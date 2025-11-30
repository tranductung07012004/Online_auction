import { useState, useEffect } from 'react';

interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

interface ColorSelectorProps {
  colors?: Color[];
  onColorSelect?: (colorId: string) => void;
}

export default function ColorSelector({ colors = [], onColorSelect }: ColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Default colors if none provided
  const defaultColors = [
    { _id: 'white', name: 'White', hexCode: '#ffffff', border: true },
    { _id: 'golden', name: 'Golden', hexCode: '#cdc78c' },
    { _id: 'black', name: 'Black', hexCode: '#000000' },
    { _id: 'pink', name: 'Pink', hexCode: '#fec4f1' },
  ];

  // Remove duplicate colors by _id
  const uniqueColors = colors.length > 0 
    ? [...new Map(
        colors.map(color => [
          color._id, 
          {
            _id: color._id,
            name: color.name,
            hexCode: color.hexCode,
            border: color.hexCode === '#ffffff' || color.hexCode === '#f8f8f8'
          }
        ])
      ).values()]
    : defaultColors;

  // Initialize selected color if not set
  useEffect(() => {
    if (!selectedColor && uniqueColors.length > 0) {
      const initialColor = uniqueColors[0]._id;
      setSelectedColor(initialColor);
      // Call the onColorSelect callback with initial color
      if (onColorSelect) {
        onColorSelect(initialColor);
      }
    }
  }, [uniqueColors]);

  // Handle color selection
  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    // Call the onColorSelect callback if provided
    if (onColorSelect) {
      onColorSelect(colorId);
    }
  };

  return (
    <div className="flex space-x-2">
      {uniqueColors.map(color => (
        <button
          key={color._id}
          className={`relative rounded-full p-0.5 ${selectedColor === color._id ? 'ring-2 ring-[#c3937c]' : ''}`}
          onClick={() => handleColorSelect(color._id)}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              color.border ? 'border border-[#d9d9d9]' : ''
            }`}
            style={{ backgroundColor: color.hexCode }}
          >
            {selectedColor === color._id && (
              <div className="absolute -bottom-6 w-full text-xs text-center font-medium text-[#333333]">
                {color.name}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}