import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { EmptyCart } from './empty-cart';
import { getCart, removeFromCart, updateCartItemDates } from '../../../api/cart';
import { createOrder } from '../../../api/order';
import DatePicker from '../../PDP/pdp/date-picker';
import { 
  getPhotographyCart, 
  removePhotographyFromCart, 
  updatePhotographyBookingDate, 
  type PhotographyCartItem 
} from '../../../api/photographyCart';

// Define the CartItem type based on the API response
interface CartItem {
  _id: string;
  dress: {
    _id: string;
    name: string;
    dailyRentalPrice?: number;  // Make this optional
    purchasePrice?: number;     // Add purchase price for buying items
    images?: string[];
  } | string;  // The dress could also be just an ID string
  dressId?: string;  // In case it's stored directly
  name?: string;     // In case name is stored directly
  image?: string;    // In case image is stored directly
  size: {
    _id: string;
    name: string;
  } | string;
  sizeId?: string;
  sizeName?: string;
  color: {
    _id: string;
  name: string;
  } | string;
  colorId?: string;
  colorName?: string;
  quantity: number;
  pricePerDay?: number;      // Add this field from the backend
  purchasePrice?: number;    // Add purchase price field
  purchaseType?: 'buy' | 'rent'; // Distinguish between buying and renting
  startDate: string;
  endDate: string;
}

