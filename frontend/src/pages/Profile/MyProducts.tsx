import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { getUserProfile, getMyProducts, reviewBidder, cancelTransaction, type UserProfile, type SellerProduct, type ReviewBidderData } from '../../api/user';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip,
  Stack,
  Paper,
  Alert,
} from '@mui/material';
import { Boxes, Star, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ========== FAKE DATA FOR UI PREVIEW ==========
const USE_FAKE_DATA = true;

const generateFakeProductsData = (showActive: boolean): SellerProduct[] => {
  const now = new Date();
  const fakeProducts: SellerProduct[] = [];

  if (showActive) {
    // Fake data for active products (còn hạn)
    fakeProducts.push(
      {
        _id: 'fake-product-1',
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
        status: 'active',
      },
      {
        _id: 'fake-product-2',
        id: 2,
        product_name: 'Váy cưới trắng tinh khôi - Phiên đấu giá đặc biệt',
        thumpnail_url: '/pic2.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 6000000,
        minimum_bid_step: 200000,
        start_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        current_price: 4500000,
        highest_bidder: { id: 4, avatar: '/avt1.jpg', fullname: 'Phạm Văn Đức' },
        bid_count: 28,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    );
  } else {
    // Fake data for won products (đã có người thắng)
    fakeProducts.push(
      {
        _id: 'fake-product-3',
        id: 3,
        product_name: 'Áo dài cách tân màu xanh - Sản phẩm hot',
        thumpnail_url: '/pic3.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 2800000,
        minimum_bid_step: 50000,
        start_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        current_price: 1950000,
        highest_bidder: { id: 6, avatar: '/avt3.jpg', fullname: 'Vũ Thị Phương' },
        bid_count: 42,
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: 'won',
        winningBidder: {
          id: 6,
          avatar: '/avt3.jpg',
          fullname: 'Vũ Thị Phương',
          bidAmount: 1950000,
          bidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        _id: 'fake-product-4',
        id: 4,
        product_name: 'Váy dạ hội màu đen - Phiên đấu giá cuối tuần',
        thumpnail_url: '/pic4.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 4500000,
        minimum_bid_step: 150000,
        start_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        current_price: 3200000,
        highest_bidder: { id: 8, avatar: '/avt2.jpg', fullname: 'Bùi Thị Hoa' },
        bid_count: 19,
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        status: 'won',
        winningBidder: {
          id: 8,
          avatar: '/avt2.jpg',
          fullname: 'Bùi Thị Hoa',
          bidAmount: 3200000,
          bidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    );
  }

  return fakeProducts;
};
// ========== END FAKE DATA ==========

export default function MyProductsPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'won'>('active');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserData(profile);
        
        // Use fake data if flag is enabled
        if (USE_FAKE_DATA) {
          console.log('Using fake products data for UI preview');
          const fakeData = generateFakeProductsData(filter === 'active');
          setProducts(fakeData);
        } else {
          const productsData = await getMyProducts();
          setProducts(productsData);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        // If API fails, use fake data for preview
        if (USE_FAKE_DATA) {
          const fakeData = generateFakeProductsData(filter === 'active');
          setProducts(fakeData);
        } else {
          toast.error(err.message || 'Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'active' | 'won' | null,
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleReviewClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setRating(5);
    setReviewText('');
    setReviewDialogOpen(true);
  };

  const handleCancelClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setCancelDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !selectedProduct.winningBidder) return;

    try {
      setIsSubmitting(true);
      const reviewData: ReviewBidderData = {
        productId: selectedProduct._id,
        bidderId: selectedProduct.winningBidder.id.toString(),
        rating,
        reviewText,
      };
      await reviewBidder(reviewData);
      toast.success('Đánh giá thành công!');
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      // Refresh products
      if (USE_FAKE_DATA) {
        const fakeData = generateFakeProductsData(filter === 'active');
        setProducts(fakeData);
      } else {
        const productsData = await getMyProducts();
        setProducts(productsData);
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!selectedProduct || !selectedProduct.winningBidder) return;

    try {
      setIsSubmitting(true);
      await cancelTransaction(selectedProduct._id, selectedProduct.winningBidder.id.toString());
      toast.success('Đã hủy giao dịch thành công!');
      setCancelDialogOpen(false);
      setSelectedProduct(null);
      // Refresh products
      if (USE_FAKE_DATA) {
        const fakeData = generateFakeProductsData(filter === 'active');
        setProducts(fakeData);
      } else {
        const productsData = await getMyProducts();
        setProducts(productsData);
      }
    } catch (err: any) {
      console.error('Error canceling transaction:', err);
      toast.error(err.message || 'Failed to cancel transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'active') {
      return product.status === 'active';
    } else {
      return product.status === 'won';
    }
  });

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
              activeTab="my-products"
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
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Boxes className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      My Products
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Quản lý các sản phẩm bạn đã đăng bán
                  </Typography>

                  {/* Filter Tabs */}
                  <Box>
                    <ToggleButtonGroup
                      value={filter}
                      exclusive
                      onChange={handleFilterChange}
                      aria-label="product filter"
                      sx={{
                        '& .MuiToggleButton-root': {
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&.Mui-selected': {
                            bgcolor: '#FFE082',
                            color: '#1a1a1a',
                            '&:hover': {
                              bgcolor: '#FFD54F',
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="active" aria-label="active products">
                        Sản phẩm đã đăng, còn hạn
                      </ToggleButton>
                      <ToggleButton value="won" aria-label="won products">
                        Sản phẩm đã có người thắng đấu giá
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {filteredProducts.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Boxes className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  {filter === 'active' 
                    ? 'Chưa có sản phẩm đang đấu giá' 
                    : 'Chưa có sản phẩm có người thắng'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filter === 'active'
                    ? 'Bạn chưa đăng sản phẩm nào hoặc tất cả sản phẩm đã kết thúc.'
                    : 'Chưa có sản phẩm nào có người thắng đấu giá.'}
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {filteredProducts.map((product) => (
                  <Card key={product._id} sx={{ bgcolor: '#fff', borderRadius: 2, overflow: 'hidden' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {/* Product Info */}
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box
                            component="img"
                            src={product.thumpnail_url || '/placeholder.svg'}
                            alt={product.product_name}
                            sx={{
                              width: 120,
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 2,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {product.product_name}
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Giá hiện tại: <strong>{formatPrice(product.current_price)}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Số lượt đấu giá: <strong>{product.bid_count}</strong>
                              </Typography>
                              {product.buy_now_price && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Giá mua ngay: <strong>{formatPrice(product.buy_now_price)}</strong>
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Kết thúc: {new Date(product.end_at).toLocaleString('vi-VN')}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box>
                            {product.status === 'active' ? (
                              <Chip
                                label="Đang đấu giá"
                                color="success"
                                icon={<CheckCircle className="h-4 w-4" />}
                              />
                            ) : (
                              <Chip
                                label="Đã có người thắng"
                                color="warning"
                                icon={<Star className="h-4 w-4" />}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Winning Bidder Info (for won products) */}
                        {product.status === 'won' && product.winningBidder && (
                          <Alert 
                            severity="info" 
                            sx={{ 
                              bgcolor: '#E3F2FD',
                              borderRadius: 2,
                            }}
                          >
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={product.winningBidder.avatar}
                                  alt={product.winningBidder.fullname}
                                  sx={{ width: 40, height: 40 }}
                                />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    Người thắng: {product.winningBidder.fullname}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Giá đấu: {formatPrice(product.winningBidder.bidAmount)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Đấu giá lúc: {new Date(product.winningBidder.bidAt).toLocaleString('vi-VN')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="contained"
                                  startIcon={<Star className="h-5 w-5" />}
                                  onClick={() => handleReviewClick(product)}
                                  sx={{
                                    bgcolor: '#FFE082',
                                    color: '#1a1a1a',
                                    '&:hover': {
                                      bgcolor: '#FFD54F',
                                    },
                                    fontWeight: 600,
                                  }}
                                >
                                  Đánh giá Bidder
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<X className="h-5 w-5" />}
                                  onClick={() => handleCancelClick(product)}
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  Hủy giao dịch
                                </Button>
                              </Box>
                            </Stack>
                          </Alert>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </div>
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Đánh giá Bidder</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedProduct?.winningBidder && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedProduct.winningBidder.avatar}
                  alt={selectedProduct.winningBidder.fullname}
                  sx={{ width: 50, height: 50 }}
                />
                <Box>
                  <Typography variant="h6">{selectedProduct.winningBidder.fullname}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedProduct.product_name}
                  </Typography>
                </Box>
              </Box>
            )}
            <Box>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                Đánh giá
              </Typography>
              <Rating
                value={rating}
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setRating(newValue);
                  }
                }}
                size="large"
              />
            </Box>
            <TextField
              label="Nhận xét"
              multiline
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              fullWidth
              placeholder="Viết nhận xét về bidder này..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={isSubmitting || !reviewText.trim()}
            sx={{
              bgcolor: '#FFE082',
              color: '#1a1a1a',
              '&:hover': {
                bgcolor: '#FFD54F',
              },
            }}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Transaction Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Hủy giao dịch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Bạn có chắc chắn muốn hủy giao dịch với bidder này? Hành động này không thể hoàn tác.
            </Alert>
            {selectedProduct?.winningBidder && (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Thông tin giao dịch:
                </Typography>
                <Typography variant="body2">
                  Bidder: {selectedProduct.winningBidder.fullname}
                </Typography>
                <Typography variant="body2">
                  Sản phẩm: {selectedProduct.product_name}
                </Typography>
                <Typography variant="body2">
                  Giá đấu: {formatPrice(selectedProduct.winningBidder.bidAmount)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleCancelTransaction}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
}


