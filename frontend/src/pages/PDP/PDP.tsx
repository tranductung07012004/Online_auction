import { Heart, ChevronRight } from 'lucide-react';
import { useEffect, useState, JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProductGallery from './pdp/product-gallery';
import ReviewForm from './pdp/review-form';
import ReviewList from './pdp/review-list';
import TransactionHistory from './pdp/transaction-history';
import BidDialog from './pdp/bid-dialog';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { getDressById, Dress } from '../../api/dress';
import { useAuth } from '../../context/AuthContext';
import { Box, Container, Typography } from '@mui/material';
import axios from 'axios';

// Interface for similar products matching ProductCard props
interface SimilarProduct {
  id: number;
  product_name: string;
  thumpnail_url: string;
  seller: {
    id: number;
    avatar: string;
    fullname: string;
  };
  buy_now_price: number | null;
  minimum_bid_step: number;
  start_at: string | Date;
  end_at: string | Date;
  current_price: number;
  highest_bidder: {
    id: number;
    avatar: string;
    fullname: string;
  } | null;
  created_at?: string | Date;
  posted_at?: string | Date;
  bid_count: number;
}

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [dress, setDress] = useState<Dress | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshReviews, setRefreshReviews] = useState<boolean>(false);
  const [reviews, setReviews] = useState<any[]>([]);

  // Bid dialog state
  const [bidDialogOpen, setBidDialogOpen] = useState<boolean>(false);
  
  // Fake data for auction
  const [fakeAuctionData, setFakeAuctionData] = useState({
    currentPrice: 1500000,
    minimumBidStep: 50000,
    isEnded: false, // For testing, set to false to allow bidding
  });

  // Generate fake similar products (same subcategory)
  const generateSimilarProducts = (currentProductId: string | undefined): SimilarProduct[] => {
    const now = new Date();
    const sellers = [
      { id: 1, avatar: '/placeholder-user.jpg', fullname: 'Nguyễn Văn A' },
      { id: 2, avatar: '/placeholder-user.jpg', fullname: 'Trần Thị B' },
      { id: 3, avatar: '/placeholder-user.jpg', fullname: 'Lê Văn C' },
      { id: 4, avatar: '/placeholder-user.jpg', fullname: 'Phạm Thị D' },
      { id: 5, avatar: '/placeholder-user.jpg', fullname: 'Hoàng Văn E' },
    ];

    const bidders = [
      { id: 6, avatar: '/placeholder-user.jpg', fullname: 'Lý Văn F' },
      { id: 7, avatar: '/placeholder-user.jpg', fullname: 'Đỗ Thị G' },
      { id: 8, avatar: '/placeholder-user.jpg', fullname: 'Bùi Văn H' },
      { id: 9, avatar: '/placeholder-user.jpg', fullname: 'Vũ Thị I' },
      { id: 10, avatar: '/placeholder-user.jpg', fullname: 'Đinh Văn J' },
    ];

    const productNames = [
      'Tranh the ki trong',
      'De tam de che',
      'Da hoi ao dai',
      'Thang canh ky phong',
      'Thanh guom cua vua Louis III',
      'Chen thanh',
      'Ke huy diet',
      'Hung thu tiec tan',
      'Tranh cua picasso',
      'Nguoi dep to lua',
      'Mot ngay nang',
      'Berserk',
    ];

    // Generate 5 similar products, excluding current product
    // If currentProductId is not a number, just take first 5
    const filteredNames = currentProductId 
      ? productNames.filter((_, index) => (index + 1).toString() !== currentProductId)
      : productNames;
    
    return filteredNames
      .slice(0, 5)
      .map((name, index) => {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 7));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);
        
        const buyNowPrice = Math.floor(Math.random() * 5000000) + 1000000; // 1M - 6M VND
        const minBidStep = Math.floor(buyNowPrice * 0.05);
        const currentPrice = Math.floor(buyNowPrice * (0.6 + Math.random() * 0.3)); // 60-90% of buy now price
        const bidCount = Math.floor(Math.random() * 50) + 1; // 1-50 bids
        const hasHighestBidder = Math.random() > 0.2; // 80% chance of having a bidder
        const postedDate = new Date(startDate);
        postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 3)); // Posted 0-3 days before start

        return {
          id: index + 100, // Use different IDs to avoid conflicts
          product_name: name,
          thumpnail_url: '/placeholder.svg',
          seller: sellers[Math.floor(Math.random() * sellers.length)],
          buy_now_price: Math.random() > 0.1 ? buyNowPrice : null, // 90% have buy now price
          minimum_bid_step: minBidStep,
          start_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          current_price: currentPrice,
          highest_bidder: hasHighestBidder ? bidders[Math.floor(Math.random() * bidders.length)] : null,
          created_at: postedDate.toISOString(),
          bid_count: bidCount,
        };
      });
  };

  useEffect(() => {
    const fetchDressData = async () => {
      try {
        setLoading(true);
        
        // Always generate similar products first (even if no ID)
        const fakeSimilarProducts = generateSimilarProducts(id);
        console.log('Generated similar products:', fakeSimilarProducts);
        setSimilarProducts(fakeSimilarProducts);
        
        // If no ID provided, use a default dress or redirect
        if (!id) {
          console.warn('No dress ID provided, using default view');
          setLoading(false);
          return;
        }
        
        // Fetch dress data
        const dressData = await getDressById(id);
        // Log full dress data to check description structure
        console.log('Fetched dress data:', JSON.stringify(dressData, null, 2));
        console.log('Description object:', dressData.description);
        
        setDress(dressData);

        // Fetch reviews (Thêm mới)
        try {
          const response = await axios.get(`http://localhost:3000/dress/${id}/review`);
          if (response.data && response.data.success) {
            setReviews(response.data.data);
          }
        } catch (reviewError) {
          console.error('Failed to fetch reviews:', reviewError);
        }
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dress data:', error);
        setError('Failed to load dress details. Please try again later.');
        // Still generate similar products even on error
        const fakeSimilarProducts = generateSimilarProducts(id);
        console.log('Generated similar products (fallback):', fakeSimilarProducts);
        setSimilarProducts(fakeSimilarProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchDressData();
  }, [id, refreshReviews]);
  
  // Handle bid button click
  const handleBid = async () => {
    // Check authentication
    const isAuthenticatedNow = await checkAuthStatus();
    
    if (!isAuthenticatedNow) {
      toast.error('Vui lòng đăng nhập để đấu giá');
      navigate('/signin');
      return;
    }

    if (fakeAuctionData.isEnded) {
      toast.error('Phiên đấu giá đã kết thúc');
      return;
    }

    // Open bid dialog
    setBidDialogOpen(true);
  };

  // Handle bid confirmation
  const handleBidConfirm = (bidAmount: number) => {
    console.log('Bid confirmed:', bidAmount);
    // Update current price (fake data)
    setFakeAuctionData(prev => ({
      ...prev,
      currentPrice: bidAmount,
    }));
    toast.success('Đấu giá thành công!');
  };

  // Format price
  const price = dress?.purchasePrice || dress?.dailyRentalPrice || 0;

  // Check if bid can be placed - fake data: always enabled unless auction ended
  const isBidEnabled = !fakeAuctionData.isEnded;

  // Handle review submission
  const handleReviewSubmitted = () => {
    // Refresh dress data to show the new review
    setRefreshReviews(prev => !prev);
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-lg text-gray-600">Loading dress details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col justify-center items-center h-[60vh] px-4">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <button 
            className="bg-[#ead9c9] text-[#333333] py-2 px-4 rounded-md"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <ProductGallery 
            images={dress?.images || ["pic1.jpg"]} 
          />

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-medium text-[#333333]">{dress?.name || "Eliza Satin"}</h1>
              <button className="text-[#333333]">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Current Price and Buy Now Price */}
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Giá hiện tại:</span>
                <div className="text-2xl font-bold text-[#2e7d32]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(fakeAuctionData.currentPrice)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Bước giá tối thiểu:</span>
                <div className="text-xl font-semibold text-[#333333]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(fakeAuctionData.minimumBidStep)}
                </div>
              </div>
            </div>
            
            {/* Display auction status */}
            <p className="text-sm text-gray-600">
              {fakeAuctionData.isEnded 
                ? "Kết thúc đấu giá" 
                : "Đang diễn ra đấu giá"}
            </p>

            {/* Bid Button */}
            <button 
              className={`w-full py-3 rounded-md flex items-center justify-center ${
                isBidEnabled
                  ? 'bg-[#ead9c9] text-[#333333] hover:bg-[#e0cbb9]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isBidEnabled}
              onClick={handleBid}
            >
              {fakeAuctionData.isEnded 
                ? 'Kết thúc đấu giá' 
                : 'Đấu giá'
              }
              {isBidEnabled && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>

            {/* Seller Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-[#333333] mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/placeholder-user.jpg" 
                    alt="Seller" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#333333]">Nguyễn Văn A</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= 4 ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">4.5 (128 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Highest Bidder Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-[#333333] mb-4">Highest Bidder</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/placeholder-user.jpg" 
                    alt="Highest Bidder" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#333333]">Trần Thị B</div>
                  <div className="text-sm text-gray-600 mt-1">Current bid: ${(price * 1.1).toFixed(2)}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= 5 ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">5.0 (56 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-16">
          <TransactionHistory />
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-8">Raise a question</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm 
                dressId={id || ''} 
                onReviewSubmitted={handleReviewSubmitted} 
              />
            </div>
            
            {/* Review List */}
            <div className="lg:col-span-2">
              <ReviewList 
                dressId={id || ''} 
                reviews={reviews} 
                onRefresh={handleReviewSubmitted} 
              />
            </div>
          </div>
        </div>

      </main>

      {/* Similar Products - Same Subcategory */}
      {similarProducts.length > 0 && (
        <Box sx={{ py: 8, bgcolor: '#f9f9f9' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 4,
                textAlign: 'center',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Same products that you may like
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 3,
              }}
            >
              {similarProducts.map((product) => (
                <Box
                  key={product.id}
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    window.scrollTo(0, 0);
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <ProductCard {...product} />
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Footer */}
      <Footer />

      {/* Bid Dialog */}
      <BidDialog
        open={bidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        onConfirm={handleBidConfirm}
        currentPrice={fakeAuctionData.currentPrice}
        minimumBidStep={fakeAuctionData.minimumBidStep}
      />
    </div>
  );
}
