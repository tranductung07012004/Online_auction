import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import ProductCard, { type ProductCardProps } from '../../components/ProductCard';
import { getUserProfile, UserProfileResponse } from '../../api/profileApi';
import { getMyBids, type MyBidsPageResponse } from '../../api/product';
import { useAuthStore } from '../../stores/authStore';
import { Pagination } from '@mui/material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import { Gavel } from 'lucide-react';
import { toast } from 'react-hot-toast';


export default function MyBidsPage(): JSX.Element {
  const userId = useAuthStore((state) => state.userId);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [biddingItems, setBiddingItems] = useState<MyBidsPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(2);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch user profile
      try {
        const profile = await getUserProfile();
        setUserData(profile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        toast.error(err.message || 'Failed to load user profile');
      }
      
      // Fetch my bids
      try {
        const bids = await getMyBids(page, size);
        setBiddingItems(bids);
      } catch (err: any) {
        console.error('Error fetching my bids:', err);
        toast.error(err.message || 'Failed to load my bids');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, size]);

  // Convert ProductResponseFromAPI to ProductCardProps
  const convertToProductCardProps = (product: any): ProductCardProps => {
    return {
      id: product.id,
      productName: product.productName,
      thumbnailUrl: product.thumbnailUrl,
      seller: {
        id: product.seller.id,
        avatar: product.seller.avatar || null,
        fullname: product.seller.fullname,
      },
      buyNowPrice: product.buyNowPrice,
      minimumBidStep: product.minimumBidStep,
      startAt: product.createdAt,
      endAt: product.endAt,
      currentPrice: product.currentPrice,
      topBidder: product.topBidder ? {
        id: product.topBidder.id,
        avatar: product.topBidder.avatar || null,
        fullname: product.topBidder.fullname,
      } : null,
      createdAt: product.createdAt,
      bidCount: product.bidCount,
    };
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination is 1-based, API is 0-based
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <CircularProgress />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="my-bids"
              userName={userData?.email || 'User'}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: '#fff', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Gavel className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      My Bids
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Danh sách các sản phẩm bạn đang đấu giá (chưa kết thúc)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {!biddingItems || biddingItems.content.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Gavel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  Chưa có sản phẩm đang đấu giá
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bạn chưa tham gia đấu giá sản phẩm nào. Hãy khám phá và đặt giá cho các sản phẩm yêu thích!
                </Typography>
              </Paper>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(2, 1fr)',
                    },
                    gap: 3,
                    mb: 3,
                  }}
                >
                  {biddingItems.content.map((product) => {
                    const productCardProps = convertToProductCardProps(product);
                    const isWinning = product.topBidder && userId && product.topBidder.id === parseInt(userId);

                    return (
                      <Box 
                        key={product.id}
                        sx={{ 
                          position: 'relative',
                        }}
                      >
                        <ProductCard {...productCardProps} />
                        {/* Bid Info Overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            zIndex: 10,
                          }}
                        >
                          {isWinning && (
                            <Chip
                              label="Đang dẫn đầu"
                              color="success"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                          <Chip
                            label={`Giá hiện tại: ${formatPrice(product.currentPrice)}`}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.95)',
                              color: '#1a1a1a',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                            size="small"
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                
                {/* Pagination */}
                {biddingItems.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={biddingItems.totalPages}
                      page={page + 1}
                      onChange={handlePageChange}
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#8c6550',
                          '&.Mui-selected': {
                            backgroundColor: '#EAD9C9',
                            color: '#8c6550',
                            '&:hover': {
                              backgroundColor: '#d4c4b0',
                            },
                          },
                          '&:hover': {
                            backgroundColor: '#f5ede5',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


