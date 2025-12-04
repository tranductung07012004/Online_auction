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