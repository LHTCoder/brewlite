import {
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
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'FR-07 Thanh toán Ví/Thẻ mô phỏng (idempotent)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Thay thế cho body.idempotencyKey',
  })
  pay(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    if (headerKey) dto.idempotencyKey = headerKey;
    return this.service.pay(dto, user);
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
