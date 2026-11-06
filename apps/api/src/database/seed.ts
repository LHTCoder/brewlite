import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import AppDataSource from './data-source';
import { Topping } from '../products/topping.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/product-size.entity';
import { Promotion } from '../promotions/promotion.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';
import {
  DEFAULT_SIZES,
  SEED_PRODUCTS,
  SEED_PROMOTIONS,
  SEED_TOPPINGS,
  SEED_USERS,
} from './seed-data';

/**
 * Seed idempotent: chạy nhiều lần không tạo trùng dữ liệu.
 * Dùng: npm run seed  (hoặc tự động trong docker-compose với SEED_ON_START=true)
 */
export async function runSeed(dataSource: DataSource): Promise<void> {
  const toppingRepo = dataSource.getRepository(Topping);
  const productRepo = dataSource.getRepository(Product);
  const promoRepo = dataSource.getRepository(Promotion);
  const userRepo = dataSource.getRepository(User);

  // Toppings
  const toppings = new Map<string, Topping>();
  for (const t of SEED_TOPPINGS) {
    let topping = await toppingRepo.findOne({ where: { name: t.name } });
    if (!topping) topping = await toppingRepo.save(toppingRepo.create(t));
    toppings.set(t.name, topping);
  }

  // Products
  for (const p of SEED_PRODUCTS) {
    const exists = await productRepo.findOne({ where: { name: p.name } });
    if (exists) continue;
    const product = productRepo.create({
      name: p.name,
      description: p.description,
      basePrice: p.basePrice,
      category: p.category,
      imageUrl: p.imageUrl,
      stock: p.stock,
      isAvailable: true,
      toppings: p.toppingNames.map((n) => toppings.get(n)!).filter(Boolean),
      sizes: (p.sizes ?? DEFAULT_SIZES).map((s) => {
        const size = new ProductSize();
        size.name = s.name;
        size.extraPrice = s.extraPrice;
        return size;
      }),
    });
    await productRepo.save(product);
  }

  // Promotions
  for (const pr of SEED_PROMOTIONS) {
    const exists = await promoRepo.findOne({ where: { code: pr.code } });
    if (!exists) await promoRepo.save(promoRepo.create(pr as Partial<Promotion>));
  }

  // Users
  for (const u of SEED_USERS) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (exists) continue;
    await userRepo.save(
      userRepo.create({
        email: u.email,
        fullName: u.fullName,
        role: u.role as UserRole,
        passwordHash: await bcrypt.hash(u.password, 10),
      }),
    );
  }
}

if (require.main === module) {
  AppDataSource.initialize()
    .then(async (ds) => {
      await runSeed(ds);
      console.log('✅ Seed hoàn tất');
      await ds.destroy();
    })
    .catch((err) => {
      console.error('❌ Seed thất bại', err);
      process.exit(1);
    });
}
