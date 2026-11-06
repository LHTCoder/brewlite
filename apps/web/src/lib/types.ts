/** Kiểu dữ liệu khớp với API NestJS (apps/api) */
export type ProductCategory = 'COFFEE' | 'TEA' | 'MILK_TEA' | 'SMOOTHIE' | 'PASTRY';
export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'WALLET' | 'CARD';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';
export type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER';

export interface ProductSize {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  category: ProductCategory;
  isAvailable: boolean;
  stock: number;
  sizes: ProductSize[];
  toppings: Topping[];
}

export interface CartLine {
  key: string; // productId + sizeId + toppingIds
  productId: string;
  productName: string;
  imageUrl: string | null;
  basePrice: number;
  size: ProductSize | null;
  toppings: Topping[];
  quantity: number;
  maxStock: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  loyaltyPoints: number;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface OrderItem {
  id: string;
  productName: string;
  sizeName: string | null;
  toppings: { id: string; name: string; price: number }[];
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  providerRef: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  note: string | null;
  items: OrderItem[];
  payment: Payment | null;
  promotion: { code: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  COFFEE: 'Cà phê',
  TEA: 'Trà',
  MILK_TEA: 'Trà sữa',
  SMOOTHIE: 'Sinh tố',
  PASTRY: 'Bánh',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};
