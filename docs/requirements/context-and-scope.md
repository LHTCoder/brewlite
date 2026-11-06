# BrewLite – Bối cảnh, Stakeholder và Phạm vi (Task 1.1)

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | 1.1 – viết lại bối cảnh và kỳ vọng stakeholder theo góp ý của nhóm |
| Trạng thái | Approved (Sprint 0) |
| Liên quan | [SRS](./srs.md) · [Đặc tả UC-01](./use-case-checkout.md) · [Ma trận truy vết](../traceability-matrix.md) |

## 1. Vấn đề nghiệp vụ

Tại các cửa hàng cà phê và trà sữa quy mô nhỏ chỉ có 2–3 nhân viên quầy, quy trình phục vụ truyền thống thường quá tải vào giờ cao điểm (7h–9h, 12h–13h). Khách phải **xếp hàng 5–10 phút** chỉ để gọi món; ghi đơn bằng giấy bút dễ **sai kích cỡ, topping hoặc nhầm thứ tự phục vụ**. Thanh toán tiền mặt tại quầy chậm, chưa đáp ứng nhu cầu thanh toán điện tử, khuyến mãi và tích điểm của khách trẻ; người quản lý lại thiếu dữ liệu bán hàng theo từng món để điều chỉnh thực đơn và kiểm soát nguyên liệu.

**Mục tiêu sản phẩm:** BrewLite là ứng dụng web mobile-first/PWA số hóa hành trình **xem menu → chọn tùy chọn → giỏ hàng → đặt đơn → thanh toán → theo dõi đơn**: tra cứu thực đơn, tùy chỉnh món, quản lý giỏ hàng, áp mã khuyến mãi, thanh toán qua ví điện tử hoặc thẻ mô phỏng, tự động tích điểm và theo dõi tiến độ đơn. Về kỹ thuật, hệ thống kiểm soát chặt máy trạng thái đơn hàng, thanh toán idempotent (Idempotency-Key) để không trừ tiền hai lần khi mạng chập chờn, và trừ tồn kho trong transaction ngay khi đơn hợp lệ.

Hệ thống giải quyết ba bài toán cốt lõi: (1) rút ngắn thời gian chờ và loại bỏ sai sót khi ghi nhận đơn; (2) bảo đảm thanh toán an toàn, nhất quán; (3) minh bạch dữ liệu tồn kho, khuyến mãi và điểm thành viên cho cả khách hàng lẫn người quản lý.

## 2. Stakeholder

| # | Stakeholder | Mục tiêu và kỳ vọng chính | Mức ảnh hưởng |
|---|---|---|---|
| S1 | **Khách hàng** | Dễ dàng xem chi tiết, chọn món, tùy chỉnh size và topping, đặt đơn trên điện thoại. Biết rõ tổng tiền sau khuyến mãi trước khi trả; thanh toán điện tử an toàn, không bị trừ tiền trùng khi mạng lỗi; tích điểm thành viên và biết chính xác lúc đồ uống sẵn sàng tại quầy. | Cao |
| S2 | **Nhân viên quầy** | Nhận danh sách đơn đã thanh toán với thông tin rõ ràng (tên món, size, topping, ghi chú) trên màn hình quầy; chuyển trạng thái pha chế bằng một lần chạm, giảm ghi chép thủ công và thu tiền mặt giờ cao điểm. | Cao |
| S3 | **Quản lý cửa hàng** | Kiểm soát danh mục thực đơn, giá bán, điều kiện khuyến mãi và tồn kho được trừ tự động theo từng đơn; tra cứu lịch sử giao dịch để đối soát doanh thu; hệ thống ổn định với chi phí hạ tầng thấp. | Cao |
| S4 | **Giảng viên / khách hàng nghiệm thu** | Đánh giá mức độ hoàn thiện và tính nhất quán của toàn bộ tạo phẩm: SRS, sơ đồ UML, kiến trúc, mã nguồn, kiểm thử tự động, CI/CD và phiên bản production truy cập ổn định qua HTTPS. | Cao |
| S5 | **Nhóm phát triển** | Phân bổ hợp lý công việc trong hai Sprint với công nghệ bắt buộc Next.js, NestJS, PostgreSQL, Docker; chuẩn hóa quản lý mã nguồn qua Git, review Pull Request và chốt chặn kiểm thử tự động trên CI trước khi bàn giao. | Trung bình |
| S6 | **Đơn vị thanh toán** (mô phỏng) | Xử lý yêu cầu thanh toán ví/thẻ nhất quán; bảo đảm tính idempotent bằng Idempotency-Key, không lưu dữ liệu thẻ nhạy cảm và trả kết quả giao dịch minh bạch cho máy chủ. | Trung bình |

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
