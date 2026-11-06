import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'toppings' })
export class Topping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;
}
