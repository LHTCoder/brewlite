import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../common/enums';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../payments/payment.entity';
import { Promotion } from '../promotions/promotion.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Mã ngắn để khách đọc tại quầy, ví dụ BL-7F3A2 */
  @Index({ unique: true })
  @Column({ length: 12 })
  code: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'int' })
  subtotal: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => Promotion, { nullable: true, eager: true })
  promotion: Promotion | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
