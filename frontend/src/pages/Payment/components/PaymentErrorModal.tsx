import React from 'react';

interface PaymentErrorModalProps {
  onClose: () => void;
  errorMessage?: string;
}

const PaymentErrorModal: React.FC<PaymentErrorModalProps> = ({ 
  onClose,
  errorMessage = 'There was an issue processing your payment.'
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h2 className="text-red-600 text-2xl font-bold text-center mb-4">Payment Unsuccessful</h2>
              
              <p className="mb-4 text-center text-gray-700">{errorMessage}</p>
              
              <p className="text-center mb-6">
                Please check your payment details and try again, or choose a different payment method.
              </p>
              
              <div className="mt-5 sm:mt-6 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-md bg-[#c3937c] px-3.5 py-2.5 text-white shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorModal; 