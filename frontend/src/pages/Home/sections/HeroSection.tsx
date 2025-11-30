import React from 'react';
import SatisfiedCounterBox from '../components/SatisfiedCounterBox';
import RentedCounterBox from '../components/RentedCounterBox';

// Định nghĩa component HeroSection với kiểu React.FC
const HeroSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center px-4 md:px-8 py-8 md:py-16 overflow-hidden min-h-screen">
      {/* Desktop Layout - Hidden on mobile screens */}
      <div className="hidden xl:block w-full h-full">
        {/* Text content */}
        <div className="md:w-1/2 mt-30">
          <h1 className="text-4xl font-bold text-[#C3937C] mb-4">
            Here. Begins The <br /> Journey
          </h1>
          <p className="text-gray-600 mb-6">
            {/* Đoạn mô tả ngắn về dịch vụ hoặc giới thiệu */}
            We have a diverse selection of dresses for everyone,<br />
            providing you with ample choices at affordable prices.
          </p>
        </div>

        {/* Image placeholder (Hero Dress) */}
        <div className="flex flex-col justify-center md:w-1/2 mt-8 md:mt-0">
          <div className="absolute top-0 right-[470px]">
            <SatisfiedCounterBox end={2564} />
          </div>
          <div className="absolute top-0 right-[130px]">
            <img
              src="./pic3.jpg"
              alt="Wedding Dress"
              className="
                w-[300px] h-[200px] object-cover
                rounded-br-[80px]
              "
            />
          </div>

          <div className="absolute top-[350px] right-[470px]">
            <img
              src="./pic4.jpg"
              alt="Wedding Dress"
              className="
                w-[300px] h-[500px] object-cover
                rounded-tl-[80px]
                rounded-tr-none
                rounded-bl-[80px]
                rounded-br-[80px]
              "
            />
          </div>
        </div>
        <div className="absolute top-60 right-[130px]">
          <img
            src="./pic1.jpg"
            alt="Wedding Dress"
            className="
              w-[300px] h-[300px] object-cover
              rounded-tl-[80px]
              rounded-br-[80px]
            "
          />
        </div>

        <div className="absolute top-[550px] right-[130px]">
          <RentedCounterBox end={1884} />
        </div>
      </div>

      {/* Mobile Layout - Shown only on mobile screens */}
      <div className="w-full xl:hidden">
        {/* Text content - Mobile */}
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#C3937C] mb-4">
            Here. Begins The Journey
          </h1>
          <p className="text-gray-600 mb-6">
            We have a diverse selection of dresses for everyone,
            providing you with ample choices at affordable prices.
          </p>
        </div>

        {/* Mobile content - stacked vertically */}
        <div className="flex flex-col items-center space-y-6">
          {/* SatisfiedCounterBox - Mobile, per requirement appears first */}
          <div className="scale-75 md:scale-90 origin-center">
            <SatisfiedCounterBox end={2564} />
          </div>

          {/* RentedCounterBox - Mobile, per requirement appears second */}
          <div className="scale-75 md:scale-90 origin-center">
            <RentedCounterBox end={1884} />
          </div>

          {/* First image (pic3) - Mobile */}
          <div className="w-full flex justify-center">
            <img
              src="./pic3.jpg"
              alt="Wedding Dress"
              className="w-[240px] md:w-[280px] h-[160px] md:h-[180px] object-cover rounded-br-[80px]"
            />
          </div>

          {/* Second image (pic4) - Mobile */}
          <div className="w-full flex justify-center">
            <img
              src="./pic4.jpg"
              alt="Wedding Dress"
              className="w-[240px] md:w-[280px] h-[400px] md:h-[450px] object-cover rounded-tl-[80px] rounded-tr-none rounded-bl-[80px] rounded-br-[80px]"
            />
          </div>

          {/* Third image (pic1) - Mobile */}
          <div className="w-full flex justify-center mb-6">
            <img
              src="./pic1.jpg"
              alt="Wedding Dress"
              className="w-[240px] md:w-[280px] h-[240px] md:h-[270px] object-cover rounded-tl-[80px] rounded-br-[80px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;