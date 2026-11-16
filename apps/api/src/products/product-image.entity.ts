import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Ảnh món do quản lý tải lên (FR-16). Lưu thẳng trong PostgreSQL vì Render gói Free
 * không có ổ đĩa bền vững cho file; API phục vụ ảnh qua GET /media/products/:id.
 */
@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'mime_type', length: 50 })
  mimeType: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
