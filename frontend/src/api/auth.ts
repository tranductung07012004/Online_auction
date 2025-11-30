import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
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
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  message: string;
  isVerified?: boolean;
  email?: string;
}

export interface VerifyEmailData {
  email: string;
  verificationCode: string;
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

export const register = async (data: RegisterData): Promise<{ userId: string; email: string; message: string }> => {
  try {
    console.log('Registering user:', data.email);
    const response = await API.post('/auth/register', data);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Logging in user:', data.username);
    const response = await API.post('/auth/login', data);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
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

export const getRoleAPI = async () => {
  try {
    console.log('Checking user role...');
  const response = await API.get('/auth/me'); 
    console.log('Role API response:', response.data);
  return response.data;
  } catch (error: any) {
    console.error('Error checking role:', error);
    throw new Error(error.response?.data?.message || 'Failed to get user role');
  }
};

export const verifyEmail = async (data: VerifyEmailData): Promise<{ message: string }> => {
  try {
    console.log('Verifying email:', data.email);
    const response = await API.post('/auth/verify-email', data);
    console.log('Email verification response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Email verification error:', error);
    throw new Error(error.response?.data?.message || 'Email verification failed');
  }
};

export const resendVerificationCode = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('Resending verification code to:', email);
    const response = await API.post('/auth/resend-verification', { email });
    console.log('Resend verification response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Resend verification error:', error);
    throw new Error(error.response?.data?.message || 'Failed to resend verification code');
  }
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