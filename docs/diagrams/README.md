# docs/diagrams – Sơ đồ UML (PlantUML)

Render: `java -jar plantuml.jar -tsvg -charset UTF-8 *.puml` (hoặc VS Code extension PlantUML). Mỗi `.puml` có `.svg` và `.png` đi kèm.

| Mã | Tệp | Loại | Task | Mô tả |
|---|---|---|---|---|
| UC-OV | use-case-overview | Use-case | 1.2 | Toàn hệ thống, 5 actor, 13 use-case |
| UC-10 | use-case-checkout | Use-case | 1.3 | Phạm vi UC-10 Đặt và thanh toán |
| Activity-01 | activity-checkout | Activity | 2.1 | Luồng end-to-end, swimlane 4 làn, nhánh hết hàng / chưa đăng nhập / thanh toán thất bại |
| Activity-02 | activity-menu | Activity | 2.1 | Xem menu, chi tiết sản phẩm (FR-01, FR-02) |
| Activity-03 | activity-cart | Activity | 2.1 | Giỏ hàng, tính tổng (FR-03) |
| Activity-04 | activity-auth | Activity | 2.1 | Đăng ký / đăng nhập (FR-04) |
| Activity-05 | activity-order-status | Activity | 2.1 | Theo dõi đơn & quầy cập nhật trạng thái (FR-10, FR-12, FR-13) |
| Sequence-01 | sequence-checkout | Sequence | 2.2 | UC-10: JWT, validate, transaction, alt thanh toán, idempotency |
| Sequence-02 | sequence-auth | Sequence | 2.2 (bổ trợ) | Đăng nhập, cấp JWT, gọi API bảo vệ |
| Sequence-03 | sequence-staff-status | Sequence | 2.2 (bổ trợ) | Nhân viên cập nhật trạng thái, khách theo dõi |
| Class-01 | class-domain | Class | 2.3 | 9 lớp miền, 7 enum, multiplicity |
| State-01 | order-state-machine | State | 2.3 (bổ trợ) | Máy trạng thái OrderStatus |
| C4-01 | c4-container | C4 Container | 3.1 | Kiến trúc container |
| Deploy-01 | deployment-production | Deployment | 3.2 | Production trên Render, ranh giới Local / CI / Production |
