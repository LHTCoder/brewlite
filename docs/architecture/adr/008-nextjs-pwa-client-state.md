# ADR-008: Next.js App Router, PWA thủ công, Zustand cho giỏ hàng

- **Trạng thái:** Accepted
- **Bối cảnh:** Đề bài bắt buộc Next.js mobile-first/PWA. Giỏ hàng phải tồn tại khi tải lại trang và trước khi đăng nhập.
- **Quyết định:**
  - Next.js 14 **App Router**, các màn hình động là client component gọi API trực tiếp từ trình duyệt (không qua server actions) để Web và API tách biệt, deploy độc lập.
  - **PWA thủ công**: `manifest.webmanifest` + `public/sw.js` tự viết (cache-first static, network-first navigation, fallback `/offline`, không cache API) thay vì `next-pwa` để kiểm soát và tránh phụ thuộc lỗi thời.
  - **Zustand + persist (localStorage)** cho giỏ hàng; trạng thái auth lưu token/user trong localStorage; không dùng Redux (quá nặng cho MVP).
  - Tailwind CSS cho mobile-first; `output: 'standalone'` cho Docker.
- **Hệ quả:** (+) Nhẹ, dễ test (store là hàm thuần). (−) Giỏ hàng chỉ ở một thiết bị (chấp nhận); SW phải tăng `VERSION` khi đổi chiến lược cache.
