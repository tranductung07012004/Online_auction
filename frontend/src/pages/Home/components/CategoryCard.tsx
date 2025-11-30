import React from "react";
import { useNavigate } from "react-router-dom";

// Định nghĩa interface cho props
interface CategoryCardProps {
  icon: React.ReactNode; // Có thể là JSX element như <img /> hoặc <svg />
  title: string;
  description: string;
  buttonText: string;
}

// Component với kiểu dữ liệu
const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, description, buttonText }) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/pcp');
  };

  return (
    <div className="flex flex-row justify-between items-center text-center bg-[linear-gradient(135deg,_#89748a,_#c4abb3)] bg-opacity-70 backdrop-blur-lg rounded-xl p-6">
      {/* Icon hoặc ảnh minh hoạ */}
      <div className="mb-4">
        {icon /* icon là 1 React node, có thể là <img /> hay <svg /> */}
      </div>
      <div className="">      
        <h3 className="text-[20px] font-semibold mb-2 text-[#FFFFFF]">{title}</h3>
        <p className="text-[#CBB3FF] text-[12px] mb-4">{description}</p>

        <button 
          className="mt-auto w-48 truncate bg-white/80 text-[#5201FF] border border-[#5201FF] px-4 py-2 rounded-full hover:bg-[#d39ccb] cursor-pointer"
          onClick={handleButtonClick}
        >
          {buttonText}
          <span className="ml-2">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;