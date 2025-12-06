import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import ProductCard, { type ProductCardProps } from '../../components/ProductCard';
import { getUserProfile, getWatchlist, removeFromWatchlist, type UserProfile, type WatchlistItem } from '../../api/user';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ========== FAKE DATA FOR UI PREVIEW ==========
const USE_FAKE_DATA = true;

const generateFakeWatchlistData = (): WatchlistItem[] => {
  const now = new Date();
  return [
    {
      _id: 'fake-watchlist-1',
      productId: '1',
      product: {
        id: 1,
        product_name: 'Áo dài truyền thống màu đỏ - Đấu giá cao cấp',
        thumpnail_url: '/pic1.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 3500000,
        minimum_bid_step: 100000,
        start_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        current_price: 2500000,
        highest_bidder: { id: 2, avatar: '/avt2.jpg', fullname: 'Trần Thị Bình' },
        bid_count: 15,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'fake-watchlist-2',
      productId: '2',
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
        highest_bidder: { id: 4, avatar: '/avt1.jpg', fullname: 'Phạm Văn Đức' },
        bid_count: 28,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'fake-watchlist-3',
      productId: '3',
      product: {
        id: 3,
        product_name: 'Áo dài cách tân màu xanh - Sản phẩm hot',
        thumpnail_url: '/pic3.jpg',
        seller: { id: 5, avatar: '/avt2.jpg', fullname: 'Hoàng Văn Em' },
        buy_now_price: 2800000,
        minimum_bid_step: 50000,
        start_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        current_price: 1800000,
        highest_bidder: { id: 6, avatar: '/avt3.jpg', fullname: 'Vũ Thị Phương' },
        bid_count: 42,
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'fake-watchlist-4',
      productId: '4',
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
        highest_bidder: { id: 8, avatar: '/avt2.jpg', fullname: 'Bùi Thị Hoa' },
        bid_count: 19,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'fake-watchlist-5',
      productId: '5',
      product: {
        id: 5,
        product_name: 'Áo dài cao cấp màu vàng - Sản phẩm độc quyền',
        thumpnail_url: '/pic5.jpg',
        seller: { id: 9, avatar: '/avt3.jpg', fullname: 'Ngô Văn Sơn' },
        buy_now_price: 5500000,
        minimum_bid_step: 250000,
        start_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        current_price: 3800000,
        highest_bidder: { id: 10, avatar: '/avt1.jpg', fullname: 'Đinh Văn Uyên' },
        bid_count: 12,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};
// ========== END FAKE DATA ==========

export default function WatchListPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserData(profile);
        
        // Use fake data if flag is enabled
        if (USE_FAKE_DATA) {
          console.log('Using fake watchlist data for UI preview');
          const fakeData = generateFakeWatchlistData();
          setWatchlistItems(fakeData);
        } else {
          const watchlist = await getWatchlist();
          setWatchlistItems(watchlist);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        // If API fails, use fake data for preview
        if (USE_FAKE_DATA) {
          const fakeData = generateFakeWatchlistData();
          setWatchlistItems(fakeData);
        } else {
          toast.error(err.message || 'Failed to load watchlist');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveFromWatchlist = async (productId: string) => {
    try {
      setRemovingIds(prev => new Set(prev).add(productId));
      await removeFromWatchlist(productId);
      setWatchlistItems(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi watchlist');
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      toast.error(err.message || 'Failed to remove from watchlist');
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Convert WatchlistItem to ProductCardProps
  const convertToProductCardProps = (item: WatchlistItem): ProductCardProps => {
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
              activeTab="watchlist"
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
                    <Heart className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      Watch List
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Danh sách các sản phẩm bạn đã thêm vào watchlist
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {watchlistItems.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  Watchlist trống
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bạn chưa thêm sản phẩm nào vào watchlist. Hãy khám phá và thêm các sản phẩm yêu thích!
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
                {watchlistItems.map((item) => {
                  const productCardProps = convertToProductCardProps(item);
                  const isRemoving = removingIds.has(item.productId);

                  return (
                    <Box 
                      key={item._id}
                      sx={{ 
                        position: 'relative',
                      }}
                    >
                      <ProductCard {...productCardProps} />
                      <IconButton
                        onClick={() => handleRemoveFromWatchlist(item.productId)}
                        disabled={isRemoving}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                          },
                          zIndex: 10,
                        }}
                        size="small"
                      >
                        {isRemoving ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-500" />
                        )}
                      </IconButton>
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

