# BrewLite – Hướng dẫn triển khai (Task 3.2 / 5.3 / 5.4)

Sơ đồ: [deployment-production.svg](./diagrams/deployment-production.svg) · Quyết định: [ADR-007](./architecture/adr/007-render-ghcr-deployment.md)

## 1. Tổng quan môi trường

| Môi trường | Web | API | Database | Cách chạy |
|---|---|---|---|---|
| **Local (dev)** | http://localhost:3000 | http://localhost:4000 (Swagger `/docs`) | Postgres trong Docker (`db`) | `docker compose up --build` hoặc `npm run dev` từng app |
| **CI** (GitHub Actions) | build | lint + unit + integration (Postgres service) + build | `postgres:16` service container | tự động khi mở PR |
| **Production** (Render) | `https://brewlite-web-00zk.onrender.com` | `https://brewlite-api-t8xs.onrender.com` (`/health`) | Render PostgreSQL (private) | tự động khi push `main` / tag `v*` |

> Render tự thêm hậu tố ngẫu nhiên vào subdomain khi tên đã có người dùng (ở đây `-00zk`, `-t8xs`). URL thật cũng được khai báo trong GitHub → Settings → Variables (`PRODUCTION_WEB_URL`, `PRODUCTION_API_URL`) để CD build web và chạy smoke test.

## 2. Thiết lập production trên Render (làm một lần)

1. Tạo tài khoản Render, kết nối GitHub.
2. **Database:** *New → PostgreSQL* → tên `brewlite-db`, region Singapore, plan Free. Copy **Internal Database URL** (dạng `postgresql://user:pass@host/brewlite`). DB này không có public IP → thỏa yêu cầu "database production không public".
3. **API:** *New → Web Service → Deploy an existing image* → image `ghcr.io/lhtcoder/brewlite-api:latest` (lần đầu có thể chọn *Build from repo* với Dockerfile `apps/api/Dockerfile`, root `apps/api`). Cấu hình:
   - Port `4000`; Health Check Path `/health`.
   - Environment (Secret): `DATABASE_URL`=Internal URL, `DATABASE_SSL=false` (internal) , `JWT_SECRET`=chuỗi ngẫu nhiên ≥ 32 ký tự (`openssl rand -base64 48`), `CORS_ORIGINS=https://brewlite-web-00zk.onrender.com`, `NODE_ENV=production`, `SEED_ON_START=true` (lần đầu, sau đó đặt `false`), `SWAGGER_ENABLED=true` (tùy chọn để giảng viên xem `/docs`).
   - Settings → **Deploy Hook** → copy URL → lưu vào GitHub Secret `RENDER_DEPLOY_HOOK_API`.
4. **Web:** tương tự với image `ghcr.io/lhtcoder/brewlite-web:latest`, port `3000`. `NEXT_PUBLIC_API_URL` được nhúng **lúc build** → CD lấy từ GitHub Variable `PRODUCTION_API_URL` và truyền `--build-arg`. Deploy Hook → `RENDER_DEPLOY_HOOK_WEB`.
5. Nếu dùng image private trên GHCR: Render → *Account Settings → Registry Credentials* thêm GHCR với GitHub PAT (`read:packages`). Đơn giản hơn: đặt package **public** trên GitHub (Packages → Package settings → Change visibility).
6. GitHub → *Settings → Secrets and variables → Actions*:
   - **Secrets** (bí mật, không hiện trong log): `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_WEB`.
   - **Variables** (URL công khai): `PRODUCTION_API_URL`, `PRODUCTION_WEB_URL`.
7. (Tùy chọn) `render.yaml` ở gốc repo cho phép tạo toàn bộ bằng *Blueprint*.

## 3. Pipeline CD (`.github/workflows/cd.yml`)

```
push main / tag v*  →  quality-gate (lint, test, build)  →  build-push (docker buildx, tag <sha> + latest + vX.Y.Z)
                   →  deploy (POST deploy hook ?imgURL=…:<sha>)  →  wait + smoke-test (/health, /)  →  ✅ / ❌ (rollback guide)
```

