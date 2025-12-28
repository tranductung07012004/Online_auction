import { JSX, useMemo, useState, useEffect } from 'react';
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
import { useSystemSettingStore } from '../stores/systemSettingStore';

interface SellerProps {
  id: number;
  avatar: string | null;
  fullname: string;
}

interface BidderProps {
  id: number;
  avatar: string | null;
  fullname: string;
}

export interface ProductCardProps {
  id: number;
  productName: string;
  thumbnailUrl: string;
  seller: SellerProps;
  buyNowPrice: number | null; // Can be null if no buy now price
  minimumBidStep: number;
  startAt?: string | Date; // Optional, will use createdAt if not provided
  endAt: string | Date;
  currentPrice: number; // Current price (highest bid)
  topBidder: BidderProps | null; // Thông tin bidder đang đặt giá cao nhất
  createdAt: string | Date; // Product posted date
  bidCount: number; // Current bid count
}

export default function ProductCard({
  id,
  productName,
  thumbnailUrl,
  seller,
  buyNowPrice,
  minimumBidStep,
  startAt,
  endAt,
  currentPrice,
  topBidder,
  createdAt,
  bidCount,
}: ProductCardProps): JSX.Element {
  // State cho countdown timer
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Lấy thông tin threshold từ Zustand store để xác định product sắp ended
  const timeRemainingThreshold = useSystemSettingStore((state) => state.timeRemaining);

  // Tính toán status dựa trên startAt, endAt và system setting
  const status = useMemo(() => {
    const now = new Date();
    const start = new Date(startAt || createdAt);
    const end = new Date(endAt);

    // Trạng thái 1: Upcoming - chưa bắt đầu
    if (now < start) {
      return { label: 'Upcoming', color: 'info' as const };
    }

    // Trạng thái 4: Ended - đã kết thúc
    if (now > end) {
      return { label: 'Ended', color: 'info' as const };
    }

    // Tính thời gian còn lại (milliseconds)
    const timeRemainingMs = end.getTime() - now.getTime();

    // Nếu không có setting từ store, mặc định là Available
    if (!timeRemainingThreshold) {
      return { label: 'Available', color: 'info' as const };
    }

    // Chuyển đổi threshold từ store thành milliseconds
    let thresholdMs = 0;
    const { time, format } = timeRemainingThreshold;

    switch (format.toLowerCase()) {
      case 'hour':
        thresholdMs = time * 60 * 60 * 1000;
        break;
      case 'minute':
        thresholdMs = time * 60 * 1000;
        break;
      case 'day':
        thresholdMs = time * 24 * 60 * 60 * 1000;
        break;
      default:
        // Mặc định là hour nếu format không hợp lệ
        thresholdMs = time * 60 * 60 * 1000;
    }

    // So sánh thời gian còn lại với threshold
    if (timeRemainingMs <= thresholdMs) {
      // Trạng thái 3: Ended Soon - sắp kết thúc (màu nổi bật)
      return { label: 'Ended Soon', color: 'error' as const };
    } else {
      // Trạng thái 2: Available - đang diễn ra bình thường
      return { label: 'Available', color: 'info' as const };
    }
  }, [startAt, endAt, createdAt, timeRemainingThreshold]);

  // Tính toán thời gian còn lại
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(endAt);
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
  }, [endAt]);

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Lấy ngày đăng sản phẩm
  const postedDate = createdAt || startAt || endAt;

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
            image={thumbnailUrl || '/placeholder.svg'}
            alt={productName}
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
            {productName}
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
              {formatPrice(currentPrice)}
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
          {topBidder && (
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
                src={topBidder.avatar || '/placeholder-user.jpg'}
                alt={topBidder.fullname}
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
                  {topBidder.fullname}
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
          {buyNowPrice !== null && (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                }}
              >
                {formatPrice(buyNowPrice)}
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
              Posted:{' '}
              {new Date(postedDate).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
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
              Bid Count: <strong>{bidCount}</strong>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

