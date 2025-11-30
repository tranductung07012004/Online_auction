import React from 'react';
import Header from '../../components/header';
import HeroSection from './sections/HeroSection';
import BridalDressSection from './sections/BridalDressSection';
import CategorySection from './sections/CategorySection';
import ServicesSection from './sections/ServicesSection';
import MostPopularSection from './sections/MostPopularSection';
import RentDressSection from './sections/RentDressSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FAQSection from './sections/FAQSection';
import Footer from '../../components/footer';
// Định nghĩa component Home với kiểu React.FC
const Home: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Đã bỏ overflow-x-hidden, cái này lúc ban đầu dùng để fix lỗi responsive cho các thiết bị mobile, nhưng lúc sau vì muốn navigation có thể trượt theo lúc lướt xuống thì bắt buộc phải bỏ thuộc tính này, nhưng hiện tại sau khi bỏ ra thì thấy hết lỗi responsive rồi ?? Tạm thời cứ để như vậy, sau này có lỗi responsive thì bỏ tính năng navigation trượt đi để lấy responsive ok hơn */}
      <Header isSticky={true}/>

      <HeroSection />

      <BridalDressSection />

      <CategorySection />

      <ServicesSection />

      <MostPopularSection />

      <RentDressSection />

      <TestimonialsSection /> 

      <FAQSection />
      
      <Footer />
    </div>
  );
};

export default Home;