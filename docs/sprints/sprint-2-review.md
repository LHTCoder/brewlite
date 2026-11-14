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
| CD: image tag SHA → GHCR → Render → smoke test → rollback | ✅ (rollback: chưa chạy thử) | CD #1–#5 đỏ vì 2 lỗi cấu hình (sửa ở PR #9, #11); CD #6 chạy tay sau khi sửa, 4 job xanh – `docs/evidence/github/07-cd-run-thanh-cong.png`; CD #7 (push `main`) và CD #8 (tag `v1.0.0`, gồm job Release) chạy tự động, xanh. Workflow `Rollback production` có sẵn nhưng chưa chạy thử trên production |
| Production HTTPS: web + API + health, DB chỉ dùng Internal URL, secret ngoài repo | ✅ | https://brewlite-web-00zk.onrender.com · https://brewlite-api-t8xs.onrender.com/health – `docs/evidence/production/` |
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


## Bổ sung sau phản biện nội bộ (14/11/2026)

Sau khi nộp, nhóm cho soát lại toàn bộ bài và sửa trong PR #19. Các thay đổi chính:

| Vấn đề phát hiện | Cách sửa | Kiểm chứng |
|---|---|---|
| Nhân viên gọi `PATCH /orders/:id/status` đổi được đơn chưa trả tiền sang PAID; đổi sang CANCELLED thì không hoàn kho | PATCH chỉ nhận PREPARING, READY, COMPLETED; PAID chỉ do thanh toán tạo ra; hủy đơn chỉ qua `POST /orders/:id/cancel`; đơn đã PAID không hủy trên hệ thống (MVP chưa có hoàn tiền) | UNIT-T08, INT-T13 |
| Khách bấm hủy đúng lúc đang thanh toán: đơn thành CANCELLED dù tiền đã trừ | `cancel()` khóa dòng đơn (`FOR UPDATE`) rồi mới kiểm tra trạng thái | INT-T14 (5 lần chạy song song) |
| Hai đơn đồng thời có cùng món nhưng thứ tự khác nhau bị deadlock, trả 500 | Khóa tất cả sản phẩm của giỏ một lần theo thứ tự id | INT-T15 |
| Tham số lọc sai (`?category=FOO`) trả 500; header `Idempotency-Key` không thay được body | Validate enum ở query; gộp khóa từ header/body trước khi kiểm tra độ dài | INT-T16 |
| Luồng E8 (cổng thanh toán quá hạn → 503) có trong đặc tả nhưng chưa có trong code | Thêm giới hạn thời gian chờ `PAYMENT_TIMEOUT_MS`; quá hạn thì rollback và trả 503 | UNIT-T09 |
| Mã FR trong chú thích code/Swagger theo cách đánh số cũ | Đổi cho khớp SRS hiện tại | Swagger `/docs` |
| Đăng ký cùng email đồng thời trả 500; `?next=` sau đăng nhập có thể chuyển ra trang ngoài | Trả 409; chỉ chấp nhận đường dẫn nội bộ | – |
| NFR chưa có số đo | Đo và ghi lại trong [`docs/evidence/nfr/README.md`](../evidence/nfr/README.md) | Lighthouse, autocannon, coverage, `npm audit` |

**Số liệu test sau khi sửa:** API 28 unit test (6 suite) + 19 integration test (2 suite); Web 10 unit test; E2E 4 kịch bản.
