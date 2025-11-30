import React from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import FamilyBannerSection from './sections-new/FamilyBannerSection';
import FlashSaleSection from './sections-new/FlashSaleSection';
import WinterJacketSection from './sections-new/WinterJacketSection';
import HeatRetainingSection from './sections-new/HeatRetainingSection';

const HomeNew: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      <Header isSticky={true} />

      {/* Family Banner Section */}
      <FamilyBannerSection />

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

