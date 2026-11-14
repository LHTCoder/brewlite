import { BadRequestException } from '@nestjs/common';
import { OrderStatus, UserRole } from '../common/enums';
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
    // Đơn đã thanh toán không hủy trên hệ thống (MVP chưa có hoàn tiền)
    expect(() => service.assertTransition(OrderStatus.PAID, OrderStatus.CANCELLED)).toThrow(
      BadRequestException,
    );
  });
});

/** UNIT-T08: nhân viên chỉ được đặt PREPARING / READY / COMPLETED qua PATCH */
describe('OrdersService.updateStatus – giới hạn quyền của nhân viên', () => {
  const service = new OrdersService({} as never, {} as never);
  const staff = { sub: 's1', email: 'staff@brewlite.dev', role: UserRole.STAFF };

  it.each([OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PENDING])(
    'từ chối PATCH sang %s',
    async (status) => {
      await expect(service.updateStatus('id', status, staff)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});
