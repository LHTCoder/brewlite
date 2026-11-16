import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Đổi ảnh minh họa SVG của 11 món mẫu sang ảnh chụp thật (JPEG) trong apps/web/public/images.
 * Không đụng tới ảnh placeholder và ảnh quản lý đã tải lên (/media/...).
 */
export class RealMenuPhotos1731700000001 implements MigrationInterface {
  name = 'RealMenuPhotos1731700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "products"
      SET "image_url" = regexp_replace("image_url", '\\.svg$', '.jpg')
      WHERE "image_url" LIKE '/images/%.svg' AND "image_url" <> '/images/placeholder.svg'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "products"
      SET "image_url" = regexp_replace("image_url", '\\.jpg$', '.svg')
      WHERE "image_url" LIKE '/images/%.jpg'`);
  }
}
