import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration khởi tạo toàn bộ schema BrewLite.
 * Chạy: npm run migration:run  (an toàn, idempotent nhờ bảng "migrations" của TypeORM)
 * Rollback: npm run migration:revert
 */
export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ---- Enums ----
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM('CUSTOMER', 'STAFF', 'MANAGER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "products_category_enum" AS ENUM('COFFEE', 'TEA', 'MILK_TEA', 'SMOOTHIE', 'PASTRY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "orders_status_enum" AS ENUM('PENDING', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(`CREATE TYPE "payments_method_enum" AS ENUM('WALLET', 'CARD')`);
    await queryRunner.query(
      `CREATE TYPE "payments_status_enum" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED')`,
    );
    await queryRunner.query(`CREATE TYPE "promotions_type_enum" AS ENUM('PERCENT', 'FIXED')`);
    await queryRunner.query(
      `CREATE TYPE "loyalty_transactions_type_enum" AS ENUM('EARN', 'REDEEM')`,
    );

    // ---- users ----
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "full_name" character varying(120) NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'CUSTOMER',
        "loyalty_points" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`);

    // ---- toppings ----
    await queryRunner.query(`
      CREATE TABLE "toppings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(80) NOT NULL,
        "price" integer NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_toppings" PRIMARY KEY ("id")
      )`);

    // ---- products ----
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "description" text,
        "base_price" integer NOT NULL,
        "image_url" character varying(500),
        "category" "products_category_enum" NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        "stock" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )`);

    // ---- product_sizes ----
    await queryRunner.query(`
      CREATE TABLE "product_sizes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(10) NOT NULL,
        "extra_price" integer NOT NULL DEFAULT 0,
        "productId" uuid,
        CONSTRAINT "PK_product_sizes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_sizes_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )`);

    // ---- product_toppings (N-N) ----
    await queryRunner.query(`
      CREATE TABLE "product_toppings" (
        "product_id" uuid NOT NULL,
        "topping_id" uuid NOT NULL,
        CONSTRAINT "PK_product_toppings" PRIMARY KEY ("product_id", "topping_id"),
        CONSTRAINT "FK_pt_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pt_topping" FOREIGN KEY ("topping_id") REFERENCES "toppings"("id") ON DELETE CASCADE
      )`);

    // ---- promotions ----
    await queryRunner.query(`
      CREATE TABLE "promotions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(30) NOT NULL,
        "description" character varying(200),
        "type" "promotions_type_enum" NOT NULL,
        "value" integer NOT NULL,
        "min_order_amount" integer NOT NULL DEFAULT 0,
        "max_discount" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "starts_at" TIMESTAMP WITH TIME ZONE,
        "ends_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_promotions" PRIMARY KEY ("id")
      )`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_promotions_code" ON "promotions" ("code")`);

    // ---- orders ----
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(12) NOT NULL,
        "status" "orders_status_enum" NOT NULL DEFAULT 'PENDING',
        "subtotal" integer NOT NULL,
        "discount" integer NOT NULL DEFAULT 0,
        "total" integer NOT NULL,
        "note" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "promotionId" uuid,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("userId") REFERENCES "users"("id"),
        CONSTRAINT "FK_orders_promotion" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id")
      )`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_orders_code" ON "orders" ("code")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user" ON "orders" ("userId")`);

    // ---- order_items ----
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_name" character varying(120) NOT NULL,
        "size_name" character varying(10),
        "toppings" jsonb NOT NULL DEFAULT '[]',
        "unit_price" integer NOT NULL,
        "quantity" integer NOT NULL,
        "line_total" integer NOT NULL,
        "orderId" uuid,
        "productId" uuid,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id")
      )`);

    // ---- payments ----
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "method" "payments_method_enum" NOT NULL,
        "status" "payments_status_enum" NOT NULL DEFAULT 'PENDING',
        "amount" integer NOT NULL,
        "idempotency_key" character varying(100) NOT NULL,
        "provider_ref" character varying(100),
        "failure_reason" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" uuid NOT NULL,
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_order" UNIQUE ("order_id"),
        CONSTRAINT "FK_payments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id")
      )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_payments_idempotency" ON "payments" ("idempotency_key")`,
    );

    // ---- loyalty_transactions ----
    await queryRunner.query(`
      CREATE TABLE "loyalty_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" "loyalty_transactions_type_enum" NOT NULL,
        "points" integer NOT NULL,
        "description" character varying(200),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "orderId" uuid,
        CONSTRAINT "PK_loyalty_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loyalty_user" FOREIGN KEY ("userId") REFERENCES "users"("id"),
        CONSTRAINT "FK_loyalty_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id")
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "loyalty_transactions"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "promotions"`);
    await queryRunner.query(`DROP TABLE "product_toppings"`);
    await queryRunner.query(`DROP TABLE "product_sizes"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "toppings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "loyalty_transactions_type_enum"`);
    await queryRunner.query(`DROP TYPE "promotions_type_enum"`);
    await queryRunner.query(`DROP TYPE "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "payments_method_enum"`);
    await queryRunner.query(`DROP TYPE "orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "products_category_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
