# ADR-001: Monorepo apps/web + apps/api + docs

- **Trạng thái:** Accepted – 2026-10
- **Bối cảnh:** Đề bài yêu cầu cấu trúc `apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows` trong một repository; nhóm 3–4 người; tài liệu (SRS, sơ đồ, ADR) phải thay đổi cùng mã nguồn qua PR.
- **Quyết định:** Dùng **một repository** chứa cả frontend, backend, tài liệu và pipeline. Mỗi app giữ `package.json` riêng (không dùng workspace tool như Turborepo/Nx để giảm độ phức tạp). CI dùng `paths` filter để chỉ chạy job liên quan.
- **Hệ quả:**
  - (+) Một PR có thể cập nhật code + sơ đồ + ma trận truy vết → dễ nghiệm thu truy vết.
  - (+) Một nơi cấu hình CI/CD, một issue board.
  - (−) `npm ci` phải chạy riêng cho từng app trong CI (chấp nhận, có cache).
  - (−) Không chia sẻ type giữa web và api tự động; `apps/web/src/lib/types.ts` phải được giữ khớp thủ công (được kiểm tra bởi E2E).
