import React from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import BannerSection from './sections/BannerSection';
import FlashSaleSection from './sections/FlashSaleSection';

const HomeNew: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header /*isSticky={true}*/ />

      {/* Banner Section - Full Width Slideshow */}
      <BannerSection />

      {/* Flash Sale Section */}
      <FlashSaleSection />

      <Footer />
    </div>
  );
};

export default HomeNew;