| Bước | Thực hiện | Bằng chứng |
|---|---|---|
| Quality gate | tái sử dụng `ci.yml` (`workflow_call`) | job `quality-gate` |
| Image tag | `ghcr.io/lhtcoder/brewlite-api:<git sha>`, thêm `v1.2.3` khi push tag | job `build-push` |
| Push registry | `docker/login-action` với `GITHUB_TOKEN` (`packages: write`) | GHCR packages |
| Deploy bằng secret CI | `curl -fsS "$RENDER_DEPLOY_HOOK_API&imgURL=$IMAGE"` | job `deploy` |
| Migration an toàn | chạy trong entrypoint container trước khi listen; Render chỉ chuyển traffic khi health check pass | `apps/api/docker-entrypoint.sh` |
| Smoke test | `scripts/smoke-test.sh` – poll `/health` tới 5 phút, kiểm tra `status=ok`, `version=<sha>`, `/products` 200, web `/` 200 | job `smoke-test` |
| Dừng & rollback | smoke test fail → job fail, workflow in hướng dẫn; chạy `rollback.yml` với SHA cũ | §5 |

## 4. Chạy migration theo cách an toàn

- Migration là **additive** (thêm bảng/cột, không drop dữ liệu) – quy ước trong `CONTRIBUTING.md`.
- Entrypoint: `node dist/database/migrate.js` → lỗi ⇒ exit 1 ⇒ Render deploy fail, **bản cũ tiếp tục chạy** (không downtime).
- Mỗi migration chạy trong transaction (`runMigrations({transaction:'each'})`).
- Backup trước release lớn: `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql` (Render Dashboard cũng có backup hàng ngày).

## 5. Rollback

**Cách 1 – Workflow `rollback.yml`** (khuyến nghị): *Actions → Rollback production → Run workflow* → nhập `image_tag` (SHA hoặc `v1.0.0` đã chạy tốt) → pipeline gọi deploy hook với image cũ và smoke test lại.

**Cách 2 – Render Dashboard:** Service → *Events* → chọn deploy trước đó → **Rollback**.

**Cách 3 – Thủ công:**
```bash
curl -fsS "$RENDER_DEPLOY_HOOK_API&imgURL=ghcr.io/lhtcoder/brewlite-api:<sha-cu>"
curl -fsS "$RENDER_DEPLOY_HOOK_WEB&imgURL=ghcr.io/lhtcoder/brewlite-web:<sha-cu>"
```
Migration: nếu bản mới đã thêm migration không tương thích, chạy `npm run migration:revert` với `DATABASE_URL` production (từ máy dev, qua External URL tạm thời bật rồi tắt) **trước** khi rollback image.

## 6. Checklist bàn giao (Task 5.4)

- [ ] URL web production HTTPS truy cập được (`PRODUCTION_WEB_URL`)
- [ ] URL API + `GET /health` trả `{"status":"ok"}` với `version` = SHA mới nhất
- [ ] Database không public (chỉ Internal URL)
- [ ] `grep -r "JWT_SECRET=" --include=*.yml --include=*.ts .` chỉ ra `.env.example`; log CI không có secret (GitHub mask)
- [ ] Release `v1.0.0` + release notes (`docs/sprints/release-notes.md`, GitHub Release)
- [ ] README có hướng dẫn local/test/build/deploy/rollback
- [ ] Video demo luồng end-to-end (link trong README)
- [ ] Sprint Review & Retrospective (`docs/sprints/`)

## 7. Lưu ý free tier

- Service "ngủ" sau 15 phút không có request → request đầu tiên mất 30–60s. Trước buổi chấm, mở `/health` và `/` trước 2 phút.
- Render free PostgreSQL hết hạn sau 30 ngày → tạo DB mới, cập nhật `DATABASE_URL`, redeploy (migration + seed tự chạy).
