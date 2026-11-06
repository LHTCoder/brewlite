# BrewLite – Ma trận truy vết (Requirements Traceability Matrix)

Quy ước mã:
- **Sơ đồ**: UC-OV = use-case tổng quát, UC-01 = use-case checkout, Activity-01 = `activity-checkout` (end-to-end), Activity-02 = `activity-menu`, Activity-03 = `activity-cart`, Activity-04 = `activity-auth`, Activity-05 = `activity-order-status`, Sequence-01 = `sequence-checkout`, Sequence-02 = `sequence-auth`, Sequence-03 = `sequence-staff-status`, Class-01 = `class-domain`, State-01 = `order-state-machine`, Deploy-01 = `deployment-production`, C4-01 = `c4-container`.
- **Test**: `UNIT-T*` = `apps/api/src/**/*.spec.ts`; `INT-T*` = `apps/api/test/*.e2e-spec.ts`; `WEB-T*` = `apps/web/src/**/*.test.ts(x)`; `E2E-T*` = `tests/e2e/checkout.spec.ts`; `CI-*` = kiểm tra trong pipeline; `MAN-*` = kiểm thử thủ công (Sprint Review).

## 1. Yêu cầu chức năng

| Mã yêu cầu | Use-case / User Story | Thiết kế / Sơ đồ | Code / API | Test |
|---|---|---|---|---|
| FR-01 Xem menu | UC-02 · US-01 "Là khách, tôi muốn xem menu theo danh mục để chọn món" | UC-OV, Activity-02, Class-01 (Product, ProductCategory) | `GET /products` – `products.controller.ts`, `products.service.ts`; `apps/web/src/app/page.tsx`, `ProductCard.tsx`, `States.tsx` | API-T01/T02 (`products.service.spec.ts`), INT-T01 (`products.e2e-spec.ts`), WEB-T03 (`ProductCard.test.tsx`), E2E-T03 |
| FR-02 Chi tiết sản phẩm | UC-03 · US-02 "…xem size, topping, tồn kho" | Activity-02, Class-01 (ProductSize, Topping) | `GET /products/:id`; `apps/web/src/app/products/[id]/page.tsx` | API-T02, INT-T01 (404/400), E2E-T01 bước 2 |
| FR-03 Giỏ hàng & tổng tiền | UC-04 · US-03 | Activity-03, ADR-008 | `apps/web/src/store/cart.ts`, `lib/pricing.ts`, `app/cart/page.tsx` | WEB-T01 (`pricing.test.ts`), WEB-T02 (`cart.test.ts`), E2E-T01 bước 3 |
| FR-04 Đăng ký / đăng nhập / JWT | UC-05, UC-06 · US-04 | Activity-04, Sequence-02, ADR-003, Class-01 (User, UserRole) | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` – `auth.service.ts`, `jwt-auth.guard.ts`; `AuthForm.tsx` | API-T03 (`auth.service.spec.ts`), INT-T03, INT-T04, E2E-T01 bước 4, E2E-T04 |
| FR-05 Kiểm tra tồn kho | UC-01 bước 5, E1 · US-05 | Activity-01 (nhánh hết hàng), Sequence-01 (FOR UPDATE) | `OrdersService.create` (`setLock('pessimistic_write')`) | INT-T06, E2E-T03 (nhãn hết hàng) |
| FR-06 Tạo đơn hàng | UC-01 bước 4–5 · US-06 | Sequence-01, Class-01 (Order, OrderItem), State-01 | `POST /orders` – `orders.controller.ts`, `orders.service.ts`, `pricing.ts`, `create-order.dto.ts` | UNIT-T01/T02 (`pricing.spec.ts`), INT-T05, INT-T07, E2E-T01 |
| FR-07 Khuyến mãi | UC-01 bước 2, A2 · US-07 | Activity-01, Class-01 (Promotion, PromotionType) | `GET /promotions/:code` – `promotions.module.ts`; `applyPromotion` | UNIT-T03, INT-T05 (discount), INT-T07 (mã sai), E2E-T01 bước 5 |
| FR-08 Thanh toán Ví/Thẻ mô phỏng | UC-01 bước 6–8, A3 · US-08 | Sequence-01 (alt thành công/thất bại), ADR-005, Class-01 (Payment, PaymentMethod, PaymentStatus) | `POST /payments` – `payments.service.ts`, `payment-gateway.service.ts`; `app/checkout/page.tsx` | UNIT-T07 (`payment-gateway.service.spec.ts`), INT-T08, INT-T09, E2E-T01, E2E-T02 |
| FR-09 Idempotency thanh toán | UC-01 A4 · US-09 | Sequence-01 (nhánh key trùng), ADR-006 | `payments.service.ts` (lookup `idempotencyKey`), migration unique index `IDX_payments_idempotency` | INT-T09 (replay cùng key → 1 bản ghi) |
| FR-10 Xác nhận & theo dõi trạng thái | UC-07 · US-10 | Activity-05, Sequence-03, State-01 | `GET /orders/:id`; `app/orders/[id]/page.tsx`, `StatusBadge.tsx` | INT-T09 (status PAID), E2E-T01 bước 6 |
| FR-11 Lịch sử đơn | UC-08 · US-11 | Class-01 (User 1–* Order) | `GET /orders` – `OrdersService.findMine`; `app/orders/page.tsx` | INT-T11, E2E-T01 bước 7 |
| FR-12 Hủy đơn PENDING | UC-09 · US-12 | State-01 (PENDING→CANCELLED), Activity-05 | `POST /orders/:id/cancel` – `OrdersService.cancel` (hoàn kho) | INT-T12 |
| FR-13 Quản lý trạng thái đơn (quầy) | UC-11, UC-12 · US-13 | Activity-05, Sequence-03, State-01, Class-01 (OrderStatus) | `GET /orders/staff/all`, `PATCH /orders/:id/status` – `@Roles`, `ORDER_TRANSITIONS`; `app/staff/page.tsx` | UNIT-T06 (`orders.service.spec.ts`), INT-T10 (403/400/200), MAN-01 |
| FR-14 Điểm thưởng | UC-10, UC-01 bước 8 · US-14 | Class-01 (LoyaltyTransaction), Sequence-01 bước 43–44 | `PaymentsService.pay` (EARN), `GET /loyalty/transactions`; `app/account/page.tsx` | UNIT-T04 (`loyaltyPointsFor`), INT-T09 (điểm), E2E-T01 bước 7 |
| FR-15 Đổi điểm (Could) | — | Class-01 (REDEEM) | chưa hiện thực | — |
| FR-16 Quản trị menu (Could) | UC-13 | — | seed/SQL | — |

## 2. Yêu cầu phi chức năng

| Mã | Thiết kế / Sơ đồ | Code / cấu hình | Test / bằng chứng |
|---|---|---|---|
| NFR-01 Hiệu năng | C4-01, Deploy-01 (CDN/edge), ADR-008 (standalone) | query builder có index, `GET /products` 1 query join; Next.js static assets cache (sw.js) | MAN-02 Lighthouse mobile ≥ 85; `autocannon` p95 ≤ 300ms (ghi trong Sprint Review) |
| NFR-02 Bảo mật | ADR-003, Sequence-01 (verify JWT, validate) | `helmet`, CORS whitelist, `ValidationPipe({whitelist})`, bcrypt, `select:false` passwordHash, `configuration.ts` fail-fast secret | API-T03 (hash), INT-T03 (400/409), INT-T04 (401), INT-T10 (403), E2E-T04; CI `npm audit` (MAN-03) |
| NFR-03 Khả dụng (UX/PWA) | ADR-008 | `manifest.webmanifest`, `sw.js`, `/offline`, `States.tsx` (loading/empty/error), BottomNav 44px | WEB-T03, E2E-T03 (empty state), MAN-04 Lighthouse PWA installable |
| NFR-04 Độ tin cậy | Sequence-01 (transaction), ADR-006 | `DataSource.transaction`, `FOR UPDATE`, unique idempotency, Render persistent DB | INT-T05/T06 (rollback), INT-T09 (idempotent), INT-T12 (hoàn kho) |
| NFR-05 Khả năng triển khai | Deploy-01, ADR-004, ADR-007, `docs/deployment.md` | `docker-compose.yml`, Dockerfiles, `docker-entrypoint.sh` (migrate), `GET /health`, `ci.yml`, `cd.yml`, `rollback.yml`, `scripts/smoke-test.sh` | INT-T01 (health, seed idempotent), CI-01 pipeline xanh, CI-02 smoke test production, MAN-05 clone & chạy theo README |
| NFR-06 Bảo trì | architecture.md §2.2, ADR-002 | module theo domain, eslint + prettier, `pricing.ts` thuần | `npm run lint`, `npm run test:cov` ≥ 70% module nghiệp vụ |
| NFR-07 Quan sát | architecture.md §2.5 | `request-logger.middleware.ts`, `http-exception.filter.ts`, `health.controller.ts` (version) | smoke test kiểm tra `version`; Render Logs |
| NFR-08 Tương thích | — | Tailwind, không API trình duyệt mới | MAN-06 thử trên iOS Safari + Android Chrome |
| NFR-09 Mở rộng | ADR-002/003 (stateless) | JWT, không session | MAN-07 (tùy chọn) |

## 3. Truy vết ngược: Test → Yêu cầu

| Test | File | Yêu cầu |
|---|---|---|
| API-T01, API-T02 | `apps/api/src/products/products.service.spec.ts` | FR-01, FR-02 |
| API-T03 | `apps/api/src/auth/auth.service.spec.ts` | FR-04, NFR-02 |
| UNIT-T01…T05 | `apps/api/src/orders/pricing.spec.ts` | FR-06, FR-07, FR-14 |
| UNIT-T06 | `apps/api/src/orders/orders.service.spec.ts` | FR-13 |
| UNIT-T07 | `apps/api/src/payments/payment-gateway.service.spec.ts` | FR-08 |
| INT-T01, INT-T02 | `apps/api/test/products.e2e-spec.ts` | FR-01, FR-02, NFR-05 |
| INT-T03…T12 | `apps/api/test/checkout.e2e-spec.ts` | FR-04…FR-14, NFR-02, NFR-04 |
| WEB-T01, WEB-T02 | `apps/web/src/lib/pricing.test.ts`, `apps/web/src/store/cart.test.ts` | FR-03 |
| WEB-T03 | `apps/web/src/components/ProductCard.test.tsx` | FR-01, NFR-03 |
| E2E-T01…T04 | `tests/e2e/checkout.spec.ts` | Luồng end-to-end FR-01…FR-14, NFR-02 |
| CI-01, CI-02 | `.github/workflows/ci.yml`, `cd.yml` | NFR-05 |
