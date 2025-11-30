import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// Component với kiểu React.FC
const RentDressSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/pcp');
  };

  return (
    <section className="py-16 px-4 bg-cover bg-center">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Cột bên trái: Ảnh + text overlay */}
        <div className="relative w-full h-[600px]">
          <img
            src="pic1.jpg"
            alt="dress placeholder"
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h2 className="text-3xl font-semibold text-white mb-4">
              How to Rent a Dress
            </h2>
            <p className="text-white max-w-md mb-6">
              This platform provides a variety of dresses, from elegant gowns 
              to modern silhouettes. Follow these steps to easily rent your 
              perfect dress for any occasion.
            </p>
            <button 
              className="bg-[#C3937C] border border-[#000000] text-white py-2 px-4 rounded-[100px] w-fit flex items-center gap-2 hover:bg-[#a97c64] transition-colors cursor-pointer"
              onClick={handleGetStarted}
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-5 h-5 inline-block align-middle" />
            </button>
          </div>
        </div>

        {/* Cột bên phải: 4 ô */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[600px]">
          <div className="p-4 bg-[#F9F9F9] shadow rounded-lg flex flex-col">
            <img
              src="icon4.png"
              alt="icon placeholder"
              className="mb-2 w-12 h-12"
            />
            <h3 className="text-lg font-semibold mb-1">Desire Time</h3>
            <p className="text-gray-600 text-sm">
              Select your preferred rental period based on the item's availability. 
              Book to have the item added to your cart.
            </p>
          </div>

          <div className="p-4 bg-white shadow rounded-lg flex flex-col">
            <img
              src="icon5.png"
              alt="icon placeholder"
              className="mb-2 w-12 h-12"
            />
            <h3 className="text-lg font-semibold mb-1">Payment Order</h3>
            <p className="text-gray-600 text-sm">
              Securely process payments through your chosen payment gateway, 
              ensuring compliance with security standards.
            </p>
          </div>

          <div className="p-4 bg-white shadow rounded-lg flex flex-col">
            <img
              src="icon6.png"
              alt="icon placeholder"
              className="mb-2 w-12 h-12"
            />
            <h3 className="text-lg font-semibold mb-1">Complete Information</h3>
            <p className="text-gray-600 text-sm">
              You'll want to gather details on various aspects to ensure the 
              item meets your needs (both fit and style).
            </p>
          </div>

          <div className="p-4 bg-[#F9F9F9] shadow rounded-lg flex flex-col">
            <img
              src="icon7.png"
              alt="icon placeholder"
              className="mb-2 w-12 h-12"
            />
            <h3 className="text-lg font-semibold mb-1">Receive Dress</h3>
            <p className="text-gray-600 text-sm">
              Carefully package dresses to avoid any wrinkling or damage during 
              transit, and include any accessories necessary for your look.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentDressSection;