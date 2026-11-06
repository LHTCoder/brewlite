import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import { PaymentMethod } from '../../common/enums';

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  orderId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán phải là WALLET hoặc CARD' })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Khóa idempotency do client sinh (UUID). Gửi lại cùng khóa -> trả kết quả cũ.',
  })
  @IsString()
  @Length(8, 100)
  idempotencyKey: string;

  @ApiPropertyOptional({ example: '4242 4242 4242 4242', description: 'Bắt buộc khi method=CARD' })
  @IsOptional()
  @Matches(/^[\d\s-]{16,23}$/, { message: 'Số thẻ phải gồm 16 chữ số' })
  cardNumber?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Số ví khi method=WALLET' })
  @IsOptional()
  @IsString()
  walletPhone?: string;
}
