import api from "./apiClient";

// Interfaces matching backend DTOs
export interface UpdateFullnameRequest {
  fullname: string;
  password: string;
}

export interface UpdateEmailRequest {
  password: string;
  newEmail: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateAddressRequest {
  address: string;
  password: string;
}

export interface UpdateAvatarRequest {
  avatar: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// UserProfileResponse matching backend DTO
export interface UserProfileResponse {
  fullname: string;
  avatar: string;
  assessment: number | null;
  email: string; // masked email
  address: string;
}

/**
 * Get user profile
 * @returns Promise with UserProfileResponse
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await api.get<ApiResponse<UserProfileResponse>>(
      "/api/user/internal/profile"
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to get user profile";
    throw new Error(errorMessage);
  }
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns Promise with UserProfileResponse
 */
export const getUserById = async (
  userId: number
): Promise<UserProfileResponse> => {
  try {
    const response = await api.get<ApiResponse<UserProfileResponse>>(
      `/api/user/internal/profile/${userId}`
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to get user information";
    throw new Error(errorMessage);
  }
};

/**
 * Update user fullname
 * @param data - UpdateFullnameRequest containing fullname and password
 * @returns Promise with success message
 */
export const updateFullname = async (
  data: UpdateFullnameRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      "/api/user/internal/fullname",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update fullname";
    throw new Error(errorMessage);
  }
};

/**
 * Update user email
 * @param data - UpdateEmailRequest containing newEmail and password
 * @returns Promise with success message
 */
export const updateEmail = async (
  data: UpdateEmailRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      "/api/user/internal/email",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update email";
    throw new Error(errorMessage);
  }
};

/**
 * Update user password
 * @param data - UpdatePasswordRequest containing oldPassword and newPassword
 * @returns Promise with success message
 */
export const updatePassword = async (
  data: UpdatePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      "/api/user/internal/password",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update password";
    throw new Error(errorMessage);
  }
};

/**
 * Update user address
 * @param data - UpdateAddressRequest containing address and password
 * @returns Promise with success message
 */
export const updateAddress = async (
  data: UpdateAddressRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      "/api/user/internal/address",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update address";
    throw new Error(errorMessage);
  }
};

/**
 * Update user avatar
 * @param data - UpdateAvatarRequest containing avatar URL
 * @returns Promise with success message
 */
export const updateAvatar = async (
  data: UpdateAvatarRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      "/api/user/internal/avatar",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update avatar";
    throw new Error(errorMessage);
  }
};
