/**
 * Các enum trạng thái dùng chung – phải khớp với class diagram (docs/diagrams/class-domain.puml)
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
}

export enum ProductCategory {
  COFFEE = 'COFFEE',
  TEA = 'TEA',
  MILK_TEA = 'MILK_TEA',
  SMOOTHIE = 'SMOOTHIE',
  PASTRY = 'PASTRY',
}

export enum OrderStatus {
  PENDING = 'PENDING', // đã tạo đơn, chưa thanh toán
  PAID = 'PAID', // thanh toán thành công
  PREPARING = 'PREPARING', // quầy đang pha chế
  READY = 'READY', // sẵn sàng để nhận
  COMPLETED = 'COMPLETED', // khách đã nhận
  CANCELLED = 'CANCELLED', // bị hủy
}

export enum PaymentMethod {
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum PromotionType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum LoyaltyTransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
}

/** Máy trạng thái đơn hàng: trạng thái hiện tại -> các trạng thái hợp lệ tiếp theo */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};
