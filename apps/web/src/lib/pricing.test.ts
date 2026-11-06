import { describe, expect, it } from 'vitest';
import { cartCount, cartLineKey, cartSubtotal, formatVND, lineTotal, lineUnitPrice } from './pricing';
import type { CartLine } from './types';

/** WEB-T01: nghiệp vụ tính tổng tiền giỏ hàng (FR-03) */
const line = (over: Partial<CartLine> = {}): CartLine => ({
  key: 'k',
  productId: 'p1',
  productName: 'Trà sữa',
  imageUrl: null,
  basePrice: 42000,
  size: { id: 's', name: 'M', extraPrice: 5000 },
  toppings: [{ id: 't', name: 'Trân châu', price: 7000, isAvailable: true }],
  quantity: 2,
  maxStock: 10,
  ...over,
});

describe('pricing (web)', () => {
  it('đơn giá = base + size + topping', () => {
    expect(lineUnitPrice(line())).toBe(54000);
    expect(lineUnitPrice(line({ size: null, toppings: [] }))).toBe(42000);
  });
  it('tổng dòng và tổng giỏ', () => {
    expect(lineTotal(line())).toBe(108000);
    expect(cartSubtotal([line(), line({ quantity: 1, toppings: [] })])).toBe(108000 + 47000);
    expect(cartCount([line(), line({ quantity: 3 })])).toBe(5);
  });
  it('định dạng tiền Việt', () => {
    expect(formatVND(108000)).toMatch(/108.000đ/);
  });
  it('khóa dòng giỏ không phụ thuộc thứ tự topping', () => {
    expect(cartLineKey('p', 's', ['b', 'a'])).toBe(cartLineKey('p', 's', ['a', 'b']));
    expect(cartLineKey('p', 's', ['a'])).not.toBe(cartLineKey('p', 's', []));
  });
});
