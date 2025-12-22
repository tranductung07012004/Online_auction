// Compatibility layer: Map Zustand store to AuthContext API
// This allows existing code using useAuth() to continue working without changes
import { useAuthStore } from '../stores/authStore';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  role: 'ADMIN' | 'BIDDER' | 'SELLER' | null;
  username: string | null;
  getRoleFromCookie: () => Promise<'ADMIN' | 'BIDDER' | 'SELLER' | null>;
  checkAuthStatus: () => Promise<boolean>;
  clearCookie: () => Promise<void>;
  isLoading: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authMessage: string | null;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthMessage: (message: string | null) => void;
}

// Compatibility hook - maps Zustand store to AuthContext interface
export const useAuth = (): AuthContextType => {
  const store = useAuthStore();
  
  // Return đúng interface như AuthContext cũ
  return {
    isAuthenticated: store.isAuthenticated,
    userId: store.userId,
    role: store.role,
    username: store.username,
    getRoleFromCookie: store.getRoleFromCookie,
    checkAuthStatus: store.checkAuthStatus,
    clearCookie: store.clearCookie,
    isLoading: store.isLoading,
    isAuthLoading: store.isAuthLoading,
    authError: store.authError,
    authMessage: store.authMessage,
    setAuthLoading: store.setAuthLoading,
    setAuthError: store.setAuthError,
    setAuthMessage: store.setAuthMessage,
  };
};

// Dummy Provider component - không wrap gì cả, chỉ để không crash code cũ
// Có thể xóa AuthProvider wrapper trong App.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Chỉ return children, không wrap Provider nữa
  // Zustand không cần Provider
  return <>{children}</>;
};
