import { OrderItem, OrderSummary } from '../types';

// Calculate rental duration in days
export const calculateDurationInDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  
  // Convert to days and add 1 (inclusive of start and end dates)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Calculate subtotal for all items
export const calculateSubtotal = (items: OrderItem[], startDate: Date, endDate: Date): number => {
  const days = calculateDurationInDays(startDate, endDate);
  
  return items.reduce((subtotal, item) => {
    // Nếu là mua sản phẩm (purchaseType === 'buy'), sử dụng purchasePrice
    if (item.purchaseType === 'buy' && item.purchasePrice) {
      return subtotal + (item.purchasePrice * item.quantity);
    }
    // Mặc định là thuê, tính theo ngày
    return subtotal + (item.pricePerDay * days * item.quantity);
  }, 0);
};

// Calculate tax amount (default 10%)
export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return subtotal * taxRate;
};

// Calculate shipping cost based on subtotal or flat rate
export const calculateShipping = (subtotal: number): number => {
  // Free shipping for orders over $100
  if (subtotal >= 100) {
    return 0;
  }
  
  // Flat rate of $10 for orders under $100
  return 10;
};

// Calculate order summary with all costs
export const calculateOrderSummary = (
  items: OrderItem[],
  startDate: Date,
  endDate: Date,
  taxRate: number = 0.1
): OrderSummary => {
  const subtotal = calculateSubtotal(items, startDate, endDate);
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;
  const initialDeposit = total * 0.5; // 50% deposit
  
  return {
    subtotal,
    tax,
    shipping,
    total,
    initialDeposit,
    remainingPayment: total - initialDeposit,
    currency: 'USD',
  };
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get appropriate status label and color
export const getOrderStatusInfo = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: '#f59e0b' }; // Amber
    case 'confirmed':
      return { label: 'Confirmed', color: '#3b82f6' }; // Blue
    case 'cancelled':
      return { label: 'Cancelled', color: '#ef4444' }; // Red
    case 'delivered':
      return { label: 'Delivered', color: '#10b981' }; // Emerald
    case 'returned':
      return { label: 'Returned', color: '#8b5cf6' }; // Purple
    case 'under-review':
      return { label: 'Under Review', color: '#6b7280' }; // Gray
    default:
      return { label: 'Unknown', color: '#6b7280' }; // Gray
  }
}; 