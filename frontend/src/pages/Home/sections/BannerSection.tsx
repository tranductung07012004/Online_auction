import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const BannerSection: React.FC = () => {
  const slides = [
    {
      id: 1,
      image: '/banner1.jpeg',
      alt: 'Banner 1',
    },
    {
      id: 2,
      image: '/banner2.jpeg',
      alt: 'Banner 2',
    },
    {
      id: 3,
      image: '/banner3.jpeg',
      alt: 'Banner 3',
    },
    {
      id: 4,
      image: '/banner4.jpeg',
      alt: 'Banner 4',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Hàm chuyển sang slide trước
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Hàm chuyển sang slide sau
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Hàm chuyển đến slide cụ thể
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Chuyển slide sau mỗi 5 giây

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Slideshow Container - Full Width */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '300px', sm: '450px', md: '600px', lg: '650px' },
          overflow: 'hidden',
        }}
      >
        {/* Images */}
        {slides.map((slide, index) => (
          <Box
            key={slide.id}
            component="img"
            src={slide.image}
            alt={slide.alt}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out',
            }}
          />
        ))}

        {/* Left Arrow Button */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: { xs: 16, md: 32, lg: 48 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            width: { xs: 44, md: 56, lg: 64 },
            height: { xs: 44, md: 56, lg: 64 },
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
        >
          <ChevronLeft sx={{ fontSize: { xs: 28, md: 36, lg: 42 } }} />
        </IconButton>

        {/* Right Arrow Button */}
        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: { xs: 16, md: 32, lg: 48 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            width: { xs: 44, md: 56, lg: 64 },
            height: { xs: 44, md: 56, lg: 64 },
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
        >
          <ChevronRight sx={{ fontSize: { xs: 28, md: 36, lg: 42 } }} />
        </IconButton>

        {/* Overlay gradient for better dots visibility */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Dots Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 20, md: 32 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: { xs: 1, md: 1.5 },
            zIndex: 20,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: { xs: 10, md: 12, lg: 14 },
                height: { xs: 10, md: 12, lg: 14 },
                borderRadius: '50%',
                bgcolor: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: currentSlide === index ? '2px solid rgba(255,255,255,0.8)' : 'none',
                '&:hover': {
                  bgcolor: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  transform: 'scale(1.3)',
                },
                boxShadow: currentSlide === index 
                  ? '0 0 12px rgba(255,255,255,0.9)' 
                  : '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default BannerSection;
