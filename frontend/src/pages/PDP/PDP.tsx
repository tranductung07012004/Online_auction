import { Heart, ChevronRight } from 'lucide-react';
import { useEffect, useState, JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProductGallery from './pdp/product-gallery';
import ReviewForm from './pdp/review-form';
import ReviewList from './pdp/review-list';
import TransactionHistory from './pdp/transaction-history';
import BidDialog from './pdp/bid-dialog';
import BidderManagement from './pdp/bidder-management';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { getProductByIdFromMain, getProductsByCategory, ProductResponseFromAPI, getQuestionsByProductId, QuestionResponse } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { Box, Container, Typography } from '@mui/material';

// 3. Các field hiển thị từ API:
// Product name, images, prices, seller, top bidder, description, categories, bid count, auction end time
// 4. Fake data vẫn dùng cho:
// Reviews/Q&A (chưa có API)

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkAuthStatus, userId, role } = useAuth();
  const [product, setProduct] = useState<ProductResponseFromAPI | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductResponseFromAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshQuestions, setRefreshQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);

  // Bid dialog state
  const [bidDialogOpen, setBidDialogOpen] = useState<boolean>(false);
  
  // Check if auction has ended
  const isAuctionEnded = product ? new Date(product.endAt) < new Date() : false;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // If no ID provided, use a default view
        if (!id) {
          console.warn('No product ID provided, using default view');
          setLoading(false);
          return;
        }
        
        // Fetch product data from main service
        const productData = await getProductByIdFromMain(id);
        console.log('Fetched product data:', JSON.stringify(productData, null, 2));
        
        setProduct(productData);

        // Fetch similar products by category
        if (productData.categories && productData.categories.length > 0) {
          try {
            const firstCategoryId = productData.categories[0].id;
            const similarProductsData = await getProductsByCategory(firstCategoryId, 0, 5);
            
            // Filter out current product from similar products
            const filteredSimilarProducts = similarProductsData.filter(
              (p) => p.id !== productData.id
            );
            
            console.log('Fetched similar products:', filteredSimilarProducts);
            setSimilarProducts(filteredSimilarProducts);
          } catch (error: any) {
            console.error('Failed to fetch similar products:', error);
            // Don't set error state, just log and leave similarProducts empty
            setSimilarProducts([]);
          }
        } else {
          setSimilarProducts([]);
        }
        
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch product data:', error);
        setError(error.response?.data?.message || 'Failed to load product details. Please try again later.');
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, userId, role]);

  // Fetch questions separately
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!id) {
        setQuestions([]);
        return;
      }

      try {
        setQuestionsLoading(true);
        // Fetch questions with a large page size to get all questions
        // ReviewList component handles client-side pagination
        const questionsData = await getQuestionsByProductId(id, 0, 100);
        
        // Map API response to format expected by ReviewList
        const mappedQuestions = questionsData.content.map((question: QuestionResponse) => {
          const firstAnswer = question.answers && question.answers.length > 0 ? question.answers[0] : null;
          
          return {
            _id: question.id.toString(),
            username: question.user.fullname,
            date: new Date(question.createdAt),
            questionText: question.content,
            icon: question.user.avatar || '/placeholder-user.jpg',
            images: [],
            answer: firstAnswer ? {
              username: firstAnswer.user.fullname,
              date: new Date(firstAnswer.createdAt),
              answerText: firstAnswer.content,
              icon: firstAnswer.user.avatar || '/placeholder-user.jpg'
            } : null
          };
        });
        
        setQuestions(mappedQuestions);
      } catch (error: any) {
        console.error('Failed to fetch questions:', error);
        // Don't set error state, just log and leave questions empty
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [id, refreshQuestions]);
  
  // Handle bid button click
  const handleBid = async () => {
    // Check authentication
    const isAuthenticatedNow = await checkAuthStatus();
    
    if (!isAuthenticatedNow) {
      toast.error('Please sign in to place a bid');
      navigate('/signin');
      return;
    }

    if (isAuctionEnded) {
      toast.error('The auction has ended');
      return;
    }

    // Open bid dialog
    setBidDialogOpen(true);
  };

  // Handle bid confirmation
  const handleBidConfirm = (bidAmount: number) => {
    console.log('Bid confirmed:', bidAmount);
    // TODO: Call API to place bid
    // For now, just show success message
    toast.success('Bid placed successfully!');
    // Refresh product data to get updated current price
    if (id) {
      getProductByIdFromMain(id).then(setProduct).catch(console.error);
    }
  };

  // Check if bid can be placed
  const isBidEnabled = !isAuctionEnded && product !== null;

  // Handle question submission
  const handleQuestionSubmitted = () => {
    // Refresh dress data to show the new question
    setRefreshQuestions(prev => !prev);
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-lg text-gray-600">Loading product details...</p>
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
            images={(() => {
              const images: string[] = [];
              
              // Add thumbnail first if it exists
              if (product?.thumbnailUrl) {
                images.push(product.thumbnailUrl);
              }
              
              // Add all pictures, avoiding duplicates
              if (product?.pictures && product.pictures.length > 0) {
                product.pictures.forEach(picture => {
                  if (picture.imageUrl && !images.includes(picture.imageUrl)) {
                    images.push(picture.imageUrl);
                  }
                });
              }
              
              // Fallback if no images
              return images.length > 0 ? images : ["pic1.jpg"];
            })()} 
          />

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-medium text-[#333333]">{product?.productName || "Product Name"}</h1>
              <button className="text-[#333333]">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Current Price and Buy Now Price */}
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Current Price:</span>
                <div className="text-2xl font-bold text-[#2e7d32]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product?.currentPrice || 0)}
                </div>
              </div>
              {product?.buyNowPrice && (
                <div>
                  <span className="text-sm text-gray-600">Buy Now Price:</span>
                  <div className="text-xl font-semibold text-[#333333]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.buyNowPrice)}
                  </div>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600">Minimum Bid Step:</span>
                <div className="text-xl font-semibold text-[#333333]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product?.minimumBidStep || 0)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Bid Count:</span>
                <div className="text-lg text-[#333333]">
                  {product?.bidCount || 0} bids
                </div>
              </div>
            </div>
            
            {/* Display auction status */}
            <p className="text-sm text-gray-600">
              {isAuctionEnded 
                ? "Auction Ended" 
                : `Auction ends: ${product?.endAt ? new Date(product.endAt).toLocaleString('vi-VN') : 'N/A'}`}
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
              {isAuctionEnded 
                ? 'Auction Ended' 
                : 'Place Bid'
              }
              {isBidEnabled && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>

            {/* Seller Information */}
            {product?.seller && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-[#333333] mb-4">Seller Information</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.seller.avatar || "/placeholder-user.jpg"} 
                      alt="Seller" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#333333]">{product.seller.fullname}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => {
                          // Assessment is on 0-10 scale, map directly to stars
                          const filledStars = product.seller.assessment ? Math.round(product.seller.assessment) : 0;
                          return (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= filledStars ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.seller.assessment ? product.seller.assessment.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Bidder Information */}
            {product?.topBidder && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-[#333333] mb-4">Highest Bidder</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.topBidder.avatar || "/placeholder-user.jpg"} 
                      alt="Highest Bidder" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#333333]">{product.topBidder.fullname}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Current bid: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(product.currentPrice)}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => {
                          // Assessment is on 0-10 scale, map directly to stars
                          const filledStars = product.topBidder?.assessment ? Math.round(product.topBidder.assessment) : 0;
                          return (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= filledStars ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.topBidder.assessment ? product.topBidder.assessment.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Description */}
            {product?.descriptions && product.descriptions.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-[#333333] mb-4">Description</h3>
                <div 
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: product.descriptions[product.descriptions.length - 1].content 
                  }}
                />
              </div>
            )}

            {/* Categories */}
            {product?.categories && product.categories.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-[#333333] mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span 
                      key={category.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-16">
          <TransactionHistory />
        </div>

        {/* Bidder Management Section - Visible to all users (for testing) */}
        <div className="mt-16">
          <BidderManagement productId={id || 'fake-product-123'} isSeller={true} />
        </div>

        {/* Questions & Answers Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-8">Questions & Answers</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question Form */}
            <div className="lg:col-span-1">
              <ReviewForm 
                dressId={id || ''} 
                onReviewSubmitted={handleQuestionSubmitted} 
              />
            </div>
            
            {/* Question List */}
            <div className="lg:col-span-2">
              {questionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-[#ead9c9] rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-500">Loading questions...</span>
                </div>
              ) : (
                <ReviewList 
                  dressId={id || ''} 
                  reviews={questions} 
                  onRefresh={handleQuestionSubmitted} 
                />
              )}
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
              {similarProducts.map((similarProduct) => (
                <Box
                  key={similarProduct.id}
                  onClick={() => {
                    navigate(`/product-page/${similarProduct.id}`);
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
                  <ProductCard 
                    id={similarProduct.id}
                    productName={similarProduct.productName}
                    thumbnailUrl={similarProduct.thumbnailUrl}
                    seller={{
                      id: similarProduct.seller.id,
                      avatar: similarProduct.seller.avatar || null,
                      fullname: similarProduct.seller.fullname,
                    }}
                    buyNowPrice={similarProduct.buyNowPrice}
                    minimumBidStep={similarProduct.minimumBidStep}
                    endAt={similarProduct.endAt}
                    currentPrice={similarProduct.currentPrice}
                    topBidder={similarProduct.topBidder ? {
                      id: similarProduct.topBidder.id,
                      avatar: similarProduct.topBidder.avatar || null,
                      fullname: similarProduct.topBidder.fullname,
                    } : null}
                    createdAt={similarProduct.createdAt}
                    bidCount={similarProduct.bidCount}
                  />
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
        currentPrice={product?.currentPrice || 0}
        minimumBidStep={product?.minimumBidStep || 0}
      />
    </div>
  );
}
