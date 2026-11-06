import { PromotionType } from '../common/enums';
import {
  applyPromotion,
  computeLineTotal,
  computeUnitPrice,
  generateOrderCode,
  loyaltyPointsFor,
} from './pricing';

/** UNIT-T01..T05: nghiệp vụ tính tiền */
describe('pricing', () => {
  it('computeUnitPrice = base + size + toppings', () => {
    expect(
      computeUnitPrice({ basePrice: 42000, sizeExtra: 5000, toppingPrices: [7000, 10000] }),
    ).toBe(64000);
    expect(computeUnitPrice({ basePrice: 29000, sizeExtra: 0, toppingPrices: [] })).toBe(29000);
  });

  it('computeLineTotal nhân số lượng và từ chối số lượng không hợp lệ', () => {
    expect(computeLineTotal(30000, 3)).toBe(90000);
    expect(() => computeLineTotal(30000, 0)).toThrow();
    expect(() => computeLineTotal(30000, 1.5)).toThrow();
  });

  describe('applyPromotion', () => {
    const percent = {
      type: PromotionType.PERCENT,
      value: 10,
      minOrderAmount: 50000,
      maxDiscount: 20000,
      isActive: true,
    };
    it('không có mã -> giảm 0', () => {
      expect(applyPromotion(100000, null)).toEqual({ ok: true, discount: 0 });
    });
    it('giảm theo % và chặn tối đa', () => {
      expect(applyPromotion(100000, percent)).toEqual({ ok: true, discount: 10000 });
      expect(applyPromotion(500000, percent)).toEqual({ ok: true, discount: 20000 });
    });
    it('từ chối khi chưa đạt đơn tối thiểu', () => {
      const r = applyPromotion(40000, percent);
      expect(r.ok).toBe(false);
    });
    it('từ chối mã không active / hết hạn', () => {
      expect(applyPromotion(100000, { ...percent, isActive: false }).ok).toBe(false);
      expect(
        applyPromotion(
          100000,
          { ...percent, endsAt: new Date('2020-01-01') },
          new Date('2021-01-01'),
        ).ok,
      ).toBe(false);
    });
    it('giảm cố định không vượt quá subtotal', () => {
      expect(
        applyPromotion(10000, {
          type: PromotionType.FIXED,
          value: 15000,
          minOrderAmount: 0,
          maxDiscount: null,
          isActive: true,
        }),
      ).toEqual({ ok: true, discount: 10000 });
    });
  });

  it('loyaltyPointsFor: 1 điểm / 10.000đ', () => {
    expect(loyaltyPointsFor(0)).toBe(0);
    expect(loyaltyPointsFor(99000)).toBe(9);
    expect(loyaltyPointsFor(100000)).toBe(10);
  });

  it('generateOrderCode có dạng BL-XXXXX', () => {
    expect(generateOrderCode(() => 0)).toBe('BL-AAAAA');
    expect(generateOrderCode()).toMatch(/^BL-[A-Z2-9]{5}$/);
  });
});
