# ADR-003: Xác thực bằng JWT stateless, lưu ở localStorage

- **Trạng thái:** Accepted
- **Bối cảnh:** Web và API chạy trên hai origin khác nhau (`*-web.onrender.com`, `*-api.onrender.com`); cần đăng nhập cho đặt đơn/thanh toán; API phải stateless để scale và để Render restart không mất phiên.
- **Quyết định:** `POST /auth/login` trả **JWT HS256** (secret ≥ 32 ký tự từ env, hết hạn 24h) chứa `sub, email, role`. Client lưu token trong `localStorage` và gửi `Authorization: Bearer`. `JwtAuthGuard` tự viết (không dùng Passport) + decorator `@Roles` cho phân quyền STAFF/MANAGER. Mật khẩu hash bcrypt cost 10. Không có refresh token trong MVP.
- **Phương án đã cân nhắc:** Cookie HttpOnly + CSRF token (an toàn hơn trước XSS nhưng phức tạp với cross-origin và SameSite trên free domain); session server (không stateless).
- **Hệ quả:**
  - (+) Đơn giản, stateless, hoạt động cross-origin với CORS whitelist.
  - (−) Token không thu hồi được trước khi hết hạn; rủi ro XSS → giảm thiểu bằng helmet, React escape mặc định, không dùng `dangerouslySetInnerHTML`. Ghi vào backlog: refresh token + cookie ở Sprint 3.
