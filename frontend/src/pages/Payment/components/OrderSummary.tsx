import React from 'react';
import { OrderSummary as OrderSummaryType } from '../types';
import { formatCurrency } from '../utils/paymentUtils';

interface OrderSummaryProps {
  summary: OrderSummaryType;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ summary }) => {
  // Đảm bảo giá trị hợp lệ để tránh hiển thị NaN hoặc undefined
  const subtotal = summary?.subtotal || 0;
  const tax = summary?.tax || 0;
  const shipping = summary?.shipping || 0;
  const total = summary?.total || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4 border-b border-gray-200 pb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>
            {shipping === 0 
              ? 'Free' 
              : formatCurrency(shipping)
            }
          </span>
        </div>
      </div>
      
      <div className="flex justify-between py-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-xl font-semibold text-[#c3937c]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;