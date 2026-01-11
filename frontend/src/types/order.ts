// Order Types
export interface Order {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  status: string; // See OrderStatus constant
  createdAt: string;
  isCancelled: boolean;
  cancelledReason?: string;
  cancelledAt?: string;
  product?: ProductBasicInfo;
}

export interface ProductBasicInfo {
  id: number;
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
}

// Payment Types
export interface OrderPayment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string; // BANK_TRANSFER, PAYPAL, CREDIT_CARD, COD
  paymentStatus: string; // PENDING, PROOF_UPLOADED, CONFIRMED, FAILED, REFUNDED
  paymentProofUrl?: string;
  transactionId?: string;
  buyerPaidAt?: string;
  sellerConfirmedAt?: string;
  notes?: string;
  createdAt: string;
}

// Shipping Types
export interface OrderShipping {
  id: number;
  orderId: number;
  shippingAddress: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveryStatus: string; // PENDING, SHIPPED, DELIVERED
  deliveredAt?: string;
  createdAt: string;
}

// Review Types
export interface OrderReview {
  id: number;
  orderId: number;
  userId: number;
  userFullName: string;
  status: number; // 1 or -1
  comment: string;
  createdAt: string;
}

// Order Status Constants
export const OrderStatus = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  ADDRESS_PROVIDED: "ADDRESS_PROVIDED",
  PAYMENT_PROOF_UPLOADED: "PAYMENT_PROOF_UPLOADED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  REVIEWED: "REVIEWED",
  CANCELLED: "CANCELLED",
} as const;

// Payment Status Constants
export const PaymentStatus = {
  PENDING: "PENDING",
  PROOF_UPLOADED: "PROOF_UPLOADED",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

// Delivery Status Constants
export const DeliveryStatus = {
  PENDING: "PENDING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
} as const;

// Payment Method Constants
export const PaymentMethod = {
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYPAL: "PAYPAL",
  CREDIT_CARD: "CREDIT_CARD",
  COD: "COD",
} as const;
