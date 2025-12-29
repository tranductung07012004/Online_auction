import api from "./apiClient";

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type SellerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SellerRequestResponse {
  id: number;
  userId: number;
  userEmail: string;
  userFullname: string;
  userAvatar: string;
  reason: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  status: SellerRequestStatus;
  adminNote: string;
  reviewedBy: number;
  reviewerEmail: string;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerRequestDTO {
  reason: string;
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
}

export interface ReviewSellerRequestDTO {
  approved: boolean;
  adminNote?: string;
}

export interface SellerRequestStatistics {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

// ==================== Admin APIs ====================

// Get all seller requests
export const getAllSellerRequests = (page: number = 0, size: number = 10) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    "/api/user/admin/seller-requests",
    { params: { page, size } }
  );

// Get seller requests by status
export const getSellerRequestsByStatus = (
  status: SellerRequestStatus,
  page: number = 0,
  size: number = 10
) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    `/api/user/admin/seller-requests/status/${status}`,
    { params: { page, size } }
  );

// Search seller requests by user email
export const searchSellerRequests = (
  keyword: string,
  page: number = 0,
  size: number = 10
) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    "/api/user/admin/seller-requests/search",
    { params: { keyword, page, size } }
  );

// Get seller request by ID
export const getSellerRequestById = (requestId: number) =>
  api.get<ApiResponse<SellerRequestResponse>>(
    `/api/user/admin/seller-requests/${requestId}`
  );

// Review (approve/reject) seller request
export const reviewSellerRequest = (
  requestId: number,
  request: ReviewSellerRequestDTO
) =>
  api.put<ApiResponse<SellerRequestResponse>>(
    `/api/user/admin/seller-requests/${requestId}/review`,
    request
  );

// Get seller request statistics
export const getSellerRequestStatistics = () =>
  api.get<ApiResponse<SellerRequestStatistics>>(
    "/api/user/admin/seller-requests/statistics"
  );

// ==================== User APIs ====================

// Create a new seller request
export const createSellerRequest = (request: CreateSellerRequestDTO) =>
  api.post<ApiResponse<SellerRequestResponse>>(
    "/api/user/seller-request",
    request
  );

// Get my seller request
export const getMySellerRequest = () =>
  api.get<ApiResponse<SellerRequestResponse>>("/api/user/seller-request/my");

// Cancel my pending seller request
export const cancelMySellerRequest = () =>
  api.delete<ApiResponse<null>>("/api/user/seller-request/my");
