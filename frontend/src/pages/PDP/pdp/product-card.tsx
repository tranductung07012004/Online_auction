import { JSX } from 'react';

interface ProductCardProps {
  image: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  badge?: string;
}

export default function ProductCard({ image, title, category, price, rating, badge }: ProductCardProps): JSX.Element {
  return (
    <div className="group">
      <div className="relative aspect-[3/4] bg-[#f9f9f9] rounded-md overflow-hidden mb-2">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="object-cover transition-transform group-hover:scale-105 w-full h-full"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs font-medium text-[#333333] px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">{rating}</span>
            <svg
              className="w-3 h-3 text-[#f4b740] fill-[#f4b740]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="ml-1">{badge}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between">
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#333333]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button className="w-8 h-8 bg-[#5201ff] rounded-full flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-[#333333]">{title}</h3>
        <p className="text-xs text-[#868686]">{category}</p>
        <p className="text-sm font-medium text-[#333333]">{price}</p>
      </div>
    </div>
  );
}
