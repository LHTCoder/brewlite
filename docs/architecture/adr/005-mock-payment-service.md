# ADR-005: Dịch vụ thanh toán mô phỏng sau interface

- **Trạng thái:** Accepted
- **Bối cảnh:** Đề bài yêu cầu thanh toán Ví/Thẻ **mô phỏng**; cần kiểm thử được nhánh thành công/thất bại một cách xác định; không có tài khoản merchant.
- **Quyết định:** Tạo `PaymentGatewayService` với interface `charge(req) → ChargeResult`. Quy tắc mô phỏng: CARD phải đủ 16 chữ số, kết thúc `0002` → "Ngân hàng từ chối giao dịch"; WALLET vượt `PAYMENT_WALLET_LIMIT` (mặc định 500.000đ) → "Số dư ví không đủ"; còn lại thành công với `providerRef` ngẫu nhiên. Độ trễ giả lập 50ms. `PaymentsService` chỉ phụ thuộc interface.
- **Hệ quả:** (+) Test INT-T08/T09 và E2E xác định, demo rõ nhánh alt. (+) Thay bằng adapter MoMo/VNPay/Stripe chỉ cần provider mới + webhook. (−) Không mô phỏng callback bất đồng bộ.
