import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

type DatePickerProps = {
  label: string;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  showPicker: boolean;
  onPickerChange: (show: boolean) => void;
  disabled?: boolean;
  minDate?: Date | null;
};

export default function DatePicker({ 
  label,
  selectedDate,
  onDateChange, 
  showPicker,
  onPickerChange,
  disabled = false,
  minDate = null 
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with current month or min date's month if it's in the future
    if (minDate && minDate > new Date()) {
      return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week of first day in month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format month name
  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear();
  };
  
  // Change month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Check if date is in the past or before minDate (if provided)
  const isDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable dates in the past
    if (date < today) return true;
    
    // Disable dates before minDate if provided
    if (minDate && date < minDate) return true;
    
    return false;
  };
  
  // Generate calendar
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const days = [];
  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateDisabled = isDisabled(date);
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() && 
      date.getMonth() === selectedDate.getMonth() && 
      date.getFullYear() === selectedDate.getFullYear();
    
    days.push(
      <button
        key={`day-${day}`}
        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
          ${dateDisabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : isSelected
              ? 'bg-[#c3937c] text-white'
              : 'hover:bg-[#ead9c9] text-[#333333] cursor-pointer'}`}
        onClick={() => !dateDisabled && onDateChange(date)}
        disabled={dateDisabled}
      >
        {day}
      </button>
    );
  }
  
  // Create rows for the calendar
  const rows = [];
  let cells = [];
  
  days.forEach((day, i) => {
    if (i % 7 === 0 && i > 0) {
      rows.push(<div key={`row-${i}`} className="grid grid-cols-7 gap-1">{cells}</div>);
      cells = [];
    }
    cells.push(day);
  });
  
  // Add the last row
  if (cells.length > 0) {
    rows.push(<div key={`row-last`} className="grid grid-cols-7 gap-1">{cells}</div>);
  }
  
  return (
    <div className="relative">
      <button 
        className={`w-full border border-[#d9d9d9] rounded-md py-3 px-4 text-left flex justify-between items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onPickerChange(!showPicker)}
        disabled={disabled}
      >
        <span className={selectedDate ? 'text-[#333333]' : 'text-[#868686]'}>
          {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : `Select ${label}`}
        </span>
        <ChevronRight className="w-4 h-4" />
      </button>
      
      {showPicker && (
        <div className="absolute z-10 mt-1 w-full">
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevMonth} 
                className="text-[#333333] p-1 rounded hover:bg-gray-100"
                type="button"
              >
                &lt;
              </button>
              <div className="text-[#333333] font-medium">{formatMonth(currentMonth)}</div>
              <button 
                onClick={nextMonth} 
                className="text-[#333333] p-1 rounded hover:bg-gray-100"
                type="button"
              >
                &gt;
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-[#868686]">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              {rows}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}