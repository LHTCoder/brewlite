# Sprint 2 – Review & Retrospective

**Thời gian:** Tuần 3–4 · **Sprint Goal:** Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai production có thể truy cập.

## Sprint Review

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Chi tiết sản phẩm (size, topping), giỏ hàng, tổng tiền | ✅ | E2E-T01 bước 2–3 |
| Đăng ký / đăng nhập / JWT / phân quyền | ✅ | INT-T03, T04, T10 |
| Tạo đơn (transaction, tồn kho, khuyến mãi) | ✅ | INT-T05–T07 |
| Thanh toán Ví/Thẻ mô phỏng, idempotency, điểm thưởng | ✅ | INT-T08, T09; E2E-T02 |
| Xác nhận, trạng thái, lịch sử, hủy đơn, màn hình quầy | ✅ | INT-T11, T12; E2E-T01 |
| Validate & xử lý lỗi FE/BE | ✅ | `AllExceptionsFilter`, form validate, 401 redirect |
| Integration test, E2E Playwright, docker-compose, `/health` | ✅ | job `e2e` trong CI |
| CD: image tag SHA → GHCR → Render → smoke test → rollback | ✅ | workflow `CD` run #…, `docs/evidence/cd-success.png` |
| Production HTTPS: web + API + health, DB private, secret ngoài repo | ✅ | URL trong README |
| Release v1.0.0 + release notes + video demo | ✅ | GitHub Release, link video |

**Demo trực tiếp:** mở production trên điện thoại → chọn Trà sữa (L + trân châu ×2) → áp `WELCOME10` → thẻ `…0002` bị từ chối → đổi sang ví → xác nhận mã `BL-…` → màn hình quầy chuyển PREPARING → READY → khách thấy cập nhật.

**Số liệu:** 22 test API (12 unit, 17 assertion integration), 9 test web, 4 kịch bản E2E; Lighthouse mobile Performance 9x / PWA installable (điền số thực tế).

## Sprint Retrospective

| Keep | Problem | Try |
|---|---|---|
| Hàm pricing thuần dùng chung quy tắc FE/BE giúp test nhanh, không lệch giá | Render free "ngủ" làm smoke test đầu tiên timeout | Tăng timeout smoke test 5 phút, ping trước demo |
| Idempotency + transaction thiết kế từ Task 2 nên code đúng ngay lần đầu | E2E flaky do seed trùng khi chạy lại | Seed idempotent + email test có timestamp |
| CD tách job rõ (gate → build → deploy → smoke) dễ đọc log khi lỗi | `NEXT_PUBLIC_API_URL` phải nhúng lúc build – lần đầu deploy web trỏ sai API | Ghi rõ trong deployment.md; thêm kiểm tra ở `/account` hiển thị version API |
| Review chéo + DoD giữ tài liệu khớp code | Thiếu thời gian cho FR-15/16 | Đưa vào backlog Sprint 3 |

**Velocity:** 50 SP kế hoạch / 47 SP hoàn thành.
