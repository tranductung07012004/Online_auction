import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import DressCard from '../components/DressCard';
import { getMostPopularDresses, Dress } from '../../../api/dress';

// Component với kiểu React.FC
const MostPopularSection: React.FC = () => {
  const [popularDresses, setPopularDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularDresses = async () => {
      try {
        setLoading(true);
        const dresses = await getMostPopularDresses(5);
        setPopularDresses(dresses);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch popular dresses:', error);
        setError('Failed to load popular dresses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDresses();
  }, []);

  // Fallback data in case the API doesn't return anything yet
  const fallbackCards = [
    {
      _id: "1",
      name: "French Lace",
      dailyRentalPrice: 300,
      images: ["pic1.jpg"],
      avgRating: 4.8,
      reviewCount: 12,
      status: "Available",
      statusColor: "#6DE588",
      subtitle: "Modern",
    },
    {
      _id: "2",
      name: "Sparkling Flowers",
      dailyRentalPrice: 550,
      images: ["pic2.jpg"],
      avgRating: 4.6,
      reviewCount: 8,
      status: "Unavailable",
      statusColor: "#e81535",
      subtitle: "Romance",
    },
    {
      _id: "3",
      name: "Elegant",
      dailyRentalPrice: 400,
      images: ["pic3.jpg"],
      avgRating: 4.7,
      reviewCount: 15,
      status: "The Most Rented",
      statusColor: "#7715e8",
      subtitle: "Paris",
    },
    {
      _id: "4",
      name: "The Most Rented",
      dailyRentalPrice: 600,
      images: ["pic4.jpg"],
      avgRating: 4.9,
      reviewCount: 20,
      status: "The Most Rented",
      statusColor: "#7715e8",
      subtitle: "Premium",
    },
    {
      _id: "5",
      name: "Luxury Lace",
      dailyRentalPrice: 450,
      images: ["pic13.jpg"],
      avgRating: 4.8,
      reviewCount: 10,
      status: "Unavailable",
      statusColor: "#e81535",
      subtitle: "Classic",
    },
  ];

  // Use the actual data or fallback if API failed or is still loading
  const displayDresses = popularDresses.length > 0 ? popularDresses : fallbackCards;

  return (
    <section className="py-16 px-8 bg-cover bg-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center text-[32px] font-[600] text-[#C3937C] mb-8">
          Most Popular
        </h1>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        <Swiper spaceBetween={20} slidesPerView={'auto'} grabCursor={true}>
          {displayDresses.map((dress, index) => (
            <SwiperSlide key={dress._id || index} style={{ width: '300px' }}>
              <DressCard 
                id={dress._id}
                imageUrl={dress.images[0]}
                alt={dress.name}
                rating={dress.avgRating}
                status={dress.status || (dress.avgRating > 4.7 ? "The Most Rented" : "Available")}
                statusColor={dress.statusColor || (dress.avgRating > 4.7 ? "#7715e8" : "#6DE588")}
                title={dress.name}
                subtitle={dress.subtitle || ""}
                price={dress.dailyRentalPrice}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default MostPopularSection;