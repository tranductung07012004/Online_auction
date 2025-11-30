import axios from 'axios';

// Create and configure the API instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging and modifying requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and handling responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url
    } : error);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error detected, redirecting to login');
      // Optionally redirect to login page
      // window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

export default api; 