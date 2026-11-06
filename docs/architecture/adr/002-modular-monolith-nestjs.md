# ADR-002: Modular monolith NestJS thay vì microservices

- **Trạng thái:** Accepted
- **Bối cảnh:** Luồng đặt đơn cần kiểm tra tồn kho, trừ kho, tạo đơn và thanh toán **nguyên tử**. Nhóm nhỏ, 2 Sprint, hạ tầng free tier.
- **Quyết định:** Một ứng dụng NestJS duy nhất, chia **module theo domain** (products, auth, orders, payments, promotions, loyalty, health). Nghiệp vụ dùng transaction PostgreSQL (`DataSource.transaction`, `FOR UPDATE`). Payment Service là một provider nội bộ sau interface (ADR-005).
- **Hệ quả:**
  - (+) ACID đơn giản, không cần saga/outbox; một image Docker, một service trên Render.
  - (+) Ranh giới module rõ → có thể tách service sau nếu cần.
  - (−) Scale toàn bộ API cùng lúc; chấp nhận vì API stateless (NFR-09).
