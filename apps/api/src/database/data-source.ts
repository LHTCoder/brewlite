import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/product-size.entity';
import { Topping } from '../products/topping.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Payment } from '../payments/payment.entity';
import { Promotion } from '../promotions/promotion.entity';
import { LoyaltyTransaction } from '../loyalty/loyalty-transaction.entity';

export const ENTITIES = [
  User,
  Product,
  ProductSize,
  Topping,
  Order,
  OrderItem,
  Payment,
  Promotion,
  LoyaltyTransaction,
];

const isTs = __filename.endsWith('.ts');

export function buildDataSourceOptions(databaseUrl: string): DataSourceOptions {
  const ssl = /sslmode=require/.test(databaseUrl) || process.env.DATABASE_SSL === 'true';
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: ENTITIES,
    migrations: [isTs ? __dirname + '/migrations/*.ts' : __dirname + '/migrations/*.js'],
    synchronize: false, // Luôn dùng migration, không auto-sync schema
    logging: process.env.DB_LOGGING === 'true',
    ssl: ssl ? { rejectUnauthorized: false } : false,
  };
}

/** DataSource dùng cho TypeORM CLI (migration:run / migration:generate) */
const AppDataSource = new DataSource(
  buildDataSourceOptions(
    process.env.DATABASE_URL ??
      'postgresql://brewlite:brewlite_dev_password@localhost:5432/brewlite',
  ),
);

export default AppDataSource;
