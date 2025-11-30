import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartItem, OrderSummary } from './types';
import { calculateOrderSummary, formatCurrency, formatDate } from './utils/paymentUtils';
import CheckoutSteps from './components/CheckoutSteps';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrderSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    initialDeposit: 0, // 50% deposit
    remainingPayment: 0, // 50% remaining payment
    currency: 'USD'
  });
  
  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        let hasItems = false;
        
        // First check if we have items in the current order from localStorage
        const orderStr = localStorage.getItem('currentOrder');
        console.log('Order data from localStorage:', orderStr);
        
        if (orderStr) {
          try {
            const orderData = JSON.parse(orderStr);
            console.log('Parsed order data:', orderData);
            let allCartItems = [];
            
            // Process dress items
            if (orderData && orderData.items && orderData.items.length > 0) {
              console.log('Dress items found in order:', orderData.items);
              allCartItems = [...orderData.items];
              hasItems = true;
            }
            
            // Process photography items
            if (orderData && orderData.photographyItems && orderData.photographyItems.length > 0) {
              console.log('Photography items found in order:', orderData.photographyItems);
              
              // Convert photography items to cart item format
              const processedPhotographyItems = orderData.photographyItems.map((item: any) => ({
                id: item.serviceId,
                name: item.serviceName,
                type: item.serviceType,
                image: item.imageUrl,
                price: item.price,
                quantity: 1,
                bookingDate: item.bookingDate,
                location: item.location || 'Default location',
                isPhotographyService: true
              }));
              
              // Combine with any existing dress items
              allCartItems = [...allCartItems, ...processedPhotographyItems];
              hasItems = true;
            }
            
            if (hasItems) {
              setCartItems(allCartItems);
              
              // Calculate overall summary
              let totalSubtotal = 0;
              let totalTax = 0;
              let totalShipping = 0;
              
              // Calculate for dress items
              if (orderData && orderData.items && orderData.items.length > 0) {
                const firstItem = orderData.items[0];
                const startDate = new Date(firstItem.startDate);
                const endDate = new Date(firstItem.endDate);
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                  const dressItemsSummary = calculateOrderSummary(
                    orderData.items,
                    startDate,
                    endDate
                  );
                  totalSubtotal += dressItemsSummary.subtotal;
                  totalTax += dressItemsSummary.tax;
                  totalShipping += dressItemsSummary.shipping;
                }
              }
              
              // Calculate for photography items
              if (orderData && orderData.photographyItems && orderData.photographyItems.length > 0) {
                const photoAmount = orderData.photographyItems.reduce(
                  (sum: number, item: {price?: number}) => sum + (item.price || 0), 0
                );
                totalSubtotal += photoAmount;
                totalTax += photoAmount * 0.1; // 10% tax
              }
              
              const totalAmount = totalSubtotal + totalTax + totalShipping;
              setSummary({
                subtotal: totalSubtotal,
                tax: totalTax,
                shipping: totalShipping,
                total: totalAmount,
                initialDeposit: totalAmount * 0.5, // 50% deposit
                remainingPayment: totalAmount * 0.5, // 50% remaining payment
                currency: 'USD'
              });
              
              setIsLoading(false);
              return; // Exit if we have items in the order
            }
          } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
          }
        }
        
        // If no items in the order, continue with the rest of the logic...
        // Existing code below:

        // If no photography items in the order, check for separate photography cart
        const photographyCartStr = localStorage.getItem('photography_cart_items');
        if (photographyCartStr) {
          try {
            const photographyItems = JSON.parse(photographyCartStr);
            console.log('Photography cart data from localStorage:', photographyItems);
            
            if (photographyItems && photographyItems.length > 0) {
              // Convert photography items to cart item format
              const processedPhotographyItems = photographyItems.map((item: any) => ({
                id: item.serviceId,
                name: item.serviceName,
                type: item.serviceType,
                image: item.imageUrl,
                price: item.price,
                quantity: 1,
                bookingDate: item.bookingDate,
                location: item.location || 'Default location',
                isPhotographyService: true
              }));
              
              setCartItems(processedPhotographyItems);
              
              // Calculate summary for photography services
              const totalAmount = processedPhotographyItems.reduce(
                (sum: number, item: {price?: number}) => sum + (item.price || 0), 0
              );
              
              const totalWithTax = totalAmount + (totalAmount * 0.1);
              setSummary({
                subtotal: totalAmount,
                tax: totalAmount * 0.1, // 10% tax
                shipping: 0,  // No shipping for photography
                total: totalWithTax,
                initialDeposit: totalWithTax * 0.5, // 50% deposit
                remainingPayment: totalWithTax * 0.5, // 50% remaining payment
                currency: 'USD'
              });
              
              return; // Exit if we have photography items
            }
          } catch (e) {
            console.error('Error parsing photography cart data from localStorage:', e);
          }
        }
        
        // Kiểm tra dữ liệu đơn hàng trong localStorage
        const orderDataStr = localStorage.getItem('currentOrder');
        if (orderDataStr) {
          try {
            const orderData = JSON.parse(orderDataStr);
            console.log('Order data from localStorage:', orderData);
            
            if (orderData && orderData.items && orderData.items.length > 0) {
              setCartItems(orderData.items);
              
              const firstItem = orderData.items[0];
              const startDate = new Date(firstItem.startDate);
              const endDate = new Date(firstItem.endDate);
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
              }
              const calculatedSummary = calculateOrderSummary(
                orderData.items,
                startDate,
                endDate
              );
              setSummary(calculatedSummary);
              return; // Thoát luôn nếu đã có dữ liệu trong localStorage
            }
          } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
          }
        }
        
        // Tiếp tục với logic cũ nếu không có dữ liệu trong localStorage
        try {
          // Thử lấy giỏ hàng thay vì đơn hàng
          const cartResponse = await axios.get('http://localhost:3000/cart', { withCredentials: true });
          
          if (cartResponse.data.success && cartResponse.data.data && cartResponse.data.data.items) {
            const cartItems = cartResponse.data.data.items;
            console.log('Cart data received:', cartItems);
            
            if (cartItems.length > 0) {
              setCartItems(cartItems);
              
              // Cố gắng chuyển đổi dữ liệu giỏ hàng thành định dạng đơn hàng
              const processedItems = cartItems.map((item: any) => {
                return {
                  dressId: typeof item.dress === 'object' ? item.dress._id : (item.dressId || item.dress),
                  name: typeof item.dress === 'object' ? item.dress.name : item.name,
                  image: typeof item.dress === 'object' && item.dress.images ? item.dress.images[0] : item.image,
                  size: typeof item.size === 'object' ? item.size.name : item.sizeName,
                  color: typeof item.color === 'object' ? item.color.name : item.colorName,
                  quantity: item.quantity,
                  pricePerDay: typeof item.dress === 'object' && item.dress.dailyRentalPrice ? 
                    item.dress.dailyRentalPrice : (item.pricePerDay || 0),
                  startDate: item.startDate,
                  endDate: item.endDate
                };
              });
              
              if (processedItems.length > 0) {
                const firstItem = processedItems[0];
                // Sử dụng startDate và endDate từ giỏ hàng hoặc giá trị mặc định
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                let itemStartDate = firstItem.startDate ? new Date(firstItem.startDate) : today;
                let itemEndDate = firstItem.endDate ? new Date(firstItem.endDate) : tomorrow;
                
                // Đảm bảo ngày hợp lệ
                if (isNaN(itemStartDate.getTime())) itemStartDate = today;
                if (isNaN(itemEndDate.getTime())) itemEndDate = tomorrow;
                
                const calculatedSummary = calculateOrderSummary(
                  processedItems,
                  itemStartDate,
                  itemEndDate
                );
                
                setSummary(calculatedSummary);
              }
            } else {
              setError('No items found in your cart');
            }
          } else {
            setError('Failed to load cart data');
          }
        } catch (error) {
          console.error('Error fetching cart data:', error);
          setError('An error occurred while loading your order');
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        
        // Nếu không lấy được đơn hàng, thử lấy từ giỏ hàng
        try {
          const cartResponse = await axios.get('http://localhost:3000/cart', { withCredentials: true });
          
          if (cartResponse.data.success && cartResponse.data.data && cartResponse.data.data.items) {
            setCartItems(cartResponse.data.data.items || []);
            
            const cartItems = cartResponse.data.data.items;
            if (cartItems.length > 0) {
              const firstItem = cartItems[0];
              const startDate = new Date(firstItem.startDate);
              const endDate = new Date(firstItem.endDate);
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
              }
              const calculatedSummary = calculateOrderSummary(
                cartItems,
                startDate,
                endDate
              );
              setSummary(calculatedSummary);
            }
          } else {
            setError('No items found in your cart');
          }
        } catch (cartError) {
          console.error('Error fetching cart:', cartError);
          setError('Failed to load order and cart items');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, []);
  
  const handleContinueToInformation = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty. Add items to proceed.');
      return;
    }
    
    // Make sure we preserve the full order with both dress items and photography items
    // by re-saving currentOrder to localStorage with correct data before navigation
    try {
      const orderDataStr = localStorage.getItem('currentOrder');
      if (orderDataStr) {
        const orderData = JSON.parse(orderDataStr);
        
        // Find photography items from cart items
        const photographyItems = cartItems.filter(item => item.isPhotographyService);
        const dressItems = cartItems.filter(item => !item.isPhotographyService);
        
        // Format photography items back to the expected structure
        const processedPhotographyItems = photographyItems.map(item => ({
          serviceId: item.id,
          serviceName: item.name,
          serviceType: item.type || 'Photography',
          price: item.price || 0,
          imageUrl: item.image,
          bookingDate: item.bookingDate,
          location: item.location || 'Default'
        }));
        
        // Update the order data with the current items
        const updatedOrderData = {
          items: dressItems,
          photographyItems: processedPhotographyItems
        };
        
        // Save the updated order data
        localStorage.setItem('currentOrder', JSON.stringify(updatedOrderData));
        console.log('Saved updated order data with photography items:', updatedOrderData);
      }
    } catch (e) {
      console.error('Error updating order data before navigation:', e);
    }
    
    navigate('/payment-information');
  };
  
  const handleBackToCart = () => {
    navigate('/cart');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="review" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3937c]"></div>
        </div>
      </div>
    );
  }
  
  if (error && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="review" />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToCart}
            className="rounded-md bg-[#c3937c] px-4 py-2 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <CheckoutSteps currentStep="review" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Review Your Order</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {cartItems.map((item, index) => {
                // Check if it's a photography service item
                if (item.isPhotographyService) {
                  const bookingDate = item.bookingDate ? new Date(item.bookingDate) : new Date();
                  const formattedDate = isNaN(bookingDate.getTime()) ? 'Invalid date' : formatDate(bookingDate);
                  
                  return (
                    <div key={index} className="flex border-b border-gray-200 pb-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">{formatCurrency(item.price || 0)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.type || 'Photography Service'}
                          </p>
                        </div>
                        
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Photography Service</p>
                            <p className="text-gray-500 mt-1">
                              Location: {item.location || 'Not specified'}
                            </p>
                            <p className="text-gray-500 mt-1">
                              Booking Date: {formattedDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Regular dress rental item
                  const startDate = item.startDate ? new Date(item.startDate) : new Date();
                  const endDate = item.endDate ? new Date(item.endDate) : new Date();
                  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const pricePerDay = item.pricePerDay || 0;
                  const purchasePrice = item.purchasePrice || (pricePerDay * 10);
                  
                  // Xác định tổng tiền dựa trên loại giao dịch
                  let itemTotal = 0;
                  let priceDisplay = '';
                  
                  if (item.purchaseType === 'buy') {
                    // Nếu là mua sản phẩm, sử dụng purchasePrice
                    itemTotal = purchasePrice * item.quantity;
                    priceDisplay = `${formatCurrency(purchasePrice)} (purchase price)`;
                  } else {
                    // Nếu là thuê, tính theo ngày
                    itemTotal = pricePerDay * days * item.quantity;
                    priceDisplay = `${formatCurrency(pricePerDay)} per day × ${days} days`;
                  }
                  
                  return (
                    <div key={index} className="flex border-b border-gray-200 pb-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">{formatCurrency(itemTotal)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.sizeName || '-'} · {item.colorName || '-'}
                          </p>
                        </div>
                        
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Qty {item.quantity}</p>
                            <p className="text-gray-500 mt-1">
                              {item.purchaseType === 'buy' ? 'Purchase' : 'Rental'}: {priceDisplay}
                            </p>
                            <p className="text-gray-500 mt-1">
                              {item.purchaseType === 'buy' 
                                ? `Delivery date: ${startDate ? formatDate(startDate) : '-'}`
                                : `${startDate ? formatDate(startDate) : '-'} - ${endDate ? formatDate(endDate) : '-'}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 border-b border-gray-200 pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(summary.tax)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {summary.shipping === 0 
                    ? 'Free' 
                    : formatCurrency(summary.shipping)
                  }
                </span>
              </div>
            </div>
            
            <div className="flex justify-between py-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-semibold text-[#c3937c]">
                {formatCurrency(summary.total)}
              </span>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleContinueToInformation}
                disabled={cartItems.length === 0}
                className={`w-full rounded-md bg-[#c3937c] px-4 py-3 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
                  cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Continue to Information
              </button>
              
              <button
                onClick={handleBackToCart}
                className="w-full mt-4 rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
              >
                Return to Cart
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              By proceeding, you agree to our Terms of Service and Privacy Policy. Your rental is subject to our Rental Agreement terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review; 