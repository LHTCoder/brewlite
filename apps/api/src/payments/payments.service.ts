import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { LoyaltyTransaction } from '../loyalty/loyalty-transaction.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentGatewayService } from './payment-gateway.service';
import {
  LoyaltyTransactionType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '../common/enums';
import { loyaltyPointsFor } from '../orders/pricing';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly gateway: PaymentGatewayService,
  ) {}

  /**
   * FR-07 Thanh toán đơn hàng (UC-10).
   * - Idempotency: cùng idempotencyKey -> trả lại payment cũ, không trừ tiền lần 2.
   * - Thành công: order PENDING -> PAID, cộng điểm thưởng (LoyaltyTransaction).
   * - Thất bại: lưu payment FAILED, order giữ PENDING để khách thử lại với key mới.
   */
  async pay(dto: CreatePaymentDto, actor: JwtPayload): Promise<Payment> {
    // 1. Idempotency check (ngoài transaction, đọc nhanh)
    const existing = await this.dataSource.getRepository(Payment).findOne({
      where: { idempotencyKey: dto.idempotencyKey },
      relations: ['order'],
    });
    if (existing) {
      if (existing.order.id !== dto.orderId) {
        throw new ConflictException('Idempotency key đã được dùng cho đơn hàng khác');
      }
      this.logger.log(`Idempotent replay payment ${existing.id} for order ${existing.order.code}`);
      return existing;
    }

    if (dto.method === PaymentMethod.CARD && !dto.cardNumber) {
      throw new BadRequestException('Vui lòng nhập số thẻ');
    }

    return this.dataSource.transaction(async (manager) => {
      const order = await manager
        .createQueryBuilder(Order, 'o')
        // Chỉ khóa dòng orders (FOR UPDATE OF "o"): PostgreSQL không cho FOR UPDATE
        // trên phía nullable của outer join nếu khóa toàn bộ bảng trong câu truy vấn.
        .setLock('pessimistic_write', undefined, ['o'])
        .innerJoinAndSelect('o.user', 'user')
        .where('o.id = :id', { id: dto.orderId })
        .getOne();
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.user.id !== actor.sub && actor.role === UserRole.CUSTOMER) {
        throw new ForbiddenException('Bạn không có quyền thanh toán đơn này');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `Đơn hàng đang ở trạng thái ${order.status}, không thể thanh toán`,
        );
      }
      const succeededBefore = await manager.findOne(Payment, {
        where: { order: { id: order.id }, status: PaymentStatus.SUCCEEDED },
      });
      if (succeededBefore) throw new BadRequestException('Đơn hàng đã được thanh toán');

      // Xóa payment FAILED trước đó (quan hệ 1-1 order-payment)
      await manager
        .createQueryBuilder()
        .delete()
        .from(Payment)
        .where('order_id = :orderId AND status = :status', {
          orderId: order.id,
          status: PaymentStatus.FAILED,
        })
        .execute();

      // 2. Gọi cổng thanh toán mô phỏng
      const result = await this.gateway.charge({
        method: dto.method,
        amount: order.total,
        cardNumber: dto.cardNumber,
        walletPhone: dto.walletPhone,
      });

      const payment = manager.create(Payment, {
        order,
        method: dto.method,
        amount: order.total,
        idempotencyKey: dto.idempotencyKey,
        status: result.success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        providerRef: result.success ? result.providerRef : null,
        failureReason: result.success ? null : result.reason,
      });
      const saved = await manager.save(Payment, payment);

      if (result.success) {
        // 3. Cập nhật đơn + điểm thưởng trong cùng transaction
        order.status = OrderStatus.PAID;
        await manager.save(Order, order);

        const points = loyaltyPointsFor(order.total);
        if (points > 0) {
          await manager.save(
            LoyaltyTransaction,
            manager.create(LoyaltyTransaction, {
              user: order.user,
              order,
              type: LoyaltyTransactionType.EARN,
              points,
              description: `Tích điểm đơn ${order.code}`,
            }),
          );
          await manager.increment(User, { id: order.user.id }, 'loyaltyPoints', points);
        }
        this.logger.log(`Payment ${saved.id} SUCCEEDED order=${order.code} amount=${order.total}`);
      } else {
        this.logger.warn(`Payment ${saved.id} FAILED order=${order.code} reason=${result.reason}`);
      }

      // Không trả về object order lồng user có passwordHash
      saved.order = { ...order, user: undefined } as unknown as Order;
      return saved;
    });
  }

  async findOne(id: string, actor: JwtPayload): Promise<Payment> {
    const payment = await this.dataSource.getRepository(Payment).findOne({
      where: { id },
      relations: ['order', 'order.user'],
    });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');
    if (actor.role === UserRole.CUSTOMER && payment.order.user.id !== actor.sub) {
      throw new ForbiddenException();
    }
    payment.order = { ...payment.order, user: undefined } as unknown as Order;
    return payment;
  }
}
