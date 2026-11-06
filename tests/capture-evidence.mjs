/**
 * Chụp ảnh minh chứng cho báo cáo (chương 8) – chạy khi API + Web đang chạy.
 *   node capture-evidence.mjs
 *   (production: WEB_URL=... API_URL=... OUT_DIR=../docs/evidence/production node capture-evidence.mjs)
 * Ảnh lưu vào docs/evidence/screens/*.png
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const API = process.env.API_URL ?? 'http://localhost:4000';
const OUT =
  process.env.OUT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'evidence', 'screens');
mkdirSync(OUT, { recursive: true });

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(`OK   ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${String(e?.message ?? e).split('\n')[0]}`);
  }
}

const browser = await chromium.launch();
const mobile = await browser.newContext({ ...devices['Pixel 7'], locale: 'vi-VN' });
const page = await mobile.newPage();
page.setDefaultTimeout(90000); // Render free tier có thể mất ~60s để "thức dậy"
const shot = async (file) => {
  await page.waitForTimeout(3500); // chờ toast (3,2 giây) tắt để ảnh không bị che
  await page.screenshot({ path: join(OUT, file), fullPage: true });
};

await step('01 menu', async () => {
  await page.goto(WEB);
  await page.getByTestId('product-card').first().waitFor();
  await page.waitForTimeout(800);
  await shot('01-menu.png');
});

await step('02 chi tiết sản phẩm', async () => {
  await page.getByRole('link', { name: /Trà sữa trân châu/ }).click();
  await page.getByRole('heading', { name: /Trà sữa trân châu/ }).waitFor();
  await page.getByText('L', { exact: true }).click();
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Tăng' }).click();
  await shot('02-chi-tiet.png');
  await page.getByRole('button', { name: /Thêm vào giỏ/ }).click();
});

await step('03 giỏ hàng', async () => {
  await page.goto(`${WEB}/cart`);
  await page.getByTestId('cart-line').first().waitFor();
  await shot('03-gio-hang.png');
});

const email = `demo-${Date.now()}@brewlite.dev`;
await step('04 đăng ký', async () => {
  await page.getByRole('button', { name: 'Đăng nhập để đặt đơn' }).click();
  await page.waitForURL(/\/login/);
  await page.getByLabel('Email').waitFor();
  await page.waitForTimeout(500);
  await shot('04a-dang-nhap.png');
  await page.getByRole('link', { name: 'Đăng ký' }).click();
  await page.getByLabel('Họ và tên').fill('Khách Demo');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill('Secret@123');
  await shot('04b-dang-ky.png');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await page.waitForURL(/\/checkout/);
});

await step('05 thanh toán – mã KM + thẻ bị từ chối', async () => {
  await page.getByLabel('Mã khuyến mãi').fill('WELCOME10');
  await page.getByRole('button', { name: 'Áp dụng' }).click();
  await page.getByText(/Đã áp dụng WELCOME10/).waitFor();
  await shot('05a-checkout.png');
  await page.getByText('Thẻ ngân hàng').click();
  await page.getByLabel(/Số thẻ/).fill('4000 0000 0000 0002');
  await page.getByTestId('pay-button').click();
  await page.getByTestId('payment-error').waitFor({ timeout: 20000 });
  await shot('05b-the-bi-tu-choi.png');
});

await step('06 thanh toán ví thành công – xác nhận', async () => {
  await page.getByText('Ví điện tử').click();
  await page.getByTestId('pay-button').click();
  await page.getByTestId('order-confirmation').waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await shot('06-xac-nhan.png');
});

await step('07 lịch sử đơn + tài khoản', async () => {
  await page.goto(`${WEB}/orders`);
  await page.getByTestId('order-row').first().waitFor();
  await shot('07a-lich-su-don.png');
  await page.goto(`${WEB}/account`);
  await page.getByTestId('loyalty-points').waitFor();
  await shot('07b-tai-khoan.png');
});

await step('08 màn hình quầy (staff)', async () => {
  // Rời trang tài khoản và chờ mọi request (GET /auth/me) xong, tránh ghi đè phiên staff
  await page.goto(`${WEB}/login`);
  await page.waitForLoadState('networkidle');
  const res = await page.request.post(`${API}/auth/login`, {
    data: { email: 'staff@brewlite.dev', password: 'Staff@123' },
  });
  const { accessToken, user } = await res.json();
  await page.evaluate(
    ([t, u]) => {
      localStorage.setItem('brewlite.token', t);
      localStorage.setItem('brewlite.user', u);
    },
    [accessToken, JSON.stringify(user)],
  );
  await page.goto(`${WEB}/staff`);
  await page.waitForURL(/\/staff/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  if (!page.url().includes('/staff')) throw new Error('bị chuyển hướng khỏi /staff');
  await shot('08-man-hinh-quay.png');
});

await mobile.close();

const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const dpage = await desktop.newPage();
dpage.setDefaultTimeout(90000);
await step('09 Swagger', async () => {
  await dpage.goto(`${API}/docs`);
  await dpage.getByText('BrewLite API').first().waitFor({ timeout: 90000 });
  await dpage.waitForTimeout(1000);
  await dpage.screenshot({ path: join(OUT, '09-swagger.png'), fullPage: false });
});
await step('10 health', async () => {
  await dpage.goto(`${API}/health`);
  await dpage.screenshot({ path: join(OUT, '10-health.png') });
});
await step('11 menu desktop', async () => {
  await dpage.goto(WEB);
  await dpage.getByTestId('product-card').first().waitFor();
  await dpage.waitForTimeout(800);
  await dpage.screenshot({ path: join(OUT, '11-menu-desktop.png'), fullPage: false });
});

await browser.close();
console.log(results.join('\n'));
if (results.some((r) => r.startsWith('FAIL'))) process.exitCode = 1;
