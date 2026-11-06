import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../common/enums';
import { OrdersService } from './orders.service';

/** UNIT-T06: máy trạng thái đơn hàng */
describe('OrdersService.assertTransition', () => {
  const service = new OrdersService({} as never, {} as never);

  it('cho phép các bước hợp lệ', () => {
    expect(() => service.assertTransition(OrderStatus.PENDING, OrderStatus.PAID)).not.toThrow();
    expect(() => service.assertTransition(OrderStatus.PAID, OrderStatus.PREPARING)).not.toThrow();
    expect(() => service.assertTransition(OrderStatus.PREPARING, OrderStatus.READY)).not.toThrow();
    expect(() => service.assertTransition(OrderStatus.READY, OrderStatus.COMPLETED)).not.toThrow();
    expect(() =>
      service.assertTransition(OrderStatus.PENDING, OrderStatus.CANCELLED),
    ).not.toThrow();
  });

  it('từ chối bước không hợp lệ', () => {
    expect(() => service.assertTransition(OrderStatus.PENDING, OrderStatus.READY)).toThrow(
      BadRequestException,
    );
    expect(() => service.assertTransition(OrderStatus.COMPLETED, OrderStatus.PENDING)).toThrow(
      BadRequestException,
    );
    expect(() => service.assertTransition(OrderStatus.CANCELLED, OrderStatus.PAID)).toThrow(
      BadRequestException,
    );
  });
});
