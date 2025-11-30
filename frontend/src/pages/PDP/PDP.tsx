import { Heart, ChevronRight, Plus, Minus, Instagram, Send, Mail, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { useEffect, useState, JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProductGallery from './pdp/product-gallery';
import ColorSelector from './pdp/color-selector';
import SizeSelector from './pdp/size-selector';
import DatePicker from './pdp/date-picker';
import AccordionSection from './pdp/accordion-section';
import ReviewItem from './pdp/review-item';
import ReviewForm from './pdp/review-form';
import ReviewList from './pdp/review-list';
import ProductCarousel from './pdp/product-carousel';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { getDressById, getSimilarDresses, Dress } from '../../api/dress';
import { addToCart } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [dress, setDress] = useState<Dress | null>(null);
  const [similarDresses, setSimilarDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  
  // New states for date selection, variants and quantity
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  
  // Purchase option state (mua/thuê)
  const [purchaseOption, setPurchaseOption] = useState<'buy' | 'rent'>('rent');
  
  // Ngày giao hàng khi mua sản phẩm
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState<boolean>(false);

  const [refreshReviews, setRefreshReviews] = useState<boolean>(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchDressData = async () => {
      try {
        setLoading(true);
        
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
        
        // Set initial selected variants if available
        if (dressData.variants && dressData.variants.length > 0) {
          setSelectedSize(dressData.variants[0].size._id);
          setSelectedColor(dressData.variants[0].color._id);
          updateAvailableStock(dressData, dressData.variants[0].size._id, dressData.variants[0].color._id);
        }
        
        // Fetch similar dresses
        const similar = await getSimilarDresses(id, 4);
        setSimilarDresses(similar);

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
      } finally {
        setLoading(false);
      }
    };

    fetchDressData();
  }, [id, refreshReviews]);
  
  // Update available stock when size or color changes
  useEffect(() => {
    if (dress && selectedSize && selectedColor) {
      updateAvailableStock(dress, selectedSize, selectedColor);
    }
  }, [dress, selectedSize, selectedColor]);
  
  // Function to calculate available stock based on selected variants
  const updateAvailableStock = (dressData: Dress, sizeId: string, colorId: string) => {
    const variant = dressData.variants.find(
      v => v.size._id === sizeId && v.color._id === colorId
    );
    
    if (variant) {
      setAvailableStock(variant.stock);
      // Adjust quantity based on stock availability
      if (variant.stock === 0) {
        // Set quantity to 0 if out of stock
        setQuantity(0);
      } else if (quantity > variant.stock || quantity === 0) {
        // If current quantity exceeds available stock or was previously 0, set to min(1, stock)
        setQuantity(Math.min(variant.stock, 1));
      }
    } else {
      setAvailableStock(0);
      setQuantity(0);
    }
  };
  
  // Handle size selection
  const handleSizeSelect = (sizeId: string) => {
    setSelectedSize(sizeId);
  };
  
  // Handle color selection
  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
  };
  
  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    // Only increase if there's stock and current quantity is less than available stock
    if (availableStock !== null && availableStock > 0 && quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };
  
  // Handle date selection
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };
  
  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };
  
  const handleDeliveryDateChange = (date: Date) => {
    setDeliveryDate(date);
    setShowDeliveryDatePicker(false);
  };

  // Handle request to book
  const handleRequestToBook = async () => {
    try {
      // Check authentication with delay to ensure cookie is correctly set and read
      console.log('PDP: Current auth status:', isAuthenticated);
      
      // Force a refresh of authentication status before proceeding
      const isAuthenticatedNow = await checkAuthStatus();
      console.log('PDP: Updated auth status:', isAuthenticatedNow);
      
      if (!isAuthenticatedNow) {
        console.error('Not authenticated, redirecting to login');
        toast.error('Please sign in to add items to your cart');
        navigate('/signin');
        return;
      }
      
      if (!id || !selectedSize || !selectedColor) {
        toast.error('Please select size and color');
        return;
      }

      // Kiểm tra ngày thuê đối với tùy chọn thuê
      if (purchaseOption === 'rent' && (!startDate || !endDate)) {
        toast.error('Please select rental dates');
        return;
      }

      if (quantity <= 0 || availableStock === 0) {
        toast.error('Selected item is out of stock');
        return;
      }

      setIsAddingToCart(true);
      
      let requestData: any = {
        dressId: id,
        sizeId: selectedSize,
        colorId: selectedColor,
        quantity,
        purchaseType: purchaseOption
      };
      
      // Xử lý ngày bắt đầu và kết thúc dựa vào tùy chọn
      if (purchaseOption === 'rent' && startDate && endDate) {
        // Nếu thuê, sử dụng ngày người dùng đã chọn
        requestData.startDate = format(startDate, 'yyyy-MM-dd');
        requestData.endDate = format(endDate, 'yyyy-MM-dd');
      } else if (purchaseOption === 'buy') {
        // Khi mua, sử dụng ngày giao hàng đã chọn hoặc ngày mặc định
        
        // Luôn đặt ngày bắt đầu ít nhất là ngày mai (gộp thêm 1 ngày)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Nếu người dùng đã chọn ngày giao hàng và ngày đó là trong tương lai
        if (deliveryDate && deliveryDate >= tomorrow) {
          requestData.startDate = format(deliveryDate, 'yyyy-MM-dd');
          
          // Ngày kết thúc là 1 ngày sau ngày giao
          const endDate = new Date(deliveryDate);
          endDate.setDate(endDate.getDate() + 1);
          requestData.endDate = format(endDate, 'yyyy-MM-dd');
        } else {
          // Ngày mai
          requestData.startDate = format(tomorrow, 'yyyy-MM-dd');
          
          // Ngày mốt
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
          requestData.endDate = format(dayAfterTomorrow, 'yyyy-MM-dd');
        }
      }
      
      console.log('Adding to cart with params:', requestData);
      
      // Wait for a short time to ensure auth cookie is set properly
      // This can help resolve timing issues with cookie setting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await addToCart(requestData);
      
      console.log('Add to cart successful, result:', result);
      toast.success('Item added to cart successfully');
      navigate('/cart');
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      console.error('Error details:', error.message);
      
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 401) {
          toast.error('Your session has expired. Please sign in again.');
          navigate('/signin');
          return;
        }
      }
      
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Calculate average rating
  const avgRating = dress?.ratings?.length 
    ? dress.ratings.reduce((sum, rating) => sum + rating.rate, 0) / dress.ratings.length 
    : 0;

  // Format rental price as number
  const rentalPrice = dress?.dailyRentalPrice ? dress.dailyRentalPrice : 0;
  
  // Format purchase price (assume purchase price is about 10x rental price if not available)
  const purchasePrice = dress?.purchasePrice ? dress.purchasePrice : rentalPrice * 10;

  // Check if all required fields are filled
  const isBookingEnabled = 
    selectedSize && 
    selectedColor && 
    (purchaseOption === 'buy' || (purchaseOption === 'rent' && startDate && endDate)) && 
    quantity > 0 && 
    availableStock !== null && 
    availableStock > 0;

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

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-[#333333]">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-[#868686]">{dress?.reviews?.length || 0} reviews</span>
              <span className="text-sm text-[#868686]">24 Rented</span>
            </div>

            {/* Purchase Options */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium text-[#333333]">Lựa chọn:</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className={`py-2 px-4 rounded-md border ${
                    purchaseOption === 'buy' 
                      ? 'bg-[#ead9c9] border-[#c3937c] text-[#333333]' 
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                  onClick={() => setPurchaseOption('buy')}
                >
                  Mua sản phẩm
                </button>
                <button 
                  className={`py-2 px-4 rounded-md border ${
                    purchaseOption === 'rent' 
                      ? 'bg-[#ead9c9] border-[#c3937c] text-[#333333]' 
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                  onClick={() => setPurchaseOption('rent')}
                >
                  Thuê sản phẩm
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-xl font-medium text-[#333333]">
              {purchaseOption === 'buy' 
                ? `$${purchasePrice}` 
                : `$${rentalPrice}/ per day`}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#333333]">Color</h3>
              <ColorSelector 
                colors={dress?.variants.map(v => v.color) || []}
                onColorSelect={handleColorSelect}
              />
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-[#333333]">Size</h3>
                <a href="#" className="text-xs text-[#c3937c] flex items-center">
                  Size &amp; Fit Guide <ChevronRight className="w-3 h-3 ml-1" />
                </a>
              </div>
              <SizeSelector 
                sizes={dress?.variants.map(v => v.size) || []}
                onSizeSelect={handleSizeSelect}
              />
              
              {/* Display available stock */}
              {availableStock !== null && (
                <p className="text-sm text-gray-600">
                  {availableStock > 0 
                    ? `${availableStock} in stock` 
                    : "Out of stock"}
                </p>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#333333]">Quantity</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button 
                  className="px-3 py-2 text-gray-600" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || availableStock === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">{quantity}</div>
                <button 
                  className="px-3 py-2 text-gray-600"
                  onClick={increaseQuantity}
                  disabled={availableStock === 0 || (availableStock !== null && quantity >= availableStock)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Date Selection - Only show if rental option is selected */}
            {purchaseOption === 'rent' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#333333]">Rental Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DatePicker
                      label="Start Date"
                      selectedDate={startDate}
                      onDateChange={handleStartDateChange}
                      showPicker={showStartDatePicker}
                      onPickerChange={setShowStartDatePicker}
                      disabled={availableStock === 0}
                      minDate={new Date()}
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="End Date"
                      selectedDate={endDate}
                      onDateChange={handleEndDateChange}
                      showPicker={showEndDatePicker}
                      onPickerChange={setShowEndDatePicker}
                      disabled={availableStock === 0 || !startDate}
                      minDate={startDate || new Date()}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Delivery Date Selection - Only show if buy option is selected */}
            {purchaseOption === 'buy' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#333333]">Ngày giao hàng</h3>
                <div>
                  <DatePicker
                    label="Chọn ngày giao hàng"
                    selectedDate={deliveryDate}
                    onDateChange={handleDeliveryDateChange}
                    showPicker={showDeliveryDatePicker}
                    onPickerChange={setShowDeliveryDatePicker}
                    disabled={availableStock === 0}
                    minDate={(() => {
                      // Tạo ngày mai
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow;
                    })()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ngày giao hàng phải ít nhất là ngày mai
                  </p>
                </div>
              </div>
            )}
            
            {purchaseOption === 'rent' && (
              <div className="text-xs text-[#868686] italic">
                *Tip to select Start Date, preferably 1 month before you plan to wear it
              </div>
            )}

            {/* Book Button */}
            <button 
              className={`w-full py-3 rounded-md flex items-center justify-center ${
                isBookingEnabled && !isAddingToCart
                  ? 'bg-[#ead9c9] text-[#333333] hover:bg-[#e0cbb9]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isBookingEnabled || isAddingToCart}
              onClick={handleRequestToBook}
            >
              {isAddingToCart 
                ? 'Adding to cart...' 
                : (availableStock === 0 
                  ? 'Out of Stock' 
                  : purchaseOption === 'buy' 
                    ? 'Add to Cart' 
                    : 'Request to Book'
                  )
              }
              {!isAddingToCart && availableStock > 0 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>

            {/* Accordion Sections */}
            <div className="space-y-4 mt-8">
              <AccordionSection 
                title="Product Details" 
                defaultOpen={true}
                icon={<i className="fas fa-plus text-xs"></i>}
                iconOpen={<i className="fas fa-minus text-xs"></i>}
              >
                {dress?.description?.productDetail || "No product details available"}
              </AccordionSection>
              <AccordionSection 
                title="Size & Fit Information" 
                icon={<i className="fas fa-plus text-xs"></i>}
                iconOpen={<i className="fas fa-minus text-xs"></i>}
              >
                {dress?.description?.sizeAndFit || "No size and fit information available"}
              </AccordionSection>
              <AccordionSection 
                title="Description" 
                icon={<i className="fas fa-plus text-xs"></i>}
                iconOpen={<i className="fas fa-minus text-xs"></i>}
              >
                {dress?.description?.description || "No description available"}
              </AccordionSection>
            </div>

            {/* Reviews */}
            {dress?.reviews && dress.reviews.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-medium">Reviews</h3>
                <div className="space-y-4">
                  {dress.reviews.slice(0, 3).map((review, index) => (
                    <ReviewItem key={index} review={review} />
                  ))}
                  {dress.reviews.length > 3 && (
                    <button className="text-sm text-[#c3937c] hover:underline">
                      View all {dress.reviews.length} reviews
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="flex items-center space-x-4 mt-8">
              <span className="text-sm text-[#333333]">Share:</span>
              <button className="text-[#333333] hover:text-[#c3937c]">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="text-[#333333] hover:text-[#c3937c]">
                <Send className="w-5 h-5" />
              </button>
              <button className="text-[#333333] hover:text-[#c3937c]">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-8">Đánh giá & Bình luận</h2>
          
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

        {/* Similar Products */}
        {similarDresses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-medium text-center mb-8">You might also like</h2>
            <ProductCarousel products={similarDresses} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
