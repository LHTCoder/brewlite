import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyTransaction } from './loyalty-transaction.entity';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(
    @InjectRepository(LoyaltyTransaction) private readonly repo: Repository<LoyaltyTransaction>,
  ) {}

  /** FR-10 Lịch sử tích điểm */
  @Get('transactions')
  @ApiOperation({ summary: 'FR-10 Lịch sử điểm thưởng của tôi' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.repo.find({
      where: { user: { id: user.sub } },
      relations: ['order'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyTransaction])],
  controllers: [LoyaltyController],
})
export class LoyaltyModule {}
