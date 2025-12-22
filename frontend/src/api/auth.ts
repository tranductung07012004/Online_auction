import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Cấu hình gửi cookie kèm theo request
  headers: {
    'Content-Type': 'application/json',
  }
});

// Set up interceptor to log requests and responses for debugging
API.interceptors.request.use(request => {
  console.log('Auth API Request:', request);
  return request;
}, error => {
  console.error('Auth Request Error:', error);
  return Promise.reject(error);
});

API.interceptors.response.use(response => {
  console.log('Auth API Response:', response);
  return response;
}, error => {
  console.error('Auth Response Error:', error);
  return Promise.reject(error);
});

export interface RegisterData {
  fullname: string;
  email: string;
  password: string;
  address: string;
  role?: string;
   // Token from Google reCAPTCHA v2 (frontend sends to backend for verification)
   recaptchaToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface AuthResponse {
  accessToken?: string;
  message: string;
  isVerified?: boolean;
  email?: string;
  errorCode?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ErrorResponseData {
  errorCode: string;
  [key: string]: any;
}

export interface RegisterResponse {
  email: string;
  userId: number;
  role: string;
  message?: string;
  errorCode?: string;
}

export interface VerifyEmailData {
  email: string;
  verificationCode: string;
}

export interface VerifyOtpRequest {
  userId: number;
  otp: string;
  email: string;
}

export interface RequestPasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export const register = async (data: RegisterData): Promise<any> => {
    console.log('Registering user:', data.email);
    const response = await API.post('/api/user/auth/register', data);
  return response.data;    
};

export const login = async (data: LoginData): Promise<any> => {
  console.log('Logging in user:', data.email);
  const response = await API.post('/api/user/auth/login', data);
  
  return response.data;
}; 

export const logout = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    await API.post('/auth/logout');
    console.log('Logout successful');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
}

export const verifyOtp = async (data: VerifyOtpRequest): Promise<any> => {

    console.log('Verifying OTP:', data);
    const response = await API.post('/api/user/auth/verify-otp', data);
    console.log('OTP verification response:', response.data);
    return response.data;
};

export const requestPasswordReset = async (data: RequestPasswordResetData): Promise<{ message: string }> => {
  try {
    console.log('Requesting password reset for:', data.email);
    const response = await API.post('/auth/forgot-password', data);
    console.log('Password reset request response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Password reset request error:', error);
    throw new Error(error.response?.data?.message || 'Failed to request password reset');
  }
};

export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  try {
    console.log('Resetting password for:', data.email);
    const response = await API.post('/auth/reset-password', data);
    console.log('Password reset response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};