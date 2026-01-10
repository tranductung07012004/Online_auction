import api from './apiClient';

// Review interfaces
export interface UserInfo {
  id: number;
  fullname: string;
  email: string;
  avatar: string | null;
  assessment: number | null;
}

export interface ReviewResponse {
  id: number;
  sender: UserInfo;
  receiver: UserInfo;
  status: number; // 1 for like, 0 for dislike
  comment: string;
  createdAt: string;
}

export interface ReviewsPageResponse {
  content: ReviewResponse[];
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

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Get reviews by sender ID (reviews sent by current user)
export const getReviewsBySenderId = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewsPageResponse> => {
  const response = await api.get<ApiResponse<ReviewsPageResponse>>(
    '/api/main/reviews/sender',
    {
      params: { page, size }
    }
  );

  return response.data.data;
};

// Get reviews by receiver ID (reviews received by current user)
export const getReviewsByReceiverId = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewsPageResponse> => {
  const response = await api.get<ApiResponse<ReviewsPageResponse>>(
    '/api/main/reviews/receiver',
    {
      params: { page, size }
    }
  );

  return response.data.data;
};

