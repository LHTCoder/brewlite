import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LoyaltyTransactionType } from '../common/enums';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';

@Entity({ name: 'loyalty_transactions' })
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.loyaltyTransactions, { nullable: false })
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  order: Order | null;

  @Column({ type: 'enum', enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType;

  /** Số điểm (+ khi EARN, - khi REDEEM) */
  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
