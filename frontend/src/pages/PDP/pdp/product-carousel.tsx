import { JSX, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './product-card';
import { Dress, getAllDresses } from '../../../api/dress';
import { useNavigate } from 'react-router-dom';

interface ProductCarouselProps {
  dresses?: Dress[];
  currentDressId?: string;
}

export default function ProductCarousel({ dresses, currentDressId }: ProductCarouselProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [allDresses, setAllDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(false);
  const MAX_DRESSES = 10; // Maximum number of dresses to display

  // Fetch all dresses if none are provided
  useEffect(() => {
    if (!dresses || dresses.length === 0) {
      fetchAllDresses();
    }
  }, [dresses]);

  const fetchAllDresses = async () => {
    try {
      setLoading(true);
      const fetchedDresses = await getAllDresses();
      setAllDresses(fetchedDresses);
    } catch (error) {
      console.error('Error fetching dresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use provided dresses or fallback to all dresses, excluding current dress
  // Limit to MAX_DRESSES
  const displayDresses = (dresses && dresses.length > 0 
    ? dresses 
    : allDresses.filter(dress => dress._id !== currentDressId))
    .slice(0, MAX_DRESSES);

  // Map dress data to product format
  const products = displayDresses.map(dress => ({
    id: dress._id,
    image: dress.images[0] || '/placeholder.svg?height=400&width=300',
    title: dress.name,
    category: dress.style || 'Wedding Dress',
    price: `$${dress.dailyRentalPrice} /Per Day`,
    rating: dress.avgRating || dress.ratings.reduce((sum, rating) => sum + rating.rate, 0) / (dress.ratings.length || 1),
    badge: dress.reviews.length > 5 ? 'The Most Rented' : 'Available',
  }));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading similar dresses...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-8">No similar dresses found</div>;
  }

  return (
    <div className="relative">
      {/* Nút kéo sang trái */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#333333]"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Danh sách sản phẩm */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto py-4 px-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-64 cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Nút kéo sang phải */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#333333]"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
