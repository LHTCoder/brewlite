import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/product-size.entity';
import { ProductImage } from '../products/product-image.entity';
import { Topping } from '../products/topping.entity';
import { User } from '../users/user.entity';
import { ProductCategory, UserRole } from '../common/enums';
import { JwtPayload } from '../auth/auth.service';
import { CreateProductDto, CreateStaffDto, UpdateProductDto, UploadImageDto } from './admin.dto';

const DRINK_SIZES = [
  { name: 'S', extraPrice: 0 },
  { name: 'M', extraPrice: 5000 },
  { name: 'L', extraPrice: 10000 },
];
const MAX_IMAGE_BYTES = 1_500_000;

/** Nghiệp vụ của quản lý: menu (FR-16) và tài khoản nhân viên (FR-18) */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductImage) private readonly images: Repository<ProductImage>,
    @InjectRepository(Topping) private readonly toppings: Repository<Topping>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // ---------- Menu ----------

  /** Tất cả món, kể cả món đang ẩn */
  listProducts(): Promise<Product[]> {
    return this.products.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  /** Thêm món: đồ uống có sẵn size S/M/L và các topping đang bán; bánh không có size/topping */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const isDrink = dto.category !== ProductCategory.PASTRY;
    const product = this.products.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      category: dto.category,
      basePrice: dto.basePrice,
      stock: dto.stock,
      isAvailable: true,
      imageUrl: '/images/placeholder.svg',
      sizes: isDrink ? DRINK_SIZES.map((s) => Object.assign(new ProductSize(), s)) : [],
      toppings: isDrink ? await this.toppings.find({ where: { isAvailable: true } }) : [],
    });
    return this.products.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Không tìm thấy món');
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.description !== undefined) product.description = dto.description.trim() || null;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.isAvailable !== undefined) product.isAvailable = dto.isAvailable;
    return this.products.save(product);
  }

  /** Lưu ảnh món vào DB, đổi imageUrl sang đường dẫn /media (kèm ?v= để trình duyệt tải ảnh mới) */
  async uploadImage(id: string, dto: UploadImageDto): Promise<Product> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Không tìm thấy món');
    const [, mimeType, base64] = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dto.dataUrl) ?? [];
    const data = Buffer.from(base64 ?? '', 'base64');
    if (data.length === 0) throw new BadRequestException('Ảnh rỗng');
    if (data.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Ảnh quá lớn (tối đa 1,5 MB)');
    }
    await this.images.save({ productId: id, mimeType, data });
    product.imageUrl = `/media/products/${id}?v=${Date.now()}`;
    return this.products.save(product);
  }

  async getImage(productId: string): Promise<ProductImage> {
    const image = await this.images.findOne({ where: { productId } });
    if (!image) throw new NotFoundException('Món chưa có ảnh tải lên');
    return image;
  }

  // ---------- Tài khoản nhân viên ----------

  /** Danh sách nhân viên quầy và quản lý */
  listStaff(): Promise<User[]> {
    return this.users.find({
      where: { role: In([UserRole.STAFF, UserRole.MANAGER]) },
      order: { role: 'ASC', createdAt: 'ASC' },
    });
  }

  async createStaff(dto: CreateStaffDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findOne({ where: { email } })) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const user = this.users.create({
      email,
      fullName: dto.fullName.trim(),
      role: dto.role,
      passwordHash: await bcrypt.hash(dto.password, 10),
      isActive: true,
    });
    try {
      const saved = await this.users.save(user);
      return this.findStaff(saved.id);
    } catch (err) {
      if ((err as { code?: string })?.code === '23505') {
        throw new ConflictException('Email đã được sử dụng');
      }
      throw err;
    }
  }

  async setActive(id: string, isActive: boolean, actor: JwtPayload): Promise<User> {
    if (id === actor.sub && !isActive) {
      throw new BadRequestException('Không thể tự khóa tài khoản của chính mình');
    }
    const user = await this.findStaff(id);
    user.isActive = isActive;
    await this.users.update({ id }, { isActive });
    return user;
  }

  async resetPassword(id: string, password: string): Promise<{ ok: true }> {
    await this.findStaff(id);
    await this.users.update({ id }, { passwordHash: await bcrypt.hash(password, 10) });
    return { ok: true };
  }

  /** Chỉ thao tác trên tài khoản nhân viên/quản lý, không đụng tài khoản khách */
  private async findStaff(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id, role: Not(UserRole.CUSTOMER) } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản nhân viên');
    return user;
  }
}
