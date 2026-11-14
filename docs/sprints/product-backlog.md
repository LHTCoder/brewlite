# Product Backlog & Sprint Planning

> Product Backlog được quản lý bằng chính file markdown này trong repo (có lịch sử thay đổi qua Git). Nhóm không dùng GitHub Issues/Projects; cột "Mục" dưới đây là mã công việc nội bộ (S1-x, S2-x), không phải số issue/PR trên GitHub.

## Thành viên & vai trò

| Thành viên | MSSV | Vai trò chính |
|---|---|---|
| Lỡ Hữu Trọng (trưởng nhóm) | 3123480083 | Khai thác yêu cầu, kiến trúc; mã nguồn, CI/CD, triển khai production (có sử dụng AI hỗ trợ); tổng hợp báo cáo; quản lý repo |
| Đỗ Minh Quang | 3123480054 | Task 2: sơ đồ activity; điều phối quy trình Scrum, Sprint Review/Retrospective |
| Trần Thị Trúc Đào | 3124720015 | Task 1: yêu cầu, sơ đồ và đặc tả use-case |
| Nguyễn Trường Phát | 3122480043 | Task 2–3: sơ đồ sequence, kiến trúc, ADR, deployment diagram |
| Lê Đào Bích Phượng | 3123480053 | Task 2: sơ đồ class, state machine, mô hình dữ liệu |

> **Về thời gian:** kế hoạch chia công việc thành 2 Sprint như bên dưới. Phần mã nguồn được hoàn thành trong thời gian ngắn và trưởng nhóm đẩy lên GitHub tập trung theo đúng thứ tự Task vào ngày 06/11/2026, nên ngày giờ trên GitHub là thời điểm đẩy lên, không phải tiến độ từng Sprint. Bản trước của file này ghi "mỗi Sprint 2 tuần"; nhóm đã bỏ con số đó vì không khớp với lịch sử thực tế.

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

## Sprint 1 – Sprint Goal: *Nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP xem menu chạy được*

| Mục | Nội dung | Phụ trách | DoD |
|---|---|---|---|
| S1-1 | Khởi tạo monorepo, README, .gitignore, .env.example, CONTRIBUTING, DoD | Trọng | merge main |
| S1-2 | docs/requirements (context-and-scope, srs, use-case-checkout) | Đào | nhóm góp ý |
| S1-3 | docs/diagrams (.puml + .svg) activity, sequence, class, use-case | Quang, Phát, Phượng | render được |
| S1-4 | docs/architecture (architecture.md, ADR 001–008), deployment diagram, deployment.md | Phát, Trọng | review |
| S1-5 | API: entity, migration, seed, `GET /products`, `GET /products/:id`, `/health`, unit test | Trọng | CI xanh |
| S1-6 | Web: layout mobile-first, menu, loading/empty/error, ProductCard test | Trọng | CI xanh |
| S1-7 | CI workflow (install→lint→test→build), branch protection | Trọng | PR bị chặn khi lỗi |
| S1-8 | Dockerfile api/web + docker-compose | Trọng | `docker compose up` chạy |

**Sprint 1 velocity dự kiến:** 26 SP.

## Sprint 2 – Sprint Goal: *Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai production truy cập được*

| Mục | Nội dung | Phụ trách |
|---|---|---|
| S2-1 | Chi tiết sản phẩm UI + giỏ hàng (Zustand) | Trọng |
| S2-2 | Auth API (register/login/JWT/guard/roles) + AuthForm | Trọng |
| S2-3 | Orders API (transaction, tồn kho, pricing, promotion) | Trọng |
| S2-4 | Payments API (mock gateway, idempotency, loyalty) | Trọng |
| S2-5 | Checkout UI, order detail, orders list, account, staff board | Trọng |
| S2-6 | Integration test (products, checkout), E2E Playwright | Trọng |
| S2-7 | CD workflow (GHCR, Render deploy hook, smoke test), rollback workflow | Trọng |
| S2-8 | Traceability matrix, release notes, Sprint Review/Retro, video demo | Quang, Trọng |

**Sprint 2 velocity dự kiến:** 50 SP (các story lớn đã được chuẩn bị nền ở Sprint 1).
