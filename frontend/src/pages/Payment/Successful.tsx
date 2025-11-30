import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Successful: React.FC = () => {

  useEffect(() => {
    // Clean up all temporary checkout data
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('photography_cart_items');
    localStorage.removeItem('photography_items_in_process');
    sessionStorage.removeItem('shippingAddress');
    
    // Other cleanup that might be needed
    console.log('Cleaned up checkout data after successful payment');
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-700 mb-8">
          Thank you for your order. We've received your payment and are processing your order now.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
          <div className="space-y-4 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">1</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Order Confirmation</h3>
                <p className="text-gray-600">
                  You'll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">2</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Order Processing</h3>
                <p className="text-gray-600">
                  We'll prepare your dresses and get them ready for shipping.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">3</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Shipping</h3>
                <p className="text-gray-600">
                  Your items will be shipped according to your selected shipping method.
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Successful; 