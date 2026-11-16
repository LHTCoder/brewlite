import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { ProductImage } from '../products/product-image.entity';
import { Topping } from '../products/topping.entity';
import { User } from '../users/user.entity';
import { AdminService } from './admin.service';
import { AdminController, MediaController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Topping, User])],
  controllers: [AdminController, MediaController],
  providers: [AdminService],
})
export class AdminModule {}
