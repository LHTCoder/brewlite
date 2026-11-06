import { Controller, Get, Module, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { applyPromotion } from '../orders/pricing';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(@InjectRepository(Promotion) private readonly repo: Repository<Promotion>) {}

  /** FR-07a Kiểm tra mã khuyến mãi trước khi đặt đơn (frontend hiển thị số tiền giảm) */
  @Get(':code')
  @ApiOperation({ summary: 'Kiểm tra mã khuyến mãi với subtotal hiện tại' })
  @ApiQuery({ name: 'subtotal', required: true, example: 100000 })
  async check(@Param('code') code: string, @Query('subtotal') subtotalRaw: string) {
    const promo = await this.repo.findOne({ where: { code: code.trim().toUpperCase() } });
    if (!promo) throw new NotFoundException('Mã khuyến mãi không tồn tại');
    const subtotal = Math.max(0, parseInt(subtotalRaw ?? '0', 10) || 0);
    const result = applyPromotion(subtotal, promo);
    return {
      code: promo.code,
      description: promo.description,
      valid: result.ok,
      discount: result.ok ? result.discount : 0,
      reason: result.ok ? null : result.reason,
    };
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  controllers: [PromotionsController],
})
export class PromotionsModule {}
