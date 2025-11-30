import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as logoutApi, getRoleAPI } from '../api/auth';
import { getUserProfile } from '../api/user';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  role: 'user' | 'admin' | null;
  username: string | null;
  getRoleFromCookie: () => Promise<'user' | 'admin' | null>;
  checkAuthStatus: () => Promise<boolean>;
  clearCookie: () => void;
  isLoading: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authMessage: string | null;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthMessage: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  role: null,
  username: null,
  getRoleFromCookie: async () => null,
  checkAuthStatus: async () => false,
  clearCookie: () => {},
  isLoading: true,
  isAuthLoading: false,
  authError: null,
  authMessage: null,
  setAuthLoading: () => {},
  setAuthError: () => {},
  setAuthMessage: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);

  useEffect(() => {
    console.log('AuthContext: Initial authentication check');
    const checkLogin = async () => {
      try {
        setIsAuthLoading(true);
        const response = await getRoleAPI(); // Get role from /auth/me
        console.log('AuthContext: Role API response:', response);

        // Handle both userId and id formats for backward compatibility
        const userIdentifier = response?.userId || response?.id;
        
        if (userIdentifier) {
          setRole(response.role);
          setUserId(userIdentifier);
          setUsername(response.username);
          setIsAuthenticated(true);
          setLastAuthCheck(Date.now());
        } else {
          console.error('AuthContext: No user ID in authentication response', response);
          setRole(null);
          setUserId(null);
          setUsername(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('AuthContext: Authentication check failed:', error);
        setRole(null);
        setUserId(null);
        setUsername(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setIsAuthLoading(false);
      }
    };

    checkLogin();
  }, []);

  // Add window focus event to recheck login status
  useEffect(() => {
    const handleFocus = async () => {
      console.log('AuthContext: Window focus - rechecking authentication');
      await getRoleFromCookie();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (authError || authMessage) {
      const timer = setTimeout(() => {
        if (authError) setAuthError(null);
        if (authMessage) setAuthMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authError, authMessage]);

  const getRoleFromCookie = async (): Promise<'user' | 'admin' | null> => {
    try {
      console.log('AuthContext: Getting role from cookie');
      setIsAuthLoading(true);
      const res = await getRoleAPI();
      console.log('AuthContext: Role API result:', res);
      
      // Handle both userId and id formats for backward compatibility
      const userIdentifier = res?.userId || res?.id;
      
      if (res && userIdentifier) {
        setUserId(userIdentifier);
        setRole(res.role);
        setUsername(res.username);
        setIsAuthenticated(true);
        setLastAuthCheck(Date.now());
        return res.role;
      } else {
        console.error('AuthContext: No user ID in response', res);
        setRole(null);
        setUserId(null);
        setUsername(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      console.error('AuthContext: Failed to get role from cookie:', error);
      setRole(null);
      setUserId(null);
      setUsername(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // New method to check auth status before performing actions
  const checkAuthStatus = async (): Promise<boolean> => {
    console.log('AuthContext: Checking auth status before action');
    
    // If recently checked (within last 30 seconds), use cached result
    const timeSinceLastCheck = Date.now() - lastAuthCheck;
    if (isAuthenticated && timeSinceLastCheck < 30000) {
      console.log('AuthContext: Using cached auth status (recent check)');
      return true;
    }
    
    // Otherwise, refresh the auth status
    try {
      const role = await getRoleFromCookie();
      const isAuth = role !== null && userId !== null;
      console.log('AuthContext: Auth check result:', isAuth, 'userId:', userId);
      return isAuth;
    } catch (error) {
      console.error('AuthContext: Auth check failed:', error);
      return false;
    }
  };

  const clearCookie = async () => {
    setIsAuthLoading(true);
    try {
      console.log('AuthContext: Logging out');
      await logoutApi();
      setAuthMessage("Logged out successfully");
    } catch (err) {
      console.error('Logout failed', err);
      setAuthError("Logout failed, please try again");
    } finally {
      setRole(null);
      setUserId(null);
      setUsername(null);
      setIsAuthenticated(false);
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        role,
        username,
        getRoleFromCookie,
        checkAuthStatus,
        clearCookie,
        isLoading,
        isAuthLoading,
        authError,
        authMessage,
        setAuthLoading: setIsAuthLoading,
        setAuthError,
        setAuthMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
