import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  colors: string[];
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  price,
  originalPrice,
  discount,
  colors,
}) => {
  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)',
        },
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Discount Badge */}
      {discount && (
        <Chip
          label={discount}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: '#E53935',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            zIndex: 1,
            height: '24px',
          }}
        />
      )}

      {/* Product Image */}
      <CardMedia
        component="img"
        image={image}
        alt={name}
        sx={{
          height: { xs: 280, sm: 320, md: 360 },
          objectFit: 'cover',
          bgcolor: '#f5f5f5',
        }}
      />

      {/* Product Info */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#333',
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.8em',
          }}
        >
          {name}
        </Typography>

        {/* Price Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#E53935',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {price}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#999',
              textDecoration: 'line-through',
              fontSize: '0.875rem',
            }}
          >
            {originalPrice}
          </Typography>
        </Box>

        {/* Color Options */}
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          {colors.map((color, index) => (
            <Box
              key={index}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: color,
                border: '1px solid #ddd',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.2)',
                  borderColor: '#333',
                },
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

