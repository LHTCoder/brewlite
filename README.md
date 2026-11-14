# ☕ BrewLite – Đặt đồ uống mobile-first (Assignment 2 – Công nghệ phần mềm)

[![CI](https://github.com/LHTCoder/brewlite/actions/workflows/ci.yml/badge.svg)](https://github.com/LHTCoder/brewlite/actions/workflows/ci.yml)
[![CD](https://github.com/LHTCoder/brewlite/actions/workflows/cd.yml/badge.svg)](https://github.com/LHTCoder/brewlite/actions/workflows/cd.yml)

Luồng nghiệp vụ: **Xem menu → Chọn tùy chọn → Giỏ hàng → Đặt đơn → Thanh toán → Theo dõi đơn**

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Frontend (PWA, mobile-first) | Next.js 14, React 18, Tailwind, Zustand | [`apps/web`](./apps/web) |
| Backend API | NestJS 10, TypeORM, JWT, class-validator | [`apps/api`](./apps/api) |
| Database | PostgreSQL 16 (migration + seed) | [`apps/api/src/database`](./apps/api/src/database) |
| Kiểm thử | Jest, Supertest, Vitest, Playwright | `apps/*/`, [`tests/`](./tests) |
| CI/CD | GitHub Actions → GHCR → Render | [`.github/workflows`](./.github/workflows) |

## 🌐 Production

| | URL |
|---|---|
| Web | https://brewlite-web-00zk.onrender.com |
| API | https://brewlite-api-t8xs.onrender.com |
| Health check | https://brewlite-api-t8xs.onrender.com/health |
| Swagger | https://brewlite-api-t8xs.onrender.com/docs |
| Video demo | [docs/evidence/video/brewlite-demo.mp4](docs/evidence/video/brewlite-demo.mp4) – luồng end-to-end trên production (quay tự động, có chú thích) |

Tài khoản demo: `customer@brewlite.dev / Customer@123` · nhân viên `staff@brewlite.dev / Staff@123` · quản lý `manager@brewlite.dev / Manager@123`.
> Đây là tài khoản mẫu do seed tạo để giảng viên chấm thử trên môi trường demo. Khi vận hành thật: tắt seed và Swagger, mật khẩu nhân viên được cấp riêng.
Mã khuyến mãi: `WELCOME10` (−10 %, tối đa 20k, đơn ≥ 50k), `FREESHIP15K` (−15k, đơn ≥ 100k).
Thanh toán mô phỏng: thẻ bất kỳ 16 số thành công, **thẻ kết thúc `0002` bị từ chối**; ví hạn mức 500.000đ.

> ⚠️ Free tier Render "ngủ" sau 15 phút – request đầu tiên có thể mất 30–60 s.

## 📁 Cấu trúc repository

```
brewlite/
├── apps/
│   ├── web/                  # Next.js PWA
│   └── api/                  # NestJS API + migrations + seed
├── docs/
│   ├── requirements/         # Task 1: context-and-scope.md, srs.md, use-case-checkout.md
│   ├── diagrams/             # Task 2: 14 sơ đồ *.puml + *.svg/.png (use-case ×2, activity ×5, sequence ×3, class, state, C4, deployment)
│   ├── architecture/         # Task 3: architecture.md, adr/001-008
│   ├── sprints/              # backlog, DoD, sprint review/retro, release notes
│   ├── evidence/             # ảnh CI/CD, video demo, số đo NFR (Lighthouse, autocannon, coverage, audit)
│   ├── traceability-matrix.md
│   └── deployment.md
├── tests/                    # E2E Playwright
├── scripts/smoke-test.sh     # smoke test sau deploy
├── .github/workflows/        # ci.yml, cd.yml, rollback.yml
├── docker-compose.yml
├── render.yaml
├── .env.example
├── CONTRIBUTING.md           # branch, PR, commit convention
└── README.md
```

## 🚀 Chạy local

### Cách 1 – Docker Compose (khuyến nghị, 1 lệnh)

```bash
git clone https://github.com/LHTCoder/brewlite.git && cd brewlite
cp .env.example .env
docker compose up --build
```
- Web: http://localhost:3000 · API: http://localhost:4000 · Swagger: http://localhost:4000/docs · Health: http://localhost:4000/health
- Container API tự chạy **migration** rồi **seed** (`SEED_ON_START=true`).

### Cách 2 – Chạy từng app (dev, hot reload)

```bash
# 1. Database
docker compose up -d db

# 2. API
cd apps/api && cp ../../.env.example .env   # DATABASE_URL trỏ localhost:5432
npm install
npm run migration:run && npm run seed
npm run start:dev                           # http://localhost:4000

# 3. Web (terminal khác)
cd apps/web
npm install
NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev   # http://localhost:3000
```

Yêu cầu: Node.js ≥ 20, Docker Desktop (hoặc PostgreSQL 16 cài sẵn).

## 🧪 Kiểm thử

```bash
# API – unit (không cần DB)
cd apps/api && npm test
# API – integration (cần Postgres; dùng DB riêng để không ảnh hưởng dữ liệu dev)
DATABASE_URL=postgresql://brewlite:brewlite_dev_password@localhost:5432/brewlite_test npm run test:integration
# Web – unit/component
cd apps/web && npm test
# E2E (hệ thống đang chạy ở :3000/:4000)
cd tests && npm install && npx playwright install chromium && npm run e2e
```

Lint & build: `npm run lint && npm run build` trong từng app. Coverage: `npm run test:cov` (API).

## 🏗️ Build & chạy image Docker

```bash
docker build -t brewlite-api --build-arg APP_VERSION=local apps/api
docker build -t brewlite-web --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 apps/web
docker run --rm -p 4000:4000 -e DATABASE_URL=... -e JWT_SECRET=... brewlite-api
```

## ☁️ Deploy & rollback

Chi tiết: [docs/deployment.md](./docs/deployment.md) · sơ đồ: [deployment-production.svg](./docs/diagrams/deployment-production.svg)

1. Tạo Render PostgreSQL (private) + 2 Web Service (image từ GHCR), lấy **Deploy Hook**.
2. GitHub → *Settings → Secrets and variables → Actions*: **Secrets** `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_WEB`; **Variables** `PRODUCTION_API_URL`, `PRODUCTION_WEB_URL` (workflow đọc `vars.*`; URL API được nhúng vào web lúc build).
3. Push lên `main` hoặc tag `v1.0.0` → workflow **CD**: quality gate → build image `:<sha>` → push GHCR → deploy hook → smoke test (`scripts/smoke-test.sh`).
4. **Rollback**: Actions → *Rollback production* → nhập image tag cũ (hoặc Render Dashboard → Events → Rollback).

## 🔁 Quy trình làm việc

Xem [CONTRIBUTING.md](./CONTRIBUTING.md): GitHub Flow (`main` được bảo vệ, nhánh ngắn `feat/…`, `fix/…`, `docs/…` merge qua PR), Conventional Commits, PR template, [Definition of Done](./docs/sprints/definition-of-done.md).

## 📚 Tài liệu bàn giao

| Task | Tạo phẩm |
|---|---|
| 1 | [context-and-scope.md](./docs/requirements/context-and-scope.md) · [srs.md](./docs/requirements/srs.md) · [use-case-checkout.md](./docs/requirements/use-case-checkout.md) |
| 2 | Activity: [checkout e2e](./docs/diagrams/activity-checkout.svg), [menu](./docs/diagrams/activity-menu.svg), [cart](./docs/diagrams/activity-cart.svg), [auth](./docs/diagrams/activity-auth.svg), [order-status](./docs/diagrams/activity-order-status.svg) · Sequence: [checkout](./docs/diagrams/sequence-checkout.svg), [auth](./docs/diagrams/sequence-auth.svg), [staff-status](./docs/diagrams/sequence-staff-status.svg) · [class-domain](./docs/diagrams/class-domain.svg) · [order-state-machine](./docs/diagrams/order-state-machine.svg) |
| 3 | [architecture.md](./docs/architecture/architecture.md) · [ADR](./docs/architecture/adr/README.md) · [c4-container](./docs/diagrams/c4-container.svg) · [deployment-production](./docs/diagrams/deployment-production.svg) · [deployment.md](./docs/deployment.md) |
| 4–5 | [product-backlog.md](./docs/sprints/product-backlog.md) · [definition-of-done.md](./docs/sprints/definition-of-done.md) · [sprint-1-review.md](./docs/sprints/sprint-1-review.md) · [sprint-2-review.md](./docs/sprints/sprint-2-review.md) · [release-notes.md](./docs/sprints/release-notes.md) |
| Truy vết | [traceability-matrix.md](./docs/traceability-matrix.md) |

## 👥 Nhóm thực hiện

Nhóm 09:

| Thành viên | MSSV | Phụ trách |
|---|---|---|
| Lỡ Hữu Trọng (trưởng nhóm) | 3123480083 | Khai thác yêu cầu, kiến trúc; mã nguồn, CI/CD, triển khai production (có sử dụng AI hỗ trợ); tổng hợp báo cáo |
| Đỗ Minh Quang | 3123480054 | Task 2: sơ đồ activity; quy trình Scrum, Sprint Review/Retrospective; biên tập báo cáo |
| Trần Thị Trúc Đào | 3124720015 | Task 1: yêu cầu, sơ đồ và đặc tả use-case |
| Nguyễn Trường Phát | 3122480043 | Task 2–3: sơ đồ sequence, kiến trúc, ADR, deployment diagram |
| Lê Đào Bích Phượng | 3123480053 | Task 2: sơ đồ class, state machine, mô hình dữ liệu |

Repo do trưởng nhóm quản lý: các thành viên gửi đặc tả, sơ đồ và góp ý; trưởng nhóm tổng hợp thành commit/PR. Vì vậy lịch sử Git chỉ có một tài khoản.

Giảng viên hướng dẫn: ThS. Từ Lãng Phiêu · Trường Đại học Sài Gòn · HK I 2026–2027
