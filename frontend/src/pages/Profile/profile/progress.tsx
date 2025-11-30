import { Check, Package, Truck, Home } from 'lucide-react';

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered';

interface OrderProgressProps {
  currentStatus: OrderStatus;
}

export const OrderProgress: React.FC<OrderProgressProps> = ({ currentStatus }) => {
  const steps = [
    { id: 'placed', label: 'Order placed', icon: Check },
    { id: 'packed', label: 'Packed', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Home },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStatus);

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative w-full">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-1/2 left-0 right-0 h-[2px] -z-10 ${
                    isCompleted ? 'bg-[#c3937c]' : 'bg-gray-300'
                  }`}
                />
              )}

              {/* Step circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted
                    ? 'bg-[#c3937c] border-[#c3937c] text-white'
                    : isCurrent
                    ? 'bg-white border-[#c3937c] text-[#c3937c]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-sm ${isCompleted || isCurrent ? 'text-[#c3937c] font-medium' : 'text-gray-500'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
