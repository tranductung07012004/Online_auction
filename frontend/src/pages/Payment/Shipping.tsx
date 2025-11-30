import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartItem, OrderSummary, Address } from './types';
import { calculateOrderSummary, formatCurrency } from './utils/paymentUtils';
import CheckoutSteps from './components/CheckoutSteps';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

const Shipping: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrderSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    currency: 'USD'
  });
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('standard');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('shipping');
  
  // Shipping options
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 3-5 business days',
      price: 0, // Free standard shipping
      estimatedDelivery: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 1-2 business days',
      price: 15,
      estimatedDelivery: '1-2 business days'
    }
  ];
  
  // Fetch cart data and get shipping address from session storage
  useEffect(() => {
    console.log('Shipping component mounted');
    
    const fetchData = async () => {
      try {
        console.log('Fetching data in Shipping component...');
        setIsLoading(true);
        
        // Determine delivery method from localStorage
        const savedMethodStr = localStorage.getItem('deliveryMethod');
        if (savedMethodStr) {
          try {
            setDeliveryMethod(JSON.parse(savedMethodStr));
          } catch (e) {
            console.error('Error parsing delivery method from localStorage:', e);
          }
        }
        
        let hasItems = false;
        
        // Check for order data in localStorage
        const orderStr = localStorage.getItem('currentOrder');
        if (orderStr) {
          try {
            const orderData = JSON.parse(orderStr);
            console.log('Order data from localStorage in Shipping:', orderData);
            let allCartItems = [];
            
            // Process dress items
            if (orderData && orderData.items && orderData.items.length > 0) {
              console.log('Dress items found in order:', orderData.items);
              allCartItems = [...orderData.items];
              
              // Get customer information
              const customerInfoStr = localStorage.getItem('customerInfo');
              if (customerInfoStr) {
                try {
                  const customerInfo = JSON.parse(customerInfoStr);
                  setCustomerInfo(customerInfo);
                } catch (e) {
                  console.error('Error parsing customer info from localStorage:', e);
                }
              }
              
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
                const updatedSummary = {...prev};
                updatedSummary.subtotal += totalAmount;
                updatedSummary.tax += totalAmount * 0.1; // 10% tax
                updatedSummary.total += totalAmount + (totalAmount * 0.1);
                return updatedSummary;
              });
              
              hasItems = true;
            }
            
            if (hasItems) {
              setCartItems(allCartItems);
              setIsLoading(false);
              return; // Exit if we have any items
              }
            } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
            }
          }
          
        // If no order data found, fallback to separate photography cart
        const photographyCartStr = localStorage.getItem('photography_cart_items');
        
        if (photographyCartStr) {
          try {
            const photographyCartItems = JSON.parse(photographyCartStr);
            console.log('Photography cart items found in localStorage:', photographyCartItems);
            
            // Convert photography cart items to cart item format
            const processedPhotographyCartItems = photographyCartItems.map((item: any) => ({
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
            
            console.log('Processed photography cart items:', processedPhotographyCartItems);
            
            // Combine with any existing dress items
            allCartItems = [...allCartItems, ...processedPhotographyCartItems];
            
            // Calculate summary for photography services
            const totalAmount = processedPhotographyCartItems.reduce(
              (sum, item) => sum + (item.price || 0), 0
            );
            
            console.log('Photography cart items total amount:', totalAmount);
            
            // Update summary with photography items
            setSummary(prev => {
              const updatedSummary = {...prev};
              updatedSummary.subtotal += totalAmount;
              updatedSummary.tax += totalAmount * 0.1; // 10% tax
              updatedSummary.total += totalAmount + (totalAmount * 0.1);
              return updatedSummary;
            });
            
            hasItems = true;
          } catch (e) {
            console.error('Error parsing photography cart items from localStorage:', e);
          }
        }
        
        // Kiểm tra dữ liệu đơn hàng trong localStorage trước
        const orderDataStr = localStorage.getItem('currentOrder');
        console.log('Retrieved from localStorage - currentOrder:', orderDataStr);
        
        if (orderDataStr) {
          try {
            const orderData = JSON.parse(orderDataStr);
            console.log('Order data from localStorage in Shipping page:', orderData);
            
            let hasItems = false;
            
            // Check for regular dress items
            if (orderData && orderData.items && orderData.items.length > 0) {
              setCartItems(orderData.items);
              hasItems = true;
              
              const firstItem = orderData.items[0];
              let itemStartDate = firstItem.startDate ? new Date(firstItem.startDate) : new Date();
              let itemEndDate = firstItem.endDate ? new Date(firstItem.endDate) : new Date();
              
              // Đảm bảo ngày hợp lệ
              if (isNaN(itemStartDate.getTime())) itemStartDate = new Date();
              if (isNaN(itemEndDate.getTime())) itemEndDate = new Date();
              
              const calculatedSummary = calculateOrderSummary(
                orderData.items,
                itemStartDate,
                itemEndDate
              );
              setSummary(calculatedSummary);
              
              // Cập nhật shipping cost dựa trên lựa chọn hiện tại
              const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
              if (selectedOption) {
                setSummary(prevSummary => ({
                  ...prevSummary,
                  shipping: selectedOption.price,
                  total: prevSummary.subtotal + prevSummary.tax + selectedOption.price
                }));
              }
            }
            
            // Check for photography items
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
              
              // If we already have dress items, merge the arrays; otherwise, set cartItems directly
              if (hasItems) {
                setCartItems(prev => [...prev, ...processedPhotographyItems]);
              } else {
                setCartItems(processedPhotographyItems);
              }
              
              hasItems = true;
              
              // Calculate summary for photography services
              const totalAmount = processedPhotographyItems.reduce(
                (sum, item) => sum + (item.price || 0), 0
              );
              
              console.log('Photography items total amount:', totalAmount);
              
              // Update the summary with photography items
              setSummary(prev => {
                const updatedSummary = {...prev};
                updatedSummary.subtotal += totalAmount;
                updatedSummary.tax += totalAmount * 0.1; // 10% tax
                updatedSummary.total = updatedSummary.subtotal + updatedSummary.tax;
                
                // Apply current shipping option
                const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
                if (selectedOption) {
                  updatedSummary.shipping = selectedOption.price;
                  updatedSummary.total += selectedOption.price;
                }
                
                console.log('Updated summary with photography items:', updatedSummary);
                return updatedSummary;
              });
            }
            
            // If we have any items (dress or photography), exit early
            if (hasItems) {
              console.log('Items found in cart, proceeding with checkout');
              setIsLoading(false);
              return; // Thoát luôn nếu đã có dữ liệu trong localStorage
            } else {
              console.error('No items found in order data');
            }
          } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
          }
        }
        
        // Nếu không có dữ liệu trong localStorage, thực hiện logic cũ
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
            
            setSummary(calculatedSummary);
            
            // Cập nhật shipping cost dựa trên lựa chọn hiện tại
            const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
            if (selectedOption) {
              setSummary(prevSummary => ({
                ...prevSummary,
                shipping: selectedOption.price,
                total: prevSummary.subtotal + prevSummary.tax + selectedOption.price
              }));
            }
            
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
        setError('Failed to load required data');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleShippingOptionChange = (optionId: string) => {
    setSelectedShippingOption(optionId);
    
    // Update summary with selected shipping cost
    const selectedOption = shippingOptions.find(option => option.id === optionId);
    if (selectedOption) {
      setSummary(prevSummary => ({
        ...prevSummary,
        shipping: selectedOption.price,
        total: prevSummary.subtotal + prevSummary.tax + selectedOption.price
      }));
    }
  };
  
  const handleContinueToPayment = () => {
    try {
      setIsSubmitting(true);
      
      // Save selected shipping option to session storage
      const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
      sessionStorage.setItem('shippingMethod', JSON.stringify(selectedOption));
      
      // Update summary in session storage
      sessionStorage.setItem('orderSummary', JSON.stringify(summary));
      
      // Make sure we preserve the full order with both dress items and photography items
      // by re-saving currentOrder to localStorage with correct data before navigation
      try {
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
        console.log('Saved updated order data with photography items before payment:', updatedOrderData);
      } catch (e) {
        console.error('Error updating order data before navigation:', e);
      }
      
      // Navigate to payment page
      navigate('/payment-checkout');
    } catch (error) {
      console.error('Error processing shipping selection:', error);
      setError('Failed to save shipping method');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToInformation = () => {
    navigate('/payment-information');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="shipping" completedSteps={['review', 'information']} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3937c]"></div>
        </div>
      </div>
    );
  }
  
  if (error && (!cartItems.length || !shippingAddress)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="shipping" completedSteps={['review', 'information']} />
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
        <CheckoutSteps currentStep="shipping" completedSteps={['review', 'information']} />
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
      <CheckoutSteps currentStep="shipping" completedSteps={['review', 'information']} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Shipping Options */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping to:</h3>
              {shippingAddress && (
                <div className="text-sm text-gray-600">
                  <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p>{shippingAddress.address}</p>
                  {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.province}, {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                  <button 
                    onClick={handleBackToInformation}
                    className="text-[#c3937c] hover:text-[#a67c66] font-medium text-xs mt-2"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {shippingOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedShippingOption === option.id 
                      ? 'border-[#c3937c] bg-[#faf6f3]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleShippingOptionChange(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id={option.id}
                        name="shipping-option"
                        type="radio"
                        className="h-4 w-4 accent-[#c3937c]"
                        checked={selectedShippingOption === option.id}
                        onChange={() => handleShippingOptionChange(option.id)}
                      />
                      <label htmlFor={option.id} className="ml-3 cursor-pointer flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">{option.name}</span>
                        <span className="block text-sm text-gray-500">{option.description}</span>
                      </label>
                    </div>
                    <span className="text-sm font-medium">
                      {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBackToInformation}
                className="text-[#c3937c] hover:text-[#a67c66] font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Return to information
              </button>
              
              <button
                onClick={handleContinueToPayment}
                disabled={isSubmitting}
                className={`rounded-md bg-[#c3937c] px-4 py-2 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Continue to payment'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, index) => {
                // Check if this is a photography service
                if (item.isPhotographyService) {
                  return (
                    <div key={index} className="py-4 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        <img
                          src={item.image}
                          alt={item.name}
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
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Regular dress items
                const startDate = item.startDate ? new Date(item.startDate) : new Date();
                const endDate = item.endDate ? new Date(item.endDate) : new Date();
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                // Determine display and price based on purchase type
                let itemTotal = 0;
                let typeDisplay = '';
                
                if (item.purchaseType === 'buy') {
                  // Use purchase price if buying
                  const purchasePrice = item.purchasePrice || (item.pricePerDay * 10);
                  itemTotal = purchasePrice * (item.quantity || 1);
                  typeDisplay = 'Purchase';
                } else {
                  // Calculate rental price based on days
                  itemTotal = (item.pricePerDay || 0) * days * (item.quantity || 1);
                  typeDisplay = `${days} days rental`;
                }
                
                return (
                  <div key={index} className="py-4 flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                      <img
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name || 'Product'}
                        className="h-full w-full object-cover object-center"
                      />
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#c3937c] text-white text-xs flex items-center justify-center">
                        {item.quantity || 1}
                      </span>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name || 'Product'}</h3>
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
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm">{formatCurrency(summary.subtotal)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm">{formatCurrency(summary.tax)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm">
                  {summary.shipping === 0 
                    ? 'Free' 
                    : formatCurrency(summary.shipping)
                  }
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-[#c3937c]">
                  {formatCurrency(summary.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;