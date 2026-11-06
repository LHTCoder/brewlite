# Product Backlog & Sprint Planning

> Issue board thực tế: GitHub Projects (Kanban) của repo – cột **Backlog → Sprint → In progress → In review → Done**. Mỗi dòng dưới đây tương ứng một GitHub Issue (nhãn `sprint-1` / `sprint-2`, `type:feature|docs|infra|test`).

## Thành viên & vai trò (điền tên nhóm)

| Thành viên | MSSV | Vai trò chính |
|---|---|---|
| <Thành viên 1> | | Scrum Master / Backend (NestJS) |
| <Thành viên 2> | | Frontend (Next.js) |
| <Thành viên 3> | | DevOps (Docker, CI/CD, Render) + Tester |
| <Thành viên 4> | | Tài liệu (SRS, sơ đồ) + QA |

## User Stories (ưu tiên MoSCoW, ước lượng story point)

| ID | User story | Yêu cầu | Ưu tiên | SP | Sprint |
|---|---|---|---|---|---|
| US-00 | Là nhóm, tôi cần repo, cấu trúc monorepo, README, .env.example, docker-compose, CI để mọi người cùng làm việc | NFR-05 | Must | 5 | 1 |
| US-01 | Là khách, tôi muốn xem menu theo danh mục để chọn món | FR-01 | Must | 5 | 1 |
| US-02 | Là khách, tôi muốn xem chi tiết món với size, topping, tồn kho | FR-02 | Must | 3 | 1 (API) / 2 (UI) |
| US-D1 | Là nhóm, tôi cần SRS, use-case, sơ đồ activity/sequence/class, kiến trúc, ADR, deployment diagram trong `docs/` | Task 1–3 | Must | 8 | 1 |
| US-03 | Là khách, tôi muốn thêm món vào giỏ và thấy tổng tiền | FR-03 | Must | 3 | 2 |
| US-04 | Là khách, tôi muốn đăng ký/đăng nhập để đặt đơn | FR-04 | Must | 5 | 2 |
| US-05/06 | Là khách, tôi muốn đặt đơn; hệ thống kiểm tra tồn kho và tính đúng giá | FR-05, FR-06 | Must | 8 | 2 |
| US-07 | Là khách, tôi muốn nhập mã khuyến mãi | FR-07 | Should | 3 | 2 |
| US-08/09 | Là khách, tôi muốn thanh toán Ví/Thẻ và không bị trừ tiền 2 lần | FR-08, FR-09 | Must | 8 | 2 |
| US-10/11 | Là khách, tôi muốn thấy xác nhận, theo dõi trạng thái và lịch sử đơn | FR-10, FR-11 | Must | 5 | 2 |
| US-12 | Là khách, tôi muốn hủy đơn chưa thanh toán | FR-12 | Should | 2 | 2 |
| US-13 | Là nhân viên, tôi muốn cập nhật trạng thái đơn tại quầy | FR-13 | Must | 5 | 2 |
| US-14 | Là khách, tôi muốn tích điểm thưởng | FR-14 | Should | 3 | 2 |
| US-T1 | Là nhóm, tôi cần integration test + E2E + docker-compose + health | Task 5.2 | Must | 5 | 2 |
| US-O1 | Là nhóm, tôi cần CD build image, push GHCR, deploy Render, smoke test, rollback | Task 5.3 | Must | 8 | 2 |
| US-O2 | Là nhóm, tôi cần release v1.0.0, release notes, video demo, Sprint Review/Retro | Task 5.4 | Must | 3 | 2 |
| US-15 | Là khách, tôi muốn đổi điểm lấy giảm giá | FR-15 | Could | 3 | Backlog |
| US-16 | Là quản lý, tôi muốn sửa menu/giá/tồn kho trên giao diện | FR-16 | Could | 8 | Backlog |
| US-17 | Là khách, tôi muốn nhận thông báo khi đơn sẵn sàng | FR-17 | Won't | 5 | Backlog |

## Sprint 1 (2 tuần) – Sprint Goal: *Nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP xem menu chạy được*

| Issue | Nội dung | Phụ trách | DoD |
|---|---|---|---|
| #1 | Khởi tạo monorepo, README, .gitignore, .env.example, CONTRIBUTING, DoD | TV1 | merge main |
| #2 | docs/requirements (context-and-scope, srs, use-case-checkout) | TV4 | review 1 người |
| #3 | docs/diagrams (.puml + .svg) activity, sequence, class, use-case | TV4 | render được |
| #4 | docs/architecture (architecture.md, ADR 001–008), deployment diagram, deployment.md | TV1, TV3 | review |
| #5 | API: entity, migration, seed, `GET /products`, `GET /products/:id`, `/health`, unit test | TV1 | CI xanh |
| #6 | Web: layout mobile-first, menu, loading/empty/error, ProductCard test | TV2 | CI xanh |
| #7 | CI workflow (install→lint→test→build), branch protection | TV3 | PR bị chặn khi lỗi |
| #8 | Dockerfile api/web + docker-compose | TV3 | `docker compose up` chạy |

**Sprint 1 velocity dự kiến:** 26 SP.

## Sprint 2 (2 tuần) – Sprint Goal: *Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai production truy cập được*

| Issue | Nội dung | Phụ trách |
|---|---|---|
| #9 | Chi tiết sản phẩm UI + giỏ hàng (Zustand) | TV2 |
| #10 | Auth API (register/login/JWT/guard/roles) + AuthForm | TV1, TV2 |
| #11 | Orders API (transaction, tồn kho, pricing, promotion) | TV1 |
| #12 | Payments API (mock gateway, idempotency, loyalty) | TV1 |
| #13 | Checkout UI, order detail, orders list, account, staff board | TV2 |
| #14 | Integration test (products, checkout), E2E Playwright | TV3, TV4 |
| #15 | CD workflow (GHCR, Render deploy hook, smoke test), rollback workflow | TV3 |
| #16 | Traceability matrix, release notes, Sprint Review/Retro, video demo | TV4 |

**Sprint 2 velocity dự kiến:** 50 SP (các story lớn đã được chuẩn bị nền ở Sprint 1).
