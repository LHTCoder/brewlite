# Sprint 2 – Review & Retrospective

**Sprint Goal:** Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai production có thể truy cập.

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
| CD: image tag SHA → GHCR → Render → smoke test → rollback | ✅ | workflow `CD` #6 (15m47s, tất cả job xanh) – `docs/evidence/github/07-cd-run-thanh-cong.png`; workflow `Rollback production` |
| Production HTTPS: web + API + health, DB private, secret ngoài repo | ✅ | https://brewlite-web-00zk.onrender.com · https://brewlite-api-t8xs.onrender.com/health – `docs/evidence/production/` |
| Release v1.0.0 + release notes + video demo | ✅ | https://github.com/LHTCoder/brewlite/releases/tag/v1.0.0; video: xem README |

**Demo trực tiếp:** mở production trên điện thoại → chọn Trà sữa (L + trân châu ×2) → áp `WELCOME10` → thẻ `…0002` bị từ chối → đổi sang ví → xác nhận mã `BL-…` → màn hình quầy chuyển PREPARING → READY → khách thấy cập nhật.

**Số liệu (đo thực tế):** API 23 unit test (5 suite) + 15 integration test với PostgreSQL (2 suite); Web 10 unit test (3 file); E2E Playwright 4 kịch bản – tất cả pass trên máy Windows của nhóm và trên GitHub Actions.

## Sprint Retrospective

| Keep | Problem | Try |
|---|---|---|
| Hàm pricing thuần dùng chung quy tắc FE/BE giúp test nhanh, không lệch giá | CD lần chạy đầu bị GitHub từ chối vì dùng `secrets` trong `environment.url` (PR #9) | Đọc kỹ tài liệu context của GitHub Actions; URL không bí mật để ở **Variables** |
| Idempotency + transaction thiết kế từ Task 2 nên code đúng ngay lần đầu | Build image thất bại: GHCR bắt buộc tên repository viết thường (`LHTCoder` → `lhtcoder`, PR #11) | Cố định tiền tố image viết thường; thêm vào checklist DoD |
| CD tách job rõ (gate → build → deploy → smoke) nên đọc log lỗi nhanh | `NEXT_PUBLIC_API_URL` được nhúng lúc build – phải biết URL API trước khi build web | Ghi rõ trong `deployment.md`; khai báo `PRODUCTION_API_URL` trước khi chạy CD |
| Branch protection + CI bắt buộc chặn được PR có test sai (PR #5) | Render Free "ngủ" sau 15 phút, lần gọi đầu mất ~1 phút | Smoke test chờ tối đa 5 phút; mở trang trước buổi demo vài phút |
| Tài liệu và sơ đồ cập nhật theo góp ý của nhóm trước khi phát hành (PR #10) | Thiếu thời gian cho FR-15/16 (quản trị menu, báo cáo) | Đưa vào backlog Sprint 3 |

