# Sprint 1 – Review & Retrospective

**Sprint Goal:** Nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP xem menu chạy được.

## Sprint Review

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Tài liệu Task 1 (bối cảnh, stakeholder, SRS, use-case) | ✅ | PR #1 |
| Tài liệu Task 2 (activity, sequence, class, state machine – PlantUML) | ✅ | PR #2 |
| Tài liệu Task 3 (kiến trúc, 8 ADR, deployment diagram) | ✅ | PR #3 |
| Repository: monorepo, README, `.env.example`, CONTRIBUTING, Definition of Done, Product Backlog | ✅ | PR #4 |
| API `GET /products`, `GET /products/:id`, `GET /health`, migration + seed, unit test | ✅ | PR #4 |
| Màn hình menu mobile-first với loading / empty / error | ✅ | PR #4 |
| CI: Install → Lint → Unit test → Build (API, Web), chặn merge khi lỗi | ✅ | PR #4; PR #5 (CI phát hiện test sai, bị chặn merge) |

**Demo:** menu hiển thị 11 món từ seed, lọc theo danh mục, tìm theo tên; món "Trà vải" hiển thị "Hết hàng"; khi API lỗi, màn hình báo lỗi kèm nút "Thử lại".

## Sprint Retrospective

| Điều tốt (Keep) | Điều chưa tốt (Problem) | Hành động (Try) |
|---|---|---|
| Tài liệu và sơ đồ `.puml` nằm cùng repo, thay đổi qua PR | Workflow CI chỉ tự chạy trên pull request sau khi `ci.yml` đã có trên `main`, nên PR đầu tiên của Sprint 1 chưa được CI kiểm tra | Đưa CI vào `main` sớm nhất có thể |
| CI chặn được PR có test sai (PR #5) | Branch protection bật sau khi đã merge PR #4 | Bật branch protection (bắt buộc check API, Web) trước khi bắt đầu Sprint 2 |
