import { useState, useEffect } from 'react';

interface Size {
  _id: string;
  name?: string;
  label?: string;
  description?: string;
}

interface SizeSelectorProps {
  sizes?: Size[];
  onSizeSelect?: (sizeId: string) => void;
}

export default function SizeSelector({ sizes = [], onSizeSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Default sizes if none provided
  const defaultSizes: Size[] = [
    { _id: 'XS', name: 'XS', description: 'Extra Small' },
    { _id: 'S', name: 'S', description: 'Small' },
    { _id: 'M', name: 'M', description: 'Medium' },
    { _id: 'L', name: 'L', description: 'Large' },
    { _id: 'XL', name: 'XL', description: 'Extra Large' },
    { _id: 'XXL', name: 'XXL', description: 'Double Extra Large' },
  ];

  // Get a display name for a size
  const getSizeName = (size: Size): string => {
    return size.name || size.label || size._id || 'Unknown';
  };

  // Remove duplicate sizes by _id and ensure all sizes have necessary properties
  const uniqueSizes = sizes.length > 0 
    ? [...new Map(sizes.map(size => [size._id, size])).values()]
    : defaultSizes;

  // Initialize selected size if not set
  useEffect(() => {
    if (!selectedSize && uniqueSizes.length > 0) {
      const initialSize = uniqueSizes[0]._id;
      setSelectedSize(initialSize);
      // Call the onSizeSelect callback with initial size
      if (onSizeSelect) {
        onSizeSelect(initialSize);
      }
    }
  }, [uniqueSizes, selectedSize]);

  // Handle size selection
  const handleSizeSelect = (sizeId: string) => {
    setSelectedSize(sizeId);
    // Call the onSizeSelect callback if provided
    if (onSizeSelect) {
      onSizeSelect(sizeId);
    }
  };

  // If no sizes, show a message
  if (uniqueSizes.length === 0) {
    return <div className="text-gray-500">No sizes available</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueSizes.map(size => (
        <button
          key={size._id}
          className={`min-w-10 h-10 px-3 rounded-full flex items-center justify-center text-sm ${
            selectedSize === size._id ? 'bg-[#333333] text-white' : 'bg-[#f2f2f2] text-[#333333]'
          }`}
          onClick={() => handleSizeSelect(size._id)}
          title={size.description || getSizeName(size)}
        >
          {getSizeName(size)}
        </button>
      ))}
    </div>
  );
}