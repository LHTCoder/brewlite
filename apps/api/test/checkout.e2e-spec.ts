import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { createTestApp, resetTransactionalData } from './setup-db';

/**
 * INT-T03..INT-T09: luồng UC-10 Đặt và thanh toán đơn hàng
 * (auth -> tạo đơn -> thanh toán -> idempotency -> trạng thái -> lịch sử)
 */
describe('Checkout flow (integration)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let token: string;
  let staffToken: string;
  let milkTea: {
    id: string;
    sizes: { id: string; name: string }[];
    toppings: { id: string; price: number }[];
    basePrice: number;
  };
  let outOfStock: { id: string; sizes: { id: string }[] };

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    ({ app, dataSource: ds } = await createTestApp());
    await resetTransactionalData(ds);

    const login = await http()
      .post('/auth/login')
      .send({ email: 'customer@brewlite.dev', password: 'Customer@123' })
      .expect(200);
    token = login.body.accessToken;

    const staff = await http()
      .post('/auth/login')
      .send({ email: 'staff@brewlite.dev', password: 'Staff@123' })
      .expect(200);
    staffToken = staff.body.accessToken;

    const products = await http().get('/products');
    milkTea = products.body.find((p: { name: string }) => p.name.includes('Trà sữa trân châu'));
    // Trà vải stock = 0 nhưng is_available = true -> lấy trực tiếp từ DB
    const rows = await ds.query(`SELECT id FROM products WHERE name = 'Trà vải'`);
    const detail = await http().get(`/products/${rows[0].id}`);
    outOfStock = detail.body;
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('INT-T03 đăng ký tài khoản mới và từ chối email trùng / dữ liệu sai', async () => {
    const email = `user-${randomUUID().slice(0, 8)}@test.dev`;
    const res = await http()
      .post('/auth/register')
      .send({ email, password: 'Secret@123', fullName: 'Người Thử' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    await http()
      .post('/auth/register')
      .send({ email, password: 'Secret@123', fullName: 'Người Thử' })
      .expect(409);
    const bad = await http()
      .post('/auth/register')
      .send({ email: 'không-phải-email', password: '123', fullName: 'A' })
      .expect(400);
    expect(Array.isArray(bad.body.message)).toBe(true);
  });

  it('INT-T04 tạo đơn không có token -> 401', async () => {
    await http()
      .post('/orders')
      .send({ items: [{ productId: milkTea.id, quantity: 1 }] })
      .expect(401);
  });

  it('INT-T05 tạo đơn: server tính giá đúng và trừ tồn kho', async () => {
    const sizeL = milkTea.sizes.find((s) => s.name === 'L')!;
    const topping = milkTea.toppings[0];
    const before = await ds.query('SELECT stock FROM products WHERE id = $1', [milkTea.id]);

    const res = await http()
      .post('/orders')
      .set(auth(token))
      .send({
        items: [{ productId: milkTea.id, sizeId: sizeL.id, toppingIds: [topping.id], quantity: 2 }],
        promotionCode: 'WELCOME10',
        note: 'Ít đá',
      })
      .expect(201);

    const expectedUnit = milkTea.basePrice + 10000 + topping.price;
    expect(res.body.status).toBe('PENDING');
    expect(res.body.items[0].unitPrice).toBe(expectedUnit);
    expect(res.body.subtotal).toBe(expectedUnit * 2);
    expect(res.body.discount).toBe(Math.min(Math.floor((expectedUnit * 2) / 10), 20000));
    expect(res.body.total).toBe(res.body.subtotal - res.body.discount);
    expect(res.body.code).toMatch(/^BL-/);

    const after = await ds.query('SELECT stock FROM products WHERE id = $1', [milkTea.id]);
    expect(after[0].stock).toBe(before[0].stock - 2);
  });

  it('INT-T06 hết hàng -> 422 và không tạo đơn', async () => {
    const count = await ds.query('SELECT COUNT(*)::int AS c FROM orders');
    const res = await http()
      .post('/orders')
      .set(auth(token))
      .send({ items: [{ productId: outOfStock.id, sizeId: outOfStock.sizes[0].id, quantity: 1 }] })
      .expect(422);
    expect(res.body.message).toMatch(/chỉ còn 0/);
    const count2 = await ds.query('SELECT COUNT(*)::int AS c FROM orders');
    expect(count2[0].c).toBe(count[0].c);
  });

  it('INT-T07 validate: giỏ trống / số lượng 0 / mã KM sai -> 400', async () => {
    await http().post('/orders').set(auth(token)).send({ items: [] }).expect(400);
    await http()
      .post('/orders')
      .set(auth(token))
      .send({ items: [{ productId: milkTea.id, sizeId: milkTea.sizes[0].id, quantity: 0 }] })
      .expect(400);
    const bad = await http()
      .post('/orders')
      .set(auth(token))
      .send({
        items: [{ productId: milkTea.id, sizeId: milkTea.sizes[0].id, quantity: 1 }],
        promotionCode: 'KHONGTONTAI',
      })
      .expect(400);
    expect(bad.body.message).toMatch(/không tồn tại/);
  });

  describe('thanh toán', () => {
    let orderId: string;
    beforeAll(async () => {
      const res = await http()
        .post('/orders')
        .set(auth(token))
        .send({ items: [{ productId: milkTea.id, sizeId: milkTea.sizes[0].id, quantity: 1 }] })
        .expect(201);
      orderId = res.body.id;
    });

    it('INT-T08 thẻ bị từ chối -> payment FAILED, đơn vẫn PENDING', async () => {
      const res = await http()
        .post('/payments')
        .set(auth(token))
        .send({
          orderId,
          method: 'CARD',
          cardNumber: '4000000000000002',
          idempotencyKey: randomUUID(),
        })
        .expect(201);
      expect(res.body.status).toBe('FAILED');
      expect(res.body.failureReason).toBe('Ngân hàng từ chối giao dịch');
      const order = await http().get(`/orders/${orderId}`).set(auth(token)).expect(200);
      expect(order.body.status).toBe('PENDING');
    });

    it('INT-T09 thanh toán ví thành công -> PAID, cộng điểm; gửi lại cùng key -> idempotent', async () => {
      const key = randomUUID();
      const first = await http()
        .post('/payments')
        .set(auth(token))
        .send({ orderId, method: 'WALLET', idempotencyKey: key })
        .expect(201);
      expect(first.body.status).toBe('SUCCEEDED');
      expect(first.body.providerRef).toMatch(/^WALLET-/);

      // Retry với cùng idempotency key -> cùng payment id, không tạo bản ghi mới
      const replay = await http()
        .post('/payments')
        .set(auth(token))
        .send({ orderId, method: 'WALLET', idempotencyKey: key })
        .expect(201);
      expect(replay.body.id).toBe(first.body.id);
      const cnt = await ds.query('SELECT COUNT(*)::int AS c FROM payments WHERE order_id = $1', [
        orderId,
      ]);
      expect(cnt[0].c).toBe(1);

      // Đơn đã PAID, thanh toán lần nữa với key mới -> 400
      await http()
        .post('/payments')
        .set(auth(token))
        .send({ orderId, method: 'WALLET', idempotencyKey: randomUUID() })
        .expect(400);

      const order = await http().get(`/orders/${orderId}`).set(auth(token)).expect(200);
      expect(order.body.status).toBe('PAID');
      expect(order.body.payment.status).toBe('SUCCEEDED');

      const me = await http().get('/auth/me').set(auth(token)).expect(200);
      expect(me.body.loyaltyPoints).toBe(Math.floor(order.body.total / 10000));
      const tx = await http().get('/loyalty/transactions').set(auth(token)).expect(200);
      expect(tx.body[0].type).toBe('EARN');
    });

    it('INT-T10 nhân viên cập nhật trạng thái theo máy trạng thái; khách bị cấm', async () => {
      await http()
        .patch(`/orders/${orderId}/status`)
        .set(auth(token))
        .send({ status: 'PREPARING' })
        .expect(403);
      await http()
        .patch(`/orders/${orderId}/status`)
        .set(auth(staffToken))
        .send({ status: 'COMPLETED' })
        .expect(400); // PAID -> COMPLETED không hợp lệ
      await http()
        .patch(`/orders/${orderId}/status`)
        .set(auth(staffToken))
        .send({ status: 'PREPARING' })
        .expect(200);
      const r = await http()
        .patch(`/orders/${orderId}/status`)
        .set(auth(staffToken))
        .send({ status: 'READY' })
        .expect(200);
      expect(r.body.status).toBe('READY');
    });

    it('INT-T11 lịch sử đơn của khách chứa đơn vừa tạo, mới nhất trước', async () => {
      const res = await http().get('/orders/me').set(auth(token)).expect(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0].id).toBe(orderId);
      const t = res.body.map((o: { createdAt: string }) => +new Date(o.createdAt));
      expect([...t].sort((a, b) => b - a)).toEqual(t);
    });
  });

  it('INT-T12 hủy đơn PENDING hoàn tồn kho; không hủy được đơn người khác', async () => {
    const before = await ds.query('SELECT stock FROM products WHERE id = $1', [milkTea.id]);
    const created = await http()
      .post('/orders')
      .set(auth(token))
      .send({ items: [{ productId: milkTea.id, sizeId: milkTea.sizes[0].id, quantity: 3 }] })
      .expect(201);

    const other = await http()
      .post('/auth/register')
      .send({
        email: `o-${randomUUID().slice(0, 6)}@t.dev`,
        password: 'Secret@123',
        fullName: 'Khác',
      });
    await http()
      .post(`/orders/${created.body.id}/cancel`)
      .set(auth(other.body.accessToken))
      .expect(403);

    const res = await http().post(`/orders/${created.body.id}/cancel`).set(auth(token)).expect(201);
    expect(res.body.status).toBe('CANCELLED');
    const after = await ds.query('SELECT stock FROM products WHERE id = $1', [milkTea.id]);
    expect(after[0].stock).toBe(before[0].stock);
  });
});
