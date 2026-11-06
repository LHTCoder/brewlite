import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

export interface OrderItemTopping {
  id: string;
  name: string;
  price: number;
}

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true, eager: true })
  product: Product | null;

  /** Snapshot tên/giá tại thời điểm đặt – không đổi khi menu thay đổi */
  @Column({ name: 'product_name', length: 120 })
  productName: string;

  @Column({ name: 'size_name', type: 'varchar', length: 10, nullable: true })
  sizeName: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  toppings: OrderItemTopping[];

  /** Đơn giá = giá cơ bản + phụ thu size + tổng topping */
  @Column({ name: 'unit_price', type: 'int' })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'line_total', type: 'int' })
  lineTotal: number;
}
