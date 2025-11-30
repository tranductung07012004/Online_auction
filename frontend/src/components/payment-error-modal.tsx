import React from 'react';
import { X } from 'lucide-react';

interface PaymentErrorModalProps {
  onClose: () => void;
}

const PaymentErrorModal: React.FC<PaymentErrorModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="h-6 w-6 text-gray-700" />
        </button>

        {/* Error icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">!</span>
          </div>
        </div>

        {/* Error heading */}
        <h2 className="text-red-600 text-4xl font-bold text-center mb-6">Sorry Payment Unsuccessful</h2>

        {/* Error message */}
        <div className="space-y-4 text-center mb-8">
          <p className="text-xl">Unfortunately, your order cannot be completed.</p>

          <p className="text-xl">Please ensure that the billing address you provided is the same one where your debit/credit card is registered.</p>

          <p className="text-xl">Alternatively, please try a different payment methods</p>
        </div>

        {/* Pay now button */}
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-[#d1a08a] hover:bg-[#c0917b] text-white font-medium py-3 px-12 rounded-full text-xl">
            Pay now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorModal; 