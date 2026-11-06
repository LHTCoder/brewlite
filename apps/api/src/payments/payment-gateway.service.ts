import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '../common/enums';
import { randomUUID } from 'crypto';

export interface ChargeRequest {
  method: PaymentMethod;
  amount: number;
  cardNumber?: string;
  walletPhone?: string;
}

export type ChargeResult =
  { success: true; providerRef: string } | { success: false; reason: string };

/**
 * Dịch vụ thanh toán MÔ PHỎNG (ADR-005).
 * Quy tắc để demo/kiểm thử có tính quyết định:
 *  - CARD: số thẻ kết thúc bằng "0002" -> bị từ chối (giống Stripe test card),
 *          số thẻ không đủ 16 chữ số -> lỗi thẻ không hợp lệ.
 *  - WALLET: số tiền vượt PAYMENT_WALLET_LIMIT -> "Số dư ví không đủ".
 *  - Các trường hợp còn lại -> thành công.
 */
@Injectable()
export class PaymentGatewayService {
  constructor(private readonly config: ConfigService) {}

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    // Mô phỏng độ trễ của cổng thanh toán
    await new Promise((r) => setTimeout(r, 50));

    if (req.method === PaymentMethod.CARD) {
      const digits = (req.cardNumber ?? '').replace(/\s|-/g, '');
      if (!/^\d{16}$/.test(digits)) return { success: false, reason: 'Số thẻ không hợp lệ' };
      if (digits.endsWith('0002')) return { success: false, reason: 'Ngân hàng từ chối giao dịch' };
      return { success: true, providerRef: `CARD-${randomUUID().slice(0, 8).toUpperCase()}` };
    }

    const limit = this.config.get<number>('payment.walletLimit') ?? 500000;
    if (req.amount > limit) return { success: false, reason: 'Số dư ví không đủ' };
    return { success: true, providerRef: `WALLET-${randomUUID().slice(0, 8).toUpperCase()}` };
  }
}
