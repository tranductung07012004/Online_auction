import api from './apiClient';

// Product interface
export interface Product {
  _id: string;
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
  created_at: string | Date;
  bid_count: number;
  category: string[];
  description: string;
  images: string[];
}

export interface CreateProductData {
  name: string;
  buyNowPrice?: string;
  startDate: string;
  endDate: string;
  description: string;
  categories: string[];
  mainImage: File;
  additionalImages: File[];
}

// Create product request DTO matching backend
export interface CreateProductRequest {
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  buyNowPrice?: number;
  minimumBidStep: number;
  endAt: string; // ISO 8601 format
  autoExtendEnabled: boolean;
  descriptionContent: string;
  sellerId: number;
  categoryIds: number[];
  pictureUrls: string[];
}

// API Response interfaces for top products
export interface ProductResponseFromAPI {
  id: number;
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  minimumBidStep: number;
  seller: {
    id: number;
    fullname: string;
    avatar: string | null;
    assessment: number;
  };
  topBidder: {
    id: number;
    fullname: string;
    avatar: string | null;
    assessment: number;
  } | null;
  autoExtendEnabled: boolean;
  bidCount: number;
  createdAt: string;
  endAt: string;
  categories: Array<{
    id: number;
    name: string;
    parentId: number | null;
  }>;
  descriptions: Array<{
    id: number;
    content: string;
    createdAt: string;
    createdBy: number;
  }>;
  pictures: Array<{
    id: number;
    imageUrl: string;
    createdAt: string;
  }>;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Create a new product
export const createProduct = async (request: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/api/main/product', request);


    return response.data; 

};

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/product');

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch products');
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/product/${id}`);

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch product');
  } catch (error: any) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Update product
export const updateProduct = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  try {
    const response = await api.put(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update product');
  } catch (error: any) {
    console.error(`Error updating product with ID ${id}:`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update product');
    }
    throw error;
  }
};

// Delete product
export const deleteProduct = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/product/${id}`);

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || 'Failed to delete product');
  } catch (error: any) {
    console.error(`Error deleting product with ID ${id}:`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete product');
    }
    throw error;
  }
};

// Get seller's products
export const getSellerProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/product/seller/my-products');

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch seller products');
  } catch (error: any) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get('/product/search', {
      params: { q: query },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to search products');
  } catch (error: any) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Bidder management interfaces
export interface Bidder {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  email: string;
  bidAmount: number;
  bidAt: string;
  bidCount: number;
  hasReview: boolean;
  reviewType?: 'like' | 'dislike';
  reviewText?: string;
  isBlocked?: boolean;
}

// Get product bidders (for seller)
export const getProductBidders = async (productId: string): Promise<Bidder[]> => {
  try {
    const response = await api.get(`/product/${productId}/bidders`);

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch bidders');
  } catch (error: any) {
    console.error(`Error fetching bidders for product ${productId}:`, error);
    throw error;
  }
};

// Block bidder from product
export const blockBidder = async (
  productId: string,
  bidderId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/product/${productId}/block-bidder`, {
      bidderId,
      reason,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || 'Failed to block bidder');
  } catch (error: any) {
    console.error(`Error blocking bidder:`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to block bidder');
    }
    throw error;
  }
};

// Allow bidder to participate in auction
export const allowBidder = async (
  productId: string,
  bidderId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/product/${productId}/allow-bidder`, {
      bidderId,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || 'Failed to allow bidder');
  } catch (error: any) {
    console.error(`Error allowing bidder:`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to allow bidder');
    }
    throw error;
  }
};



// Get top 5 products ending soon
export const getTop5EndingSoon = async (): Promise<any> => {
    const response = await api.get<ApiResponse<ProductResponseFromAPI[]>>(
      '/api/main/product/top-ending-soon'
    );

    return response.data;
};

// Get top 5 products with most bid count
export const getTop5MostBidCount = async (): Promise<any> => {
    const response = await api.get<ApiResponse<ProductResponseFromAPI[]>>(
      '/api/main/product/most-bid-count'
    );

    return response.data;
};

// Get top 5 products with highest current price
export const getTop5HighestCurrentPrice = async (): Promise<any> => {
    const response = await api.get<ApiResponse<ProductResponseFromAPI[]>>(
      '/api/main/product/highest-current-price'
    );

    return response.data;
};

// Get product by ID from main service
export const getProductByIdFromMain = async (productId: string | number): Promise<ProductResponseFromAPI> => {
    const response = await api.get<ApiResponse<ProductResponseFromAPI>>(
      `/api/main/product/${productId}`
    );

    return response.data.data;
};

// Get products by category from main service
export const getProductsByCategory = async (
  categoryId: number,
  page: number = 0,
  size: number = 5
): Promise<ProductResponseFromAPI[]> => {
  const response = await api.get<ApiResponse<{
    content: ProductResponseFromAPI[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>>(
    `/api/main/product/category/${categoryId}`,
    {
      params: { page, size }
    }
  );

  return response.data.data.content;
};

// Question and Answer interfaces
export interface QuestionUser {
  id: number;
  fullname: string;
  avatar: string | null;
  assessment: number;
}

export interface QuestionAnswer {
  id: number;
  user: QuestionUser;
  questionId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: number;
  user: QuestionUser;
  productId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  answers: QuestionAnswer[];
}

export interface QuestionsPageResponse {
  content: QuestionResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Get questions by product ID from main service
export const getQuestionsByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 10
): Promise<QuestionsPageResponse> => {
  const response = await api.get<ApiResponse<QuestionsPageResponse>>(
    `/api/main/questions/product/${productId}`,
    {
      params: { page, size }
    }
  );

  return response.data.data;
};

// Create question request interface
export interface CreateQuestionRequest {
  productId: number;
  content: string;
}

// Create question
export const createQuestion = async (
  productId: string | number,
  content: string
): Promise<QuestionResponse> => {
  const response = await api.post<ApiResponse<QuestionResponse>>(
    '/api/main/questions',
    {
      productId: typeof productId === 'string' ? parseInt(productId, 10) : productId,
      content: content.trim()
    }
  );

  return response.data.data;
};

// Create answer request interface
export interface CreateAnswerRequest {
  questionId: number;
  content: string;
}

// Answer response interface
export interface AnswerResponse {
  id: number;
  user: QuestionUser;
  questionId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Create answer
export const createAnswer = async (
  questionId: string | number,
  content: string
): Promise<AnswerResponse> => {
  const response = await api.post<ApiResponse<AnswerResponse>>(
    '/api/main/questions/answers',
    {
      questionId: typeof questionId === 'string' ? parseInt(questionId, 10) : questionId,
      content: content.trim()
    }
  );

  return response.data.data;
};

