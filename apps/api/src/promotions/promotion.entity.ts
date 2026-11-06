import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { PromotionType } from '../common/enums';

@Entity({ name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 30 })
  code: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  /** PERCENT: % giảm (0-100); FIXED: số tiền giảm (VND) */
  @Column({ type: 'int' })
  value: number;

  @Column({ name: 'min_order_amount', type: 'int', default: 0 })
  minOrderAmount: number;

  @Column({ name: 'max_discount', type: 'int', nullable: true })
  maxDiscount: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;
}
