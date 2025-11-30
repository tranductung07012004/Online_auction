import React from 'react';
import CategoryCard from '../components/CategoryCard';

// Định nghĩa component CategorySection với kiểu React.FC
const CategorySection: React.FC = () => {
  return (
    <section
      className="py-16 px-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/05/anh-co-dau.jpg')",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề */}
        <h1 className="text-center text-4xl font-bold text-white mb-12">
          Our Categories
        </h1>

        {/* Grid chia card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryCard
            icon={
              <img
                src="pic7.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Dress for Moms"
            description="What to wear & other tips"
            buttonText="See our models"
          />

          <CategoryCard
            icon={
              <img
                src="pic8.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Wedding Guest"
            description="Forever look good on these category"
            buttonText="See our models"
          />

          <CategoryCard
            icon={
              <img
                src="pic9.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Short Tie"
            description="Unique & unusual dress"
            buttonText="See our models"
          />
          <CategoryCard
            icon={
              <img
                src="pic10.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Short Tie"
            description="Style is a good way to say who you are"
            buttonText="See our models"
          />
          <CategoryCard
            icon={
              <img
                src="pic11.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Short Tie"
            description="A classy dress is never get old"
            buttonText="See our model"
          />
          <CategoryCard
            icon={
              <img
                src="pic12.png" // Hoặc link URL
                alt="Dress Icon"
                className="w-30 h-30 object-contain"
              />
            }
            title="Short Tie"
            description="Dress how you want to be addressed"
            buttonText="See our models"
          />
        </div>
      </div>
    </section>
  );
};

export default CategorySection;