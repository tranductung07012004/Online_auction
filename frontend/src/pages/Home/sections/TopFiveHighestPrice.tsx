import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import ProductCard from '../../../components/ProductCard';
import { getTop5HighestCurrentPrice, type ProductResponseFromAPI } from '../../../api/product';
import { useNavigate } from 'react-router-dom';


const TopFiveHighestPrice: React.FC = () => {
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ProductResponseFromAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getTop5HighestCurrentPrice();
        setProducts(res.data);
      } catch (err: any) {
        const errorMessage = err.response.data.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Khoảng cách scroll (width của card + gap)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ py: 6, bgcolor: '#FFF8F0' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#947340',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Top 5 products that have the highest current price
            </Typography>
            <Box
              sx={{
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: '25px',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' },
                cursor: 'pointer',
                bgcolor: '#e3b874',
                '&:hover': {
                  bgcolor: '#EAD9C9',  
                },
              }}
              onClick={() => navigate('/pcp')}
            >
              Watch out our products
            </Box>
          </Box>
        </Box>

        {/* Products Slider */}
        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <Typography color="text.secondary">No products available</Typography>
            </Box>
          ) : (
            <>
              {/* Nút kéo sang trái */}
              <IconButton
                onClick={() => scroll('left')}
                sx={{
                  position: 'absolute',
                  left: { xs: -10, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  width: { xs: 36, md: 48 },
                  height: { xs: 36, md: 48 },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                }}
                aria-label="Scroll left"
              >
                <ChevronLeft sx={{ fontSize: { xs: 20, md: 28 } }} />
              </IconButton>

              {/* Container scrollable */}
              <Box
                ref={scrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  py: 2,
                  px: 1,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': {
                    display: 'none', // Ẩn scrollbar trên Chrome, Safari
                  },
                  scrollbarWidth: 'none', // Ẩn scrollbar trên Firefox
                  msOverflowStyle: 'none', // Ẩn scrollbar trên IE/Edge
                }}
              >
                {products.map((product, index) => (
                  <Box
                    key={`${product.id}-${index}`}
                    sx={{
                      flexShrink: 0,
                      width: { xs: 200, sm: 240, md: 280 },
                    }}
                  >
                    <ProductCard {...product} />
                  </Box>
                ))}
              </Box>

              {/* Nút kéo sang phải */}
              <IconButton
                onClick={() => scroll('right')}
                sx={{
                  position: 'absolute',
                  right: { xs: -10, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  width: { xs: 36, md: 48 },
                  height: { xs: 36, md: 48 },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                }}
                aria-label="Scroll right"
              >
                <ChevronRight sx={{ fontSize: { xs: 20, md: 28 } }} />
              </IconButton>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default TopFiveHighestPrice;
