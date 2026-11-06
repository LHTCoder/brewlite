import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductCategory } from '../common/enums';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  /** FR-01: Danh sách menu, lọc theo danh mục / từ khóa */
  async findAll(filter: { category?: ProductCategory; q?: string } = {}): Promise<Product[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.sizes', 'sizes')
      .leftJoinAndSelect('p.toppings', 'toppings')
      .where('p.is_available = true')
      .orderBy('p.category', 'ASC')
      .addOrderBy('p.name', 'ASC')
      .addOrderBy('sizes.extra_price', 'ASC');

    if (filter.category) qb.andWhere('p.category = :category', { category: filter.category });
    if (filter.q) qb.andWhere('LOWER(p.name) LIKE :q', { q: `%${filter.q.toLowerCase()}%` });

    return qb.getMany();
  }

  /** FR-02: Chi tiết sản phẩm (size, topping, tồn kho) */
  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id }, relations: ['sizes', 'toppings'] });
    if (!product) throw new NotFoundException(`Không tìm thấy sản phẩm ${id}`);
    product.sizes.sort((a, b) => a.extraPrice - b.extraPrice);
    return product;
  }
}
