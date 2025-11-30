import axios from 'axios';
import { Order, Address, PaymentMethod } from '../types';

const API_URL = 'http://localhost:3000';

// Create a custom axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const PaymentApi = {
  // Create a new order from cart items
  createOrder: async (): Promise<Order> => {
    try {
      // Import the createOrder function from the main API
      const { createOrder } = await import('../../../api/order');
      
      // Use the main API's createOrder function which now handles localStorage fallback
      return await createOrder();
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        throw new Error(
          error.response.data?.message || 'Failed to create order. Please try again later.'
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error creating order: ' + error.message);
      }
    }
  },

  // Get order details by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },
  
  // Get all orders for the current user
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data.data;
  },
  
  // Cancel an order
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.put(`/orders/cancel/${orderId}`);
    return response.data.data;
  },
  
  // Update shipping address for an order
  updateShippingAddress: async (orderId: string, address: Address): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/shipping`, { address });
    return response.data.data;
  },
  
  // Process payment for an order
  processPayment: async (orderId: string, paymentMethod: PaymentMethod): Promise<Order> => {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, { paymentMethod });
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        throw new Error(
          error.response.data?.message || 'Server error during payment processing. Please try again later.'
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error processing payment: ' + error.message);
      }
    }
  }
};

export default PaymentApi; 