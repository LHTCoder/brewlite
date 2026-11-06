# ADR-007: Triển khai trên Render + GHCR, deploy bằng deploy hook

- **Trạng thái:** Accepted
- **Bối cảnh:** Cần URL production HTTPS, DB không public, secret ngoài repo, pipeline CD có build image tag SHA, push registry, deploy, smoke test, rollback (đề bài §7.3–7.4). Ngân sách 0đ.
- **Quyết định:**
  - Hosting **Render.com**: 2 Web Service kiểu *Docker image* (`brewlite-web`, `brewlite-api`) + 1 **Render PostgreSQL** (Internal URL, không public). TLS tự động, health check path `/health` cho API.
  - Registry **GitHub Container Registry (ghcr.io)**: image `brewlite-api:<sha>` và `brewlite-web:<sha>` (kèm tag `latest`, `vX.Y.Z` khi release).
  - CD (`cd.yml`): quality gate → build & push → gọi **Render Deploy Hook** với `imgURL=ghcr.io/...:<sha>` (secret `RENDER_DEPLOY_HOOK_API/WEB`) → chờ → smoke test `GET /health` và `GET /` → thất bại thì job fail và in hướng dẫn rollback; workflow `rollback.yml` (workflow_dispatch) deploy lại một SHA cũ.
  - Migration chạy trong entrypoint container API (ADR-004); Render chỉ chuyển traffic khi health check mới pass → zero-downtime và tự giữ bản cũ nếu bản mới lỗi.
- **Phương án đã cân nhắc:** Railway (tương tự, free credit giới hạn thời gian), Fly.io (cần thẻ), VPS (tốn chi phí, phải tự quản TLS).
- **Hệ quả:** (+) Đáp ứng mọi yêu cầu §7.3–7.4 với chi phí 0đ. (−) Cold start free tier; free Postgres 30 ngày → có backup + seed tái tạo; cần ping trước buổi chấm.
