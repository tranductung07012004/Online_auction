import React from 'react';
import { Link } from 'react-router-dom';

export type CheckoutStep = 'review' | 'information' | 'shipping' | 'payment';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  completedSteps?: CheckoutStep[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ 
  currentStep,
  completedSteps = []
}) => {
  const steps = [
    { key: 'review', label: 'Xem lại giỏ hàng', path: '/payment-review' },
    { key: 'information', label: 'Thông tin khách hàng', path: '/payment-information' },
    { key: 'shipping', label: 'Phương thức giao hàng', path: '/payment-shipping' },
    { key: 'payment', label: 'Thanh toán', path: '/payment-checkout' },
  ];

  // Find current step index
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  
  return (
    <div className="py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile view - Step indicator */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Bước {currentStepIndex + 1}: {steps[currentStepIndex].label}
            </h2>
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#c3937c] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Desktop view - Full step cards */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-3">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = completedSteps.includes(step.key);
              const isDisabled = index > currentStepIndex && !isCompleted;
              
              return (
                <Link
                  key={step.key}
                  to={isDisabled ? '#' : step.path}
                  onClick={(e) => isDisabled && e.preventDefault()}
                  className={`
                    relative overflow-hidden rounded-lg p-4 
                    transition-all duration-300 transform
                    ${isActive ? 'bg-[#c3937c] text-white scale-105 shadow-lg' : ''}
                    ${isCompleted ? 'bg-[#f8f0eb] border-[#c3937c] border' : ''}
                    ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  `}
                >
                  <div className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full 
                      ${isActive ? 'bg-white text-[#c3937c]' : ''}
                      ${isCompleted ? 'bg-[#c3937c] text-white' : ''}
                      ${isDisabled ? 'bg-gray-300 text-gray-500' : ''}
                      mr-3 text-lg font-semibold
                    `}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isDisabled ? 'text-gray-500' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                  
                  {/* Accent decoration */}
                  {isActive && (
                    <>
                      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                      <div className="absolute -top-6 -left-6 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-[#c3937c] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps; 