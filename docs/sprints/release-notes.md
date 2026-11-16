# BrewLite – Release Notes

## Thay đổi trên `main` sau v1.0.0 (chưa gắn tag mới)

Mỗi lần merge vào `main`, CD tự triển khai lên production, nên production chạy commit mới nhất của `main` (xem trường `version` trong `/health`), không còn đúng bản `v1.0.0`.

| PR | Ngày merge | Nội dung |
|---|---|---|
| #13 | 06/11/2026 | Video demo production, cập nhật Sprint Review theo thực tế |
| #14 | 10/11/2026 | Chỉnh sơ đồ và đánh số use-case UC-1…UC-13 theo góp ý của nhóm |
| #15 | 10/11/2026 | Sơ đồ use-case dùng ký hiệu actor người que |
| #16 | 10/11/2026 | Vẽ lại 5 sơ đồ activity bằng PlantUML 1.2026.9 |
| #17 | 10/11/2026 | Sơ đồ activity không còn đường nối đè lên ô |
| #18 | 13/11/2026 | Video demo khung dọc 9:16 |
| #19 | 14/11/2026 | Sửa lỗi theo phản biện nội bộ: giới hạn PATCH trạng thái của nhân viên, khóa đơn khi hủy, chống deadlock, timeout 503, validate query; nâng Next.js 14.2.35; số đo NFR; đồng bộ tài liệu |
| #20 | 15/11/2026 | Sửa ngày merge PR #19 trong release notes; chú thích mã FR ở trang chi tiết đơn khớp SRS (FR-10) |
| #21 | 16/11/2026 | Yêu cầu bổ sung của khách hàng (SRS v1.1): mã QR thanh toán riêng từng đơn (FR-08), phân quyền 3 vai trò – quầy/quản lý không mua hàng (FR-19), trang Quản lý sửa menu và ảnh món (FR-16), cấp/khóa/đặt lại mật khẩu tài khoản nhân viên (FR-18), ảnh chụp thật cho 11 món |
| #22 | 16/11/2026 | Quay lại video demo và chụp lại ảnh minh chứng theo luồng mã QR và trang Quản lý |

---

# BrewLite v1.0.0

**Ngày phát hành:** 06/11/2026 · **Tag:** `v1.0.0` · **Image:** `ghcr.io/lhtcoder/brewlite-api:1.0.0`, `ghcr.io/lhtcoder/brewlite-web:1.0.0`

**Production:** Web https://brewlite-web-00zk.onrender.com · API https://brewlite-api-t8xs.onrender.com (`/health`, `/docs`)

## Tính năng
- 🧋 Menu mobile-first theo danh mục, tìm món, chi tiết với size S/M/L và topping, hiển thị hết hàng.
- 🛒 Giỏ hàng lưu cục bộ (PWA), gộp dòng trùng, giới hạn theo tồn kho, tính tổng tiền.
- 🔐 Đăng ký / đăng nhập JWT, phân quyền CUSTOMER / STAFF / MANAGER.
- 🧾 Tạo đơn hàng với kiểm tra tồn kho trong transaction, giá tính lại ở server, mã khuyến mãi (`WELCOME10`, `FREESHIP15K`).
- 💳 Thanh toán Ví / Thẻ mô phỏng, **idempotent**, thất bại cho thử lại; tích điểm thưởng 1 điểm / 10.000đ.
- 📦 Theo dõi trạng thái đơn (PENDING → PAID → PREPARING → READY → COMPLETED), lịch sử đơn, hủy đơn chưa thanh toán.
- 🧑‍🍳 Màn hình quầy cho nhân viên cập nhật trạng thái.
- ❤️ `GET /health`, logging có cấu trúc, Swagger `/docs`.

## Hạ tầng
- Docker multi-stage cho API và Web; `docker-compose.yml` chạy toàn bộ ở local.
- CI: Install → Lint → Unit → Integration (Postgres) → Build → E2E (Playwright).
- CD: build image tag SHA → GHCR → Render deploy hook → smoke test; workflow rollback.

## Đã biết / hạn chế
- Cổng thanh toán là mô phỏng (thẻ `…0002` bị từ chối, ví hạn mức 500.000đ).
- Quản trị menu qua seed/SQL (FR-16 – Sprint 3).
- Free tier Render có cold start ~30–60s.

## Nâng cấp từ bản trước
Bản đầu tiên – không cần migration thủ công; container tự chạy `InitialSchema1730000000000`.
