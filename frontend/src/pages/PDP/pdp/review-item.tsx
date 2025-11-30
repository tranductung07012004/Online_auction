import React, { JSX } from 'react';

interface ReviewItemProps {
  name: string;
  date: string;
  rating: number;
  review: string;
}

export default function ReviewItem({ name, date, rating, review }: ReviewItemProps): JSX.Element {
  return (
    <div className="flex space-x-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#f2f2f2] overflow-hidden">
          <img src="/placeholder.svg?height=40&width=40" alt={name} className="object-cover w-full h-full" />
        </div>
      </div>

      {/* Nội dung đánh giá */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-medium text-[#333333]">{name}</h4>
          <span className="text-xs text-[#868686]">{date}</span>
        </div>

        {/* Xếp hạng sao */}
        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <svg
              key={star}
              className={`w-3 h-3 ${star <= rating ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Nội dung nhận xét */}
        <p className="text-sm text-[#333333]">{review}</p>
      </div>
    </div>
  );
}
