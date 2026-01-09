import api from './apiClient';
import type { ApiResponse, ProductResponseFromAPI } from './product';

// Search products using search API from main service
export interface SearchProductsParams {
  keyword?: string;
  categoryIds?: number[];
  page?: number;
  size?: number;
  sort?: string; // Format: "field,direction" e.g., "endAt,asc" or "currentPrice,desc"
}

export interface SearchProductsResponse {
  content: ProductResponseFromAPI[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const searchProductsFromMain = async (
  params: SearchProductsParams
): Promise<SearchProductsResponse> => {
  const {
    keyword,
    categoryIds,
    page = 0,
    size = 10,
    sort = "endAt,asc"
  } = params;

  const queryParams: any = {
    page,
    size,
    sort
  };

  if (keyword) {
    queryParams.keyword = keyword;
  }

  if (categoryIds && categoryIds.length > 0) {
    // Axios will handle array params correctly
    queryParams.categoryIds = categoryIds;
  }

  const response = await api.get<ApiResponse<SearchProductsResponse>>(
    "/api/main/search",
    {
      params: queryParams
    }
  );

  return response.data.data;
};

