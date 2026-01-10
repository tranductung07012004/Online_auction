import { JSX, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images?: string[];
}

export default function ProductGallery({ images = [] }: ProductGalleryProps): JSX.Element {
  const [mainImage, setMainImage] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default images if none provided
  const displayImages = images.length > 0 
    ? images 
    : [
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
      ];

  const handlePrevious = () => {
    setMainImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    // Reset auto-play timer when user manually navigates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleNext = () => {
    setMainImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    // Reset auto-play timer when user manually navigates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Auto-play slideshow
  useEffect(() => {
    // Only auto-play if there's more than 1 image and not paused
    if (displayImages.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up auto-play interval (5 seconds)
    intervalRef.current = setInterval(() => {
      setMainImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [displayImages.length, isPaused]);

  return (
    <div className="space-y-4">
      {/* Ảnh chính - Fixed size với crop và slideshow controls */}
      <div 
        className="relative w-full h-[600px] bg-[#f9f9f9] rounded-md overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          src={displayImages[mainImage] || '/placeholder.svg'}
          alt="Product"
          className="object-cover w-full h-full transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Navigation buttons - Only show if more than 1 image */}
        {displayImages.length > 1 && (
          <>
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Next button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Image counter indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {mainImage + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Danh sách ảnh nhỏ - Fixed size với crop */}
      <div className="grid grid-cols-4 gap-2">
        {displayImages.map((image, index) => (
          <button
            key={index}
            className={`relative w-full h-24 bg-[#f9f9f9] rounded-md overflow-hidden ${
              mainImage === index ? 'ring-2 ring-[#c3937c]' : ''
            }`}
            onClick={() => {
              setMainImage(index);
              // Reset auto-play timer when user manually selects an image
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }}
          >
            <img
              src={image || '/placeholder.svg'}
              alt={`Thumbnail ${index + 1}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
