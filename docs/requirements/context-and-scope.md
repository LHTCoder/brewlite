# BrewLite – Bối cảnh, Stakeholder và Phạm vi (Task 1.1)

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | 1.0 |
| Trạng thái | Approved (Sprint 0) |
| Liên quan | [SRS](./srs.md) · [Đặc tả UC-01](./use-case-checkout.md) · [Ma trận truy vết](../traceability-matrix.md) |

## 1. Vấn đề nghiệp vụ

BrewLite là một quán cà phê – trà sữa quy mô nhỏ (1 cửa hàng, 2–3 nhân viên quầy). Giờ cao điểm (7h–9h, 12h–13h) khách phải **xếp hàng 5–10 phút** để gọi món, nhân viên ghi đơn bằng tay nên **sai size/topping, nhầm đơn** xảy ra thường xuyên; thanh toán tiền mặt làm chậm quầy; chủ quán không có số liệu bán hàng theo món để điều chỉnh menu và tồn kho.

**Mục tiêu sản phẩm:** một ứng dụng web mobile-first (PWA) cho khách **xem menu → chọn tùy chọn → giỏ hàng → đặt đơn → thanh toán → theo dõi đơn**, giúp giảm thời gian chờ tại quầy, loại bỏ sai sót ghi tay và lưu lại dữ liệu đơn hàng có cấu trúc.

## 2. Stakeholder

| # | Stakeholder | Vai trò / mối quan tâm | Mục tiêu & kỳ vọng | Mức ảnh hưởng |
|---|---|---|---|---|
| S1 | **Khách hàng** (Customer) | Người dùng cuối, dùng điện thoại | Đặt món nhanh (< 2 phút), chọn đúng size/topping, biết chính xác tổng tiền trước khi trả, thanh toán không tiền mặt, biết khi nào đồ uống sẵn sàng, tích điểm thưởng | Cao |
| S2 | **Nhân viên quầy** (Staff) | Pha chế, giao đồ uống | Nhận đơn rõ ràng (món, size, topping, ghi chú), cập nhật trạng thái đơn bằng 1 chạm, không phải thu tiền mặt | Cao |
| S3 | **Quản lý cửa hàng** (Manager) | Chủ quán / quản lý ca | Kiểm soát menu, giá, khuyến mãi, tồn kho; xem lịch sử đơn; hệ thống chạy ổn định giờ cao điểm; chi phí vận hành thấp | Cao |
| S4 | **Giảng viên / khách hàng nghiệm thu** | Đánh giá đồ án theo Assignment 2 | Tài liệu đầy đủ, truy vết được từ yêu cầu → thiết kế → code → test; hệ thống chạy được trên production có HTTPS; CI/CD hoạt động | Cao |
| S5 | **Nhóm phát triển** | Sinh viên thực hiện | Phạm vi vừa đủ để hoàn thành trong 2 Sprint; công nghệ bắt buộc Next.js – NestJS – PostgreSQL – Docker; quy trình Git/PR rõ ràng | Trung bình |
| S6 | **Đơn vị thanh toán** (Payment provider) | Ví điện tử / cổng thẻ (mô phỏng trong MVP) | Giao dịch có idempotency, không trừ tiền hai lần, dữ liệu thẻ không lưu trên hệ thống BrewLite | Trung bình |

## 3. Phạm vi

### 3.1 Trong phạm vi MVP (Must – Sprint 1 & 2)

| ID | Hạng mục | Sprint |
|---|---|---|
| IS-01 | Xem menu theo danh mục, tìm món; trạng thái loading/empty/error | 1 |
| IS-02 | Chi tiết sản phẩm: mô tả, giá, size (S/M/L), topping, tồn kho | 2 |
| IS-03 | Giỏ hàng lưu cục bộ (PWA), tăng/giảm số lượng, tính tổng tiền | 2 |
| IS-04 | Đăng ký, đăng nhập bằng email/mật khẩu, JWT | 2 |
| IS-05 | Tạo đơn hàng (server kiểm tra tồn kho, tính lại giá, trừ kho trong transaction) | 2 |
| IS-06 | Thanh toán Ví/Thẻ **mô phỏng** có idempotency; thất bại thì cho thử lại | 2 |
| IS-07 | Mã khuyến mãi (percent/fixed, đơn tối thiểu, giới hạn giảm) | 2 |
| IS-08 | Xác nhận đơn, theo dõi trạng thái, lịch sử đơn của khách | 2 |
| IS-09 | Màn hình quầy: nhân viên chuyển trạng thái PAID → PREPARING → READY → COMPLETED | 2 |
| IS-10 | Tích điểm thưởng 1 điểm/10.000đ khi thanh toán thành công | 2 |
| IS-11 | Health check, logging, cấu hình qua biến môi trường, Docker, CI/CD, production HTTPS | 1–2 |

