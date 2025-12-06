import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import ProductCard, { type ProductCardProps } from '../../components/ProductCard';
import { getUserProfile, getMyBids, type UserProfile, type BiddingItem } from '../../api/user';
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

// ========== FAKE DATA FOR UI PREVIEW ==========
const USE_FAKE_DATA = true;

const generateFakeBiddingData = (): BiddingItem[] => {
  const now = new Date();
  return [
    {
      _id: 'fake-bid-1',
      productId: '1',
      bidAmount: 2500000,
      bidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: false,
      status: 'active',
      product: {
        id: 1,
        product_name: 'Áo dài truyền thống màu đỏ - Đấu giá cao cấp',
        thumpnail_url: '/pic1.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 3500000,
        minimum_bid_step: 100000,
        start_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        current_price: 2600000,
        highest_bidder: { id: 2, avatar: '/avt2.jpg', fullname: 'Trần Thị Bình' },
        bid_count: 15,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    {
      _id: 'fake-bid-2',
      productId: '2',
      bidAmount: 4500000,
      bidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      status: 'active',
      product: {
        id: 2,
        product_name: 'Váy cưới trắng tinh khôi - Phiên đấu giá đặc biệt',
        thumpnail_url: '/pic2.jpg',
        seller: { id: 3, avatar: '/avt3.jpg', fullname: 'Lê Thị Cúc' },
        buy_now_price: 6000000,
        minimum_bid_step: 200000,
        start_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        current_price: 4500000,
        highest_bidder: { id: 999, avatar: '/avt1.jpg', fullname: 'You' }, // User is winning
        bid_count: 28,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    },
    {
      _id: 'fake-bid-3',
      productId: '3',
      bidAmount: 1800000,
      bidAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: false,
      status: 'active',
      product: {
        id: 3,
        product_name: 'Áo dài cách tân màu xanh - Sản phẩm hot',
        thumpnail_url: '/pic3.jpg',
        seller: { id: 5, avatar: '/avt2.jpg', fullname: 'Hoàng Văn Em' },
        buy_now_price: 2800000,
        minimum_bid_step: 50000,
        start_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        current_price: 1950000,
        highest_bidder: { id: 6, avatar: '/avt3.jpg', fullname: 'Vũ Thị Phương' },
        bid_count: 42,
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
    },
    {
      _id: 'fake-bid-4',
      productId: '4',
      bidAmount: 3200000,
      bidAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      status: 'active',
      product: {
        id: 4,
        product_name: 'Váy dạ hội màu đen - Phiên đấu giá cuối tuần',
        thumpnail_url: '/pic4.jpg',
        seller: { id: 7, avatar: '/avt1.jpg', fullname: 'Đặng Văn Giang' },
        buy_now_price: 4500000,
        minimum_bid_step: 150000,
        start_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        current_price: 3200000,
        highest_bidder: { id: 999, avatar: '/avt1.jpg', fullname: 'You' }, // User is winning
        bid_count: 19,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
    },
  ];
};
// ========== END FAKE DATA ==========

export default function MyBidsPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [biddingItems, setBiddingItems] = useState<BiddingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserData(profile);
        
        // Use fake data if flag is enabled
        if (USE_FAKE_DATA) {
          console.log('Using fake bidding data for UI preview');
          const fakeData = generateFakeBiddingData();
          setBiddingItems(fakeData);
        } else {
          const bids = await getMyBids();
          setBiddingItems(bids);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        // If API fails, use fake data for preview
        if (USE_FAKE_DATA) {
          const fakeData = generateFakeBiddingData();
          setBiddingItems(fakeData);
        } else {
          toast.error(err.message || 'Failed to load my bids');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert BiddingItem to ProductCardProps
  const convertToProductCardProps = (item: BiddingItem): ProductCardProps => {
    const product = item.product;
    return {
      id: parseInt(product.id.toString()),
      product_name: product.product_name,
      thumpnail_url: product.thumpnail_url,
      seller: product.seller,
      buy_now_price: product.buy_now_price,
      minimum_bid_step: product.minimum_bid_step,
      start_at: product.start_at,
      end_at: product.end_at,
      current_price: product.current_price,
      highest_bidder: product.highest_bidder,
      created_at: product.created_at || product.posted_at,
      posted_at: product.posted_at,
      bid_count: product.bid_count,
    };
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
              userImage={userData?.profileImageUrl}
              fullName={
                userData
                  ? userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                  : undefined
              }
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

            {biddingItems.length === 0 ? (
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
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {biddingItems.map((item) => {
                  const productCardProps = convertToProductCardProps(item);

                  return (
                    <Box 
                      key={item._id}
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
                        {item.isWinning && (
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
                          label={`Giá đặt: ${formatPrice(item.bidAmount)}`}
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
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


