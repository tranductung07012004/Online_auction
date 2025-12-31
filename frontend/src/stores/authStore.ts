import { create } from "zustand";
import { logout as logoutApi } from "../api/auth";
import { getUserIdFromToken, getRoleFromToken } from "../libs/utils";

interface PendingVerification {
  email: string;
  userId: number;
  role?: string;
}

interface AuthState {
  // Auth state
  isAuthenticated: boolean;
  userId: string | null;
  role: "ADMIN" | "BIDDER" | "SELLER" | null;
  username: string | null;
  accessToken: string | null;

  // Loading & error states
  isLoading: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authMessage: string | null;

  // Pending verification (mới thêm)
  pendingVerification: PendingVerification | null;

  // Actions - giữ nguyên API như AuthContext
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthMessage: (message: string | null) => void;
  setPendingVerification: (data: PendingVerification) => void;
  clearPendingVerification: () => void;

  // Auth methods
  getRoleFromCookie: () => Promise<"ADMIN" | "BIDDER" | "SELLER" | null>;
  checkAuthStatus: () => Promise<boolean>;
  clearAuth: () => Promise<void>;

  // Setters cho auth state
  setAuthState: (state: {
    isAuthenticated?: boolean;
    userId?: string | null;
    role?: "ADMIN" | "BIDDER" | "SELLER" | null;
    username?: string | null;
    accessToken?: string | null;
  }) => void;

  // Set access token and extract user info
  setAccessToken: (token: string) => void;

  // Refresh access token
  refreshAccessToken: () => Promise<string | null>;
}

// Auto-clear messages helper
let errorTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state - giống AuthContext
  isAuthenticated: false,
  userId: null,
  role: null,
  username: null,
  accessToken: null,
  isLoading: false,
  isAuthLoading: false,
  authError: null,
  authMessage: null,
  pendingVerification: null,

  // Actions
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  setAuthError: (error) => {
    // Clear previous timer
    if (errorTimer) clearTimeout(errorTimer);

    set({ authError: error });

    // Auto-clear after 5 seconds
    if (error) {
      errorTimer = setTimeout(() => {
        set({ authError: null });
        errorTimer = null;
      }, 5000);
    }
  },

  setAuthMessage: (message) => {
    // Clear previous timer
    if (messageTimer) clearTimeout(messageTimer);

    set({ authMessage: message });

    // Auto-clear after 5 seconds
    if (message) {
      messageTimer = setTimeout(() => {
        set({ authMessage: null });
        messageTimer = null;
      }, 5000);
    }
  },

  setPendingVerification: (data) => set({ pendingVerification: data }),
  clearPendingVerification: () => set({ pendingVerification: null }),

  setAuthState: (newState) => set((state) => ({ ...state, ...newState })),

  setAccessToken: (token) => {
    const userId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);
    set({
      accessToken: token,
      userId: userId,
      role: role as "ADMIN" | "BIDDER" | "SELLER" | null,
      isAuthenticated: !!userId && !!role,
    });
  },

  refreshAccessToken: async () => {
    try {
      // Gọi refresh token endpoint (sử dụng fetch trực tiếp để tránh interceptor loop)
      const response = await fetch('http://localhost:8080/api/user/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies (httpOnly cookie chứa refresh token)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to refresh token');
      }

      const data = await response.json();
      const newAccessToken = data.data; // Access token nằm trong data.data theo format ApiResponse

      if (newAccessToken) {
        // Lưu token mới vào store
        get().setAccessToken(newAccessToken);
        console.log('Access token refreshed successfully');
        return newAccessToken;
      }

      console.warn('No access token in refresh response');
      return null;
    } catch (err: any) {
      console.error('Error refreshing access token:', err);
      return null;
    }
  },

  getRoleFromCookie: async () => {
    console.warn(
      "getRoleFromCookie is no longer available - getRoleAPI endpoint was removed"
    );
    set({ isAuthLoading: false });
    return null;
  },

  checkAuthStatus: async () => {
    const { isAuthenticated, userId } = get();
    console.log("Checking auth status:", { isAuthenticated, userId });
    return isAuthenticated && userId !== null;
  },

  clearAuth: async () => {
    set({ isAuthLoading: true });
    try {
      console.log("Logging out");
      await logoutApi();
      // Clear auth state
      set({
        isAuthenticated: false,
        userId: null,
        role: null,
        username: null,
        accessToken: null,
        authMessage: "Logged out successfully",
      });
    } catch (err) {
      console.error("Logout failed", err);
      // Vẫn clear auth state ngay cả khi API fail
      set({
        isAuthenticated: false,
        userId: null,
        role: null,
        username: null,
        accessToken: null,
        authError: "Logout failed, please try again",
      });
    } finally {
      set({ isAuthLoading: false });
    }
  },
}));

// Window focus event handler (tương tự useEffect trong AuthContext)
if (typeof window !== "undefined") {
  const handleFocus = async () => {
    console.log("Window focus - rechecking authentication");
    const { getRoleFromCookie } = useAuthStore.getState();
    await getRoleFromCookie();
  };

  window.addEventListener("focus", handleFocus);
}
