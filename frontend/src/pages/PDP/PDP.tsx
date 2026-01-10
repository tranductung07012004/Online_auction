import { Heart, ChevronRight } from 'lucide-react';
import { useEffect, useState, JSX, useMemo } from 'react';
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
import { checkUserCanBid } from '../../api/bidderManagement';
import { addToWishlist, isProductInUserWishlist } from '../../api/wishlist';
import { useAuthStore } from '../../stores/authStore';
import { Box, Container, Typography, Pagination } from '@mui/material';
import RoleWrapper from '../../components/RoleWrapper';

// 3. Các field hiển thị từ API:
// Product name, images, prices, seller, top bidder, description, categories, bid count, auction end time
// 4. Fake data vẫn dùng cho:
// Reviews/Q&A (chưa có API)

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkAuthStatus, userId, role } = useAuthStore();
  const [product, setProduct] = useState<ProductResponseFromAPI | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductResponseFromAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshQuestions, setRefreshQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);

  // Bid dialog state
  const [bidDialogOpen, setBidDialogOpen] = useState<boolean>(false);
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  
  // Description pagination state
  const [descriptionPage, setDescriptionPage] = useState<number>(1);
  const descriptionsPerPage = 5;
  
  // Check if auction has ended
  const isAuctionEnded = product ? new Date(product.endAt) < new Date() : false;

  // Check if current user is the top bidder
  const isCurrentUserTopBidder = useMemo(() => {
    if (!product?.topBidder || !userId) {
      return false;
    }
    return parseInt(userId, 10) === product.topBidder.id;
  }, [product?.topBidder, userId]);

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
        // Reset description page when product changes
        setDescriptionPage(1);

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

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
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
          // Map all answers, not just the first one
          const answers = question.answers && question.answers.length > 0 
            ? question.answers.map((answer) => ({
                id: answer.id.toString(),
                username: answer.user.fullname,
                date: new Date(answer.createdAt),
                answerText: answer.content,
                icon: answer.user.avatar || '/placeholder-user.jpg'
              }))
            : [];
          
          return {
            _id: question.id.toString(),
            username: question.user.fullname,
            date: new Date(question.createdAt),
            questionText: question.content,
            icon: question.user.avatar || '/placeholder-user.jpg',
            answers: answers
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

    // Check if user can bid on this product
    try {
      if (!id) {
        toast.error('Product ID is missing');
        return;
      }

      const canBid = await checkUserCanBid(id);
      
      // If API returns true (200 OK), user can bid
      if (canBid) {
        setBidDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Error checking if user can bid:', error);
      
      // Handle 400 Bad Request - user cannot bid
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'You are not allowed to bid on this product. You may be blacklisted or need seller approval.';
        toast.error(errorMessage);
      } else {
        // Handle other errors
        toast.error(error.response?.data?.message || 'Failed to check bidding permission. Please try again.');
      }
    }
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

  // Check if current user is the seller of this product
  const isProductSeller = 
    role === 'SELLER' && 
    userId !== null && 
    product !== null && 
    product.seller !== null &&
    parseInt(userId, 10) === product.seller.id;

  // Check if user can place bid
  // Conditions:
  // 1. Auction must not be ended
  // 2. Product must exist
  // 3. User must have role BIDDER or SELLER
  // 4. If user is SELLER, they cannot bid on their own product
  const canPlaceBid = useMemo(() => {
    // Auction ended or no product
    if (isAuctionEnded || !product) {
      return false;
    }

    // Must be BIDDER or SELLER
    if (role !== 'BIDDER' && role !== 'SELLER') {
      return false;
    }

    // SELLER cannot bid on their own product
    if (isProductSeller) {
      return false;
    }

    return true;
  }, [isAuctionEnded, product, role, isProductSeller]);

  // Keep isBidEnabled for backward compatibility (used in button styling)
  const isBidEnabled = canPlaceBid;

  // Check if user can answer questions (only product seller)
  // Note: This is ownership-based, not role-based, so cannot use RoleWrapper
  const canAnswerQuestion = isProductSeller;

  // Hard set threshold: 3 days
  const ENDING_SOON_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

  // Calculate if auction is ending soon (hard set to 3 days)
  const isEndingSoon = useMemo(() => {
    if (!product) {
      return false;
    }

    const now = new Date();
    const end = new Date(product.endAt);
    
    // If already ended, not ending soon
    if (now > end) {
      return false;
    }

    // Calculate time remaining in milliseconds
    const timeRemainingMs = end.getTime() - now.getTime();

    return timeRemainingMs <= ENDING_SOON_THRESHOLD_MS;
  }, [product]);

  // State for time remaining text (updates every second)
  const [timeRemainingText, setTimeRemainingText] = useState<string>('');

  // Update time remaining text every second
  useEffect(() => {
    if (!product) {
      setTimeRemainingText('');
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(product.endAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemainingText('Ended');
        return;
      }

      // If > 3 days: display "Auction ends: [date time]"
      if (diff > ENDING_SOON_THRESHOLD_MS) {
        setTimeRemainingText(`Auction ends: ${end.toLocaleString('vi-VN')}`);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // If >= 1 day: display "X day(s) left"
      if (days >= 1) {
        setTimeRemainingText(`${days} ${days === 1 ? 'day' : 'days'} left`);
        return;
      }

      // If < 1 day but >= 1 hour: display "X hour(s) left"
      if (hours >= 1) {
        setTimeRemainingText(`${hours} ${hours === 1 ? 'hour' : 'hours'} left`);
        return;
      }

      // If < 1 hour but >= 1 minute: display "X minute(s) left"
      if (minutes >= 1) {
        setTimeRemainingText(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`);
        return;
      }

      // If < 1 minute: display "X second(s) left"
      setTimeRemainingText(`${seconds} ${seconds === 1 ? 'second' : 'seconds'} left`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [product]);

  // Handle question submission
  const handleQuestionSubmitted = () => {
    // Refresh dress data to show the new question
    setRefreshQuestions(prev => !prev);
  };

  // Handle add to wishlist (only add, no remove)
  const handleAddToWishlist = async () => {
    if (!id) {
      toast.error('Product ID is missing');
      return;
    }

    // Check authentication
    const isAuthenticatedNow = await checkAuthStatus();
    if (!isAuthenticatedNow) {
      toast.error('Please sign in to add to wishlist');
      navigate('/signin');
      return;
    }

    // Check role
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
      // Add to wishlist
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
              {/* Wishlist Button - Only visible to BIDDER or SELLER, and only when not in wishlist */}
              {(role === 'BIDDER' || role === 'SELLER') && !isInWishlist && (
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                  title="Add to wishlist"
                >
                  <Heart className="w-6 h-6" />
                </button>
              )}
              {/* Show filled heart if already in wishlist (read-only) */}
              {(role === 'BIDDER' || role === 'SELLER') && isInWishlist && (
                <div className="text-red-500" title="In your wishlist">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
              )}
            </div>

            {/* Top Bidder Notification */}
            {isCurrentUserTopBidder && !isAuctionEnded && (
              <div className="border-2 border-yellow-400 rounded-lg p-3 bg-yellow-50">
                <p className="text-lg font-semibold text-[#8B4513] text-center">
                  🏆 You are the top bidder right now, keep going!!
                </p>
              </div>
            )}

            {/* Current Price and Buy Now Price */}
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Current Price:</span>
                <div className="text-2xl font-bold text-[#e8bb76]">
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
            
            {/* Display product created date */}
            {product?.createdAt && (
              <div className="text-sm text-gray-600">
                Product created: {new Date(product.createdAt).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            
            {/* Display auction status */}
            <div className={`text-lg font-bold ${isEndingSoon ? 'text-[#f0c88b]' : 'text-gray-600'}`}>
              {isAuctionEnded 
                ? "Auction Ended" 
                : timeRemainingText}
            </div>

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
                : isProductSeller
                ? 'Cannot Bid on Your Own Product'
                : role !== 'BIDDER' && role !== 'SELLER'
                ? 'Sign In as Bidder or Seller to Bid'
                : 'Place Bid'
              }
              {isBidEnabled && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>

            {/* Seller Information */}
            {product?.seller && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-[#333333] mb-4">Seller Information</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 min-w-12 min-h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                    <div className="mt-2">
                      <span
                        onClick={() => navigate(`/reviews/user/${product.seller.id}`)}
                        className="text-sm text-[#8B4513] italic underline cursor-pointer hover:text-[#654321] transition-colors"
                      >
                        see detailed reviews
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
                  <div className="w-12 h-12 min-w-12 min-h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.topBidder.avatar || "/placeholder-user.jpg"} 
                      alt="Highest Bidder" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#333333]">{product.topBidder.fullname}</div>
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
                    <div className="mt-2">
                      <span
                        onClick={() => product.topBidder && navigate(`/reviews/user/${product.topBidder.id}`)}
                        className="text-sm text-[#8B4513] italic underline cursor-pointer hover:text-[#654321] transition-colors"
                      >
                        see detailed reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Description */}
            {product?.descriptions && product.descriptions.length > 0 && (() => {
              // Sort descriptions by createdAt (newest first)
              const sortedDescriptions = [...product.descriptions].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });

              // Calculate pagination
              const totalDescriptionPages = Math.ceil(sortedDescriptions.length / descriptionsPerPage);
              const startIndex = (descriptionPage - 1) * descriptionsPerPage;
              const endIndex = startIndex + descriptionsPerPage;
              const paginatedDescriptions = sortedDescriptions.slice(startIndex, endIndex);

              return (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium text-[#333333] mb-4">Description</h3>
                  
                  {/* Display all descriptions in current page */}
                  <div className="space-y-6">
                    {paginatedDescriptions.map((desc, index) => (
                      <div key={desc.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(desc.createdAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <div 
                          className="text-sm text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: desc.content }} 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination for descriptions */}
                  {totalDescriptionPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={totalDescriptionPages}
                        page={descriptionPage}
                        onChange={(_event, value) => setDescriptionPage(value)}
                        color="primary"
                        size="small"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#333333',
                            '&.Mui-selected': {
                              backgroundColor: '#EAD9C9',
                              color: '#8c6550',
                              '&:hover': {
                                backgroundColor: '#EAD9C9',
                                opacity: 0.8,
                              },
                            },
                            '&:hover': {
                              backgroundColor: '#EAD9C9',
                              opacity: 0.6,
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </div>
              );
            })()}

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

        {/* Transaction History Section - Only visible to SELLER or BIDDER */}
        <RoleWrapper requiredRole="BIDDER">
          <div className="mt-16">
            <TransactionHistory productId={id} />
          </div>
        </RoleWrapper>

        {/* Bidder Management Section - Only visible to product seller */}
        {isProductSeller && (
          <div className="mt-16">
            <BidderManagement productId={id || 'fake-product-123'} isSeller={true} />
          </div>
        )}

        {/* Questions & Answers Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-8">Questions & Answers</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question Form - Only visible to BIDDER or SELLER */}
            <RoleWrapper requiredRole="BIDDER">
              <div className="lg:col-span-1">
                <ReviewForm 
                  dressId={id || ''} 
                  onReviewSubmitted={handleQuestionSubmitted}
                  canSubmitQuestion={true}
                />
              </div>
            </RoleWrapper>
            
            {/* Question List - Visible to everyone, but only seller can answer */}
            <div className={role === 'BIDDER' || role === 'SELLER' ? "lg:col-span-2" : "lg:col-span-full"}>
              {questionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-[#ead9c9] rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-500">Loading questions...</span>
                </div>
              ) : (
                <ReviewList 
                  questions={questions} 
                  onRefresh={handleQuestionSubmitted}
                  canAnswerQuestion={canAnswerQuestion}
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
        productId={id || ''}
      />
    </div>
  );
}
