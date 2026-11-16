import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { CurrentUser, JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';
import { OrderStatus, UserRole } from '../common/enums';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'FR-06 Tạo đơn hàng từ giỏ (server tính lại giá, trừ tồn kho)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.service.create(user.sub, dto);
  }

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'FR-11 Lịch sử đơn của tôi' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.service.findMine(user.sub);
  }

  @Get('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'FR-11 Lịch sử đơn của tôi (endpoint GET /orders/me theo đề bài)' })
  findMineAlias(@CurrentUser() user: JwtPayload) {
    return this.service.findMine(user.sub);
  }

  @Get('staff/all')
  @Roles(UserRole.STAFF, UserRole.MANAGER)
  @ApiOperation({ summary: 'FR-13 Nhân viên xem đơn cần xử lý' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  findAll(
    @Query('status', new ParseEnumPipe(OrderStatus, { optional: true })) status?: OrderStatus,
  ) {
    return this.service.findAllForStaff(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'FR-10 Chi tiết / trạng thái đơn' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findOneForUser(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.STAFF, UserRole.MANAGER)
  @ApiOperation({
    summary: 'FR-13 Nhân viên cập nhật trạng thái đơn (chỉ PAID→PREPARING→READY→COMPLETED)',
  })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateStatus(id, dto.status, user);
  }

  @Post(':id/cancel')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'FR-12 Hủy đơn chưa thanh toán (hoàn tồn kho)' })
  cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.cancel(id, user);
  }
}
