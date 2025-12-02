import React from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import BannerSection from './sections-new/BannerSection';
import FlashSaleSection from './sections-new/FlashSaleSection';
import WinterJacketSection from './sections-new/WinterJacketSection';
import HeatRetainingSection from './sections-new/HeatRetainingSection';

const HomeNew: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header /*isSticky={true}*/ />

      {/* Banner Section - Full Width Slideshow */}
      <BannerSection />

      {/* Flash Sale Section */}
      <FlashSaleSection />

      {/* Winter Jacket 4.5 Section */}
      <WinterJacketSection />

      {/* Heat Retaining Section */}
      <HeatRetainingSection />

      <Footer />
    </div>
  );
};

export default HomeNew;

