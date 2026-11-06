# Minh chứng (Task 4.4, 5.3, 5.4)

Ảnh chụp tự động bằng Playwright (`tests/capture-evidence.mjs`, `tests/capture-github.mjs`).

| Thư mục | Nội dung |
|---|---|
| `screens/` | Luồng end-to-end chạy **local** (Windows, PostgreSQL thật): menu → chi tiết → giỏ → đăng nhập/đăng ký → mã KM → thẻ bị từ chối → ví thành công → xác nhận → lịch sử đơn → tài khoản/điểm → màn hình quầy → Swagger → `/health` |
| `production/` | Cùng luồng trên **production** https://brewlite-web-00zk.onrender.com (API https://brewlite-api-t8xs.onrender.com) |
| `github/` | Repo, lịch sử commit, danh sách PR, **PR #5 CI thất bại – bị chặn merge**, các lần chạy CI, các lần chạy CD, **CD #6 thành công** (gate → build → push GHCR → deploy → smoke test), packages GHCR, releases, nhánh |

Liên kết trực tiếp:
- CI thất bại có chủ đích: https://github.com/LHTCoder/brewlite/pull/5
- CI thành công: https://github.com/LHTCoder/brewlite/actions/workflows/ci.yml
- CD thành công: https://github.com/LHTCoder/brewlite/actions/runs/42159960333
- Image: https://github.com/LHTCoder?tab=packages
