import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser, JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enums';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'FR-08 Thanh toán Ví/Thẻ mô phỏng, FR-09 idempotent' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Thay thế cho body.idempotencyKey (8–100 ký tự)',
  })
  pay(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    const key = (headerKey ?? dto.idempotencyKey ?? '').trim();
    if (key.length < 8 || key.length > 100) {
      throw new BadRequestException(
        'Thiếu khóa idempotency hợp lệ (8–100 ký tự) trong header Idempotency-Key hoặc body',
      );
    }
    return this.service.pay({ ...dto, idempotencyKey: key }, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem kết quả giao dịch' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findOne(id, user);
  }
}
