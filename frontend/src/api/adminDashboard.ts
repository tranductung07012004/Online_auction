import api from "./apiClient";

interface ApiResponse<T> {
  message: string;
  data: T;
}

// ==================== User Service Dashboard Stats ====================

export interface AdminDashboardUserStats {
  totalUsers: number;
  adminCount: number;
  sellerCount: number;
  bidderCount: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingSellerRequests: number;
  approvedSellerRequests: number;
  rejectedSellerRequests: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface RecentUserDTO {
  id: number;
  email: string;
  fullname: string;
  avatar: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

// Get user statistics for dashboard
export const getUserStatistics = () =>
  api.get<ApiResponse<AdminDashboardUserStats>>(
    "/api/user/admin/dashboard/user-stats"
  );

// Get recent registered users
export const getRecentUsers = (limit: number = 10) =>
  api.get<ApiResponse<RecentUserDTO[]>>(
    "/api/user/admin/dashboard/recent-users",
    {
      params: { limit },
    }
  );

// ==================== Main Service Dashboard Stats ====================

export interface CategoryProductCount {
  categoryId: number;
  categoryName: string;
  productCount: number;
}

export interface AdminDashboardStats {
  totalProducts: number;
  activeAuctions: number;
  endedAuctions: number;
  endingSoonAuctions: number;
  totalBids: number;
  highestCurrentPrice: number;
  averageStartPrice: number;
  totalCategories: number;
  topCategories: CategoryProductCount[];
  newProductsToday: number;
  newProductsThisWeek: number;
}

export interface RecentProductDTO {
  id: number;
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  currentPrice: number;
  sellerId: number;
  bidCount: number;
  endAt: string;
  createdAt: string;
  isActive: boolean;
}

// Get dashboard statistics (products, auctions, categories)
export const getDashboardStats = () =>
  api.get<ApiResponse<AdminDashboardStats>>("/api/main/admin/dashboard/stats");

// Get recent products
export const getRecentProducts = (limit: number = 10) =>
  api.get<ApiResponse<RecentProductDTO[]>>(
    "/api/main/admin/dashboard/recent-products",
    {
      params: { limit },
    }
  );

// ==================== Combined Dashboard Data ====================

export interface FullDashboardData {
  userStats: AdminDashboardUserStats;
  productStats: AdminDashboardStats;
  recentUsers: RecentUserDTO[];
  recentProducts: RecentProductDTO[];
}

// Get all dashboard data in parallel
export const getFullDashboardData = async (): Promise<FullDashboardData> => {
  const [userStatsRes, productStatsRes, recentUsersRes, recentProductsRes] =
    await Promise.all([
      getUserStatistics(),
      getDashboardStats(),
      getRecentUsers(5),
      getRecentProducts(5),
    ]);

  return {
    userStats: userStatsRes.data.data,
    productStats: productStatsRes.data.data,
    recentUsers: recentUsersRes.data.data,
    recentProducts: recentProductsRes.data.data,
  };
};
