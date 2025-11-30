import React from 'react';
import { useNavigate } from 'react-router-dom';

// Định nghĩa component ServicesSection với kiểu React.FC
const ServicesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/pcp');
  };

  return (
    <section className="py-16 px-8 bg-cover bg-center">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề */}
        <h1 className="text-center text-[32px] font-[600] text-[#C3937C] mb-3">
          Our Services
        </h1>
        <p className="text-center text-[16px] text-[#0C0C0C]">
          We work hard to gain a trust on you
        </p>

        {/* Grid 4 cột trên desktop, 2 cột trên tablet, 1 cột trên mobile */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white shadow-lg rounded-tl-[50px] rounded-tr-[50px] overflow-hidden h-[600px] grid grid-rows-[minmax(150px,2fr)_1fr]">
            {/* Ảnh */}
            <div className="overflow-hidden">
              <img
                src="pic1.jpg"
                alt="Service 1"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nội dung */}
            <div className="flex flex-col justify-between p-4">
              <h3 className="text-lg text-center font-semibold text-[#0C0C0C]">
                Personalized dress for you
              </h3>
              <p className="text-[#0C0C0C] text-sm text-center overflow-auto">
                Đây là đoạn text dài. We offer a large assortment of clothing for you, with which you can create whatever you desire on your mind. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <button 
                className="border border-[#C3937C] bg-white text-[#C3937C] flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-lg hover:bg-[#C3937C] hover:text-white transition cursor-pointer"
                onClick={handleLearnMore}
              >
                <img src="/icon3.png" alt="icon" className="w-4 h-4" />
                Learn more &gt;
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-lg rounded-tl-[50px] rounded-tr-[50px] overflow-hidden h-[600px] grid grid-rows-[minmax(150px,auto)_1fr]">
            {/* Nội dung */}
            <div className="flex flex-col justify-between p-4">
              <h3 className="text-lg text-center font-semibold text-[#0C0C0C]">
                Customize your dress size
              </h3>
              <p className="text-[#0C0C0C] text-sm text-center">
                All sewing patterns are made to measure for your size measurements by our expert designers according to the unique technologies. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <button 
                className="border border-[#C3937C] bg-white text-[#C3937C] flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-lg hover:bg-[#C3937C] hover:text-white transition cursor-pointer"
                onClick={handleLearnMore}
              >
                <img src="/icon3.png" alt="icon" className="w-4 h-4" />
                Learn more &gt;
              </button>
            </div>

            {/* Ảnh */}
            <div className="overflow-hidden">
              <img
                src="pic2.jpg"
                alt="Service 1"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow-lg rounded-tl-[50px] rounded-tr-[50px] overflow-hidden h-[600px] grid grid-rows-[minmax(150px,2fr)_1fr]">
            {/* Ảnh */}
            <div className="overflow-hidden">
              <img
                src="pic3.jpg"
                alt="Service 1"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nội dung */}
            <div className="flex flex-col justify-between p-4">
              <h3 className="text-lg text-center font-semibold text-[#0C0C0C]">
                Virtual outfit try-on with AI
              </h3>
              <p className="text-[#0C0C0C] text-sm text-center overflow-auto">
                Instantly see how clothes look on you without the need for physical fitting. Our AI models adapt to various body types and sizes to provide a realistic fitting experience.
              </p>
              <button 
                className="border border-[#C3937C] bg-white text-[#C3937C] flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-lg hover:bg-[#C3937C] hover:text-white transition cursor-pointer"
                onClick={handleLearnMore}
              >
                <img src="/icon3.png" alt="icon" className="w-4 h-4" />
                Learn more &gt;
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white shadow-lg rounded-tl-[50px] rounded-tr-[50px] overflow-hidden h-[600px] grid grid-rows-[minmax(150px,auto)_1fr]">
            {/* Nội dung */}
            <div className="flex flex-col justify-between p-4">
              <h3 className="text-lg text-center font-semibold text-[#0C0C0C]">
                Professional consultation
              </h3>
              <p className="text-[#0C0C0C] text-sm text-center">
                Your dress consultation give you a chance to try on all different dress styles with the help of a professional consultant. Your dress consultation give you a chance to try on all different dress styles with the help of a professional consultant.
              </p>
              <button 
                className="border border-[#C3937C] bg-white text-[#C3937C] flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-lg hover:bg-[#C3937C] hover:text-white transition cursor-pointer"
                onClick={handleLearnMore}
              >
                <img src="/icon3.png" alt="icon" className="w-4 h-4" />
                Learn more &gt;
              </button>
            </div>

            {/* Ảnh */}
            <div className="overflow-hidden">
              <img
                src="pic4.jpg"
                alt="Service 1"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;