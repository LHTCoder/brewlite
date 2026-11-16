import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bổ sung cho FR-16 (quản lý menu) và FR-18 (quản lý tài khoản nhân viên):
 * - users.is_active: khóa / mở khóa tài khoản
 * - product_images: ảnh món do quản lý tải lên
 */
export class AdminAndMedia1731700000000 implements MigrationInterface {
  name = 'AdminAndMedia1731700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "product_id" uuid PRIMARY KEY REFERENCES "products"("id") ON DELETE CASCADE,
        "mime_type" varchar(50) NOT NULL,
        "data" bytea NOT NULL,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_active"`);
  }
}