### 3.2 Phạm vi mở rộng (Should / Could – nếu còn thời gian)

- Quản lý menu/giá/tồn kho qua giao diện (hiện tại qua seed/SQL).
- Đổi điểm thưởng lấy giảm giá (REDEEM).
- Thông báo đẩy (Web Push) khi đơn READY.
- Thống kê doanh thu theo ngày/món cho quản lý.
- Đăng nhập Google/OAuth.

### 3.3 Không thực hiện (Won't – ngoài phạm vi)

- Tích hợp cổng thanh toán thật (MoMo, VNPay, Stripe) – chỉ mô phỏng.
- Giao hàng tận nơi, định vị, nhiều chi nhánh.
- Ứng dụng native iOS/Android (chỉ PWA).
- Quản lý nhân sự, ca làm, lương; kế toán, hóa đơn điện tử.
- Chat/hỗ trợ trực tuyến.

## 4. Giả định

| ID | Giả định |
|---|---|
| A-01 | Khách hàng có smartphone, trình duyệt hiện đại (Chrome/Safari ≥ 2 năm) và kết nối Internet. |
| A-02 | Chỉ một cửa hàng, một múi giờ, một loại tiền (VND, số nguyên). |
| A-03 | Khách nhận đồ uống tại quầy (pick-up); không có giao hàng. |
| A-04 | Dữ liệu menu ban đầu được nạp bằng seed; quản lý chỉnh menu trực tiếp trên DB/SQL trong MVP. |
| A-05 | Dịch vụ thanh toán được mô phỏng với quy tắc xác định (thẻ kết thúc `0002` bị từ chối, ví có hạn mức) để kiểm thử được. |
| A-06 | Nền tảng triển khai miễn phí (Render free tier) đủ cho mục đích demo/nghiệm thu. |

## 5. Ràng buộc

| ID | Ràng buộc | Nguồn |
|---|---|---|
| C-01 | Bắt buộc dùng **Next.js** (frontend), **NestJS** (backend), **PostgreSQL**, **Docker**. | Đề bài |
| C-02 | Cấu trúc repo `apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows`. | Đề bài §9 |
| C-03 | Mọi tạo phẩm (tài liệu, sơ đồ, code) phải đi qua commit/PR; CI chặn merge khi lint/test/build lỗi. | Đề bài §6.2, §6.4 |
| C-04 | Có URL production HTTPS tại thời điểm chấm; DB không public; secret không nằm trong repo/log. | Đề bài §7.4 |
| C-05 | Thời gian: 2 Sprint (mỗi Sprint 2 tuần); nhóm 3–4 sinh viên làm ngoài giờ học. | Môn học |
| C-06 | Ngân sách hạ tầng = 0đ (free tier). | Nhóm |

## 6. Rủi ro ban đầu

| ID | Rủi ro | Khả năng | Ảnh hưởng | Biện pháp |
|---|---|---|---|---|
| R-01 | Free tier (Render) "ngủ" sau 15 phút không dùng → request đầu chậm 30–60s khi chấm | Cao | Trung bình | Smoke test sau deploy; ping trước buổi chấm; ghi rõ trong README |
| R-02 | Thanh toán bị gọi 2 lần (khách bấm lại, mạng chập chờn) → trừ tiền/ghi đơn 2 lần | Trung bình | Cao | Idempotency key (unique index), transaction, test INT-T09 |
| R-03 | Hai khách đặt món cuối cùng cùng lúc → tồn kho âm | Trung bình | Trung bình | `SELECT … FOR UPDATE` trong transaction tạo đơn |
| R-04 | Thành viên thiếu kinh nghiệm NestJS/Next.js → chậm tiến độ | Cao | Cao | Scaffold sớm ở Sprint 1, pair programming, review PR |
| R-05 | Lộ secret (JWT, DB password) lên GitHub | Thấp | Cao | `.gitignore` `.env`, chỉ commit `.env.example`, secret trong GitHub Secrets |
| R-06 | Sơ đồ/tài liệu lệch với code sau khi đổi thiết kế | Cao | Trung bình | Lưu `.puml` trong repo, PR đổi code phải cập nhật docs, ma trận truy vết |
| R-07 | Free PostgreSQL trên Render hết hạn sau 30 ngày | Trung bình | Cao | Backup bằng `pg_dump`; migration + seed tái tạo DB trong vài phút |
