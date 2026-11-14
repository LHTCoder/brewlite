# Số đo yêu cầu phi chức năng (NFR)

Đo ngày 14/11/2026, sau phản biện nội bộ (PR #19). Mỗi dòng ghi rõ đo ở đâu và bằng công cụ gì. Chỉ tiêu lấy từ [`srs.md`](../../requirements/srs.md) mục 4.

| NFR | Chỉ tiêu | Kết quả | Đánh giá |
|---|---|---|---|
| NFR-01 | `GET /products` p95 ≤ 300 ms với 50 người dùng đồng thời | **Local** (API bản build + PostgreSQL 16, `autocannon -c 50 -d 20`): 13.996 request, 0 lỗi, p50 = 65 ms, p97,5 = 117 ms, p99 = 141 ms, nên p95 ≤ 117 ms. `GET /products/:id`: p97,5 = 86 ms. | Đạt trên local |
| NFR-01 | (như trên) | **Production** Render gói Free, Singapore, đo từ trình duyệt ở TP.HCM sau khi đánh thức server: 1 người dùng, 60 request: p50 = 109 ms, p95 = 392 ms. 10 người dùng đồng thời, 300 request: p50 = 279 ms, p95 = 731 ms, 0 lỗi. | Chưa đạt trên production gói Free (0,1 CPU, thêm độ trễ mạng TP.HCM → Singapore). Nâng gói Starter là hướng xử lý |
| NFR-01 | Lighthouse mobile Performance ≥ 85 | Local (`next start`, Lighthouse 12, giả lập di động): Menu **98**, Chi tiết món **94**. LCP 2,3 s và 2,4 s | Đạt trên local |
| NFR-02 | `npm audit --audit-level=high` không có lỗ hổng High/Critical | API: 7 high, 9 moderate, đều nằm trong NestJS 10 và các thư viện đi kèm; bản sửa cần nâng lên NestJS 11 trở lên. Web: Next.js đã nâng 14.2.21 → 14.2.35 (bản cuối của nhánh 14), vẫn còn 1 critical, 1 high; bản sửa cần Next.js 15.5 trở lên. Xem `npm-audit-api.txt`, `npm-audit-web.txt` | **Chưa đạt.** Các lỗ hổng critical của Next.js nằm ở Image Optimizer, Server Actions, middleware và máy chủ Windows; BrewLite tắt Image Optimizer (`images.unoptimized`), không dùng Server Actions hay middleware, và chạy trên Linux. Việc nâng cấp NestJS 11 / Next.js 15 được đưa vào backlog |
| NFR-02 | Header bảo mật `X-Content-Type-Options`, `X-Frame-Options` | API: helmet. Web: thêm `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` trong `next.config.mjs` | Đạt |
| NFR-03 | Lighthouse Accessibility ≥ 90 | Lần đo đầu: Menu **89** (thiếu tương phản chữ, sai thứ tự tiêu đề, khóa phóng to). Sau khi sửa: Menu **100**, Chi tiết món **96** | Đạt sau khi sửa |
| NFR-06 | Coverage ≥ 70 % cho module nghiệp vụ (pricing, orders, payments) | Unit test (`npm run test:cov`): `pricing.ts` 97 %, `orders.service.ts` 18 %, `payments.service.ts` 29 %. Integration test với PostgreSQL thật (`npm run test:integration:cov`): `orders.service.ts` 92 %, `payments.service.ts` 78 %, toàn API 92,6 % statements | Chỉ tiêu ban đầu tính riêng unit test nên chưa đạt với orders và payments. Hai service này chạy trong transaction DB nên được kiểm chủ yếu bằng integration test; tính theo integration thì đạt |

Tệp kèm theo:

- `lighthouse-menu.html`, `lighthouse-chi-tiet.html`: báo cáo Lighthouse đầy đủ, mở bằng trình duyệt.
- `autocannon-local.json`: kết quả autocannon.
- `npm-audit-api.txt`, `npm-audit-web.txt`: kết quả `npm audit --omit=dev`.

Cách đo lại:

```bash
# API chạy ở cổng 4000 với DB có seed
npx autocannon -c 50 -d 20 http://localhost:4000/products
# Web chạy bằng next start ở cổng 3000
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices
cd apps/api && npm run test:cov && npm run test:integration:cov
npm audit --omit=dev
```
