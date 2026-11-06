# Architecture Decision Records (ADR)

Mỗi quyết định kiến trúc quan trọng được ghi ngắn gọn theo mẫu: **Bối cảnh → Quyết định → Hệ quả**. Trạng thái: Proposed / Accepted / Superseded.

| # | Tiêu đề | Trạng thái |
|---|---|---|
| [001](./001-monorepo.md) | Monorepo apps/web + apps/api + docs | Accepted |
| [002](./002-modular-monolith-nestjs.md) | Modular monolith NestJS thay vì microservices | Accepted |
| [003](./003-jwt-auth.md) | Xác thực bằng JWT stateless, lưu localStorage | Accepted |
| [004](./004-typeorm-migrations.md) | TypeORM với migration thủ công, không synchronize | Accepted |
| [005](./005-mock-payment-service.md) | Dịch vụ thanh toán mô phỏng sau interface | Accepted |
| [006](./006-idempotent-payments.md) | Idempotency key cho thanh toán | Accepted |
| [007](./007-render-ghcr-deployment.md) | Triển khai Render + GHCR, deploy bằng deploy hook | Accepted |
| [008](./008-nextjs-pwa-client-state.md) | Next.js App Router, PWA thủ công, Zustand cho giỏ hàng | Accepted |
