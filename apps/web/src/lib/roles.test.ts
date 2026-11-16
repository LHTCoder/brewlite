import { describe, expect, it } from 'vitest';
import { homeFor, imageSrc, API_URL } from './api';
import { navItemsFor } from '@/components/BottomNav';
import { isShoppingPath } from '@/components/AppShell';
import { qrPayload } from '@/components/PaymentQr';

describe('FR-19 phân quyền giao diện theo vai trò', () => {
  it('thanh điều hướng: chỉ khách có Menu / Giỏ hàng / Đơn hàng', () => {
    expect(navItemsFor('CUSTOMER').map((i) => i.label)).toEqual(['Menu', 'Giỏ hàng', 'Đơn hàng', 'Tài khoản']);
    expect(navItemsFor(undefined).map((i) => i.label)).toEqual(['Menu', 'Giỏ hàng', 'Đơn hàng', 'Tài khoản']);
    expect(navItemsFor('STAFF').map((i) => i.label)).toEqual(['Quầy', 'Tài khoản']);
    expect(navItemsFor('MANAGER').map((i) => i.label)).toEqual(['Quản lý', 'Quầy', 'Tài khoản']);
  });

  it('trang mua hàng bị chặn với quầy/quản lý, trang chủ theo vai trò', () => {
    for (const p of ['/', '/products/abc', '/cart', '/checkout', '/orders', '/orders/123']) expect(isShoppingPath(p)).toBe(true);
    for (const p of ['/staff', '/manage', '/account', '/login', '/ordersx']) expect(isShoppingPath(p)).toBe(false);
    expect(homeFor('STAFF')).toBe('/staff');
    expect(homeFor('MANAGER')).toBe('/manage');
    expect(homeFor('CUSTOMER')).toBe('/');
  });
});

describe('FR-08 mã QR thanh toán và ảnh món', () => {
  it('mỗi đơn có nội dung QR khác nhau (mã đơn + số tiền + id)', () => {
    const a = qrPayload({ id: 'id-1', code: 'BL-AAAAA', total: 59000 });
    const b = qrPayload({ id: 'id-2', code: 'BL-BBBBB', total: 59000 });
    expect(a).not.toBe(b);
    expect(a).toContain('order=BL-AAAAA');
    expect(a).toContain('amount=59000');
  });

  it('ảnh tải lên được lấy từ API, ảnh tĩnh giữ nguyên', () => {
    expect(imageSrc('/media/products/x?v=1')).toBe(`${API_URL}/media/products/x?v=1`);
    expect(imageSrc('/images/latte.jpg')).toBe('/images/latte.jpg');
    expect(imageSrc(null)).toBe('/images/placeholder.svg');
  });
});
