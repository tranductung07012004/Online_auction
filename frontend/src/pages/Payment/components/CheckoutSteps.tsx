import React from 'react';

export type CheckoutStep = 'payment' | 'information';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  completedSteps?: CheckoutStep[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ 
  currentStep,
  completedSteps = []
}) => {
  const steps = [
    { key: 'payment', label: 'Thanh toán', path: '/payment-checkout' },
    { key: 'information', label: 'Thông tin nhận hàng', path: '/payment-information' },
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
        
        {/* Desktop view - Two-step indicator */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = completedSteps.includes(step.key as CheckoutStep);

              return (
                <div
                  key={step.key}
                  className={`
                    relative overflow-hidden rounded-lg p-4 transition-all duration-300
                    ${isActive ? 'bg-[#c3937c] text-white shadow-lg scale-105' : ''}
                    ${!isActive && isCompleted ? 'bg-[#f8f0eb] border border-[#c3937c] text-[#4b3628]' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-600' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full mr-3 text-lg font-semibold
                        ${isActive ? 'bg-white text-[#c3937c]' : ''}
                        ${!isActive && isCompleted ? 'bg-[#c3937c] text-white' : ''}
                        ${!isActive && !isCompleted ? 'bg-gray-300 text-gray-700' : ''}
                      `}
                    >
                      {isCompleted && !isActive ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{step.label}</p>
                    </div>
                  </div>
                  {isActive && (
                    <>
                      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                      <div className="absolute -top-6 -left-6 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
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