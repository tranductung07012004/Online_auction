import axios from 'axios';
import {useAuthStore} from '../stores/authStore';

// Create and configure the API instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.errorCode === 'UNAUTHORIZED_EXPIRED_INVALID_TOKEN'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await useAuthStore.getState().refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          isRefreshing = false;

          return api(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'), null);
          isRefreshing = false;
          
          useAuthStore.getState().clearAuth();
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        useAuthStore.getState().clearAuth();
        
        return Promise.reject(refreshError);
      }
    }

    console.error('API Response Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url
    } : error);
    
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error detected');
    }
    
    return Promise.reject(error);
  }
);

export default api; 