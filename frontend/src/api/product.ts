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

// Create a new product
export const createProduct = async (formData: FormData): Promise<Product> => {
  try {
    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to create product');
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create product');
    }
    throw error;
  }
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

