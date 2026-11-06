/**
 * Quay video demo luồng end-to-end trên production (không cần người thao tác).
 *   WEB_URL=... API_URL=... node record-demo.mjs   -> ../docs/evidence/video/*.webm
 * Video có chú thích tiếng Việt ở đầu màn hình cho từng bước.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const API = process.env.API_URL ?? 'http://localhost:4000';
const OUT = process.env.OUT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'evidence', 'video');
mkdirSync(OUT, { recursive: true });

const W = 430, H = 860;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  isMobile: true,
  hasTouch: true,
  locale: 'vi-VN',
  recordVideo: { dir: OUT, size: { width: W * 2, height: H * 2 } },
  deviceScaleFactor: 2,
});
// Thanh chú thích cố định ở đầu màn hình, giữ nội dung qua các lần chuyển trang
await ctx.addInitScript(() => {
  const draw = () => {
    const t = sessionStorage.getItem('demo.caption');
    if (!t || !document.body) return;
    let el = document.getElementById('demo-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-caption';
      el.style.cssText =
        'position:fixed;left:8px;right:8px;bottom:76px;z-index:99999;background:rgba(40,24,14,.92);color:#fff;' +
        'font:600 15px/1.35 system-ui,sans-serif;padding:10px 12px;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.3);pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = t;
  };
  document.addEventListener('DOMContentLoaded', draw);
  setInterval(draw, 300);
});
const page = await ctx.newPage();
page.setDefaultTimeout(90000);
const pause = (ms = 1800) => page.waitForTimeout(ms);
const caption = async (text, ms = 2200) => {
  await page.evaluate((t) => {
    sessionStorage.setItem('demo.caption', t);
    const el = document.getElementById('demo-caption');
    if (el) el.textContent = t;
  }, text);
  await pause(ms);
};
const type = (loc, text) => loc.pressSequentially(text, { delay: 60 });

const steps = [];
async function step(name, fn) {
  try { await fn(); steps.push(`OK   ${name}`); } catch (e) { steps.push(`FAIL ${name}: ${String(e?.message ?? e).split('\n')[0]}`); }
}

await step('Mở menu', async () => {
  await page.goto(WEB);
  await page.getByTestId('product-card').first().waitFor();
  await caption('BrewLite – đặt đồ uống trước, nhận tại quầy. Bước 1: Xem menu (production, HTTPS)', 3500);
  await page.mouse.wheel(0, 500); await pause(1200); await page.mouse.wheel(0, -500);
  await page.getByRole('button', { name: 'Trà sữa', exact: true }).click();
  await caption('Lọc theo danh mục “Trà sữa”');
});

await step('Chi tiết sản phẩm', async () => {
  await page.getByRole('link', { name: /Trà sữa trân châu/ }).first().click();
  await page.getByRole('heading', { name: /Trà sữa trân châu/ }).waitFor();
  await caption('Bước 2: Chọn size L, thêm topping, số lượng 2 – giá cập nhật ngay');
  await page.getByText('L', { exact: true }).click(); await pause(900);
  await page.getByRole('checkbox').first().check(); await pause(900);
  await page.getByRole('button', { name: 'Tăng' }).click(); await pause(1200);
  await page.getByRole('button', { name: /Thêm vào giỏ/ }).click();
  await caption('Đã thêm vào giỏ hàng');
});

await step('Giỏ hàng', async () => {
  await page.goto(`${WEB}/cart`);
  await page.getByTestId('cart-line').first().waitFor();
  await caption('Bước 3: Giỏ hàng – tạm tính, tăng/giảm số lượng. Chưa đăng nhập nên phải đăng nhập để đặt đơn', 3000);
  await page.getByRole('button', { name: 'Đăng nhập để đặt đơn' }).click();
  await page.waitForURL(/\/login/);
});

await step('Đăng ký', async () => {
  await page.getByLabel('Email').waitFor();
  await caption('Bước 4: Chuyển tới đăng nhập (giỏ hàng vẫn giữ). Tạo tài khoản mới');
  await page.getByRole('link', { name: 'Đăng ký' }).click();
  await type(page.getByLabel('Họ và tên'), 'Khách Demo');
  await type(page.getByLabel('Email'), `demo-${Date.now()}@brewlite.dev`);
  await type(page.getByLabel('Mật khẩu'), 'Secret@123');
  await pause(800);
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await page.waitForURL(/\/checkout/);
});

await step('Mã khuyến mãi', async () => {
  await caption('Bước 5: Quay lại trang thanh toán. Nhập mã khuyến mãi WELCOME10');
  await type(page.getByLabel('Mã khuyến mãi'), 'WELCOME10');
  await page.getByRole('button', { name: 'Áp dụng' }).click();
  await page.getByText(/Đã áp dụng WELCOME10/).waitFor();
  await caption('Giảm 10% – tổng tiền được tính lại');
});

await step('Thẻ bị từ chối', async () => {
  await page.getByText('Thẻ ngân hàng').click();
  await caption('Bước 6: Thanh toán bằng thẻ mô phỏng …0002 (luôn bị ngân hàng từ chối)');
  await type(page.getByLabel(/Số thẻ/), '4000 0000 0000 0002');
  await page.getByTestId('pay-button').click();
  await page.getByTestId('payment-error').waitFor();
  await caption('Thanh toán thất bại: đơn vẫn chờ thanh toán, được thử lại', 3000);
});

let code = '';
await step('Ví thành công', async () => {
  await page.getByText('Ví điện tử').click();
  await caption('Bước 7: Đổi sang Ví điện tử và thanh toán lại');
  await page.getByTestId('pay-button').click();
  await page.getByTestId('order-confirmation').waitFor();
  code = (await page.getByTestId('order-confirmation').innerText()).match(/BL-[A-Z0-9]+/)?.[0] ?? '';
  await caption(`Thanh toán thành công! Mã đơn ${code} – khách đọc mã này tại quầy`, 3500);
});

const orderUrl = page.url();
let customer = null;
await step('Màn hình quầy', async () => {
  customer = await page.evaluate(() => [localStorage.getItem('brewlite.token'), localStorage.getItem('brewlite.user')]);
  await page.goto(`${WEB}/login`);
  await page.waitForLoadState('networkidle');
  const res = await page.request.post(`${API}/auth/login`, { data: { email: 'staff@brewlite.dev', password: 'Staff@123' } });
  const { accessToken, user } = await res.json();
  await page.evaluate(([t, u]) => { localStorage.setItem('brewlite.token', t); localStorage.setItem('brewlite.user', u); }, [accessToken, JSON.stringify(user)]);
  await page.goto(`${WEB}/staff`);
  const card = page.locator('li.card', { hasText: code });
  await card.waitFor();
  await caption(`Bước 8: Nhân viên quầy đăng nhập – thấy đơn ${code} đã thanh toán`, 3000);
  await card.getByRole('button', { name: 'Bắt đầu pha chế' }).click();
  await caption('Nhân viên bấm “Bắt đầu pha chế” → PREPARING');
  await card.getByRole('button', { name: /Đã xong/ }).click();
  await caption('Pha xong, bấm “Đã xong – gọi khách” → READY', 2600);
});

await step('Khách thấy cập nhật', async () => {
  await page.goto(`${WEB}/login`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(([t, u]) => { localStorage.setItem('brewlite.token', t); localStorage.setItem('brewlite.user', u); }, customer);
  await page.goto(orderUrl.replace(/\?.*$/, ''));
  await caption('Bước 9: Khách xem đơn – trạng thái đã chuyển sang “Sẵn sàng” (tự làm mới)', 3500);
  await page.goto(`${WEB}/account`);
  await page.getByTestId('loyalty-points').waitFor();
  await caption('Điểm thưởng đã được cộng: 1 điểm / 10.000đ', 3000);
});

await step('Hết hàng', async () => {
  await page.goto(WEB);
  await page.getByTestId('product-card').first().waitFor();
  await page.getByPlaceholder('Tìm món…').pressSequentially('Trà vải', { delay: 80 });
  await caption('Món hết hàng hiển thị nhãn “Hết hàng”, không thể thêm vào giỏ', 3000);
  await caption('Hết demo. Cảm ơn thầy và các bạn đã theo dõi!', 2500);
});

const video = page.video();
await ctx.close();
await browser.close();
if (video) {
  const p = await video.path();
  renameSync(p, join(OUT, 'brewlite-demo.webm'));
}
for (const f of readdirSync(OUT)) if (f.endsWith('.webm') && f !== 'brewlite-demo.webm') console.log('khac:', f);
console.log(steps.join('\n'));
if (steps.some((s) => s.startsWith('FAIL'))) process.exitCode = 1;
