import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from '../common/enums';
import { ProductSize } from './product-size.entity';
import { Topping } from './topping.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Giá cơ bản (VND, số nguyên) */
  @Column({ name: 'base_price', type: 'int' })
  basePrice: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  /** Số lượng tồn kho còn bán được */
  @Column({ type: 'int', default: 0 })
  stock: number;

  @OneToMany(() => ProductSize, (size) => size.product, { cascade: true, eager: true })
  sizes: ProductSize[];

  @ManyToMany(() => Topping, { eager: true })
  @JoinTable({
    name: 'product_toppings',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' },
  })
  toppings: Topping[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
