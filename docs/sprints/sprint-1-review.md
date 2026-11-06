# Sprint 1 – Review & Retrospective

**Thời gian:** Tuần 1–2 · **Sprint Goal:** Nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP xem menu chạy được.

## Sprint Review

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Repository, cấu trúc monorepo, README, `.env.example`, CONTRIBUTING, DoD | ✅ Hoàn thành | commit đầu tiên trên `main`, PR #1 |
| Tài liệu Task 1–3 trong `docs/` (SRS, use-case, 8 sơ đồ PlantUML + SVG, kiến trúc, 8 ADR, deployment) | ✅ Hoàn thành | PR #2–#4 |
| API `GET /products`, `GET /products/:id`, `GET /health`, migration + seed, unit test | ✅ Hoàn thành | PR #5, CI xanh |
| Màn hình menu mobile-first với loading / empty / error | ✅ Hoàn thành | PR #6, ảnh chụp trong `docs/evidence/` |
| CI: Install → Lint → Unit Test → Build, chặn merge khi lỗi | ✅ Hoàn thành | PR #7; `docs/evidence/ci-success.png`, `ci-failure.png` |
| Dockerfile + docker-compose | ✅ Hoàn thành | PR #8 |
| Chi tiết sản phẩm UI | ⏩ Chuyển Sprint 2 (API đã xong) | #9 |

**Demo:** `docker compose up` → mở http://localhost:3000, menu hiển thị 11 món seed, món "Trà vải" hết hàng; tắt API → màn hình lỗi + Thử lại.

**Phản hồi từ giảng viên/khách hàng:** (điền sau buổi review – ví dụ: cần nhãn danh mục tiếng Việt, cần số lượng còn lại trên chi tiết).

## Sprint Retrospective

| Điều tốt (Keep) | Điều chưa tốt (Problem) | Hành động (Try) |
|---|---|---|
| Scaffold API + Web sớm giúp cả nhóm chạy được ngay tuần 1 | PR đầu tiên bị CI chặn nhiều lần do lint/prettier khác nhau giữa máy | Thống nhất `.prettierrc`, bật format-on-save; thêm `npm run lint:fix` vào hướng dẫn |
| Lưu `.puml` trong repo nên sửa sơ đồ qua PR rất nhanh | Ước lượng story docs (US-D1) thấp – thực tế mất 2 ngày | Tách docs thành issue nhỏ theo từng tài liệu |
| Review chéo bắt được lỗi migration (thiếu index unique) | Thành viên mới NestJS mất thời gian hiểu DI/TypeORM | Pair programming 2 buổi đầu Sprint 2; ghi chú kiến trúc vào `architecture.md` |

**Velocity:** 26 SP kế hoạch / 23 SP hoàn thành.
