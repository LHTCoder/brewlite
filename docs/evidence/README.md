# Minh chứng (Task 4.4, 5.3, 5.4)

Ảnh chụp tự động bằng Playwright (`tests/capture-evidence.mjs`, `tests/capture-github.mjs`).

| Thư mục | Nội dung |
|---|---|
| `screens/` | Luồng end-to-end chạy **local** (PostgreSQL thật, chụp lại ngày 16/11 sau PR #21, cùng mã nguồn bản production `d1c6a4f`): menu ảnh chụp thật → chi tiết → giỏ → đăng nhập/đăng ký → mã KM → thẻ bị từ chối → **mã QR của đơn** (`05c-ma-qr.png`) → xác nhận → lịch sử đơn → tài khoản/điểm → màn hình quầy → **trang Quản lý** (`12a`–`12c`: menu, sửa món, tài khoản nhân viên) → Swagger → `/health` |
| `production/` | Chụp ngày 06/11 (trước PR #21, menu còn ảnh minh họa SVG và Ví chưa có mã QR). Cùng luồng trên **production** https://brewlite-web-00zk.onrender.com (API https://brewlite-api-t8xs.onrender.com). Ba ảnh giỏ hàng, đăng nhập, checkout trùng khớp từng điểm ảnh với bản local vì các màn hình này hiển thị cùng dữ liệu ở hai môi trường; ảnh chụp không có thanh địa chỉ, nên khi vấn đáp nhóm demo trực tiếp trên trình duyệt |
| `video/brewlite-demo.mp4` | Video demo 87 giây, quay lại ngày 16/11 sau PR #21 trên bản chạy local cùng mã nguồn bản production `d1c6a4f` (máy quay không truy cập được Render): menu → chi tiết (size L, topping) → giỏ → đăng ký → mã KM → thẻ bị từ chối → **ví: hiện mã QR riêng của đơn, quét rồi xác nhận** → quầy chuyển PREPARING → READY (quầy chỉ có Quầy, Tài khoản) → khách thấy cập nhật → điểm thưởng → món hết hàng → **trang Quản lý** (sửa món, tài khoản nhân viên, bị chặn khỏi giỏ hàng) (`tests/record-demo.mjs`); khung dọc 9:16, 1080×1920 |
| `nfr/` | Số đo yêu cầu phi chức năng (Lighthouse, autocannon, coverage, `npm audit`) – xem [`nfr/README.md`](./nfr/README.md) |
| `github/` | Repo, lịch sử commit, danh sách PR, **PR #5 CI thất bại – bị chặn merge**, các lần chạy CI, các lần chạy CD, **CD #6 thành công** (chạy tay sau khi sửa CD #1–#5; gate → build & push GHCR → deploy → smoke test). CD #7 (push `main`) và CD #8 (tag `v1.0.0`) chạy tự động, cũng xanh, packages GHCR, releases, nhánh |

Liên kết trực tiếp:
- CI thất bại có chủ đích: https://github.com/LHTCoder/brewlite/pull/5
- CI thành công: https://github.com/LHTCoder/brewlite/actions/workflows/ci.yml
- CD thành công: https://github.com/LHTCoder/brewlite/actions/runs/42159960333
- Image: https://github.com/LHTCoder?tab=packages
