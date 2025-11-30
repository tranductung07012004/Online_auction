import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import ProductCard from '../components-new/ProductCard';

const FlashSaleSection: React.FC = () => {
  const products = [
    {
      id: 1,
      image: 'https://via.placeholder.com/300x400?text=Product+1',
      name: 'Áo thun nam basic',
      price: '149.000đ',
      originalPrice: '299.000đ',
      discount: '-50%',
      colors: ['#000000', '#FFFFFF', '#0000FF'],
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/300x400?text=Product+2',
      name: 'Áo polo nam cao cấp',
      price: '249.000đ',
      originalPrice: '499.000đ',
      discount: '-50%',
      colors: ['#87CEEB', '#000000', '#808080'],
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/300x400?text=Product+3',
      name: 'Quần jean nữ',
      price: '299.000đ',
      originalPrice: '599.000đ',
      discount: '-50%',
      colors: ['#000080', '#808080'],
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/300x400?text=Product+4',
      name: 'Áo sơ mi nữ',
      price: '199.000đ',
      originalPrice: '399.000đ',
      discount: '-50%',
      colors: ['#FFFFE0', '#FFFFFF', '#FFC0CB'],
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/300x400?text=Product+5',
      name: 'Quần âu nam',
      price: '349.000đ',
      originalPrice: '699.000đ',
      discount: '-50%',
      colors: ['#000080', '#000000', '#808080'],
    },
  ];

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
              SĂN SALE
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
              GIẢM ~ 50%
            </Box>
          </Box>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
              <ProductCard {...product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FlashSaleSection;

