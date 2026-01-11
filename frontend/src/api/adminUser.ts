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

export interface UserAdminResponse {
  id: number;
  email: string;
  role: string;
  fullname: string;
  avatar: string;
  address: string;
  verified: boolean;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserVerificationRequest {
  verified: boolean;
}

// Get all users
export const getAllUsers = () =>
  api.get<ApiResponse<UserAdminResponse[]>>("/api/user/internal/all");

// Get users by role
export const getUsersByRole = (
  role: string,
  page: number = 0,
  size: number = 10
) =>
  api.get<ApiResponse<PageResponse<UserAdminResponse>>>(
    `/api/user/admin/role/${role}`,
    {
      params: { page, size },
    }
  );

// Get user by ID
export const getUserById = (userId: number) =>
  api.get<ApiResponse<UserAdminResponse>>(`/api/user/admin/${userId}`);

// Update user role
export const updateUserRole = (
  userId: number,
  request: UpdateUserRoleRequest
) =>
  api.put<ApiResponse<UserAdminResponse>>(
    `/api/user/admin/${userId}/role`,
    request
  );

// Update user verification status
export const updateUserVerification = (
  userId: number,
  request: UpdateUserVerificationRequest
) =>
  api.put<ApiResponse<UserAdminResponse>>(
    `/api/user/admin/${userId}/verification`,
    request
  );

// Delete user
export const deleteUser = (userId: number) =>
  api.delete<ApiResponse<null>>(`/api/user/internal/${userId}`);
