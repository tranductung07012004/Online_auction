export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'cash_on_delivery';
  last4?: string;
  cardBrand?: string;
  expiryDate?: string;
}

export interface OrderItem {
  dressId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  pricePerDay: number;
  purchasePrice?: number;
  purchaseType?: 'buy' | 'rent';
}

export interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  initialDeposit: number; // 50% deposit amount
  remainingPayment: number; // 50% remaining to be paid after returning
  currency: string;
}

export interface PaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  UNDER_REVIEW = 'under-review'
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  startDate: Date;
  endDate: Date;
  arrivalDate?: Date;
  returnDate?: Date;
  status: OrderStatus;
  totalAmount: number;
  depositPaid?: boolean; // Flag to indicate if deposit is paid
  remainingPayment?: number; // Amount remaining to be paid
  notes?: string;
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  // Common properties
  name: string;
  image: string;
  quantity: number;
  
  // Dress rental specific properties
  dressId?: string;
  sizeId?: string;
  sizeName?: string;
  colorId?: string;
  colorName?: string;
  pricePerDay?: number;
  startDate?: Date;
  endDate?: Date;
  arrivalDate?: Date;
  returnDate?: Date;
  
  // Photography service specific properties
  isPhotographyService?: boolean;
  serviceId?: string;
  serviceName?: string;
  type?: string;
  price?: number;
  bookingDate?: string | Date;
  location?: string;
} 