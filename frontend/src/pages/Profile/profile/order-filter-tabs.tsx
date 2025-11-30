import { JSX, useState } from 'react';

type OrderFilterTab = 'current' | 'previous' | 'canceled';

interface OrderFilterTabsProps {
  defaultTab?: OrderFilterTab;
  onTabChange?: (tab: OrderFilterTab) => void;
}

export function OrderFilterTabs({ defaultTab = 'current', onTabChange }: OrderFilterTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<OrderFilterTab>(defaultTab);

  const handleTabChange = (tab: OrderFilterTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="flex space-x-2 mb-6">
      <button
        onClick={() => handleTabChange('current')}
        className={`px-4 py-2 rounded-full text-sm ${
          activeTab === 'current' ? 'bg-[#c3937c] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
        }`}
      >
        Current order
      </button>
      <button
        onClick={() => handleTabChange('previous')}
        className={`px-4 py-2 rounded-full text-sm ${
          activeTab === 'previous' ? 'bg-[#c3937c] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
        }`}
      >
        Previous order
      </button>
      <button
        onClick={() => handleTabChange('canceled')}
        className={`px-4 py-2 rounded-full text-sm ${
          activeTab === 'canceled' ? 'bg-[#c3937c] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
        }`}
      >
        Canceled order
      </button>
    </div>
  );
}
