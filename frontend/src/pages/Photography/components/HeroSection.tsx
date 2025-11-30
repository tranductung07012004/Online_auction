import React from 'react';

const HeroSection = () => {
  return (
    <div 
      className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundPosition: 'center 30%'
      }}
    >
      <div className="text-center text-white z-10 px-4 md:px-0">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Capture Your Perfect Moments</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Professional wedding photography services to preserve your special memories for a lifetime
        </p>
        <a 
          href="#packages" 
          className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300"
        >
          Book Now
        </a>
      </div>
    </div>
  );
};

export default HeroSection;
