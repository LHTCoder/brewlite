import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '../common/enums';
import { AdminService } from './admin.service';
import {
  CreateProductDto,
  CreateStaffDto,
  ResetPasswordDto,
  SetActiveDto,
  UpdateProductDto,
  UploadImageDto,
} from './admin.dto';

const uuid = new ParseUUIDPipe({ version: '4' });

/** Chức năng chỉ dành cho quản lý (MANAGER) */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MANAGER)
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('products')
  @ApiOperation({ summary: 'FR-16 Danh sách toàn bộ món (kể cả món đang ẩn)' })
  listProducts() {
    return this.service.listProducts();
  }

  @Post('products')
  @ApiOperation({ summary: 'FR-16 Thêm món mới' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'FR-16 Sửa tên, mô tả, giá, tồn kho, ẩn/hiện món' })
  updateProduct(@Param('id', uuid) id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }

  @Put('products/:id/image')
  @ApiOperation({ summary: 'FR-16 Đổi ảnh món (data URL JPEG/PNG/WebP)' })
  uploadImage(@Param('id', uuid) id: string, @Body() dto: UploadImageDto) {
    return this.service.uploadImage(id, dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'FR-18 Danh sách tài khoản nhân viên quầy và quản lý' })
  listStaff() {
    return this.service.listStaff();
  }

  @Post('users')
  @ApiOperation({ summary: 'FR-18 Cấp tài khoản nhân viên quầy / quản lý' })
  createStaff(@Body() dto: CreateStaffDto) {
    return this.service.createStaff(dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'FR-18 Khóa / mở khóa tài khoản nhân viên' })
  setActive(
    @Param('id', uuid) id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() actor: JwtPayload,
  ) {
    return this.service.setActive(id, dto.isActive, actor);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'FR-18 Đặt lại mật khẩu tài khoản nhân viên' })
  resetPassword(@Param('id', uuid) id: string, @Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(id, dto.password);
  }
}

/** Ảnh món do quản lý tải lên – công khai, cho phép trang web ở domain khác hiển thị */
@ApiTags('products')
@Controller('media')
export class MediaController {
  constructor(private readonly service: AdminService) {}

  @Get('products/:id')
  @ApiOperation({ summary: 'Ảnh món (FR-16)' })
  async productImage(@Param('id', uuid) id: string, @Res() res: Response) {
    const image = await this.service.getImage(id);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.type(image.mimeType).send(image.data);
  }
}
