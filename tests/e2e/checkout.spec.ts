import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

/**
 * E2E-T01: Luồng end-to-end Menu → Chi tiết → Giỏ → Đăng ký → Checkout → Thanh toán → Xác nhận
 * E2E-T02: Thanh toán thất bại (thẻ ...0002) rồi thử lại thành công bằng ví
 * E2E-T03: Trạng thái empty / hết hàng trên menu
 */
test.describe('BrewLite – luồng đặt và thanh toán đơn hàng', () => {
  test('E2E-T01 đặt đơn và thanh toán ví thành công, thấy xác nhận và lịch sử', async ({ page }) => {
    // 1. Menu hiển thị sản phẩm
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'BrewLite' })).toBeVisible();
    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(5);

    // 2. Chi tiết: chọn size L + topping, số lượng 2
    await page.getByRole('link', { name: /Trà sữa trân châu/ }).click();
    await expect(page.getByRole('heading', { name: /Trà sữa trân châu/ })).toBeVisible();
    await page.getByText('L', { exact: true }).click();
    const topping = page.getByRole('checkbox').first();
    await topping.check();
    await page.getByRole('button', { name: 'Tăng' }).click();
    await expect(page.getByTestId('quantity')).toHaveText('2');
    await page.getByRole('button', { name: /Thêm vào giỏ/ }).click();

    // 3. Giỏ hàng có badge và tạm tính
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
    await page.goto('/cart');
    await expect(page.getByTestId('cart-line')).toHaveCount(1);
    const subtotalText = await page.getByTestId('cart-subtotal').innerText();
    expect(subtotalText).toMatch(/đ$/);

    // 4. Chưa đăng nhập -> chuyển tới login -> đăng ký tài khoản mới
    await page.getByRole('button', { name: 'Đăng nhập để đặt đơn' }).click();
    await expect(page).toHaveURL(/\/login\?next=(%2F|\/)checkout/);
    await page.getByRole('link', { name: 'Đăng ký' }).click();
    const email = `e2e-${Date.now()}@test.dev`;
    await page.getByLabel('Họ và tên').fill('Khách E2E');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mật khẩu').fill('Secret@123');
    await page.getByRole('button', { name: 'Đăng ký' }).click();

    // 5. Checkout: áp mã khuyến mãi, chọn ví, thanh toán
    await expect(page).toHaveURL(/\/checkout/);
    await page.getByLabel('Mã khuyến mãi').fill('WELCOME10');
    await page.getByRole('button', { name: 'Áp dụng' }).click();
    await expect(page.getByText(/Đã áp dụng WELCOME10/)).toBeVisible();
    await page.getByText('Ví điện tử').click();
    await page.getByTestId('pay-button').click();

    // 6. Xác nhận đơn
    await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/BL-[A-Z2-9]{5}/).first()).toBeVisible();
    await expect(page.getByTestId('status-badge')).toHaveText('Đã thanh toán');
    await expect(page.getByText('Thành công', { exact: true })).toBeVisible();

    // 7. Lịch sử đơn có đơn vừa tạo; giỏ đã trống; điểm thưởng > 0
    await page.goto('/orders');
    await expect(page.getByTestId('order-row').first()).toContainText('Đã thanh toán');
    await page.goto('/cart');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await page.goto('/account');
    const points = Number(await page.getByTestId('loyalty-points').innerText());
    expect(points).toBeGreaterThan(0);
  });

  test('E2E-T02 thẻ bị từ chối -> báo lỗi, đơn PENDING, thử lại bằng ví thành công', async ({ page, request }) => {
    // Đăng ký qua API cho nhanh, rồi nạp token vào localStorage
    const email = `e2e-fail-${Date.now()}@test.dev`;
    const reg = await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'Secret@123', fullName: 'Khách Thẻ Lỗi' },
    });
    expect(reg.ok()).toBeTruthy();
    const { accessToken, user } = await reg.json();
    await page.goto('/');
    await page.evaluate(
      ([t, u]) => {
        localStorage.setItem('brewlite.token', t);
        localStorage.setItem('brewlite.user', u);
      },
      [accessToken, JSON.stringify(user)],
    );

    await page.goto('/');
    await page.getByRole('link', { name: /Cà phê sữa đá/ }).click();
    await page.getByRole('button', { name: /Thêm vào giỏ/ }).click();
    await page.goto('/checkout');

    await page.getByText('Thẻ ngân hàng').click();
    await page.getByLabel(/Số thẻ/).fill('4000 0000 0000 0002');
    await page.getByTestId('pay-button').click();
    await expect(page.getByTestId('payment-error')).toContainText('Ngân hàng từ chối giao dịch', { timeout: 20_000 });
    await expect(page.getByTestId('pay-button')).toHaveText('Thử thanh toán lại');

    await page.getByText('Ví điện tử').click();
    await page.getByTestId('pay-button').click();
    await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 20_000 });
  });

  test('E2E-T03 menu hiển thị món hết hàng và lọc theo danh mục', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Hết hàng').first()).toBeVisible();
    await page.getByRole('button', { name: 'Bánh' }).click();
    const names = await page.getByTestId('product-card').allInnerTexts();
    expect(names.every((n) => /Bánh/.test(n))).toBe(true);
    await page.getByLabel('Tìm món').fill('không-tồn-tại-xyz');
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('E2E-T04 API health và bảo vệ endpoint bằng JWT', async ({ request }) => {
    const health = await request.get(`${API_URL}/health`);
    expect(health.ok()).toBeTruthy();
    expect((await health.json()).status).toBe('ok');
    const unauthorized = await request.post(`${API_URL}/orders`, { data: { items: [] } });
    expect(unauthorized.status()).toBe(401);
  });
});
