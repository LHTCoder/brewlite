import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '../common/enums';
import { PaymentGatewayService } from './payment-gateway.service';

/** UNIT-T07: dịch vụ thanh toán mô phỏng */
describe('PaymentGatewayService', () => {
  const gateway = new PaymentGatewayService({
    get: () => 500000,
  } as unknown as ConfigService);

  it('thẻ hợp lệ -> thành công', async () => {
    const r = await gateway.charge({
      method: PaymentMethod.CARD,
      amount: 50000,
      cardNumber: '4242 4242 4242 4242',
    });
    expect(r.success).toBe(true);
  });

  it('thẻ kết thúc 0002 -> bị từ chối', async () => {
    const r = await gateway.charge({
      method: PaymentMethod.CARD,
      amount: 50000,
      cardNumber: '4000000000000002',
    });
    expect(r).toEqual({ success: false, reason: 'Ngân hàng từ chối giao dịch' });
  });

  it('số thẻ sai định dạng -> lỗi', async () => {
    const r = await gateway.charge({ method: PaymentMethod.CARD, amount: 1, cardNumber: '123' });
    expect(r.success).toBe(false);
  });

  it('ví vượt hạn mức -> thất bại, trong hạn mức -> thành công', async () => {
    expect((await gateway.charge({ method: PaymentMethod.WALLET, amount: 600000 })).success).toBe(
      false,
    );
    expect((await gateway.charge({ method: PaymentMethod.WALLET, amount: 60000 })).success).toBe(
      true,
    );
  });
});
