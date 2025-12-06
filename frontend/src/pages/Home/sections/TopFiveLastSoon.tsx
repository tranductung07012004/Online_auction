import React, { useRef } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import ProductCard from '../../../components/ProductCard';

const TopFiveLastSoon: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const sellers = [
    { id: 1, avatar: '/placeholder-user.jpg', fullname: 'Nguyễn Văn A' },
    { id: 2, avatar: '/placeholder-user.jpg', fullname: 'Trần Thị B' },
    { id: 3, avatar: '/placeholder-user.jpg', fullname: 'Lê Văn C' },
  ];

  const bidders = [
    { id: 6, avatar: '/placeholder-user.jpg', fullname: 'Lý Văn F' },
    { id: 7, avatar: '/placeholder-user.jpg', fullname: 'Đỗ Thị G' },
    { id: 8, avatar: '/placeholder-user.jpg', fullname: 'Bùi Văn H' },
  ];

  const products = [
    {
      id: 1,
      product_name: 'Punishment',
      thumpnail_url: '/slide1.jpeg',
      seller: sellers[0],
      buy_now_price: 299000,
      minimum_bid_step: 15000,
      current_price: 149000,
      highest_bidder: bidders[0],
      bid_count: 12,
      start_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      product_name: 'Knight',
      thumpnail_url: '/slide2.jpeg',
      seller: sellers[1],
      buy_now_price: 499000,
      minimum_bid_step: 25000,
      current_price: 249000,
      highest_bidder: bidders[1],
      bid_count: 8,
      start_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      product_name: 'A story',
      thumpnail_url: '/slide3.jpeg',
      seller: sellers[2],
      buy_now_price: 599000,
      minimum_bid_step: 30000,
      current_price: 299000,
      highest_bidder: bidders[2],
      bid_count: 15,
      start_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      product_name: 'Knight on a horse',
      thumpnail_url: '/slide4.jpeg',
      seller: sellers[0],
      buy_now_price: 399000,
      minimum_bid_step: 20000,
      current_price: 199000,
      highest_bidder: bidders[0],
      bid_count: 20,
      start_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      product_name: 'Monks',
      thumpnail_url: '/slide5.jpeg',
      seller: sellers[1],
      buy_now_price: 699000,
      minimum_bid_step: 35000,
      current_price: 349000,
      highest_bidder: bidders[1],
      bid_count: 18,
      start_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

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
                color: '#E53935',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Top 5 products that is going to last soon
            </Typography>
            <Box
              sx={{
                bgcolor: '#000',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: '25px',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Watch out our products
            </Box>
          </Box>
        </Box>

        {/* Products Slider */}
        <Box sx={{ position: 'relative' }}>
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
        </Box>
      </Container>
    </Box>
  );
};

export default TopFiveLastSoon;