export const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [photographyItems, setPhotographyItems] = useState<PhotographyCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  // States for date picker
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingPhotoItem, setEditingPhotoItem] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [showPhotoDatePicker, setShowPhotoDatePicker] = useState<boolean>(false);
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newPhotoDate, setNewPhotoDate] = useState<Date | null>(null);

  // Helper function to get dress name
  const getDressName = (item: CartItem): string => {
    if (typeof item.dress === 'object' && item.dress?.name) {
      return item.dress.name;
    }
    return item.name || 'Dress';
  };
  
  // Helper function to get dress image
  const getDressImage = (item: CartItem): string => {
    if (typeof item.dress === 'object' && item.dress?.images && item.dress.images.length > 0) {
      return item.dress.images[0];
    }
    return item.image || '/placeholder.svg';
  };
  
  // Helper function to get size name
  const getSizeName = (item: CartItem): string => {
    if (typeof item.size === 'object' && item.size?.name) {
      return item.size.name;
    }
    return item.sizeName || 'One Size';
  };
  
  // Helper function to get color name
  const getColorName = (item: CartItem): string => {
    if (typeof item.color === 'object' && item.color?.name) {
      return item.color.name;
    }
    return item.colorName || 'Standard';
  };
  
  // Helper function to get price per day
  const getPricePerDay = (item: CartItem): number => {
    if (typeof item.dress === 'object' && item.dress?.dailyRentalPrice) {
      return item.dress.dailyRentalPrice;
    }
    return item.pricePerDay || 0;
  };
  
  // Helper function to get purchase price
  const getPurchasePrice = (item: CartItem): number => {
    // Kiểm tra nếu item có trực tiếp purchasePrice
    if (item.purchasePrice) {
      return item.purchasePrice;
    }
    // Kiểm tra nếu dress là object và có purchasePrice
    if (typeof item.dress === 'object' && item.dress?.purchasePrice) {
      return item.dress.purchasePrice;
    }
    // Fallback to rental price * 10 if purchase price is not available
    return getPricePerDay(item) * 10;
  };

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        console.log('Fetching cart data...');
        
        // Always try to get cart data from API first
        try {
        const cartData = await getCart();
        console.log('hahahaahahahahahahahahaha', cartData);
          console.log('Cart data received from API:', cartData);
        
          // Use API data regardless if it's empty or not
          setCartItems(cartData?.items || []);
          
        } catch (apiError) {
          console.error('Failed to fetch cart from API:', apiError);
          // Only use localStorage as fallback if API call fails
          const orderStr = localStorage.getItem('currentOrder');
          if (orderStr) {
            try {
              const orderData = JSON.parse(orderStr);
              console.log('Order data from localStorage (fallback):', orderData);
              
              if (orderData && orderData.items && orderData.items.length > 0) {
                console.log('Found dress items in localStorage (fallback):', orderData.items);
                setCartItems(orderData.items);
              } else {
                setCartItems([]);
              }
            } catch (e) {
              console.error('Error parsing order data from localStorage:', e);
          setCartItems([]);
            }
        } else {
            setCartItems([]);
          }
        }
        
        // Get photography services from localStorage
        const photoItems = getPhotographyCart();
        console.log('Photography items from localStorage:', photoItems);
        setPhotographyItems(photoItems);
        
      } catch (err: any) {
        console.error('Failed to fetch cart:', err);
        console.error('Error details:', err.message);
        if (err.response) {
          console.error('Error response:', err.response);
        }
        setError('Failed to load cart data. Please try again.');
        
        // Even if everything fails, still try to get photography items
        const photoItems = getPhotographyCart();
        setPhotographyItems(photoItems);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  // Handle removing item from cart
  const handleRemoveItem = async (index: number) => {
    try {
      // Remove from API
      await removeFromCart(index);
      setCartItems(cartItems.filter((_, idx) => idx !== index));

      // Also remove from localStorage
      const orderStr = localStorage.getItem('currentOrder');
      if (orderStr) {
        try {
          const orderData = JSON.parse(orderStr);
          if (orderData && orderData.items) {
            // Remove the item at the specified index
            orderData.items = orderData.items.filter((_, idx) => idx !== index);
            // Update localStorage
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
          }
        } catch (e) {
          console.error('Error updating localStorage after remove:', e);
        }
      }

      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Failed to remove item:', err);
      toast.error('Failed to remove item from cart');
    }
  };

  // Handle removing photography service from cart
  const handleRemovePhotoItem = (serviceId: string) => {
    try {
      const updatedItems = removePhotographyFromCart(serviceId);
      setPhotographyItems(updatedItems);
      toast.success('Service removed from cart');
    } catch (err) {
      console.error('Error removing photography item:', err);
      toast.error('Failed to remove service');
    }
  };

  // Handle updating item dates
  const handleUpdateDates = async (index: number) => {
    if (!newStartDate || !newEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const formattedStartDate = format(newStartDate, 'yyyy-MM-dd');
      const formattedEndDate = format(newEndDate, 'yyyy-MM-dd');
      
      await updateCartItemDates(index, {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
      
      // Update local state
      const updatedItems = [...cartItems];
      updatedItems[index] = {
        ...updatedItems[index],
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      setCartItems(updatedItems);
      setEditingItem(null);
      setNewStartDate(null);
      setNewEndDate(null);
      toast.success('Dates updated successfully');
    } catch (err) {
      console.error('Failed to update dates:', err);
      toast.error('Failed to update rental dates');
    }
  };

  // Handle updating photography date
  const handleUpdatePhotoDate = (serviceId: string) => {
    try {
      if (!newPhotoDate) {
        toast.error('Please select a new date');
        return;
      }

      const formattedDate = format(newPhotoDate, 'yyyy-MM-dd');
      const updatedItems = updatePhotographyBookingDate(serviceId, formattedDate);
      setPhotographyItems(updatedItems);
      setEditingPhotoItem(null);
      setNewPhotoDate(null);
      setShowPhotoDatePicker(false);
      toast.success('Booking date updated');
    } catch (err) {
      console.error('Error updating photography date:', err);
      toast.error('Failed to update booking date');
    }
  };

  // Handle proceeding to payment
  const handleContinueToPayment = async () => {
    try {
      setIsProcessingOrder(true);
      
      // Only proceed if we have items
      if (cartItems.length === 0 && photographyItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
      
      // Chuyển đổi dữ liệu giỏ hàng sang định dạng phù hợp cho trang Review
      const convertedCartItems = cartItems.map(item => {
        // Chuyển đổi từ định dạng CartItem sang OrderItem
        return {
          dressId: typeof item.dress === 'object' ? item.dress._id : item.dressId || item.dress,
          name: typeof item.dress === 'object' ? item.dress.name : item.name,
          image: typeof item.dress === 'object' && item.dress.images ? item.dress.images[0] : item.image,
          size: typeof item.size === 'object' ? item.size.name : item.sizeName,
          color: typeof item.color === 'object' ? item.color.name : item.colorName,
          quantity: item.quantity,
          pricePerDay: typeof item.dress === 'object' ? item.dress.dailyRentalPrice : item.pricePerDay,
          purchasePrice: item.purchasePrice || (typeof item.dress === 'object' ? item.dress.purchasePrice : undefined),
          startDate: item.startDate,
          endDate: item.endDate,
          purchaseType: item.purchaseType || 'rent'
        };
      });
      
      // Lưu dữ liệu đã chuyển đổi vào localStorage
      const orderData = {
        items: convertedCartItems,
        photographyItems: photographyItems
      };
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      
      // IMPORTANT: Don't call createOrder() here anymore, as it clears the cart
      // We'll only create the order when the payment is confirmed
      // This allows users to return to the cart without losing items
      
      // For photography items, don't remove them yet but mark them as being processed
      if (photographyItems.length > 0) {
        // Mark that we've processed these items, but keep them in storage
        localStorage.setItem('photography_items_in_process', 'true');
      }
      
      // Show success and navigate
      toast.success('Continuing to checkout!');
      navigate('/payment-review');
    } catch (error: any) {
      console.error('Failed to process cart:', error);
      toast.error(error.message || 'Failed to continue to payment. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Handle date picker changes
  const handleStartDateChange = (date: Date) => {
    setNewStartDate(date);
    setShowStartDatePicker(false);
  };
  
  const handleEndDateChange = (date: Date) => {
    setNewEndDate(date);
    setShowEndDatePicker(false);
  };

  const handlePhotoDateChange = (date: Date) => {
    setNewPhotoDate(date);
  };

  // Calculate rental days for an item
  const getRentalDays = (item: CartItem): number => {
    try {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      return differenceInDays(end, start) + 1; // Include both start and end dates
    } catch (err) {
      console.error('Error calculating rental days:', err);
      return 1; // Default to 1 day if calculation fails
    }
  };

  // Calculate total for a single item
  const calculateItemTotal = (item: CartItem): number => {
    try {
      if (item.purchaseType === 'buy') {
        // Use the helper function to get purchase price
        return getPurchasePrice(item) * item.quantity;
      } else {
        // Nếu thuê sản phẩm, tính theo số ngày thuê
        const rentalDays = getRentalDays(item);
        const pricePerDay = getPricePerDay(item);
        return pricePerDay * rentalDays * item.quantity;
      }
    } catch (err) {
      console.error('Error calculating item total:', err, item);
      return 0;
    }
  };

  // Calculate cart total
  const total = [...(cartItems || []).map(item => calculateItemTotal(item)), 
                ...(photographyItems || []).map(item => item.price)]
    .reduce((sum, price) => sum + price, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-lg text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <button 
          className="bg-[#c3937c] text-white py-2 px-4 rounded-full"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems?.length && !photographyItems?.length) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mt-10 space-y-8">
        {cartItems && cartItems.map((item, index) => (
          <div
            key={item._id}
            className="bg-white rounded-lg overflow-hidden shadow-sm"
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/4 bg-[#f8f3ee] p-4 flex items-center justify-center">
                <img
                  src={getDressImage(item)}
                  alt={getDressName(item)}
                  className="h-full max-h-[200px] object-cover"
                />
              </div>

              <div className="w-full md:w-3/4 p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-2xl font-serif">{getDressName(item)}</h3>
                    <div className="mt-4 space-y-1 text-[#404040]">
                      <p>Size: {getSizeName(item)}</p>
                      <p>Color: {getColorName(item)}</p>
                      {item.purchaseType === 'buy' ? (
                        <>
                          <p>Loại giao dịch: <span className="font-medium text-[#c3937c]">Mua sản phẩm</span></p>
                          <p>Giá: ${getPurchasePrice(item)} (giá mua)</p>
                          <p>Tổng: ${calculateItemTotal(item)}</p>
                        </>
                      ) : (
                        <>
                          <p>Loại giao dịch: <span className="font-medium text-[#c3937c]">Thuê sản phẩm</span></p>
                          <p>Giá thuê: ${getPricePerDay(item)} mỗi ngày</p>
                          <p>
                            Phí thuê cho {getRentalDays(item)} ngày: $
                            {calculateItemTotal(item)}
                          </p>
                        </>
                      )}
                      <p>Số lượng: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <button
                      className="text-[#c3937c] hover:text-[#a67563] font-medium"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  {item.purchaseType === 'buy' ? (
                    <div className="flex items-center gap-2 bg-[#f8f3ee] rounded-full px-4 py-2">
                      <span className="text-[#c3937c]">
                        Ngày giao hàng:
                      </span>
                      <span>
                        {new Date(item.startDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="mx-1">|</span>
                      <span>
                        Thời gian: 8 - 10 giờ sáng
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-[#f8f3ee] rounded-full px-4 py-2">
                        <span className="text-[#c3937c]">
                          Ngày nhận:
                        </span>
                        <span>
                          {new Date(item.startDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="mx-1">|</span>
                        <span>
                          Thời gian: 8 - 10 giờ sáng
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-[#f8f3ee] rounded-full px-4 py-2">
                        <span className="text-[#c3937c]">
                          Ngày trả:
                        </span>
                        <span>
                          {new Date(item.endDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="mx-1">|</span>
                        <span>
                          Thời gian: 8 - 10 giờ sáng
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {editingItem === item._id ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <DatePicker
                          label={item.purchaseType === 'buy' ? "Ngày giao hàng" : "Ngày nhận"}
                          selectedDate={newStartDate || new Date(item.startDate)}
                          onDateChange={handleStartDateChange}
                          showPicker={showStartDatePicker}
                          onPickerChange={setShowStartDatePicker}
                          minDate={new Date()}
                        />
                      </div>
                      {item.purchaseType !== 'buy' && (
                        <div>
                          <DatePicker
                            label="Ngày trả"
                            selectedDate={newEndDate || new Date(item.endDate)}
                            onDateChange={handleEndDateChange}
                            showPicker={showEndDatePicker}
                            onPickerChange={setShowEndDatePicker}
                            minDate={newStartDate || new Date(item.startDate)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-600"
                        onClick={() => {
                          setEditingItem(null);
                          setNewStartDate(null);
                          setNewEndDate(null);
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className="px-4 py-2 bg-[#c3937c] text-white rounded-md"
                        onClick={() => handleUpdateDates(index)}
                      >
                        {item.purchaseType === 'buy' ? 'Cập nhật ngày giao' : 'Cập nhật ngày thuê'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      className="text-[#c3937c] font-medium underline"
                      onClick={() => {
                        setEditingItem(item._id);
                        setNewStartDate(new Date(item.startDate));
                        setNewEndDate(new Date(item.endDate));
                      }}
                    >
                      {item.purchaseType === 'buy' ? 'Thay đổi ngày giao' : 'Thay đổi ngày thuê'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {photographyItems && photographyItems.map((item) => (
          <div key={item.serviceId} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Service Image */}
              <div className="w-full md:w-1/4 bg-[#f8f3ee] p-4 flex items-center justify-center">
                <img 
                  src={item.imageUrl || '/assets/placeholder-image.jpg'} 
                  alt={item.serviceName} 
                  className="h-full max-h-[200px] object-cover"
                />
              </div>
              
              {/* Service Details */}
              <div className="w-full md:w-3/4 p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-2xl font-serif">{item.serviceName}</h3>
                    <div className="mt-4 space-y-1 text-[#404040]">
                      <p>Type: {item.serviceType}</p>
                      <p>Location: {item.location || 'Studio'}</p>
                      <p>Price: ${item.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <button
                      className="text-[#c3937c] hover:text-[#a67563] font-medium"
                      onClick={() => handleRemovePhotoItem(item.serviceId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2 bg-[#f8f3ee] rounded-full px-4 py-2 inline-flex">
                    <span className="text-[#c3937c]">
                      Booking Date:
                    </span>
                    <span>
                      {format(new Date(item.bookingDate), 'dd/MM/yyyy')}
                    </span>
                    <span className="mx-1">|</span>
                    <span>
                      Thời gian: 8 - 10 giờ sáng
                    </span>
                  </div>
                </div>
                
                {/* Date editing */}
                {editingPhotoItem === item.serviceId ? (
                  <div className="mt-4 space-y-4">
                    <div className="relative">
                      <DatePicker
                        label="Booking Date"
                        selectedDate={newPhotoDate || new Date(item.bookingDate)}
                        onDateChange={handlePhotoDateChange}
                        showPicker={showPhotoDatePicker}
                        onPickerChange={setShowPhotoDatePicker}
                        minDate={new Date()}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-600"
                        onClick={() => {
                          setEditingPhotoItem(null);
                          setNewPhotoDate(null);
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className="px-4 py-2 bg-[#c3937c] text-white rounded-md"
                        onClick={() => handleUpdatePhotoDate(item.serviceId)}
                      >
                        Cập nhật ngày
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      className="text-[#c3937c] font-medium underline"
                      onClick={() => {
                        setEditingPhotoItem(item.serviceId);
                        setNewPhotoDate(new Date(item.bookingDate));
                      }}
                    >
                      Thay đổi ngày đặt lịch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-serif mb-4">Summary of orders</h2>
        <div className="space-y-3">
          {/* Dress Rentals summary */}
          {cartItems && cartItems.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>
                {getDressName(item)}
                {item.quantity > 1 && ` (x${item.quantity})`}
                {item.purchaseType === 'rent' && ` (${getRentalDays(item)} ngày)`}
                {item.purchaseType === 'buy' && ` (Mua)`}
              </span>
              <span>${calculateItemTotal(item)}</span>
            </div>
          ))}
          
          {/* Photography Services summary */}
          {photographyItems && photographyItems.map((item) => (
            <div key={item.serviceId} className="flex justify-between">
              <span>{item.serviceName} (Photography)</span>
              <span>${item.price}</span>
            </div>
          ))}
          
          <hr className="my-2 border-t border-gray-200" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className="bg-[#c3937c] hover:bg-[#a67563] text-white rounded-full px-8 py-6 h-auto font-medium"
          onClick={handleContinueToPayment}
          disabled={isProcessingOrder || cartItems.length === 0 && photographyItems.length === 0}
        >
          {isProcessingOrder ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center bg-[#f8f3ee] rounded-full px-4 py-2">
          <span className="text-[#c3937c] font-medium">
            Time left to complete reservation:
          </span>
          <span className="ml-2 font-bold">12:32</span>
        </div>
      </div>
    </div>
  );
};
