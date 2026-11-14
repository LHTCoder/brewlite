import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { Promotion } from '../promotions/promotion.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_TRANSITIONS, OrderStatus, STAFF_SETTABLE_STATUSES, UserRole } from '../common/enums';
import { applyPromotion, computeLineTotal, computeUnitPrice, generateOrderCode } from './pricing';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  /**
   * FR-06 Tạo đơn hàng (kèm FR-05 kiểm tra tồn kho, FR-07 khuyến mãi).
   * Chạy trong 1 transaction: khóa dòng sản phẩm (FOR UPDATE), kiểm tra tồn kho,
   * tính lại giá ở server (không tin client), trừ tồn kho, lưu đơn.
   */
  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      const items: OrderItem[] = [];
      let subtotal = 0;

      // Khóa tất cả sản phẩm của giỏ một lần, theo thứ tự id cố định,
      // để hai đơn đồng thời có cùng món (thứ tự khác nhau) không bị deadlock.
      const productIds = [...new Set(dto.items.map((l) => l.productId))].sort();
      await manager
        .createQueryBuilder(Product, 'p')
        .setLock('pessimistic_write')
        .where('p.id IN (:...ids)', { ids: productIds })
        .orderBy('p.id', 'ASC')
        .getMany();

      for (const line of dto.items) {
        const product = await manager
          .createQueryBuilder(Product, 'p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id: line.productId })
          .getOne();
        if (!product || !product.isAvailable) {
          throw new UnprocessableEntityException(`Sản phẩm không còn bán (${line.productId})`);
        }
        if (product.stock < line.quantity) {
          throw new UnprocessableEntityException(
            `"${product.name}" chỉ còn ${product.stock} phần, không đủ cho ${line.quantity}`,
          );
        }

        // sizes / toppings được nạp riêng để tránh lock join
        const full = await manager.findOne(Product, {
          where: { id: product.id },
          relations: ['sizes', 'toppings'],
        });
        const sizes = full?.sizes ?? [];
        const toppings = full?.toppings ?? [];

        let sizeName: string | null = null;
        let sizeExtra = 0;
        if (sizes.length > 0) {
          const size = sizes.find((s) => s.id === line.sizeId);
          if (!size)
            throw new BadRequestException(`Vui lòng chọn size hợp lệ cho "${product.name}"`);
          sizeName = size.name;
          sizeExtra = size.extraPrice;
        }

        const chosenToppings = (line.toppingIds ?? []).map((tid) => {
          const t = toppings.find((x) => x.id === tid && x.isAvailable);
          if (!t) throw new BadRequestException(`Topping không hợp lệ cho "${product.name}"`);
          return { id: t.id, name: t.name, price: t.price };
        });

        const unitPrice = computeUnitPrice({
          basePrice: product.basePrice,
          sizeExtra,
          toppingPrices: chosenToppings.map((t) => t.price),
        });
        const lineTotal = computeLineTotal(unitPrice, line.quantity);
        subtotal += lineTotal;

        const item = manager.create(OrderItem, {
          product,
          productName: product.name,
          sizeName,
          toppings: chosenToppings,
          unitPrice,
          quantity: line.quantity,
          lineTotal,
        });
        items.push(item);

        // Trừ tồn kho ngay trong transaction
        product.stock -= line.quantity;
        await manager.save(Product, product);
      }

      // Khuyến mãi
      let promotion: Promotion | null = null;
      let discount = 0;
      if (dto.promotionCode) {
        promotion = await manager.findOne(Promotion, {
          where: { code: dto.promotionCode.trim().toUpperCase() },
        });
        if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');
        const check = applyPromotion(subtotal, promotion);
        if (!check.ok) throw new BadRequestException(check.reason);
        discount = check.discount;
      }

      const order = manager.create(Order, {
        code: await this.uniqueCode(manager.getRepository(Order)),
        user,
        status: OrderStatus.PENDING,
        subtotal,
        discount,
        total: subtotal - discount,
        note: dto.note?.trim() || null,
        promotion,
        items,
      });
      const saved = await manager.save(Order, order);
      this.logger.log(`Order ${saved.code} created by ${user.email} total=${saved.total}`);
      return this.findOneForUser(
        saved.id,
        { sub: userId, email: user.email, role: user.role },
        manager.getRepository(Order),
      );
    });
  }

  /** FR-11 Lịch sử đơn của khách (mới nhất trước) */
  findMine(userId: string): Promise<Order[]> {
    return this.orders.find({
      where: { user: { id: userId } },
      relations: ['items', 'payment', 'promotion'],
      order: { createdAt: 'DESC' },
    });
  }

  /** FR-13 Nhân viên/quản lý xem đơn (lọc theo trạng thái nếu có) */
  findAllForStaff(status?: OrderStatus): Promise<Order[]> {
    return this.orders.find({
      where: status ? { status } : {},
      relations: ['items', 'payment', 'user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOneForUser(
    id: string,
    user: JwtPayload,
    repo: Repository<Order> = this.orders,
  ): Promise<Order> {
    const order = await repo.findOne({
      where: { id },
      relations: ['items', 'payment', 'promotion', 'user'],
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    const isStaff = user.role === UserRole.STAFF || user.role === UserRole.MANAGER;
    if (!isStaff && order.user.id !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  /**
   * FR-13 Nhân viên cập nhật trạng thái đơn tại quầy: chỉ PAID→PREPARING→READY→COMPLETED.
   * PAID chỉ do thanh toán tạo ra; hủy đơn phải đi qua cancel() để hoàn tồn kho.
   */
  async updateStatus(id: string, next: OrderStatus, actor: JwtPayload): Promise<Order> {
    if (!STAFF_SETTABLE_STATUSES.includes(next)) {
      throw new BadRequestException(
        `Nhân viên chỉ được chuyển đơn sang ${STAFF_SETTABLE_STATUSES.join(', ')}`,
      );
    }
    const saved = await this.dataSource.transaction(async (manager) => {
      const order = await this.lockOrder(manager, id);
      const from = order.status;
      this.assertTransition(from, next);
      await manager.update(Order, { id }, { status: next });
      this.logger.log(`Order ${order.code}: ${from} -> ${next} by ${actor.email}`);
      return order;
    });
    return this.findOneForUser(saved.id, actor);
  }

  /** FR-12 Hủy đơn khi còn PENDING – hoàn tồn kho */
  async cancel(id: string, actor: JwtPayload): Promise<Order> {
    await this.dataSource.transaction(async (manager) => {
      // Khóa dòng đơn trước khi đọc trạng thái: nếu khách bấm hủy đúng lúc đang thanh toán,
      // một trong hai thao tác phải chờ thao tác kia xong rồi mới kiểm tra lại trạng thái.
      const locked = await this.lockOrder(manager, id);
      const order = await this.findOneForUser(locked.id, actor, manager.getRepository(Order));
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể hủy đơn chưa thanh toán');
      }
      this.assertTransition(order.status, OrderStatus.CANCELLED);
      for (const item of order.items) {
        if (item.product) {
          await manager.increment(Product, { id: item.product.id }, 'stock', item.quantity);
        }
      }
      await manager.update(Order, { id }, { status: OrderStatus.CANCELLED });
      this.logger.log(`Order ${order.code}: PENDING -> CANCELLED by ${actor.email}`);
    });
    return this.findOneForUser(id, actor);
  }

  /** Khóa dòng orders (SELECT … FOR UPDATE) trong transaction hiện tại */
  private async lockOrder(manager: EntityManager, id: string): Promise<Order> {
    const order = await manager
      .createQueryBuilder(Order, 'o')
      .setLock('pessimistic_write')
      .where('o.id = :id', { id })
      .getOne();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  assertTransition(from: OrderStatus, to: OrderStatus) {
    if (!ORDER_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(`Không thể chuyển trạng thái từ ${from} sang ${to}`);
    }
  }

  private async uniqueCode(repo: Repository<Order>): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = generateOrderCode();
      if (!(await repo.findOne({ where: { code } }))) return code;
    }
    throw new Error('Không sinh được mã đơn duy nhất');
  }
}
