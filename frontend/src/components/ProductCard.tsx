import React, { JSX, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';

interface SellerProps {
  id: number;
  avatar: string;
  fullname: string;
}

interface BidderProps {
  id: number;
  avatar: string;
  fullname: string;
}

export interface ProductCardProps {
  id: number;
  product_name: string;
  thumpnail_url: string;
  seller: SellerProps;
  buy_now_price: number | null; // Can be null if no buy now price
  minimum_bid_step: number;
  start_at: string | Date;
  end_at: string | Date;
  current_price: number; // Current price (highest bid)
  highest_bidder: BidderProps | null; // Thông tin bidder đang đặt giá cao nhất
  created_at?: string | Date; // Product posted date
  posted_at?: string | Date; // Product posted date (alias)
  bid_count: number; // Current bid count
}

export default function ProductCard({
  id,
  product_name,
  thumpnail_url,
  seller,
  buy_now_price,
  minimum_bid_step,
  start_at,
  end_at,
  current_price,
  highest_bidder,
  created_at,
  posted_at,
  bid_count,
}: ProductCardProps): JSX.Element {
  // State cho countdown timer
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Tính toán status dựa trên start_at và end_at
  const status = useMemo(() => {
    const now = new Date();
    const start = new Date(start_at);
    const end = new Date(end_at);

    if (now < start) {
      return { label: 'Upcoming', color: 'info' as const };
    } else if (now >= start && now <= end) {
      const timeRemaining = end.getTime() - now.getTime();
      const hoursRemaining = timeRemaining / (1000 * 60 * 60);
      
      if (hoursRemaining < 24) {
        return { label: 'Last Promotion', color: 'error' as const };
      } else if (hoursRemaining < 72) {
        return { label: 'Almost Booked', color: 'warning' as const };
      } else {
        return { label: 'Available', color: 'success' as const };
      }
    } else {
      return { label: 'Ended', color: 'default' as const };
    }
  }, [start_at, end_at]);

  // Tính toán thời gian còn lại
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(end_at);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} days ${hours} hours`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} hours ${minutes} minutes`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes} minutes ${seconds} seconds`);
      } else {
        setTimeRemaining(`${seconds} seconds`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [end_at]);

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Lấy ngày đăng sản phẩm
  const postedDate = created_at || posted_at || start_at;

  return (
    <Card
      sx={{
        bgcolor: '#dacfba',
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Link to={`/product/${id}`} style={{ textDecoration: 'none' }}>
          <CardMedia
            component="img"
            image={thumpnail_url || '/placeholder.svg'}
            alt={product_name}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
            }}
          />
        </Link>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{
              fontWeight: 'medium',
              fontSize: '0.75rem',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Stack spacing={1.5}>
          {/* Product Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.8em',
            }}
          >
            {product_name}
          </Typography>

          {/* Current Price */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {formatPrice(current_price)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Current Price
            </Typography>
          </Box>

          {/* Highest Bidder Information */}
          {highest_bidder && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 1,
              }}
            >
              <Avatar
                src={highest_bidder.avatar}
                alt={highest_bidder.fullname}
                sx={{ width: 32, height: 32 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {highest_bidder.fullname}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                  }}
                >
                  Highest Bidder
                </Typography>
              </Box>
            </Box>
          )}

          {/* Buy Now Price (if available) */}
          {buy_now_price !== null && (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                }}
              >
                {formatPrice(buy_now_price)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Buy Now Price
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Posted Date */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              Posted: {new Date(postedDate).toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Typography>
          </Box>

          {/* Time Remaining */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: status.color === 'error' ? '#E53935' : 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              ⏱️ Time Remaining: {timeRemaining}
            </Typography>
          </Box>

          {/* Bid Count */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Bid Count: <strong>{bid_count}</strong>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

