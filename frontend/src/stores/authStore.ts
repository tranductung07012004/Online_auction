import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logout as logoutApi } from '../api/auth';
import { getUserIdFromToken, getRoleFromToken } from '../libs/utils';

interface PendingVerification {
  email: string;
  userId: number;
  role?: string;
}

interface AuthState {
  // Auth state
  isAuthenticated: boolean;
  userId: string | null;
  role: 'ADMIN' | 'BIDDER' | 'SELLER' | null;
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
  getRoleFromCookie: () => Promise<'ADMIN' | 'BIDDER' | 'SELLER' | null>;
  checkAuthStatus: () => Promise<boolean>;
  clearCookie: () => Promise<void>;
  
  // Setters cho auth state
  setAuthState: (state: {
    isAuthenticated?: boolean;
    userId?: string | null;
    role?: 'ADMIN' | 'BIDDER' | 'SELLER' | null;
    username?: string | null;
    accessToken?: string | null;
  }) => void;
  
  // Set access token and extract user info
  setAccessToken: (token: string) => void;
  
  // Clear auth state
  clearAuth: () => void;
}

// Auto-clear messages helper
let errorTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
          role: role as 'ADMIN' | 'BIDDER' | 'SELLER' | null,
          isAuthenticated: !!userId && !!role,
        });
      },
      
      clearAuth: () => {
        set({
          isAuthenticated: false,
          userId: null,
          role: null,
          username: null,
          accessToken: null,
        });
      },
      
      getRoleFromCookie: async () => {
        console.warn('getRoleFromCookie is no longer available - getRoleAPI endpoint was removed');
        set({ isAuthLoading: false });
        return null;
      },
      
      checkAuthStatus: async () => {
        const { isAuthenticated, userId } = get();
        console.log('Checking auth status:', { isAuthenticated, userId });
        return isAuthenticated && userId !== null;
      },
      
      clearCookie: async () => {
        set({ isAuthLoading: true });
        try {
          console.log('Logging out');
          await logoutApi();
          set({ 
            authMessage: "Logged out successfully",
            role: null,
            userId: null,
            username: null,
            accessToken: null,
            isAuthenticated: false,
          });
        } catch (err) {
          console.error('Logout failed', err);
          set({ authError: "Logout failed, please try again" });
        } finally {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist những fields cần thiết
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        role: state.role,
        username: state.username,
        accessToken: state.accessToken,
        pendingVerification: state.pendingVerification,
      }),
    }
  )
);

// Window focus event handler (tương tự useEffect trong AuthContext)
if (typeof window !== 'undefined') {
  const handleFocus = async () => {
    console.log('Window focus - rechecking authentication');
    const { getRoleFromCookie } = useAuthStore.getState();
    await getRoleFromCookie();
  };

  window.addEventListener('focus', handleFocus);
}

