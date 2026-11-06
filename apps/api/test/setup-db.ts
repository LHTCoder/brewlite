import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/http-exception.filter';
import { runSeed } from '../src/database/seed';

/**
 * Khởi tạo app NestJS thật kết nối PostgreSQL (DATABASE_URL hoặc TEST_DATABASE_URL),
 * chạy migration + seed. Dùng cho integration test (INT-T*).
 */
export async function createTestApp(): Promise<{ app: INestApplication; dataSource: DataSource }> {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-test-secret-test-secret-123';
  process.env.NODE_ENV = 'test';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  await runSeed(dataSource);
  return { app, dataSource };
}

/** Xóa dữ liệu giao dịch giữa các test (giữ menu/user seed) */
export async function resetTransactionalData(dataSource: DataSource) {
  await dataSource.query(
    'TRUNCATE loyalty_transactions, payments, order_items, orders RESTART IDENTITY CASCADE',
  );
  await dataSource.query('UPDATE users SET loyalty_points = 0');
  await dataSource.query(`UPDATE products SET stock = 100 WHERE name <> 'Trà vải'`);
}
