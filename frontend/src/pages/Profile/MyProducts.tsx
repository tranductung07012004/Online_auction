import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { reviewBidder, cancelTransaction, type ReviewBidderData } from '../../api/user';
import { getUserProfile, type UserProfileResponse } from '../../api/profileApi';
import { getActiveProductsBySeller, getEndedProductsBySeller, type ProductResponseFromAPI } from '../../api/product';
import type { SellerProduct } from '../../api/user';
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
  Pagination,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { Boxes, Star, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Map ProductResponseFromAPI to SellerProduct
const mapProductToSellerProduct = (product: ProductResponseFromAPI): SellerProduct => {
  return {
    _id: product.id.toString(),
    id: product.id,
    product_name: product.productName,
    thumpnail_url: product.thumbnailUrl,
    seller: {
      id: product.seller.id,
      avatar: product.seller.avatar || '/placeholder-user.jpg',
      fullname: product.seller.fullname,
    },
    buy_now_price: product.buyNowPrice,
    minimum_bid_step: product.minimumBidStep,
    start_at: new Date(product.createdAt),
    end_at: new Date(product.endAt),
    current_price: product.currentPrice,
    highest_bidder: product.topBidder ? {
      id: product.topBidder.id,
      avatar: product.topBidder.avatar || '/placeholder-user.jpg',
      fullname: product.topBidder.fullname,
    } : null,
    bid_count: product.bidCount,
    created_at: new Date(product.createdAt),
    posted_at: new Date(product.createdAt),
    status: new Date(product.endAt) > new Date() ? 'active' : 'won',
    winningBidder: product.topBidder && new Date(product.endAt) <= new Date() ? {
      id: product.topBidder.id,
      avatar: product.topBidder.avatar || '/placeholder-user.jpg',
      fullname: product.topBidder.fullname,
      bidAmount: product.currentPrice,
      bidAt: product.endAt,
    } : undefined,
  };
};

export default function MyProductsPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'won'>('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 1;
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [reviewType, setReviewType] = useState<'like' | 'dislike' | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profile = await getUserProfile();
        setUserData(profile);

        // Fetch products based on filter with pagination
        const pageIndex = page - 1; // Convert to 0-based index for API
        let productsResponse;
        
        if (filter === 'active') {
          productsResponse = await getActiveProductsBySeller(pageIndex, itemsPerPage);
        } else {
          productsResponse = await getEndedProductsBySeller(pageIndex, itemsPerPage);
        }

        // Map products to SellerProduct format
        const mappedProducts = productsResponse.content.map(mapProductToSellerProduct);
        setProducts(mappedProducts);
        setTotalPages(productsResponse.totalPages || 1);

        // Load reviewed status from localStorage
        const reviewed = new Set<string>();
        mappedProducts.forEach(product => {
          const isReviewed = localStorage.getItem(`bidder_reviewed_${product._id}`);
          if (isReviewed === 'true') {
            reviewed.add(product._id);
          }
        });
        setReviewedProducts(reviewed);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.message || 'Failed to load products');
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, page]);

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: 'active' | 'won' | null,
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1); // Reset to first page when filter changes
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
      const pageIndex = page - 1;
      let productsResponse;
      if (filter === 'active') {
        productsResponse = await getActiveProductsBySeller(pageIndex, itemsPerPage);
      } else {
        productsResponse = await getEndedProductsBySeller(pageIndex, itemsPerPage);
      }
      const mappedProducts = productsResponse.content.map(mapProductToSellerProduct);
      setProducts(mappedProducts);
      setTotalPages(productsResponse.totalPages || 1);
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
      const pageIndex = page - 1;
      let productsResponse;
      if (filter === 'active') {
        productsResponse = await getActiveProductsBySeller(pageIndex, itemsPerPage);
      } else {
        productsResponse = await getEndedProductsBySeller(pageIndex, itemsPerPage);
      }
      const mappedProducts = productsResponse.content.map(mapProductToSellerProduct);
      setProducts(mappedProducts);
      setTotalPages(productsResponse.totalPages || 1);
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

  // Products are already filtered and paginated by the API
  const paginatedProducts = products;

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
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: '#fff', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Boxes className="h-8 w-8" style={{ color: '#968f65' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#968f65' }}>
                      My Products
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#968f65' }}>
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
                            bgcolor: '#e8d45f',
                            color: '#1a1a1a',
                            '&:hover': {
                              bgcolor: '#e8d45f',
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton
                        value="active"
                        aria-label="active products"
                      >
                        Active Auctions
                      </ToggleButton>
                      <ToggleButton value="won" aria-label="won products">
                        Completed Auctions
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {products.length === 0 ? (
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
                    : 'No completed auctions'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filter === 'active'
                    ? 'You do not have any active auctions.'
                    : 'No products with winners yet.'}
                </Typography>
              </Paper>
            ) : (
              <>
                <Stack spacing={3}>
                  {paginatedProducts.map((product) => (
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
                                Ends: {new Date(product.end_at).toLocaleString('en-US')}
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
                            ) : (
                              <Chip
                                label="Completed"
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

                        {/* Note for completed products without winner */}
                        {product.status === 'won' && !product.winningBidder && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              bgcolor: '#f5f5f5',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#868686', fontStyle: 'italic' }}>
                              This auction ended without any bids.
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                  ))}
                </Stack>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#333333',
                          '&.Mui-selected': {
                            backgroundColor: '#EAD9C9',
                            color: '#333333',
                            '&:hover': {
                              backgroundColor: '#EAD9C9',
                            },
                          },
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
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

      <Footer />
    </div>
  );
}


