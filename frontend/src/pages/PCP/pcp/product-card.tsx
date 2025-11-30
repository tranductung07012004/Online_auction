import React, { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  designer: string;
  price: number;
  rating: number;
  status: 'Available' | 'Almost Booked' | 'Last Promotion' | 'The Most Rented';
  mainImage: string;
  thumbnails: string[];
}

export default function ProductCard({
  id,
  name,
  designer,
  price,
  rating,
  status,
  mainImage,
  thumbnails,
}: ProductCardProps): JSX.Element {
  const getStatusColor = () => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Almost Booked':
        return 'bg-orange-100 text-orange-800';
      case 'Last Promotion':
        return 'bg-red-100 text-red-800';
      case 'The Most Rented':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-[#f0e9ff] rounded-lg overflow-hidden">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <img
            src={mainImage || '/placeholder.svg'}
            alt={name}
            width={400}
            height={500}
            className="w-full h-[400px] object-cover"
          />
        </Link>
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="flex items-center bg-white rounded-full px-2 py-1">
            <span className="font-medium mr-1">{rating}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
          <div className={`rounded-full px-2 py-1 text-xs ${getStatusColor()}`}>{status}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-600">{designer}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-medium">${price}</p>
            <p className="text-xs text-gray-500">/Per Day</p>
          </div>
        </div>

        <div className="flex justify-center space-x-2 mt-4">
          {thumbnails.map((thumb, index) => (
            <div key={index} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <img
                src={thumb || '/placeholder.svg'}
                alt={`${name} view ${index + 1}`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
