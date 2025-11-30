import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import ProductCard from '../components-new/ProductCard';

const WinterJacketSection: React.FC = () => {
  const products = [
    {
      id: 1,
      image: 'https://via.placeholder.com/300x400?text=Winter+Jacket+1',
      name: 'Áo khoác hoodie unisex',
      price: '399.000đ',
      originalPrice: '799.000đ',
      discount: '-50%',
      colors: ['#000000', '#808080', '#0000FF'],
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/300x400?text=Winter+Jacket+2',
      name: 'Áo len nữ cổ tròn',
      price: '299.000đ',
      originalPrice: '599.000đ',
      discount: '-50%',
      colors: ['#FFC0CB', '#FFFFFF', '#FFE4E1'],
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/300x400?text=Winter+Jacket+3',
      name: 'Áo cardigan nữ',
      price: '349.000đ',
      originalPrice: '699.000đ',
      discount: '-50%',
      colors: ['#8B4513', '#000000', '#808080'],
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/300x400?text=Winter+Jacket+4',
      name: 'Áo len cao cổ',
      price: '279.000đ',
      originalPrice: '559.000đ',
      discount: '-50%',
      colors: ['#F5DEB3', '#FFFFFF', '#D2B48C'],
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/300x400?text=Winter+Jacket+5',
      name: 'Áo sơ mi nam dài tay',
      price: '249.000đ',
      originalPrice: '499.000đ',
      discount: '-50%',
      colors: ['#ADD8E6', '#FFFFFF', '#87CEEB'],
    },
  ];

  return (
    <Box sx={{ py: 6, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        {/* Section Header with Banner Images */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: '250px',
                }}
              >
                <Box
                  component="img"
                  src="https://via.placeholder.com/600x250?text=Winter+Collection+Banner+1"
                  alt="Winter Collection"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 4,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    ÁO PHAO 4.5
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: '250px',
                }}
              >
                <Box
                  component="img"
                  src="https://via.placeholder.com/600x250?text=Winter+Collection+Banner+2"
                  alt="Family Collection"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
              <ProductCard {...product} />
            </Grid>
          ))}
        </Grid>

        {/* View More Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#1976D2',
              color: '#1976D2',
              px: 6,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '25px',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#1565C0',
                bgcolor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            Xem thêm
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WinterJacketSection;

