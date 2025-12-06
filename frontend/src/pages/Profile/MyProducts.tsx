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
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip,
  Stack,
  Paper,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { Boxes, Star, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ========== FAKE DATA FOR UI PREVIEW ==========
const USE_FAKE_DATA = true;

const generateFakeProductsData = (showActive: boolean, showUpcoming: boolean = false): SellerProduct[] => {
  const now = new Date();
  const fakeProducts: SellerProduct[] = [];

  if (showUpcoming) {
    // Fake data for upcoming products (chưa đến thời điểm đấu giá)
    fakeProducts.push(
      {
        _id: 'fake-product-5',
        id: 5,
        product_name: 'Áo dài lụa tơ tằm cao cấp',
        thumpnail_url: '/pic5.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 5000000,
        minimum_bid_step: 150000,
        start_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        current_price: 3000000,
        highest_bidder: null,
        bid_count: 0,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
      },
      {
        _id: 'fake-product-6',
        id: 6,
        product_name: 'Váy cưới ren Pháp sang trọng',
        thumpnail_url: '/pic6.jpg',
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        buy_now_price: 8000000,
        minimum_bid_step: 250000,
        start_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        end_at: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        current_price: 5000000,
        highest_bidder: null,
        bid_count: 0,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        posted_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
      },
    );
  } else if (showActive) {
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
  const [filter, setFilter] = useState<'active' | 'won' | 'upcoming'>('active');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [reviewType, setReviewType] = useState<'like' | 'dislike' | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
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
          const fakeData = generateFakeProductsData(
            filter === 'active',
            filter === 'upcoming'
          );
          setProducts(fakeData);

          // Load reviewed status from localStorage
          const reviewed = new Set<string>();
          fakeData.forEach(product => {
            const isReviewed = localStorage.getItem(`bidder_reviewed_${product._id}`);
            if (isReviewed === 'true') {
              reviewed.add(product._id);
            }
          });
          setReviewedProducts(reviewed);
        } else {
          const productsData = await getMyProducts();
          setProducts(productsData);

          // Load reviewed status from localStorage
          const reviewed = new Set<string>();
          productsData.forEach(product => {
            const isReviewed = localStorage.getItem(`bidder_reviewed_${product._id}`);
            if (isReviewed === 'true') {
              reviewed.add(product._id);
            }
          });
          setReviewedProducts(reviewed);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        // If API fails, use fake data for preview
        if (USE_FAKE_DATA) {
          const fakeData = generateFakeProductsData(
            filter === 'active',
            filter === 'upcoming'
          );
          setProducts(fakeData);

          // Load reviewed status from localStorage
          const reviewed = new Set<string>();
          fakeData.forEach(product => {
            const isReviewed = localStorage.getItem(`bidder_reviewed_${product._id}`);
            if (isReviewed === 'true') {
              reviewed.add(product._id);
            }
          });
          setReviewedProducts(reviewed);
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
    newFilter: 'active' | 'won' | 'upcoming' | null,
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleReviewClick = (product: SellerProduct) => {
    setSelectedProduct(product);

    // Load previous review data from localStorage if exists
    const savedRating = localStorage.getItem(`bidder_rating_${product._id}`);
    const savedComment = localStorage.getItem(`bidder_comment_${product._id}`);

    setReviewType((savedRating === 'like' || savedRating === 'dislike') ? savedRating : null);
    setReviewText(savedComment || '');
    setReviewDialogOpen(true);
  };

  const handleCancelClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setCancelDialogOpen(true);
  };

  const handleDescriptionClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setDescription('');
    setDescriptionDialogOpen(true);
  };

  const handleSubmitDescription = async () => {
    if (!selectedProduct || !description.trim()) return;

    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call
      console.log('Adding description:', {
        productId: selectedProduct._id,
        description: description,
      });
      toast.success('Description added successfully!');
      setDescriptionDialogOpen(false);
      setSelectedProduct(null);
      setDescription('');
    } catch (err: any) {
      console.error('Error adding description:', err);
      toast.error(err.message || 'Failed to add description');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !selectedProduct.winningBidder || !reviewType) return;

    try {
      setIsSubmitting(true);
      const reviewData: ReviewBidderData = {
        productId: selectedProduct._id,
        bidderId: selectedProduct.winningBidder.id.toString(),
        reviewType,
        reviewText,
      };
      await reviewBidder(reviewData);

      // Save to localStorage
      localStorage.setItem(`bidder_rating_${selectedProduct._id}`, reviewType);
      if (reviewText.trim()) {
        localStorage.setItem(`bidder_comment_${selectedProduct._id}`, reviewText.trim());
      }
      localStorage.setItem(`bidder_reviewed_${selectedProduct._id}`, 'true');

      // Update reviewed products set
      setReviewedProducts(prev => new Set(prev).add(selectedProduct._id));

      const isReReview = reviewedProducts.has(selectedProduct._id);
      toast.success(isReReview ? 'Bidder review updated successfully!' : 'Review submitted successfully!');
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      // Refresh products
      if (USE_FAKE_DATA) {
        const fakeData = generateFakeProductsData(
          filter === 'active',
          filter === 'upcoming'
        );
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
      toast.success('Transaction cancelled successfully!');
      setCancelDialogOpen(false);
      setSelectedProduct(null);
      // Refresh products
      if (USE_FAKE_DATA) {
        const fakeData = generateFakeProductsData(
          filter === 'active',
          filter === 'upcoming'
        );
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
    } else if (filter === 'upcoming') {
      return product.status === 'upcoming';
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
                    Manage the products you have listed
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
                        Active Auctions
                      </ToggleButton>
                      <ToggleButton value="upcoming" aria-label="upcoming products">
                        Upcoming Auctions
                      </ToggleButton>
                      <ToggleButton value="won" aria-label="won products">
                        Completed Auctions
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
                    ? 'No active auctions'
                    : filter === 'upcoming'
                      ? 'No upcoming auctions'
                      : 'No completed auctions'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filter === 'active'
                    ? 'You don't have any active auctions.'
                    : filter === 'upcoming'
                      ? 'You don't have any upcoming auctions.'
                      : 'No products with winners yet.'}
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
                                Current Price: <strong>{formatPrice(product.current_price)}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Bid Count: <strong>{product.bid_count}</strong>
                              </Typography>
                              {product.buy_now_price && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Buy Now Price: <strong>{formatPrice(product.buy_now_price)}</strong>
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {product.status === 'upcoming'
                                  ? `Starts: ${new Date(product.start_at).toLocaleString('en-US')}`
                                  : `Ends: ${new Date(product.end_at).toLocaleString('en-US')}`}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box>
                            {product.status === 'active' ? (
                              <Chip
                                label="Active"
                                color="success"
                                icon={<CheckCircle className="h-4 w-4" />}
                              />
                            ) : product.status === 'upcoming' ? (
                              <Chip
                                label="Upcoming"
                                sx={{
                                  backgroundColor: '#a67c66',      // màu nền
                                  color: 'white',                  // màu chữ
                                  textTransform: 'none',           // giữ nguyên viết hoa/thường
                                  '&:hover': {
                                    backgroundColor: '#8c6550',    // màu hover
                                  },
                                }}
                                color="info"
                                icon={<CheckCircle className="h-4 w-4" />}
                              />
                            ) : (
                              <Chip
                                label="Completed"
                                color="warning"
                                icon={<Star className="h-4 w-4" />}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Add Description Button (for upcoming products) */}
                        {product.status === 'upcoming' && (
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              onClick={() => handleDescriptionClick(product)}
                              sx={{
                                bgcolor: '#FFE082',
                                color: '#1a1a1a',
                                '&:hover': {
                                  bgcolor: '#FFD54F',
                                },
                                fontWeight: 600,
                              }}
                            >
                              Add Description
                            </Button>
                          </Box>
                        )}

                        {/* Winning Bidder Info (for won products) */}
                        {product.status === 'won' && product.winningBidder && (
                          <Alert
                            severity="info"
                            sx={{
                              "& .MuiAlert-icon": {
                                color: "#5c5752",        // ⚡ đây là màu của icon "i"
                              },
                              color: "#5c5752",
                              bgcolor: '#f5d3b0',
                              borderRadius: 2,
                            }}
                          >
                            <Stack spacing={2}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}>
                                <Avatar
                                  src={product.winningBidder.avatar}
                                  alt={product.winningBidder.fullname}
                                  sx={{ width: 40, height: 40 }}
                                />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    Winner: {product.winningBidder.fullname}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Winning Bid: {formatPrice(product.winningBidder.bidAmount)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Bid Placed: {new Date(product.winningBidder.bidAt).toLocaleString('en-US')}
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
                                  {reviewedProducts.has(product._id) ? 'Review Bidder Again' : 'Review Bidder'}
                                </Button>
                                <Button

                                  startIcon={<X className="h-5 w-5" />}
                                  onClick={() => handleCancelClick(product)}
                                  sx={{
                                    backgroundColor: '#a67c66',      // màu nền
                                    color: 'white',                  // màu chữ
                                    textTransform: 'none',           // giữ nguyên viết hoa/thường
                                    '&:hover': {
                                      backgroundColor: '#8c6550',    // màu hover
                                    },
                                    fontWeight: 600,
                                  }}
                                >
                                  Cancel Transaction
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
        <DialogTitle>
          {selectedProduct && reviewedProducts.has(selectedProduct._id) ? 'Review Bidder Again' : 'Review Bidder'}
        </DialogTitle>
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
                </Box>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                Are you satisfied with this bidder?
              </Typography>
              <ToggleButtonGroup
                value={reviewType}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setReviewType(newValue);
                  }
                }}
                aria-label="bidder rating"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    py: 1.5,
                    borderColor: '#c3937c',
                    color: '#c3937c',
                    '&.Mui-selected': {
                      bgcolor: '#c3937c',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#a67c66',
                      },
                    },
                    '&:hover': {
                      bgcolor: '#f8f3f0',
                    },
                  },
                }}
              >
                <ToggleButton value="like" aria-label="like">
                  <ThumbUpIcon sx={{ mr: 1 }} />
                  Like
                </ToggleButton>
                <ToggleButton value="dislike" aria-label="dislike">
                  <ThumbDownIcon sx={{ mr: 1 }} />
                  Dislike
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment about bidder"
              placeholder="Share your experience with this bidder (communication, reliability, payment...)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a67c66',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a67c66',
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  backgroundColor: '#f8f3f0',
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReviewDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={isSubmitting || !reviewText.trim() || !reviewType}
            sx={{
              bgcolor: '#c3937c',
              '&:hover': { bgcolor: '#a67c66' },
              '&:disabled': { bgcolor: '#d3c4b8' }
            }}
          >
            {isSubmitting ? 'Sending...' : 'Submit Review'}
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
        <DialogTitle>Cancel Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Are you sure you want to cancel the transaction with this bidder? This action cannot be undone.
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
                  Product: {selectedProduct.product_name}
                </Typography>
                <Typography variant="body2">
                  Bid Amount: {formatPrice(selectedProduct.winningBidder.bidAmount)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              backgroundColor: '#a67c66',      // màu nền
              color: 'white',                  // màu chữ
              textTransform: 'none',           // giữ nguyên viết hoa/thường
              '&:hover': {
                backgroundColor: '#8c6550',    // màu hover
              },
            }}
            onClick={() => setCancelDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancelTransaction}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Description Dialog */}
      <Dialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Description</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedProduct && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src={selectedProduct.thumpnail_url || '/placeholder.svg'}
                  alt={selectedProduct.product_name}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography variant="h6">{selectedProduct.product_name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Starts: {new Date(selectedProduct.start_at).toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            )}
            <TextField
              label="Product description"
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a67c66',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a67c66',
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  backgroundColor: '#f8f3f0',
                },
              }}
              multiline
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              placeholder="Enter detailed description for the product..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              backgroundColor: '#a67c66',      // màu nền
              color: 'white',                  // màu chữ
              textTransform: 'none',           // giữ nguyên viết hoa/thường
              '&:hover': {
                backgroundColor: '#8c6550',    // màu hover
              },
            }}
            onClick={() => setDescriptionDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitDescription}
            variant="contained"
            disabled={isSubmitting || !description.trim()}
            sx={{
              bgcolor: '#FFE082',
              color: '#1a1a1a',
              '&:hover': {
                bgcolor: '#FFD54F',
              },
            }}
          >
            {isSubmitting ? 'Sending...' : 'Add Description'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
}


