import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  color?: string;
}

interface FilterSectionProps {
  title: string;
  type: 'checkbox' | 'range' | 'color';
  options?: FilterOption[];
  minPrice?: number;
  maxPrice?: number;
}

export default function FilterSection({
  title,
  type,
  options = [],
  minPrice = 250,
  maxPrice = 650,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(title === 'Style');
  const [rangeValue, setRangeValue] = useState([minPrice, maxPrice]);

  return (
    <div className="border-b border-gray-200 py-4">
      <button className="w-full flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-medium">{title}</span>
        {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="mt-4">
          {type === 'checkbox' && (
            <div className="space-y-2">
              {options.map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={option.id} className="ml-2 text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}

          {type === 'range' && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">${rangeValue[0]}</span>
                <span className="text-sm">to</span>
                <span className="text-sm">${rangeValue[1]}</span>
              </div>

              <div className="relative h-1 bg-gray-200 rounded-full mt-4 mb-6">
                <div
                  className="absolute h-1 bg-primary rounded-full"
                  style={{
                    left: `${((rangeValue[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    right: `${100 - ((rangeValue[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                  }}
                ></div>
                <div
                  className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5 -ml-2"
                  style={{ left: `${((rangeValue[0] - minPrice) / (maxPrice - minPrice)) * 100}%` }}
                ></div>
                <div
                  className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5 -ml-2"
                  style={{ left: `${((rangeValue[1] - minPrice) / (maxPrice - minPrice)) * 100}%` }}
                ></div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={rangeValue[0]}
                  onChange={e => setRangeValue([Number.parseInt(e.target.value), rangeValue[1]])}
                  className="absolute w-full h-1 opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={rangeValue[1]}
                  onChange={e => setRangeValue([rangeValue[0], Number.parseInt(e.target.value)])}
                  className="absolute w-full h-1 opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>$650</span>
              </div>
            </div>
          )}

          {type === 'color' && (
            <div className="space-y-2">
              {options.map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {option.color && (
                    <span
                      className="ml-2 w-4 h-4 rounded-full inline-block border border-gray-200"
                      style={{ backgroundColor: option.color }}
                    ></span>
                  )}
                  <label htmlFor={option.id} className="ml-2 text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
