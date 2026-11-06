import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './setup-db';

/** INT-T01, INT-T02: API menu + health */
describe('Products & Health (integration)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    ({ app, dataSource: ds } = await createTestApp());
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /health -> 200 ok với database up', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.checks.database).toBe('up');
  });

  it('GET /products -> danh sách sản phẩm có size & topping', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(10);
    const milkTea = res.body.find((p: { name: string }) => p.name.includes('Trà sữa trân châu'));
    expect(milkTea.sizes.map((s: { name: string }) => s.name)).toEqual(['S', 'M', 'L']);
    expect(milkTea.toppings.length).toBeGreaterThan(0);
  });

  it('GET /products?category=COFFEE chỉ trả cà phê', async () => {
    const res = await request(app.getHttpServer()).get('/products?category=COFFEE').expect(200);
    expect(res.body.every((p: { category: string }) => p.category === 'COFFEE')).toBe(true);
  });

  it('GET /products/:id -> chi tiết; id lạ -> 404; id sai định dạng -> 400', async () => {
    const list = await request(app.getHttpServer()).get('/products');
    const id = list.body[0].id;
    const res = await request(app.getHttpServer()).get(`/products/${id}`).expect(200);
    expect(res.body.id).toBe(id);
    await request(app.getHttpServer())
      .get('/products/00000000-0000-4000-8000-000000000000')
      .expect(404);
    await request(app.getHttpServer()).get('/products/not-a-uuid').expect(400);
  });

  it('seed là idempotent (số sản phẩm không đổi khi chạy lại)', async () => {
    const before = await ds.query('SELECT COUNT(*)::int AS c FROM products');
    const { runSeed } = await import('../src/database/seed');
    await runSeed(ds);
    const after = await ds.query('SELECT COUNT(*)::int AS c FROM products');
    expect(after[0].c).toBe(before[0].c);
  });
});
