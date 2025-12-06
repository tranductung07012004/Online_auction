import React from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import BannerSection from './sections/BannerSection';
import TopFiveLastSoon from './sections/TopFiveLastSoon';
import TopFiveHighestPrice from './sections/TopFiveHighestPrice';
import TopFiveBidCount from './sections/TopFiveBidCount'; 

const HomeNew: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header /*isSticky={true}*/ />

      {/* Banner Section - Full Width Slideshow */}
      <BannerSection />

      {/* Top 5 last soon Section */}
      <TopFiveLastSoon />

      <TopFiveHighestPrice />

      <TopFiveBidCount />

      <Footer />
    </div>
  );
};

export default HomeNew;

