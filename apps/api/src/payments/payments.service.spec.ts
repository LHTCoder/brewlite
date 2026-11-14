import { ServiceUnavailableException } from '@nestjs/common';
import { withTimeout } from './payments.service';

/** UNIT-T09: cổng thanh toán không phản hồi -> 503 (UC-10 luồng E8) */
describe('withTimeout', () => {
  it('trả kết quả khi cổng phản hồi kịp', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 100)).resolves.toBe('ok');
  });

  it('ném 503 khi cổng không phản hồi trong thời hạn', async () => {
    const slow = new Promise((r) => setTimeout(() => r('late'), 200));
    await expect(withTimeout(slow, 20)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
