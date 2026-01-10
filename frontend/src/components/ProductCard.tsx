import { JSX, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  IconButton,
} from '@mui/material';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSystemSettingStore } from '../stores/systemSettingStore';
import { useAuthStore } from '../stores/authStore';
import { addToWishlist, isProductInUserWishlist } from '../api/wishlist';
import RoleWrapper from './RoleWrapper';

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
  const navigate = useNavigate();
  const { checkAuthStatus, userId, role } = useAuthStore();
  
  // State cho countdown timer
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // State cho wishlist
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  
  // Lấy thông tin threshold từ Zustand store để xác định product mới tạo
  const newCreatedProductThreshold = useSystemSettingStore((state) => state.newCreatedProduct);
  // Trong ProductCard.tsx, sau dòng 74
  console.log('ProductCard - newCreatedProductThreshold:', newCreatedProductThreshold);

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

    // Tính thời gian từ khi tạo sản phẩm đến hiện tại (milliseconds)
    const createdAtDate = new Date(createdAt);
    const timeSinceCreatedMs = now.getTime() - createdAtDate.getTime();

    // Nếu không có setting từ store, mặc định là Available
    if (!newCreatedProductThreshold) {
      return { label: 'Available', color: 'info' as const };
    }

    // Chuyển đổi threshold từ store thành milliseconds
    let thresholdMs = 0;
    const { time, format } = newCreatedProductThreshold;

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

    // So sánh thời gian từ khi tạo với threshold
    if (timeSinceCreatedMs <= thresholdMs) {
      // Trạng thái 3: New - sản phẩm mới (màu nổi bật)
      return { label: 'New', color: 'error' as const };
    } else {
      // Trạng thái 2: Available - đang diễn ra bình thường
      return { label: 'Available', color: 'info' as const };
    }
  }, [startAt, endAt, createdAt, newCreatedProductThreshold]);

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

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      // Only check if user is authenticated and has BIDDER or SELLER role
      if (!id || !userId || (role !== 'BIDDER' && role !== 'SELLER')) {
        setIsInWishlist(false);
        return;
      }

      try {
        const inWishlist = await isProductInUserWishlist(id);
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error('Failed to check wishlist status:', error);
        setIsInWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [id, userId, role]);

  // Handle add to wishlist
  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking wishlist button
    e.stopPropagation();

    // Check authentication
    const isAuthenticatedNow = await checkAuthStatus();
    if (!isAuthenticatedNow) {
      toast.error('Please sign in to add to wishlist');
      navigate('/signin');
      return;
    }

    // Role check is handled by RoleWrapper, but we keep this as a safety check
    if (role !== 'BIDDER' && role !== 'SELLER') {
      toast.error('Only Bidders and Sellers can add products to wishlist');
      return;
    }

    // If already in wishlist, don't do anything
    if (isInWishlist) {
      return;
    }

    try {
      setWishlistLoading(true);
      await addToWishlist(id);
      toast.success('Product added to wishlist successfully');
      setIsInWishlist(true);
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.message || 'Failed to add product to wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

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
        // Viền màu vàng cho sản phẩm mới
        border: status.color === 'error' ? '3px solid #FFD700' : 'none',
        boxShadow: status.color === 'error' ? '0 0 0 1px rgba(255, 215, 0, 0.3), 0 4px 6px rgba(0,0,0,0.1)' : 'none',
        '&:hover': {
          boxShadow: status.color === 'error' 
            ? '0 0 0 1px rgba(255, 215, 0, 0.5), 0 8px 12px rgba(0,0,0,0.15)' 
            : 6,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Link to={`/product-page/${id}`} style={{ textDecoration: 'none' }}>
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
        {/* Wishlist Button */}
        <RoleWrapper requiredRole="BIDDER">
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 2,
            }}
          >
            {!isInWishlist ? (
              <IconButton
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                  },
                  transition: 'all 0.2s',
                }}
                title="Add to wishlist"
              >
                <Heart 
                  className="w-5 h-5" 
                  style={{ color: '#666' }}
                />
              </IconButton>
            ) : (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="In your wishlist"
              >
                <Heart 
                  className="w-5 h-5" 
                  style={{ color: '#E53935', fill: '#E53935' }}
                />
              </Box>
            )}
          </Box>
        </RoleWrapper>
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

