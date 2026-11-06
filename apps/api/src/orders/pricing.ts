import { PromotionType } from '../common/enums';

/**
 * Nghiệp vụ tính tiền – hàm thuần (pure) để dễ unit test và dùng chung
 * logic với frontend (apps/web/src/lib/pricing.ts có cùng quy tắc).
 */
export interface PriceParts {
  basePrice: number;
  sizeExtra: number;
  toppingPrices: number[];
}

export interface PromotionRule {
  type: PromotionType;
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

/** Đơn giá 1 ly = giá cơ bản + phụ thu size + tổng topping */
export function computeUnitPrice(parts: PriceParts): number {
  const toppings = parts.toppingPrices.reduce((s, p) => s + p, 0);
  return parts.basePrice + parts.sizeExtra + toppings;
}

export function computeLineTotal(unitPrice: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Số lượng phải là số nguyên dương');
  }
  return unitPrice * quantity;
}

export type PromotionCheck = { ok: true; discount: number } | { ok: false; reason: string };

/** FR-07 Áp dụng khuyến mãi: trả về số tiền giảm hoặc lý do không hợp lệ */
export function applyPromotion(
  subtotal: number,
  promo: PromotionRule | null | undefined,
  now: Date = new Date(),
): PromotionCheck {
  if (!promo) return { ok: true, discount: 0 };
  if (!promo.isActive) return { ok: false, reason: 'Mã khuyến mãi không còn hiệu lực' };
  if (promo.startsAt && now < promo.startsAt)
    return { ok: false, reason: 'Mã chưa đến thời gian áp dụng' };
  if (promo.endsAt && now > promo.endsAt) return { ok: false, reason: 'Mã khuyến mãi đã hết hạn' };
  if (subtotal < promo.minOrderAmount) {
    return {
      ok: false,
      reason: `Đơn tối thiểu ${promo.minOrderAmount.toLocaleString('vi-VN')}đ để dùng mã này`,
    };
  }
  let discount =
    promo.type === PromotionType.PERCENT ? Math.floor((subtotal * promo.value) / 100) : promo.value;
  if (promo.maxDiscount != null) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, discount };
}

/** FR-10 Điểm thưởng: 1 điểm cho mỗi 10.000đ thanh toán thành công */
export function loyaltyPointsFor(total: number): number {
  return Math.floor(total / 10000);
}

/** Sinh mã đơn ngắn dễ đọc tại quầy, ví dụ BL-7F3A2 */
export function generateOrderCode(random: () => number = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(random() * alphabet.length)];
  return `BL-${s}`;
}
