import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductCategory, UserRole } from '../common/enums';

/** FR-16 Thêm món mới */
export class CreateProductDto {
  @ApiProperty({ example: 'Cà phê muối' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Cà phê phin phủ lớp kem muối béo mặn.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 35000, description: 'Giá cơ bản (VND)' })
  @IsInt()
  @Min(1000)
  @Max(1000000)
  basePrice: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  @Max(100000)
  stock: number;
}

/** FR-16 Sửa món: chỉ gửi trường cần đổi */
export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1000) @Max(1000000) basePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100000) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
}

/** FR-16 Ảnh món dạng data URL (JPEG/PNG/WebP, tối đa ~1,5 MB) */
export class UploadImageDto {
  @ApiProperty({ example: 'data:image/jpeg;base64,/9j/4AAQ...' })
  @IsString()
  @MaxLength(2_100_000)
  @Matches(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, {
    message: 'Ảnh phải là JPEG, PNG hoặc WebP dạng data URL',
  })
  dataUrl: string;
}

/** FR-18 Cấp tài khoản nhân viên quầy / quản lý */
export class CreateStaffDto {
  @ApiProperty({ example: 'quay2@brewlite.dev' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Nguyễn Thị Quầy' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'Staff@1234', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: [UserRole.STAFF, UserRole.MANAGER] })
  @IsIn([UserRole.STAFF, UserRole.MANAGER], { message: 'Vai trò phải là STAFF hoặc MANAGER' })
  role: UserRole;
}

export class SetActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class ResetPasswordDto {
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(72)
  password: string;
}
