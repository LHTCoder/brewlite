import type { CartLine } from './types';

/**
 * Tính tiền phía client – CÙNG QUY TẮC với apps/api/src/orders/pricing.ts.
 * Server luôn tính lại; giá ở đây chỉ để hiển thị.
 */
export function lineUnitPrice(line: Pick<CartLine, 'basePrice' | 'size' | 'toppings'>): number {
  const toppings = line.toppings.reduce((s, t) => s + t.price, 0);
  return line.basePrice + (line.size?.extraPrice ?? 0) + toppings;
}

export function lineTotal(line: CartLine): number {
  return lineUnitPrice(line) * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + lineTotal(l), 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

/** Khóa định danh 1 dòng giỏ hàng: cùng sản phẩm + size + topping thì gộp số lượng */
export function cartLineKey(productId: string, sizeId: string | null, toppingIds: string[]): string {
  return [productId, sizeId ?? '-', [...toppingIds].sort().join('+')].join('|');
}
