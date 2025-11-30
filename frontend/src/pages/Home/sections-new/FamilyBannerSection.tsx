import React, { useState } from 'react';
import { Box, Container, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const FamilyBannerSection: React.FC = () => {
  // Danh sách các ảnh slideshow
  const slides = [
    {
      id: 1,
      image: '../../../public/banner1.webp',
      alt: 'Banner 1',
    },
    {
      id: 2,
      image: '../../../public/banner2.webp',
      alt: 'Banner 2',
    },
    {
      id: 3,
      image: '../../../public/banner3.webp',
      alt: 'Banner 3',
    },
    {
      id: 4,
      image: '../../../public/banner4.webp',
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

  return (
    <Box
      sx={{
        py: { xs: 2, md: 4 },
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {/* Slideshow Container */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '200px', sm: '300px', md: '400px' },
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
                  objectFit: 'cover',
                  opacity: currentSlide === index ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                }}
              />
            ))}

            {/* Left Arrow Button */}
            <IconButton
              onClick={prevSlide}
              sx={{
                position: 'absolute',
                left: { xs: 8, md: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                },
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <ChevronLeft sx={{ fontSize: { xs: 24, md: 32 } }} />
            </IconButton>

            {/* Right Arrow Button */}
            <IconButton
              onClick={nextSlide}
              sx={{
                position: 'absolute',
                right: { xs: 8, md: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                },
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <ChevronRight sx={{ fontSize: { xs: 24, md: 32 } }} />
            </IconButton>
          </Box>

          {/* Dots Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 2,
            }}
          >
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: { xs: 8, md: 10 },
                  height: { xs: 8, md: 10 },
                  borderRadius: '50%',
                  bgcolor: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    transform: 'scale(1.2)',
                  },
                  boxShadow: currentSlide === index ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FamilyBannerSection;

