import api from './apiClient';
import { ApiResponse } from './product';
import { UserInfo } from './bidderManagement';

// ---------- Bid History ----------

export interface BidHistoryResponse {
  id: number;
  productId: number;
  bidder: UserInfo | null;
  price: number;
  createdAt: string;
}

export interface BidHistoryPageResponse {
  content: BidHistoryResponse[];
  totalPages: number;
  totalElements: number;
}

// Get bid histories by product ID
export const getBidHistoriesByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 10
): Promise<BidHistoryPageResponse> => {
  const response = await api.get<ApiResponse<BidHistoryPageResponse>>(
    `/api/main/bid-history/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

