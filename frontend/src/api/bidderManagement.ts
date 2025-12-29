import api from './apiClient';
import { ApiResponse } from './product';

// ---------- Shared types ----------

export interface UserInfo {
  id: number;
  fullname: string;
  avatar: string | null;
  assessment: number | null;
}

// ---------- Blacklist ----------

export interface BlackListBidder {
  id: number;
  fullname: string;
  avatar: string | null;
}

export interface BlackListResponse {
  id: number;
  productId: number;
  bidder: BlackListBidder;
  createdAt: string;
  createdBy: number;
}

export interface BlackListPageResponse {
  content: BlackListResponse[];
  // We only use a subset of Spring Page fields on the frontend
  totalPages: number;
  totalElements: number;
}

export const getBlackListByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 10
): Promise<BlackListPageResponse> => {
  const response = await api.get<ApiResponse<BlackListPageResponse>>(
    `/api/main/blacklist/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

// ---------- Auto-bid ----------

export interface AutoBidItem {
  id: number;
  productId: number;
  bidder: UserInfo;
  createdAt: string;
  updatedAt: string;
}

// ---------- Bid-request ----------

export interface BidRequestItem {
  id: number;
  productId: number;
  bidder: UserInfo;
  sellerId: number;
  verified: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

// Get auto-bids (In Bidding tab)
export const getAutoBidsByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<AutoBidItem>> => {
  const response = await api.get<ApiResponse<PageResponse<AutoBidItem>>>(
    `/api/main/auto-bid/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

// Get bid-requests (Request to Bid tab)
export const getBidRequestsByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<BidRequestItem>> => {
  const response = await api.get<ApiResponse<PageResponse<BidRequestItem>>>(
    `/api/main/bid-request/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

// Check if user can bid on product
// Returns true if user can bid (200 OK)
// Throws error with 400 status if user cannot bid, error.response.data contains { message: string, data: { errorCode: string } }
export const checkUserCanBid = async (
  productId: string | number
): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>(
    `/api/main/auto-bid/check/${productId}`
  );
  return response.data.data;
};

// Create auto bid request interface
export interface CreateAutoBidRequest {
  productId: number;
  maxPrice: number;
}

// Create auto bid
export const createAutoBid = async (
  request: CreateAutoBidRequest
): Promise<AutoBidItem> => {
  const response = await api.post<ApiResponse<AutoBidItem>>(
    '/api/main/auto-bid',
    {
      productId: request.productId,
      maxPrice: request.maxPrice,
    }
  );
  return response.data.data;
};

// ---------- Block User (Blacklist) ----------

export interface BlockUserRequest {
  bidderId: number;
  productId: number;
}

// Block user from bidding on product
export const blockUser = async (
  request: BlockUserRequest
): Promise<BlackListResponse> => {
  const response = await api.post<ApiResponse<BlackListResponse>>(
    '/api/main/blacklist',
    {
      bidderId: request.bidderId,
      productId: request.productId,
    }
  );
  return response.data.data;
};

// ---------- Verify Bid Request ----------

export interface VerifyBidRequestRequest {
  bidderId: number;
  productId: number;
}

// Verify bid request (allow user to bid)
export const verifyBidRequest = async (
  request: VerifyBidRequestRequest
): Promise<BidRequestItem> => {
  const response = await api.post<ApiResponse<BidRequestItem>>(
    '/api/main/bid-request/verify',
    {
      bidderId: request.bidderId,
      productId: request.productId,
    }
  );
  return response.data.data;
};


