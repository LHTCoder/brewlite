import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { createTestApp, resetTransactionalData } from './setup-db';

/** INT-T17..INT-T20: phân quyền 3 vai trò, quản lý menu (FR-16), tài khoản nhân viên (FR-18) */
describe('Phân quyền và chức năng quản lý (integration)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let customer: string;
  let staff: string;
  let manager: string;
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const login = async (email: string, password: string) =>
    (await http().post('/auth/login').send({ email, password }).expect(200)).body
      .accessToken as string;

  // Ảnh JPEG 1x1 điểm ảnh
  const tinyJpeg =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  beforeAll(async () => {
    ({ app, dataSource: ds } = await createTestApp());
    await resetTransactionalData(ds);
    await ds.query(`DELETE FROM users WHERE email LIKE 'nv-%@test.dev'`);
    customer = await login('customer@brewlite.dev', 'Customer@123');
    staff = await login('staff@brewlite.dev', 'Staff@123');
    manager = await login('manager@brewlite.dev', 'Manager@123');
  });
  afterAll(async () => {
    await ds.query(`DELETE FROM users WHERE email LIKE 'nv-%@test.dev'`);
    await app.close();
  });

  it('INT-T17 quầy và quản lý không đặt, không thanh toán, không xem lịch sử mua', async () => {
    const products = (await http().get('/products').expect(200)).body;
    const p = products.find((x: { stock: number }) => x.stock > 5);
    const body = { items: [{ productId: p.id, sizeId: p.sizes[0]?.id, quantity: 1 }] };
    for (const t of [staff, manager]) {
      await http().post('/orders').set(auth(t)).send(body).expect(403);
      await http().get('/orders/me').set(auth(t)).expect(403);
    }
    const order = (await http().post('/orders').set(auth(customer)).send(body).expect(201)).body;
    for (const t of [staff, manager]) {
      await http()
        .post('/payments')
        .set(auth(t))
        .send({ orderId: order.id, method: 'WALLET', idempotencyKey: randomUUID() })
        .expect(403);
    }
    // Quầy vẫn xem được hàng đợi
    await http().get('/orders/staff/all').set(auth(staff)).expect(200);
  });

  it('INT-T18 chỉ quản lý sửa được menu; món bị ẩn không hiện ở menu khách', async () => {
    for (const t of [customer, staff]) {
      await http().get('/admin/products').set(auth(t)).expect(403);
      await http().get('/admin/users').set(auth(t)).expect(403);
    }
    const all = (await http().get('/admin/products').set(auth(manager)).expect(200)).body;
    const target = all.find((x: { name: string }) => x.name === 'Latte');
    const updated = (
      await http()
        .patch(`/admin/products/${target.id}`)
        .set(auth(manager))
        .send({ basePrice: 47000, stock: 12, isAvailable: false })
        .expect(200)
    ).body;
    expect(updated.basePrice).toBe(47000);
    expect(updated.stock).toBe(12);
    let menu = (await http().get('/products').expect(200)).body;
    expect(menu.some((x: { id: string }) => x.id === target.id)).toBe(false);

    await http()
      .patch(`/admin/products/${target.id}`)
      .set(auth(manager))
      .send({ basePrice: target.basePrice, stock: target.stock, isAvailable: true })
      .expect(200);
    menu = (await http().get('/products').expect(200)).body;
    expect(menu.some((x: { id: string }) => x.id === target.id)).toBe(true);
    await http()
      .patch(`/admin/products/${target.id}`)
      .set(auth(manager))
      .send({ basePrice: -5 })
      .expect(400);
  });

  it('INT-T19 quản lý thêm món mới và đổi ảnh món; ảnh được phục vụ qua /media', async () => {
    const created = (
      await http()
        .post('/admin/products')
        .set(auth(manager))
        .send({
          name: `Cà phê muối ${Date.now()}`,
          category: 'COFFEE',
          basePrice: 35000,
          stock: 20,
        })
        .expect(201)
    ).body;
    expect(created.sizes.map((s: { name: string }) => s.name).sort()).toEqual(['L', 'M', 'S']);

    await http()
      .put(`/admin/products/${created.id}/image`)
      .set(auth(manager))
      .send({ dataUrl: 'data:text/html;base64,PGgxPg==' })
      .expect(400);
    const withImage = (
      await http()
        .put(`/admin/products/${created.id}/image`)
        .set(auth(manager))
        .send({ dataUrl: tinyJpeg })
        .expect(200)
    ).body;
    expect(withImage.imageUrl).toMatch(new RegExp(`^/media/products/${created.id}\\?v=\\d+$`));
    const img = await http().get(`/media/products/${created.id}`).expect(200);
    expect(img.headers['content-type']).toContain('image/jpeg');
    expect(img.headers['cross-origin-resource-policy']).toBe('cross-origin');

    await ds.query('DELETE FROM products WHERE id = $1', [created.id]);
  });

  it('INT-T20 quản lý cấp, khóa, mở khóa và đặt lại mật khẩu tài khoản nhân viên', async () => {
    const email = `nv-${Date.now()}@test.dev`;
    const created = (
      await http()
        .post('/admin/users')
        .set(auth(manager))
        .send({ email, fullName: 'Nhân viên mới', password: 'Quay@12345', role: 'STAFF' })
        .expect(201)
    ).body;
    expect(created.role).toBe('STAFF');
    expect(created.passwordHash).toBeUndefined();
    await http()
      .post('/admin/users')
      .set(auth(manager))
      .send({ email, fullName: 'Trùng', password: 'Quay@12345', role: 'STAFF' })
      .expect(409);
    await http()
      .post('/admin/users')
      .set(auth(manager))
      .send({
        email: `nv-x-${Date.now()}@test.dev`,
        fullName: 'Sai vai trò',
        password: 'Quay@12345',
        role: 'CUSTOMER',
      })
      .expect(400);

    const t = await login(email, 'Quay@12345');
    await http().get('/orders/staff/all').set(auth(t)).expect(200);

    // Khóa: không đăng nhập được, token cũ bị từ chối
    await http()
      .patch(`/admin/users/${created.id}/status`)
      .set(auth(manager))
      .send({ isActive: false })
      .expect(200);
    await http().post('/auth/login').send({ email, password: 'Quay@12345' }).expect(403);
    await http().get('/orders/staff/all').set(auth(t)).expect(401);

    // Mở khóa + đặt lại mật khẩu
    await http()
      .patch(`/admin/users/${created.id}/status`)
      .set(auth(manager))
      .send({ isActive: true })
      .expect(200);
    await http()
      .post(`/admin/users/${created.id}/reset-password`)
      .set(auth(manager))
      .send({ password: 'MoiDoi@2026' })
      .expect(201);
    await http().post('/auth/login').send({ email, password: 'Quay@12345' }).expect(401);
    await login(email, 'MoiDoi@2026');

    // Không tự khóa mình, không đụng tài khoản khách
    const me = (await http().get('/auth/me').set(auth(manager)).expect(200)).body;
    await http()
      .patch(`/admin/users/${me.id}/status`)
      .set(auth(manager))
      .send({ isActive: false })
      .expect(400);
    const cust = (await http().get('/auth/me').set(auth(customer)).expect(200)).body;
    await http()
      .patch(`/admin/users/${cust.id}/status`)
      .set(auth(manager))
      .send({ isActive: false })
      .expect(404);
    const list = (await http().get('/admin/users').set(auth(manager)).expect(200)).body;
    expect(list.every((u: { role: string }) => u.role !== 'CUSTOMER')).toBe(true);
  });
});
