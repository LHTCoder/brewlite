import { ProductCategory, PromotionType } from '../common/enums';

/** Dữ liệu mẫu – dùng cho seed, test và demo. Giá tính bằng VND. */
export const SEED_TOPPINGS = [
  { name: 'Trân châu đen', price: 7000 },
  { name: 'Trân châu trắng', price: 7000 },
  { name: 'Thạch cà phê', price: 8000 },
  { name: 'Kem cheese', price: 10000 },
  { name: 'Shot espresso thêm', price: 12000 },
];

export const DEFAULT_SIZES = [
  { name: 'S', extraPrice: 0 },
  { name: 'M', extraPrice: 5000 },
  { name: 'L', extraPrice: 10000 },
];

export const SEED_PRODUCTS: Array<{
  name: string;
  description: string;
  basePrice: number;
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  toppingNames: string[];
  sizes?: { name: string; extraPrice: number }[];
}> = [
  {
    name: 'Cà phê sữa đá',
    description: 'Cà phê phin truyền thống pha với sữa đặc, đậm đà và mát lạnh.',
    basePrice: 29000,
    category: ProductCategory.COFFEE,
    imageUrl: '/images/ca-phe-sua-da.svg',
    stock: 100,
    toppingNames: ['Thạch cà phê', 'Shot espresso thêm'],
  },
  {
    name: 'Bạc xỉu',
    description: 'Nhiều sữa, ít cà phê – vị ngọt dịu dễ uống.',
    basePrice: 32000,
    category: ProductCategory.COFFEE,
    imageUrl: '/images/bac-xiu.svg',
    stock: 80,
    toppingNames: ['Thạch cà phê', 'Kem cheese'],
  },
  {
    name: 'Americano',
    description: 'Espresso pha loãng với nước nóng, hậu vị thanh.',
    basePrice: 35000,
    category: ProductCategory.COFFEE,
    imageUrl: '/images/americano.svg',
    stock: 60,
    toppingNames: ['Shot espresso thêm'],
  },
  {
    name: 'Latte',
    description: 'Espresso hòa cùng sữa tươi đánh bọt mịn.',
    basePrice: 45000,
    category: ProductCategory.COFFEE,
    imageUrl: '/images/latte.svg',
    stock: 50,
    toppingNames: ['Shot espresso thêm', 'Kem cheese'],
  },
  {
    name: 'Trà đào cam sả',
    description: 'Trà đen ủ lạnh, đào ngâm, cam tươi và sả thơm.',
    basePrice: 39000,
    category: ProductCategory.TEA,
    imageUrl: '/images/tra-dao-cam-sa.svg',
    stock: 70,
    toppingNames: ['Trân châu trắng'],
  },
  {
    name: 'Trà vải',
    description: 'Trà xanh kết hợp vải ngâm ngọt mát.',
    basePrice: 37000,
    category: ProductCategory.TEA,
    imageUrl: '/images/tra-vai.svg',
    stock: 0, // cố ý hết hàng để demo trường hợp out-of-stock
    toppingNames: ['Trân châu trắng'],
  },
  {
    name: 'Trà sữa trân châu đường đen',
    description: 'Trà sữa béo nhẹ với trân châu đường đen dẻo thơm.',
    basePrice: 42000,
    category: ProductCategory.MILK_TEA,
    imageUrl: '/images/tra-sua-tran-chau.svg',
    stock: 90,
    toppingNames: ['Trân châu đen', 'Trân châu trắng', 'Kem cheese'],
  },
  {
    name: 'Trà sữa matcha',
    description: 'Matcha Nhật Bản hòa cùng sữa tươi.',
    basePrice: 45000,
    category: ProductCategory.MILK_TEA,
    imageUrl: '/images/tra-sua-matcha.svg',
    stock: 40,
    toppingNames: ['Trân châu đen', 'Kem cheese'],
  },
  {
    name: 'Sinh tố bơ',
    description: 'Bơ sáp xay cùng sữa, béo mịn.',
    basePrice: 49000,
    category: ProductCategory.SMOOTHIE,
    imageUrl: '/images/sinh-to-bo.svg',
    stock: 30,
    toppingNames: [],
  },
  {
    name: 'Bánh croissant bơ',
    description: 'Bánh sừng bò nướng giòn, thơm bơ.',
    basePrice: 25000,
    category: ProductCategory.PASTRY,
    imageUrl: '/images/croissant.svg',
    stock: 25,
    toppingNames: [],
    sizes: [{ name: 'M', extraPrice: 0 }],
  },
  {
    name: 'Bánh tiramisu',
    description: 'Bánh tiramisu mềm với lớp cacao đắng nhẹ.',
    basePrice: 35000,
    category: ProductCategory.PASTRY,
    imageUrl: '/images/tiramisu.svg',
    stock: 20,
    toppingNames: [],
    sizes: [{ name: 'M', extraPrice: 0 }],
  },
];

export const SEED_PROMOTIONS = [
  {
    code: 'WELCOME10',
    description: 'Giảm 10% cho đơn từ 50.000đ, tối đa 20.000đ',
    type: PromotionType.PERCENT,
    value: 10,
    minOrderAmount: 50000,
    maxDiscount: 20000,
    isActive: true,
  },
  {
    code: 'FREESHIP15K',
    description: 'Giảm 15.000đ cho đơn từ 100.000đ',
    type: PromotionType.FIXED,
    value: 15000,
    minOrderAmount: 100000,
    maxDiscount: null,
    isActive: true,
  },
  {
    code: 'EXPIRED',
    description: 'Mã đã hết hạn (dùng để test)',
    type: PromotionType.PERCENT,
    value: 50,
    minOrderAmount: 0,
    maxDiscount: null,
    isActive: false,
  },
];

export const SEED_USERS = [
  {
    email: 'customer@brewlite.dev',
    password: 'Customer@123',
    fullName: 'Nguyễn Văn Khách',
    role: 'CUSTOMER',
  },
  { email: 'staff@brewlite.dev', password: 'Staff@123', fullName: 'Trần Thị Quầy', role: 'STAFF' },
  {
    email: 'manager@brewlite.dev',
    password: 'Manager@123',
    fullName: 'Lê Quản Lý',
    role: 'MANAGER',
  },
];
