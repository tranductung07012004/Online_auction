import React from 'react';
import { useNavigate } from 'react-router-dom';

// Định nghĩa interface cho props
interface DressCardProps {
  id: string;
  imageUrl: string;
  alt?: string;
  rating?: number;
  status?: string;
  statusColor?: string;
  title?: string;
  subtitle?: string;
  price?: number;
  priceUnit?: string;
}

// Component với kiểu dữ liệu
const DressCard: React.FC<DressCardProps> = ({
  id,
  imageUrl, 
  alt = "Wedding Dress", 
  rating = 4.8, 
  status = "Available", 
  statusColor = "#6DE588",
  title = "Floral Lace", 
  subtitle = "Diana", 
  price = 450, 
  priceUnit = "Per Day"
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/pdp/${id}`);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="relative rounded-lg w-full cursor-pointer" onClick={handleClick}>
      {/* Badge container - góc trên trái */}
      <div className="absolute top-8 left-10 flex space-x-2">
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow text-sm font-medium">
          {rating} <span className="text-yellow-500 ml-1">⭐</span>
        </div>
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow text-sm font-medium">
          <span className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: statusColor }}  
          />
          {status}
        </div>
      </div>
      
      {/* Phần hiển thị hình ảnh */}
      <div className="w-full h-[500px] overflow-hidden">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-tl-[80px] rounded-tr-[80px]"
          onError={(e) => {
            // Fallback to a default image if the original fails to load
            (e.target as HTMLImageElement).src = '/default-dress.jpg';
          }}
        />
      </div>
      
      {/* Phần nội dung bên dưới */}
      <div className="flex flex-row justify-between bg-[#FFFFFF] rounded-bl-[30px] rounded-br-[30px] p-4 items-center">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{title}</h3>
          <h5 className="text-gray-600">{subtitle}</h5>
        </div>
        <p className="text-gray-600">
          Price: <span className="text-[#C3937C]">${price}</span>/{priceUnit}
        </p>
      </div>
    </div>
  );
};

export default DressCard;