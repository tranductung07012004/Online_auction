import api from './apiClient';

export interface UserInfo {
  id: number;
  fullname: string;
  email: string;
  avatar: string;
  assessment: number;
}

export interface WishlistResponse {
  id: number;
  productId: number;
  user: UserInfo;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Add product to wishlist
export const addToWishlist = async (productId: string | number): Promise<WishlistResponse> => {
  try {
    const response = await api.post<ApiResponse<WishlistResponse>>(
      `/api/main/wishlist/${productId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to add product to wishlist'
    );
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId: string | number): Promise<void> => {
  try {
    await api.delete<ApiResponse<null>>(`/api/main/wishlist/${productId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to remove product from wishlist'
    );
  }
};


// Get user's wishlist (paginated)
export const getUserWishlist = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<WishlistResponse>> => {
  try {
    const response = await api.get<ApiResponse<PageResponse<WishlistResponse>>>(
      '/api/main/wishlist/user',
      {
        params: { page, size },
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get wishlist'
    );
  }
};

// Get all user's wishlist (no pagination)
export const getAllUserWishlist = async (): Promise<WishlistResponse[]> => {
  try {
    const response = await api.get<ApiResponse<WishlistResponse[]>>(
      '/api/main/wishlist/user/all'
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get all wishlist'
    );
  }
};

// Check if product is in current user's wishlist
export const isProductInUserWishlist = async (
  productId: string | number
): Promise<boolean> => {
  try {
    // Get all user's wishlist
    const wishlist = await getAllUserWishlist();
    return wishlist.some(
      (item) => item.productId === Number(productId)
    );
  } catch (error: any) {
    return false;
  }
};

