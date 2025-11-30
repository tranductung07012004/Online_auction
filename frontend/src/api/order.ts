import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Get user orders
export const getUserOrders = async () => {
  try {
    console.log('Making API request to fetch user orders');
    const response = await API.get('/orders/user');
    console.log('Orders API response status:', response.status);
    console.log('Orders API response headers:', response.headers);

    if (!response.data || !response.data.data) {
      console.warn('API returned unexpected data structure:', response.data);
      return [];
    }

    console.log('Orders API data count:', response.data.data.length);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch orders - detailed error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

// Get order by ID
export const getOrderById = async (orderId: string) => {
  try {
    const response = await API.get(`/orders/${orderId}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
};

// Create order
export const createOrder = async (localItems?: any[]) => {
  try {
    console.log('Creating order from cart items...');
    
    // If localItems are provided, use them to create the order
    let requestData = {};
    if (localItems && localItems.length > 0) {
      console.log('Using provided local items for order creation:', localItems);
      requestData = {
        useLocalData: true,
        items: localItems,
        startDate: localItems[0].startDate,
        endDate: localItems[0].endDate
      };
    }
    
    const response = await API.post('/orders/create', requestData);
    console.log('Order creation API response status:', response.status);

    if (!response.data || !response.data.data) {
      console.warn(
        'Order creation API returned unexpected data structure:',
        response.data,
      );
      throw new Error('Unexpected response format');
    }

    console.log('New order created with ID:', response.data.data._id);
    console.log('New order status:', response.data.data.status);
    console.log(
      'New order full data:',
      JSON.stringify(response.data.data, null, 2),
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create order - detailed error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      // If the error is "Cart is empty" and we have items in localStorage, try to create order from localStorage
      if (error.response.data?.message === 'Cart is empty' && !localItems) {
        console.log('Cart is empty, trying to create order from localStorage data');
        const orderDataStr = localStorage.getItem('currentOrder');
        if (orderDataStr) {
          try {
            const orderData = JSON.parse(orderDataStr);
            if (orderData && orderData.items && orderData.items.length > 0) {
              console.log('Found items in localStorage, retrying order creation');
              return createOrder(orderData.items);
            }
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
    }
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Cancel order
export const cancelOrder = async (orderId: string) => {
  try {
    const response = await API.put(`/orders/cancel/${orderId}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel order');
  }
};

// Get all orders (Admin function)
export const getAllOrders = async () => {
  try {
    const response = await API.get('/orders/admin');
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch all orders:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch all orders',
    );
  }
};

// Update order status (Admin function)
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await API.put(`/orders/${orderId}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update order status',
    );
  }
};

// Update payment status (Admin function)
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: string,
) => {
  try {
    const response = await API.put(`/orders/${orderId}/payment-status`, {
      paymentStatus,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to update payment status:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update payment status',
    );
  }
};

// Process dress return with condition assessment and final payment (Admin function)
export const processReturn = async (
  orderId: string,
  returnData: {
    condition: 'perfect' | 'good' | 'damaged';
    damageDescription?: string;
    additionalCharges?: number;
    sendPaymentReminder: boolean;
  },
) => {
  try {
    console.log(
      'Processing return for order ID:',
      orderId,
      'with data:',
      returnData,
    );

    // Gọi API thực từ backend
    const response = await API.post(
      `/orders/${orderId}/process-return`,
      returnData,
    );

    // Kiểm tra phản hồi từ API
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to process return');
    }

    const updatedOrder = response.data.data;
    console.log('Return processed successfully from API:', updatedOrder);
    return updatedOrder;
  } catch (error: any) {
    console.error('Failed to process return:', error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to process return',
    );
  }
};

// Track order by order code
export const trackOrder = async (orderCode: string) => {
  try {
    console.log('Tracking order with code:', orderCode);

    // Gọi API tra cứu đơn hàng
    const response = await API.get(`/orders/track/${orderCode}`);

    // Kiểm tra phản hồi từ API
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to track order');
    }

    console.log('Order tracking info:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to track order:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to track order',
    );
  }
};

// Track order by phone number
export const trackOrderByPhone = async (phone: string) => {
  try {
    console.log('Tracking orders with phone number:', phone);

    // Gọi API tra cứu đơn hàng bằng số điện thoại
    const response = await API.get(`/orders/track-by-phone/${phone}`);

    // Kiểm tra phản hồi từ API
    if (!response.data || !response.data.success) {
      throw new Error(
        response.data?.message || 'Failed to track order by phone',
      );
    }

    console.log('Orders found by phone:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to track order by phone:', error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to track order by phone',
    );
  }
};
