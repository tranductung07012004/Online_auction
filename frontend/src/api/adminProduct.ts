import api from "./apiClient";

// Admin Product interfaces
export interface AdminProduct {
  id: number;
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  currentPrice: number | null;
  buyNowPrice: number | null;
  bidCount: number;
  sellerId: number;
  sellerName: string | null;
  sellerEmail: string | null;
  topBidderId: number | null;
  topBidderName: string | null;
  categoryName: string | null;
  createdAt: string;
  endAt: string;
  status: "ACTIVE" | "ENDED" | "CANCELLED";
}

export interface AdminProductStats {
  totalProducts: number;
  activeProducts: number;
  endedProducts: number;
  cancelledProducts: number;
  productsWithBids: number;
  productsWithoutBids: number;
  productsEndingSoon: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface GetProductsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: "ALL" | "ACTIVE" | "ENDED";
  sellerId?: number;
  categoryId?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/**
 * Get all products with pagination and filters (Admin)
 */
export const getAdminProducts = async (
  params: GetProductsParams = {}
): Promise<ApiResponse<PageResponse<AdminProduct>>> => {
  const response = await api.get<ApiResponse<PageResponse<AdminProduct>>>(
    "/api/main/admin/products",
    { params }
  );
  return response.data;
};

/**
 * Get product by ID (Admin)
 */
export const getAdminProductById = async (
  productId: number
): Promise<ApiResponse<AdminProduct>> => {
  const response = await api.get<ApiResponse<AdminProduct>>(
    `/api/main/admin/products/${productId}`
  );
  return response.data;
};

/**
 * Get products by seller (Admin)
 */
export const getAdminProductsBySeller = async (
  sellerId: number,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<AdminProduct>>> => {
  const response = await api.get<ApiResponse<PageResponse<AdminProduct>>>(
    `/api/main/admin/products/seller/${sellerId}`,
    { params: { page, size } }
  );
  return response.data;
};

/**
 * Get product statistics (Admin)
 */
export const getAdminProductStats = async (): Promise<
  ApiResponse<AdminProductStats>
> => {
  const response = await api.get<ApiResponse<AdminProductStats>>(
    "/api/main/admin/products/stats"
  );
  return response.data;
};

/**
 * Delete a product (Admin)
 */
export const deleteAdminProduct = async (
  productId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/api/main/admin/products/${productId}`
  );
  return response.data;
};

/**
 * End auction early (Admin)
 */
export const endAuctionEarly = async (
  productId: number,
  reason: string
): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(
    `/api/main/admin/products/${productId}/end-auction`,
    { reason }
  );
  return response.data;
};
