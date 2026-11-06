import { beforeEach, describe, expect, it } from 'vitest';
import { useCart } from './cart';
import type { Product } from '@/lib/types';

/** WEB-T02: trạng thái giỏ hàng (FR-03) */
const product: Product = {
  id: 'p1',
  name: 'Trà sữa',
  description: null,
  basePrice: 42000,
  imageUrl: null,
  category: 'MILK_TEA',
  isAvailable: true,
  stock: 3,
  sizes: [{ id: 's1', name: 'M', extraPrice: 5000 }],
  toppings: [{ id: 't1', name: 'Trân châu', price: 7000, isAvailable: true }],
};

describe('cart store', () => {
  beforeEach(() => useCart.getState().clear());

  it('thêm sản phẩm và gộp dòng trùng cấu hình', () => {
    useCart.getState().add(product, product.sizes[0], [], 1);
    useCart.getState().add(product, product.sizes[0], [], 1);
    expect(useCart.getState().lines).toHaveLength(1);
    expect(useCart.getState().lines[0].quantity).toBe(2);
  });

  it('cấu hình khác (topping) tạo dòng mới', () => {
    useCart.getState().add(product, product.sizes[0], [], 1);
    useCart.getState().add(product, product.sizes[0], product.toppings, 1);
    expect(useCart.getState().lines).toHaveLength(2);
  });

  it('không vượt tồn kho; số lượng 0 thì xóa dòng', () => {
    useCart.getState().add(product, product.sizes[0], [], 5);
    expect(useCart.getState().lines[0].quantity).toBe(3);
    const key = useCart.getState().lines[0].key;
    useCart.getState().setQuantity(key, 0);
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it('clear xóa cả mã khuyến mãi và ghi chú', () => {
    useCart.getState().setPromotionCode('WELCOME10');
    useCart.getState().setNote('ít đá');
    useCart.getState().clear();
    expect(useCart.getState().promotionCode).toBeNull();
    expect(useCart.getState().note).toBe('');
  });
});
