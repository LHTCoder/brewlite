# ADR-006: Idempotency key cho thanh toán

- **Trạng thái:** Accepted
- **Bối cảnh:** Khách bấm "Thanh toán" hai lần hoặc mạng retry có thể gửi `POST /payments` lặp → nguy cơ trừ tiền/ghi giao dịch 2 lần (R-02). Đề bài Task 2.2 yêu cầu thể hiện idempotency.
- **Quyết định:** Client sinh `idempotencyKey` (UUID v4) cho mỗi **lần thử** thanh toán và gửi qua body hoặc header `Idempotency-Key`. API: cột `payments.idempotency_key` **UNIQUE**; trước khi gọi cổng thanh toán, tìm payment theo key → nếu có và cùng `orderId` trả lại kết quả cũ (không gọi cổng lần 2); khác `orderId` → 409. Thanh toán thất bại → client sinh key mới cho lần thử tiếp theo. Việc đổi trạng thái đơn khóa dòng `orders` bằng `FOR UPDATE`.
- **Hệ quả:** (+) An toàn trước double-submit và retry; test INT-T09 kiểm chứng. (−) Cần client tuân thủ sinh key; key sống vĩnh viễn trong bảng (chấp nhận với quy mô nhỏ).
