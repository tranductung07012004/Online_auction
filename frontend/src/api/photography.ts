import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:3000/photography';

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Photography service interfaces
export interface PhotographyService {
  _id: string;
  name: string;
  description: string;
  price: number;
  packageType: string;
  details: string[];
  coverImage: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Photography booking interfaces
export interface PhotographyBooking {
  _id: string;
  customerId: any;
  serviceId: any;
  bookingDate: string;
  shootingDate: string;
  shootingTime: string;
  shootingLocation: string;
  additionalRequests?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentDetails?: {
    paymentId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    paymentDate: string;
  };
}

// Get all photography services
export const getAllPhotographyServices = async (): Promise<PhotographyService[]> => {
  try {
    const response = await API.get('/services');
    return response.data;
  } catch (error) {
    console.error('Error fetching photography services:', error);
    throw error;
  }
};

// Get photography service by ID
export const getPhotographyServiceById = async (id: string): Promise<PhotographyService> => {
  try {
    const response = await API.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching photography service ${id}:`, error);
    throw error;
  }
};

// Create photography booking
export const createPhotographyBooking = async (bookingData: any): Promise<PhotographyBooking> => {
  try {
    const response = await API.post('/bookings', bookingData);
    toast.success('Booking created successfully!');
    return response.data;
  } catch (error) {
    console.error('Error creating photography booking:', error);
    toast.error('Failed to create booking. Please try again.');
    throw error;
  }
};

// Create photography booking after payment
export const createPhotographyBookingAfterPayment = async (bookingData: any): Promise<PhotographyBooking> => {
  try {
    const response = await API.post('/bookings/confirm-after-payment', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating photography booking after payment:', error);
    throw error;
  }
};

// Get user's photography bookings
export const getUserPhotographyBookings = async (): Promise<PhotographyBooking[]> => {
  try {
    const response = await API.get('/bookings/my-bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching user photography bookings:', error);
    throw error;
  }
};

// Get booking by ID
export const getPhotographyBookingById = async (id: string): Promise<PhotographyBooking> => {
  try {
    const response = await API.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching photography booking ${id}:`, error);
    throw error;
  }
}; 