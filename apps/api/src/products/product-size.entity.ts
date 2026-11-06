import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_sizes' })
export class ProductSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** S / M / L */
  @Column({ length: 10 })
  name: string;

  /** Phụ thu so với giá cơ bản (VND) */
  @Column({ name: 'extra_price', type: 'int', default: 0 })
  extraPrice: number;

  @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
  product: Product;
}
