import React, { JSX, useState } from 'react';

interface ProductGalleryProps {
  images?: string[];
}

export default function ProductGallery({ images = [] }: ProductGalleryProps): JSX.Element {
  const [mainImage, setMainImage] = useState<number>(0);

  // Default images if none provided
  const displayImages = images.length > 0 
    ? images 
    : [
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
        '/placeholder.svg?height=600&width=400',
      ];

  return (
    <div className="space-y-4">
      {/* Ảnh chính */}
      <div className="relative aspect-[3/4] bg-[#f9f9f9] rounded-md overflow-hidden">
        <img
          src={displayImages[mainImage] || '/placeholder.svg'}
          alt="Wedding Dress"
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Danh sách ảnh nhỏ */}
      <div className="grid grid-cols-4 gap-2">
        {displayImages.map((image, index) => (
          <button
            key={index}
            className={`relative aspect-square bg-[#f9f9f9] rounded-md overflow-hidden ${
              mainImage === index ? 'ring-2 ring-[#c3937c]' : ''
            }`}
            onClick={() => setMainImage(index)}
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
