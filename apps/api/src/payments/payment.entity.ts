import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '../common/enums';
import { Order } from '../orders/order.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.payment, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'int' })
  amount: number;

  /** Khóa idempotency do client sinh – chống thanh toán 2 lần khi retry */
  @Index({ unique: true })
  @Column({ name: 'idempotency_key', length: 100 })
  idempotencyKey: string;

  /** Mã giao dịch từ cổng thanh toán (mô phỏng) */
  @Column({ name: 'provider_ref', type: 'varchar', length: 100, nullable: true })
  providerRef: string | null;

  @Column({ name: 'failure_reason', type: 'varchar', length: 255, nullable: true })
  failureReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
