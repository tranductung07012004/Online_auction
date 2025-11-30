import React, { useState } from 'react';

interface DropdownPanelProps {
  items: string[];
  imageUrl: string;
  altText: string;
  isMobile?: boolean;
  onItemClick?: (item: string) => void;
}

const DropdownPanel: React.FC<DropdownPanelProps> = ({
  items,
  imageUrl,
  altText,
  isMobile = false,
  onItemClick,
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    setActiveItem(index);
    const selectedItem = items[index];
    console.log(`Clicked on: ${selectedItem}`);
    if (onItemClick) onItemClick(selectedItem); // ✅ Gọi callback
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${isMobile ? 'w-full' : 'w-80 md:w-96 lg:w-120'}`}
    >
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
        {/* Left section - Menu items */}
        <div className={`${isMobile ? 'w-full' : 'w-1/2'} p-4`}>
          <ul>
            {items.map((item, index) => (
              <li
                key={index}
                className={`py-2 cursor-pointer transition-all duration-200
                            hover:text-[#C3937C] hover:pl-2
                            active:bg-[#f8f1e8] 
                            ${activeItem === index ? 'text-[#C3937C] pl-2 font-medium' : 'text-gray-700'}`}
                onClick={() => handleItemClick(index)}
              >
                {item}
                {index < items.length - 1 && (
                  <div className="border-b border-gray-200 mt-2"></div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right section - Image */}
        <div className={`${isMobile ? 'w-full h-48' : 'w-1/2 h-full'}`}>
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/400/400';
              target.alt = 'Placeholder image';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DropdownPanel;
