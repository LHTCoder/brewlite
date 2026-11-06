# BrewLite v1.0.0 – Release Notes

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
