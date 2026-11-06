import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductCategory } from '../common/enums';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'FR-01 Xem menu' })
  @ApiQuery({ name: 'category', enum: ProductCategory, required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiOkResponse({ description: 'Danh sách sản phẩm đang bán' })
  findAll(@Query('category') category?: ProductCategory, @Query('q') q?: string) {
    return this.service.findAll({ category, q });
  }

  @Get(':id')
  @ApiOperation({ summary: 'FR-02 Chi tiết sản phẩm' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }
}
