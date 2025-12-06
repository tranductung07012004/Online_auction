import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  accountActivity: boolean;
  darkMode: boolean;
  language: string;
}

export interface UserProfile {
  _id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  role: string;
  isVerified: boolean;
  profileImageUrl?: string;
  settings?: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUsernameData {
  newUsername: string;
  password: string;
}

// Generate fake user profile data for development
const generateFakeUserProfile = (): UserProfile => {
  const now = new Date();
  const createdAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const updatedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  
  return {
    _id: 'fake_user_id_123',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    role: 'user',
    isVerified: true,
    profileImageUrl: '/placeholder-user.jpg',
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotions: true,
      accountActivity: true,
      darkMode: false,
      language: 'vi',
    },
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await API.get('/users/profile');
    return response.data.data;
  } catch (error: any) {
    // If it's a network error (backend not running), return fake data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Backend not available, using fake profile data for development');
      return generateFakeUserProfile();
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await API.put('/users/profile', data);
    return response.data.data;
  } catch (error: any) {
    // If it's a network error (backend not running), return fake updated data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Backend not available, simulating profile update');
      const fakeProfile = generateFakeUserProfile();
      return {
        ...fakeProfile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Update password
export const updatePassword = async (data: UpdatePasswordData): Promise<{ message: string }> => {
  try {
    const response = await API.put('/users/password', data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

// Update username
export const updateUsername = async (data: UpdateUsernameData): Promise<UserProfile> => {
  try {
    const response = await API.put('/users/username', data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update username');
  }
};

// Upload profile image
export const uploadProfileImage = async (formData: FormData): Promise<{ imageUrl: string }> => {
  try {
    const response = await API.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    // If it's a network error (backend not running), return fake image URL
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Backend not available, simulating image upload');
      return { imageUrl: '/placeholder-user.jpg' };
    }
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// Update user settings
export const updateUserSettings = async (data: UserSettings): Promise<UserProfile> => {
  try {
    const response = await API.put('/users/settings', data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update settings');
  }
};

// Seller Request Interfaces
export interface SellerRequest {
  _id?: string;
  userId: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

// Send request to become seller
export const sendSellerRequest = async (reason?: string): Promise<SellerRequest> => {
  try {
    const response = await API.post('/users/seller-request', { reason });
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send seller request');
  }
};

// Get seller request status
export const getSellerRequestStatus = async (): Promise<SellerRequest | null> => {
  try {
    const response = await API.get('/users/seller-request');
    return response.data.data || response.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No request found
    }
    throw new Error(error.response?.data?.message || 'Failed to get seller request status');
  }
};

// Watchlist Interfaces
export interface WatchlistItem {
  _id: string;
  productId: string;
  product: {
    id: number;
    product_name: string;
    thumpnail_url: string;
    seller: {
      id: number;
      avatar: string;
      fullname: string;
    };
    buy_now_price: number | null;
    minimum_bid_step: number;
    start_at: string | Date;
    end_at: string | Date;
    current_price: number;
    highest_bidder: {
      id: number;
      avatar: string;
      fullname: string;
    } | null;
    created_at?: string | Date;
    posted_at?: string | Date;
    bid_count: number;
  };
  createdAt: string;
}

// Get watchlist
export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  try {
    const response = await API.get('/users/watchlist');
    return response.data.data || response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to get watchlist');
  }
};

// Add product to watchlist
export const addToWatchlist = async (productId: string): Promise<WatchlistItem> => {
  try {
    const response = await API.post('/users/watchlist', { productId });
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add to watchlist');
  }
};

// Remove product from watchlist
export const removeFromWatchlist = async (productId: string): Promise<void> => {
  try {
    await API.delete(`/users/watchlist/${productId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to remove from watchlist');
  }
};

// Bidding Products Interfaces
export interface BiddingItem {
  _id: string;
  productId: string;
  bidAmount: number;
  bidAt: string;
  product: {
    id: number;
    product_name: string;
    thumpnail_url: string;
    seller: {
      id: number;
      avatar: string;
      fullname: string;
    };
    buy_now_price: number | null;
    minimum_bid_step: number;
    start_at: string | Date;
    end_at: string | Date;
    current_price: number;
    highest_bidder: {
      id: number;
      avatar: string;
      fullname: string;
    } | null;
    created_at?: string | Date;
    posted_at?: string | Date;
    bid_count: number;
  };
  isWinning?: boolean; // Whether user is currently the highest bidder
  status?: 'active' | 'won' | 'lost'; // Status of the bid
}

// Get user's active bidding products (products user has bid on that are still active)
export const getMyBids = async (): Promise<BiddingItem[]> => {
  try {
    const response = await API.get('/users/my-bids');
    return response.data.data || response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to get my bids');
  }
};

// Seller Products Interfaces
export interface SellerProduct {
  _id: string;
  id: number;
  product_name: string;
  thumpnail_url: string;
  seller: {
    id: number;
    avatar: string;
    fullname: string;
  };
  buy_now_price: number | null;
  minimum_bid_step: number;
  start_at: string | Date;
  end_at: string | Date;
  current_price: number;
  highest_bidder: {
    id: number;
    avatar: string;
    fullname: string;
  } | null;
  created_at?: string | Date;
  posted_at?: string | Date;
  bid_count: number;
  status: 'active' | 'won'; // active = còn hạn, won = đã có người thắng
  winningBidder?: {
    id: number;
    avatar: string;
    fullname: string;
    bidAmount: number;
    bidAt: string;
  };
}

// Get seller's products
export const getMyProducts = async (): Promise<SellerProduct[]> => {
  try {
    const response = await API.get('/users/my-products');
    return response.data.data || response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to get my products');
  }
};

// Review bidder (seller reviews the winning bidder)
export interface ReviewBidderData {
  productId: string;
  bidderId: string;
  rating: number;
  reviewText: string;
}

export const reviewBidder = async (data: ReviewBidderData): Promise<void> => {
  try {
    await API.post('/users/review-bidder', data);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to review bidder');
  }
};

// Cancel transaction with bidder
export const cancelTransaction = async (productId: string, bidderId: string): Promise<void> => {
  try {
    await API.post('/users/cancel-transaction', { productId, bidderId });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel transaction');
  }
}; 