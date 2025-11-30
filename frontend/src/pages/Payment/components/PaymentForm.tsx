import React from 'react';
import usePaymentForm from '../hooks/usePaymentForm';
import { PaymentFormData } from '../types';

interface PaymentFormProps {
  onSubmit: (formData: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = usePaymentForm();
  
  const processing = isLoading || isSubmitting;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input 
              id="credit-card" 
              name="payment-method" 
              type="radio" 
              className="w-4 h-4 accent-[#c3937c]" 
              defaultChecked 
            />
            <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
              Credit Card
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              id="paypal" 
              name="payment-method" 
              type="radio" 
              className="w-4 h-4 accent-[#c3937c]" 
              disabled
            />
            <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-400">
              PayPal (Coming soon)
            </label>
          </div>
        </div>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }}>
        <div className="mb-6">
          <h3 className="text-base font-medium mb-4">Card Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                className={`block w-full rounded-md border ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.cardNumber}
                onChange={handleChange}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                placeholder="John Smith"
                className={`block w-full rounded-md border ${
                  errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.cardholderName}
                onChange={handleChange}
              />
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (MM/YY)
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  className={`block w-full rounded-md border ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  className={`block w-full rounded-md border ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                  value={formData.cvv}
                  onChange={handleChange}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="saveCard"
                name="saveCard"
                type="checkbox"
                className="h-4 w-4 accent-[#c3937c]"
                checked={formData.saveCard}
                onChange={handleChange}
              />
              <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                Save this card for future purchases
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-gray-500">
            Your payment information is secured with SSL encryption
          </p>
          
          <button
            type="submit"
            disabled={processing}
            className={`rounded-md bg-[#c3937c] px-4 py-2 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 