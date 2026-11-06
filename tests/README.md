# tests/ – Kiểm thử tích hợp & end-to-end

| Loại | Vị trí | Công cụ | Chạy |
|---|---|---|---|
| Unit (API) | `apps/api/src/**/*.spec.ts` | Jest | `cd apps/api && npm test` |
| Integration (API + Postgres) | `apps/api/test/*.e2e-spec.ts` | Jest + Supertest | `cd apps/api && DATABASE_URL=... npm run test:integration` |
| Unit/Component (Web) | `apps/web/src/**/*.test.ts(x)` | Vitest + Testing Library | `cd apps/web && npm test` |
| **End-to-end** | `tests/e2e/*.spec.ts` | Playwright (Pixel 7) | xem dưới |

## Chạy E2E ở local

```bash
docker compose up -d --build            # web :3000, api :4000, db
cd tests && npm install && npx playwright install chromium
npm run e2e                             # hoặc npm run e2e:headed
npm run e2e:report                      # xem báo cáo HTML
```

Chạy với production: `WEB_URL=https://brewlite-web-00zk.onrender.com API_URL=https://brewlite-api-t8xs.onrender.com npm run e2e`

Mapping test ↔ yêu cầu: xem [docs/traceability-matrix.md](../docs/traceability-matrix.md).
