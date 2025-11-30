import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import ProductCard from '../components-new/ProductCard';

const HeatRetainingSection: React.FC = () => {
  const products = [
    {
      id: 1,
      image: 'https://via.placeholder.com/300x400?text=Thermal+Shirt+1',
      name: 'Áo giữ nhiệt cổ tròn',
      price: '149.000đ',
      originalPrice: '299.000đ',
      discount: '-50%',
      colors: ['#FF0000', '#000000', '#FFFFFF'],
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/300x400?text=Thermal+Shirt+2',
      name: 'Áo giữ nhiệt cao cổ nam',
      price: '169.000đ',
      originalPrice: '339.000đ',
      discount: '-50%',
      colors: ['#000080', '#000000', '#808080'],
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/300x400?text=Thermal+Shirt+3',
      name: 'Áo giữ nhiệt nữ',
      price: '159.000đ',
      originalPrice: '319.000đ',
      discount: '-50%',
      colors: ['#000000', '#808080', '#FFFFFF'],
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/300x400?text=Thermal+Shirt+4',
      name: 'Áo giữ nhiệt dài tay',
      price: '179.000đ',
      originalPrice: '359.000đ',
      discount: '-50%',
      colors: ['#006400', '#000000', '#808080'],
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/300x400?text=Thermal+Shirt+5',
      name: 'Áo giữ nhiệt trẻ em',
      price: '139.000đ',
      originalPrice: '279.000đ',
      discount: '-50%',
      colors: ['#008080', '#000000', '#808080'],
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
                color: '#FF6F00',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              ÁO GIỮ NHIỆT
            </Typography>
            <Box
              component="img"
              src="https://via.placeholder.com/80x80?text=Icon"
              alt="Heat Icon"
              sx={{
                width: { xs: '40px', md: '60px' },
                height: { xs: '40px', md: '60px' },
                display: { xs: 'none', sm: 'block' },
              }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontSize: { xs: '0.875rem', md: '1rem' },
            }}
          >
            Ấm áp mọi nơi - Tự tin mọi lúc
          </Typography>
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

export default HeatRetainingSection;

