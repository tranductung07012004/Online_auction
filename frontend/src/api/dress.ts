import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Cấu hình gửi cookie kèm theo request
});

// Thêm interceptor để ghi log các request
API.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials
    });
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để ghi log các response
API.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  error => {
    console.error('API Response Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      url: error.config.url
    } : error);
    return Promise.reject(error);
  }
);

// Define dress type
export interface DressVariant {
  size: {
    _id: string;
    name: string;
    description?: string;
  };
  color: {
    _id: string;
    name: string;
    hexCode: string;
  };
  stock: number;
}

export interface DressRating {
  username: string;
  rate: number;
}

export interface DressReview {
  username: string;
  reviewText: string;
  icon?: string;
  date: Date;
}

export interface DressDescription {
  productDetail: string;
  sizeAndFit: string;
  description: string;
}

export interface Dress {
  _id: string;
  name: string;
  dailyRentalPrice: number;
  purchasePrice: number;
  ratings: DressRating[];
  reviews: DressReview[];
  variants: DressVariant[];
  description: DressDescription;
  images: string[];
  style?: string;
  material?: string;
  avgRating?: number;
  reviewCount?: number;
}

// Get all dresses
export const getAllDresses = async (): Promise<Dress[]> => {
  try {
    //const response = await axios.get(`${API_URL}/dress`);
    const response = await API.get('/dress');
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch dresses');
  } catch (error) {
    console.error('Error fetching dresses:', error);
    throw error;
  }
};

// Search dresses by query
export const searchDresses = async (query: string): Promise<Dress[]> => {
  try {
    const response = await API.get('/dress/search', {
      params: { q: query }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to search dresses');
  } catch (error) {
    console.error('Error searching dresses:', error);
    throw error;
  }
};

// Get most popular dresses
export const getMostPopularDresses = async (limit: number = 5): Promise<Dress[]> => {
  try {
    const response = await API.get(`/dress/popular`, {
      params: { limit }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch popular dresses');
  } catch (error) {
    console.error('Error fetching popular dresses:', error);
    throw error;
  }
};

// Get dress by ID
export const getDressById = async (id: string): Promise<Dress> => {
  try {
    const response = await API.get(`/dress/${id}`);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch dress');
  } catch (error) {
    console.error(`Error fetching dress with ID ${id}:`, error);
    throw error;
  }
};

// Get similar dresses
export const getSimilarDresses = async (id: string, limit: number = 4): Promise<Dress[]> => {
  try {
    const response = await API.get(`/dress/${id}/similar`, {
      params: { limit }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch similar dresses');
  } catch (error) {
    console.error(`Error fetching similar dresses for ID ${id}:`, error);
    throw error;
  }
};

// Create a new dress
export const createDress = async (dressData: FormData): Promise<Dress> => {
  try {
    const response = await API.post('/dress', dressData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create dress');
  } catch (error) {
    console.error('Error creating dress:', error);
    throw error;
  }
};

// Update an existing dress
export const updateDress = async (id: string, dressData: FormData): Promise<Dress> => {
  try {
    const response = await API.put(`/dress/${id}`, dressData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update dress');
  } catch (error) {
    console.error(`Error updating dress with ID ${id}:`, error);
    throw error;
  }
};

// Delete a dress
export const deleteDress = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await API.delete(`/dress/${id}`);
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Failed to delete dress');
  } catch (error) {
    console.error(`Error deleting dress with ID ${id}:`, error);
    throw error;
  }
};

// Remove an image from a dress
export const removeImage = async (dressId: string, imageUrl: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await API.delete(`/dress/${dressId}/image`, {
      data: { imageUrl }
    });
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Failed to remove image');
  } catch (error) {
    console.error(`Error removing image from dress with ID ${dressId}:`, error);
    throw error;
  }
};

// Interface for review submission
export interface ReviewSubmission {
  dressId: string;
  rating: number;
  reviewText: string;
  images?: File[];
  userId?: string;
}

// Submit a review for dress
export const submitReview = async (reviewData: ReviewSubmission): Promise<{ success: boolean; message: string }> => {
  try {
    const formData = new FormData();
    
    // Chuẩn bị dữ liệu đầu vào
    const dressId = reviewData.dressId.trim();
    const rating = Math.max(1, Math.min(5, Number(reviewData.rating) || 0));
    const reviewText = (reviewData.reviewText || '').trim();
    
    // Kiểm tra dữ liệu ở phía client
    if (!dressId) {
      throw new Error('Dress ID is required');
    }
    
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }
    
    if (!reviewText) {
      throw new Error('Review text is required');
    }
    
    // Thêm vào formData
    formData.append('dressId', dressId);
    formData.append('rating', rating.toString());
    formData.append('reviewText', reviewText);
    if (reviewData.userId) {
      formData.append('userId', reviewData.userId);
    }
    
    console.log('Submitting review with data:', {
      dressId,
      rating,
      reviewText,
      userId: reviewData.userId,
      hasImages: reviewData.images ? reviewData.images.length > 0 : false
    });
    
    // Thêm ảnh nếu có
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    // Gửi request
    const response = await API.post(`/dress/${dressId}/review`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    
    // Kiểm tra kết quả
    if (response.data && response.data.success) {
      return response.data;
    }
    
    console.error('Server responded with error:', response.data);
    throw new Error(response.data.message || 'Failed to submit review');
  } catch (error) {
    console.error('Error submitting review:', error);
    if (error.response) {
      console.error('Error response from server:', error.response.data);
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    }
    throw error;
  }
};

// Reply to an existing review
export const replyToReview = async (
  dressId: string, 
  reviewId: string, 
  replyText: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await API.post(`/dress/${dressId}/review/${reviewId}/reply`, {
      replyText
    });
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Failed to reply to review');
  } catch (error) {
    console.error(`Error replying to review:`, error);
    throw error;
  }
};

// Check if user has already reviewed a dress
export const checkUserReview = async (dressId: string): Promise<boolean> => {
  try {
    const response = await API.get(`/dress/${dressId}/review/check`, {
      withCredentials: true,
    });
    
    return response.data.hasReviewed;
  } catch (error) {
    console.error(`Error checking if user has reviewed dress with ID ${dressId}:`, error);
    return false;
  }
}; 