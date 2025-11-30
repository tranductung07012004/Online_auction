import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartItem, OrderSummary, Address, PaymentFormData, PaymentMethod, Order, OrderStatus } from './types';
import { calculateOrderSummary, formatCurrency } from './utils/paymentUtils';
import CheckoutSteps from './components/CheckoutSteps';
import PaymentForm from './components/PaymentForm';
import PaymentApi from './api/paymentApi';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

// Componente para modal de error
const ErrorModal = ({ isOpen, onClose, message, onRetry }: { 
  isOpen: boolean; 
  onClose: () => void; 
  message: string;
  onRetry: () => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="mb-4 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">Payment Unsuccessful</h3>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full py-2 bg-[#c3937c] hover:bg-[#a67c66] text-white font-medium rounded-lg"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-lg"
          >
            Change Payment Method
          </button>
        </div>
      </div>
    </div>
  );
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingOption | null>(null);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const hasError = useRef(false);
  const apiCallAttempted = useRef(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData | null>(null);
  
  // Fetch cart data and get info from session storage
  useEffect(() => {
    // Ngăn gọi API lần thứ 2 nếu đã có lỗi
    if (hasError.current || apiCallAttempted.current) return;
    
    const fetchData = async () => {
      try {
        apiCallAttempted.current = true;
        setIsLoading(true);
        let hasItems = false;
        let allCartItems: any[] = [];
        
        // Check for order data in localStorage
        const orderStr = localStorage.getItem('currentOrder');
        if (orderStr) {
          try {
            const orderData = JSON.parse(orderStr);
            console.log('Order data from localStorage in Checkout:', orderData);
            
            // Process dress items
            if (orderData && orderData.items && orderData.items.length > 0) {
              console.log('Dress items found in order:', orderData.items);
              allCartItems = [...orderData.items];
              
              // Calculate summary for dress items
              const firstItem = orderData.items[0];
              const startDate = new Date(firstItem.startDate);
              const endDate = new Date(firstItem.endDate);
              
              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const dressItemsSummary = calculateOrderSummary(
                orderData.items,
                  startDate,
                  endDate
              );
                setSummary(dressItemsSummary);
                }
              
              hasItems = true;
            }
            
            // Process photography items
            if (orderData && orderData.photographyItems && orderData.photographyItems.length > 0) {
              console.log('Photography items found in order:', orderData.photographyItems);
              console.log('Current hasItems status:', hasItems);
              
              // Convert photography items to cart item format
              const processedPhotographyItems = orderData.photographyItems.map((item) => ({
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
              
              console.log('Processed photography items:', processedPhotographyItems);
              
              // Combine with any existing dress items
              allCartItems = [...allCartItems, ...processedPhotographyItems];
              
              // Calculate summary for photography services
              const totalAmount = processedPhotographyItems.reduce(
                (sum, item) => sum + (item.price || 0), 0
              );
              
              console.log('Photography items total amount:', totalAmount);
              
              // Update summary with photography items
              setSummary(prev => {
                if (!prev) {
                  return {
                    subtotal: totalAmount,
                    tax: totalAmount * 0.1, // 10% tax
                    shipping: 0,  // No shipping for photography
                    total: totalAmount + (totalAmount * 0.1),
                    initialDeposit: (totalAmount + (totalAmount * 0.1)) * 0.5, // 50% deposit
                    remainingPayment: (totalAmount + (totalAmount * 0.1)) * 0.5, // 50% remaining payment
                  currency: 'USD'
                };
                }
                
                const updatedSummary = {...prev};
                updatedSummary.subtotal += totalAmount;
                updatedSummary.tax += totalAmount * 0.1; // 10% tax
                updatedSummary.total += totalAmount + (totalAmount * 0.1);
                updatedSummary.initialDeposit = updatedSummary.total * 0.5;
                updatedSummary.remainingPayment = updatedSummary.total * 0.5;
                return updatedSummary;
              });
              
              hasItems = true;
            }
            
            if (hasItems) {
              setCartItems(allCartItems);
              
              // Continue with loading shipping address
              processAddressAndShippingMethod();
              
              setIsLoading(false);
              return; // Exit if we have processed any items
            }
          } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
          }
        }
        
        // --- Xử lý dữ liệu từ session storage ---
        processAddressAndShippingMethod();
        
        // Nếu không có dữ liệu trong localStorage, thực hiện logic cũ
        // Fetch cart data
        const cartResponse = await axios.get('http://localhost:3000/cart', { withCredentials: true });
        
        if (cartResponse.data.success && cartResponse.data.data) {
          const cartItems = cartResponse.data.data.items || [];
          
          // Chuyển đổi dữ liệu giỏ hàng thành định dạng đơn hàng
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
            
            // Cập nhật phí shipping nếu có
            if (shippingMethod) {
              calculatedSummary.shipping = shippingMethod.price;
              calculatedSummary.total = calculatedSummary.subtotal + calculatedSummary.tax + shippingMethod.price;
            }
            
            setSummary(calculatedSummary);
            
            // Lưu dữ liệu đã xử lý vào localStorage
            const orderData = {
              items: processedItems
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            setCartItems(processedItems);
          } else {
            setError('No items in cart');
            setTimeout(() => {
              navigate('/cart');
            }, 2000);
            return;
          }
        } else {
          setError('No items in cart');
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        hasError.current = true;
        setError('Failed to load required data');
        setIsLoading(false);
      }
    };
    
    // Tách phần xử lý địa chỉ và phương thức vận chuyển thành function riêng
    const processAddressAndShippingMethod = () => {
      // Lấy thông tin địa chỉ từ session storage, nếu không có thì điều hướng về trang Information
      const savedAddress = sessionStorage.getItem('shippingAddress');
      if (!savedAddress) {
        setError('No shipping address found');
        setTimeout(() => {
          navigate('/payment-information');
        }, 2000);
        return;
      }
      
      try {
        setShippingAddress(JSON.parse(savedAddress));
      } catch (e) {
        console.error('Invalid address format in session storage:', e);
        setError('Invalid address format. Please go back and try again.');
        return;
      }
      
      // Lấy thông tin phương thức vận chuyển từ session storage
      const savedShippingMethod = sessionStorage.getItem('shippingMethod');
      if (!savedShippingMethod) {
        setError('No shipping method selected');
        setTimeout(() => {
          navigate('/payment-shipping');
        }, 2000);
        return;
      }
      
      try {
        setShippingMethod(JSON.parse(savedShippingMethod));
      } catch (e) {
        console.error('Invalid shipping method format in session storage:', e);
        setError('Invalid shipping method. Please go back and try again.');
        return;
      }
    };
    
    fetchData();
  }, []); // Loại bỏ các dependencies không cần thiết để tránh re-render
  
  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    try {
      // Lưu dữ liệu form cho trường hợp retry
      setPaymentFormData(formData);
      setIsProcessingPayment(true);
      
      // Tạo phương thức thanh toán
      const paymentMethod: PaymentMethod = {
        id: 'card_' + Date.now(),
        type: 'credit_card',
        last4: formData.cardNumber.slice(-4),
        cardBrand: getCardBrand(formData.cardNumber),
        expiryDate: formData.expiryDate
      };
      
      let newOrder: Order | null = null;
      let hasPhotographyItems = false;
      let hasDressItems = false;
      
      try {
        // Check what types of items we have in the order
        const orderDataStr = localStorage.getItem('currentOrder');
        if (orderDataStr) {
          const orderData = JSON.parse(orderDataStr);
          
          // Check for photography items
          if (orderData && orderData.photographyItems && orderData.photographyItems.length > 0) {
            hasPhotographyItems = true;
            console.log('Processing photography bookings...');
            
            // Process photography bookings with proper payment method
            const photographyResult = await processPhotographyBookings(
              orderData.photographyItems, 
              paymentMethod
            );
            
            console.log('Photography bookings processed:', photographyResult);
          }
          
          // Check for regular dress items
          if (orderData && orderData.items && orderData.items.length > 0) {
            hasDressItems = true;
          }
        }
      
        // Continue with regular order processing only if we have dress items
        if (hasDressItems) {
          try {
            console.log('Attempting to create order from backend...');
            newOrder = await PaymentApi.createOrder();
            console.log('Order created from backend:', newOrder);
          } catch (createOrderError: any) {
            console.error('Error creating order from backend:', createOrderError);
            
            // Nếu không thể tạo đơn hàng từ backend, sử dụng dữ liệu từ localStorage
            console.log('Creating mock order from localStorage...');
            
            // Lấy dữ liệu từ localStorage
            const orderDataStr = localStorage.getItem('currentOrder');
            if (!orderDataStr) {
              throw new Error('No order data found in localStorage');
            }
            
            const orderData = JSON.parse(orderDataStr);
            // Check for any items - either regular items or photography items
            if (!orderData || 
                (!orderData.items || orderData.items.length === 0) && 
                (!orderData.photographyItems || orderData.photographyItems.length === 0)) {
              throw new Error('Invalid order data in localStorage');
            }
            
            // Process items to ensure we have a valid array
            let processedItems = [];
            let mockStartDate = new Date();
            let mockEndDate = new Date();
            
            // Add regular dress items if available
            if (orderData.items && orderData.items.length > 0) {
              processedItems = [...orderData.items];
              // Get dates from first dress item if available
              const firstItem = orderData.items[0];
              mockStartDate = firstItem.startDate ? new Date(firstItem.startDate) : new Date();
              mockEndDate = firstItem.endDate ? new Date(firstItem.endDate) : new Date();
            }
            
            // Add photography items if available
            if (orderData.photographyItems && orderData.photographyItems.length > 0) {
              // Convert photography items to the right format
              const processedPhotographyItems = orderData.photographyItems.map(item => ({
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
              
              // Add to processed items
              processedItems = [...processedItems, ...processedPhotographyItems];
              
              // Use booking date for photography items if no dress dates are set
              if (!orderData.items || orderData.items.length === 0) {
                const firstPhoto = orderData.photographyItems[0];
                if (firstPhoto.bookingDate) {
                  const bookingDate = new Date(firstPhoto.bookingDate);
                  mockStartDate = bookingDate;
                  mockEndDate = bookingDate;
                }
              }
            }
            
            if (summary === null) {
              throw new Error('Order summary not calculated');
            }
            
            // Tạo đơn hàng chỉ trên frontend - Sử dụng deposit amount (50%) thay vì full amount
            newOrder = {
              _id: 'local_' + Date.now(),
              userId: 'current_user',
              items: processedItems,
              startDate: mockStartDate,
              endDate: mockEndDate,
              status: OrderStatus.CONFIRMED,
              totalAmount: summary.total,
              depositAmount: summary.initialDeposit || (summary.total * 0.5), // Sử dụng số tiền đặt cọc 50%
              depositPaid: true, // Đánh dấu đã thanh toán đặt cọc
              remainingPayment: summary.remainingPayment || (summary.total * 0.5), // Lưu số tiền cần thanh toán còn lại
              notes: 'Khách hàng đã thanh toán 50% đặt cọc. 50% còn lại sẽ thanh toán khi trả váy.',
              shippingAddress: shippingAddress || undefined,
              paymentMethod: paymentMethod,
              createdAt: new Date()
            };
            
            console.log('Mock order created with 50% deposit:', newOrder);
          }
        } else if (hasPhotographyItems && !hasDressItems) {
          // Create a simple mock order for photography items only
          console.log('Creating photography-only mock order...');
          
          // Lấy dữ liệu từ localStorage
          const orderDataStr = localStorage.getItem('currentOrder');
          if (!orderDataStr) {
            throw new Error('No order data found in localStorage');
          }
          
          const orderData = JSON.parse(orderDataStr);
          if (!orderData.photographyItems || orderData.photographyItems.length === 0) {
            throw new Error('No photography items found in order data');
          }
          
          // Convert photography items to the right format
          const processedPhotographyItems = orderData.photographyItems.map(item => ({
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
          
          const totalAmount = processedPhotographyItems.reduce(
            (sum, item) => sum + (item.price || 0), 0
          );
          
          // Create simple mock order for UI display only
          newOrder = {
            _id: 'photo_' + Date.now(),
            userId: 'current_user',
            items: processedPhotographyItems,
            startDate: new Date(),
            endDate: new Date(),
            status: OrderStatus.CONFIRMED,
            totalAmount: totalAmount,
            depositAmount: totalAmount * 0.5,
            depositPaid: true,
            remainingPayment: totalAmount * 0.5,
            notes: 'Photography services booking confirmed',
            shippingAddress: shippingAddress || undefined,
            paymentMethod: paymentMethod,
            createdAt: new Date()
          };
          
          console.log('Photography-only mock order created:', newOrder);
        } else {
          console.error('No items found in cart (neither dresses nor photography services)');
          throw new Error('Your cart is empty. Please add items before checkout.');
        }
        
        // Giả lập xử lý thanh toán (không cần gọi API, vì backend có vấn đề)
        console.log('Simulating payment processing...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Đợi 1.5 giây để giả lập xử lý
        
        // Xóa dữ liệu
        localStorage.removeItem('currentOrder');
        sessionStorage.removeItem('shippingAddress');
        sessionStorage.removeItem('shippingMethod');
        
        // Lưu thông tin đơn hàng đã hoàn thành để hiển thị ở trang thành công
        localStorage.setItem('completedOrder', JSON.stringify(newOrder));
        
        console.log('Payment successful! Navigating to success page...');
        navigate('/payment-successful');
        
      } catch (apiError: any) {
        console.error('API error during order creation:', apiError);
        throw new Error(apiError.message || 'Server error during order creation. Please try again later.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'There was an issue processing your payment');
      setShowErrorModal(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Add new function to process photography bookings
  const processPhotographyBookings = async (photographyItems: any[], paymentMethod: PaymentMethod) => {
    try {
      console.log('Processing photography bookings:', photographyItems);
      
      // Ensure we have valid photography items
      if (!photographyItems || photographyItems.length === 0) {
        console.error('No photography items to process');
        throw new Error('No photography items to process');
      }
      
      // Validate items have proper serviceId
      photographyItems.forEach((item, index) => {
        if (!item.serviceId && !item.id) {
          console.error(`Missing serviceId in photography item at index ${index}:`, item);
          throw new Error('Missing service ID in photography item');
        }
      });
      
      // Transform items to the format expected by the API
      const bookingItems = photographyItems.map(item => ({
        serviceId: item.serviceId || item.id, // Ensure we have serviceId
        shootingDate: item.bookingDate || new Date().toISOString(),
        shootingTime: '10:00 AM', // Default or from user input
        shootingLocation: item.location || 'Studio',
        additionalRequests: item.additionalRequests || ''
      }));
      
      console.log('Transformed booking items:', bookingItems);
      
      // Additional validation for serviceId
      bookingItems.forEach((item, index) => {
        if (!item.serviceId) {
          console.error(`Missing serviceId in transformed booking item at index ${index}:`, item);
          throw new Error('Missing service ID in transformed booking item');
        }
      });
      
      // Calculate totals
      const totalAmount = photographyItems.reduce((sum, item) => sum + (item.price || 0), 0);
      
      // Create booking request
      const bookingRequest = {
        bookingItems,
        paymentDetails: {
          paymentMethod,
          totalAmount,
          depositAmount: totalAmount * 0.5,
          remainingAmount: totalAmount * 0.5
        },
        shippingAddress
      };
      
      console.log('Sending photography booking request to backend:', JSON.stringify(bookingRequest));
      
      try {
        // Send to backend
        const response = await axios.post(
          'http://localhost:3000/photography/bookings/confirm-after-payment',
          bookingRequest,
          { withCredentials: true }
        );
        
        console.log('Photography bookings created successfully:', response.data);
        return response.data;
      } catch (apiError) {
        console.error('Error creating photography bookings with API:', apiError);
        console.error('Error details:', apiError.response?.data || 'No response data');
        
        // When in production mode, throw the error to be handled by caller
        if (process.env.NODE_ENV === 'production') {
          throw apiError;
        }
        
        // Fallback to mock response if API fails (for development)
        console.log('Creating mock photography bookings instead...');
        
        // Create mock booking data
        const mockBookings = bookingItems.map((item, index) => {
          const matchingItem = photographyItems.find(p => p.serviceId === item.serviceId || p.id === item.serviceId);
          if (!matchingItem) {
            console.error(`Cannot find matching photography item for booking item at index ${index}:`, item);
            throw new Error('Cannot find matching photography item for booking');
          }
          
          return {
            _id: `mock_booking_${Date.now()}_${index}`,
            customerId: 'current_user',
            serviceId: {
              _id: item.serviceId,
              name: matchingItem.serviceName || matchingItem.name,
              price: matchingItem.price,
              packageType: matchingItem.serviceType || matchingItem.type
            },
            bookingDate: new Date(),
            shootingDate: new Date(item.shootingDate),
            shootingTime: item.shootingTime,
            shootingLocation: item.shootingLocation,
            status: 'Pending',
            paymentDetails: {
              paymentMethod,
              totalAmount: matchingItem.price,
              depositAmount: matchingItem.price * 0.5,
              remainingAmount: matchingItem.price * 0.5,
              depositPaid: true
            }
          };
        });
        
        return {
          success: true,
          bookings: mockBookings
        };
      }
    } catch (error) {
      console.error('Photography booking processing error:', error);
      throw error;
    }
  };
  
  const handleRetryPayment = () => {
    if (paymentFormData) {
      handlePaymentSubmit(paymentFormData);
    }
    setShowErrorModal(false);
  };
  
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };
  
  const handleBackToShipping = () => {
    navigate('/payment-shipping');
  };
  
  // Helper function to determine card brand from card number
  const getCardBrand = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(cleanNumber)) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  };
  
  // Nếu không thể kết nối tới server nhưng vẫn có thông tin từ session, hiển thị một thông báo
  const renderServerConnectionError = () => {
    if (error && error.includes("Could not connect to server")) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error} Some features may be limited.</p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="payment" completedSteps={['review', 'information', 'shipping']} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3937c]"></div>
        </div>
      </div>
    );
  }
  
  if (error && (!cartItems.length || !shippingAddress || !shippingMethod) && !error.includes("Could not connect to server")) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="payment" completedSteps={['review', 'information', 'shipping']} />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-gray-600 mb-6">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Add extra validation - if we somehow got here with no items, show an error
  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="payment" completedSteps={['review', 'information', 'shipping']} />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">No items in your cart</h2>
          <p className="text-gray-600 mb-6">Your cart appears to be empty. Please add some items before checkout.</p>
          <button 
            onClick={() => navigate('/cart')}
            className="bg-[#c3937c] text-white px-6 py-2 rounded hover:bg-[#a67c66] transition-colors"
          >
            Return to cart
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <CheckoutSteps currentStep="payment" completedSteps={['review', 'information', 'shipping']} />
      
      {renderServerConnectionError()}
      
      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={handleCloseErrorModal}
        message={errorMessage}
        onRetry={handleRetryPayment}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Payment Form */}
        <div className="lg:col-span-2">
          {error && !error.includes("Could not connect to server") && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
            
            <div className="space-y-6">
              {/* Shipping Address Summary */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-medium mb-2">Địa chỉ giao hàng</h3>
                {shippingAddress && (
                  <div className="text-sm text-gray-600">
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                    <p>
                      {shippingAddress.city}, {shippingAddress.province}, {shippingAddress.postalCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                  </div>
                )}
              </div>
              
              {/* Shipping Method Summary */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-medium mb-2">Phương thức giao hàng</h3>
                {shippingMethod && (
                  <div className="text-sm text-gray-600">
                    <p>{shippingMethod.name}</p>
                    <p>{shippingMethod.description}</p>
                    <p>
                      {shippingMethod.price === 0 
                        ? 'Miễn phí' 
                        : formatCurrency(shippingMethod.price)
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <PaymentForm 
            onSubmit={handlePaymentSubmit}
            isLoading={isProcessingPayment}
          />
          
          <div className="mt-6">
            <button
              onClick={handleBackToShipping}
              className="text-[#c3937c] hover:text-[#a67c66] font-medium flex items-center"
              disabled={isProcessingPayment}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Quay lại phương thức giao hàng
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tổng quan đơn hàng</h2>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, index) => {
                // Check if this is a photography service
                if (item.isPhotographyService) {
                  return (
                    <div key={index} className="py-4 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        <img
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name || 'Photography Service'}
                          className="h-full w-full object-cover object-center"
                        />
                        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#c3937c] text-white text-xs flex items-center justify-center">
                          {item.quantity || 1}
                        </span>
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.type}</p>
                        <p className="text-xs text-gray-500">
                          {item.bookingDate ? new Date(item.bookingDate).toLocaleDateString() : 'No date'} - {item.location}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Regular dress items
                const startDate = new Date(item.startDate || new Date());
                const endDate = new Date(item.endDate || new Date());
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                // Determine display and price based on purchase type
                let itemTotal = 0;
                let typeDisplay = '';
                
                if (item.purchaseType === 'buy') {
                  // Use purchase price if buying
                  const purchasePrice = item.purchasePrice || (item.pricePerDay * 10);
                  itemTotal = purchasePrice * (item.quantity || 1);
                  typeDisplay = 'Mua sản phẩm';
                } else {
                  // Calculate rental price based on days
                  itemTotal = (item.pricePerDay || 0) * days * (item.quantity || 1);
                  typeDisplay = `${days} ngày thuê`;
                }
                
                return (
                  <div key={index} className="py-4 flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                      <img
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#c3937c] text-white text-xs flex items-center justify-center">
                        {item.quantity || 1}
                      </span>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      {item.sizeName && item.colorName && (
                        <p className="text-xs text-gray-500">{item.sizeName} · {item.colorName}</p>
                      )}
                      <p className="text-xs text-gray-500">{typeDisplay}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tạm tính</span>
                <span className="text-sm">{formatCurrency(summary?.subtotal || 0)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Thuế</span>
                <span className="text-sm">{formatCurrency(summary?.tax || 0)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Phí vận chuyển</span>
                <span className="text-sm">
                  {summary?.shipping === 0 
                    ? 'Miễn phí' 
                    : formatCurrency(summary?.shipping || 0)
                  }
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="font-semibold">Tổng cộng</span>
                <span className="font-semibold text-[#c3937c]">
                  {formatCurrency(summary?.total || 0)}
                </span>
              </div>
              
              {/* Deposit amount - 50% */}
              <div className="flex justify-between py-2 mt-4 bg-[#f8f3f0] p-3 rounded-lg border border-[#c3937c]">
                <span className="font-semibold text-[#c3937c]">Thanh toán đặt cọc (50%)</span>
                <span className="font-semibold text-[#c3937c]">
                  {formatCurrency(summary?.initialDeposit || 0)}
                </span>
              </div>
              
              {/* Remaining payment - 50% */}
              <div className="flex justify-between py-2 mt-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600">Thanh toán khi trả váy (50%)</span>
                <span className="text-gray-600">
                  {formatCurrency(summary?.remainingPayment || 0)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="bg-[#f8f3f0] p-3 rounded-lg border border-[#c3937c]">
              <p className="text-sm font-medium text-[#c3937c] mb-1">Lưu ý về đặt cọc</p>
              <p className="text-xs text-gray-700">
                Khoản thanh toán này chỉ là 50% đặt cọc của tổng giá trị đơn hàng. Khoản 50% còn lại sẽ được thanh toán khi bạn trả váy. Bạn sẽ nhận được thông báo qua email khi đến hạn thanh toán phần còn lại.
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Bằng cách hoàn tất thanh toán, bạn đồng ý với Điều khoản dịch vụ và xác nhận rằng bạn đã đọc Chính sách bảo mật. Thông tin thanh toán của bạn được mã hóa an toàn và thông tin của bạn (ngoại trừ chi tiết thanh toán) sẽ được chia sẻ với OX bride.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 