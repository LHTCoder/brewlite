import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

/** API-T01, API-T02: unit test ProductsService với repository giả lập */
describe('ProductsService', () => {
  let service: ProductsService;
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  const repo = {
    createQueryBuilder: jest.fn(() => qb),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [ProductsService, { provide: getRepositoryToken(Product), useValue: repo }],
    }).compile();
    service = module.get(ProductsService);
  });

  it('findAll trả về danh sách sản phẩm đang bán', async () => {
    qb.getMany.mockResolvedValue([{ id: '1', name: 'Latte' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(qb.where).toHaveBeenCalledWith('p.is_available = true');
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('findAll lọc theo category và từ khóa', async () => {
    qb.getMany.mockResolvedValue([]);
    await service.findAll({ category: 'COFFEE' as never, q: 'La' });
    expect(qb.andWhere).toHaveBeenCalledWith('p.category = :category', { category: 'COFFEE' });
    expect(qb.andWhere).toHaveBeenCalledWith('LOWER(p.name) LIKE :q', { q: '%la%' });
  });

  it('findOne ném NotFoundException khi không có sản phẩm', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne sắp xếp size theo phụ thu tăng dần', async () => {
    repo.findOne.mockResolvedValue({
      id: '1',
      sizes: [
        { name: 'L', extraPrice: 10000 },
        { name: 'S', extraPrice: 0 },
      ],
    });
    const p = await service.findOne('1');
    expect(p.sizes.map((s) => s.name)).toEqual(['S', 'L']);
  });
});
