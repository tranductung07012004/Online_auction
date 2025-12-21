import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as logoutApi } from '../api/auth';

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

  useEffect(() => {
    console.log('AuthContext: Initial authentication check');
    // getRoleAPI endpoint has been removed
    setIsLoading(false);
    setIsAuthLoading(false);
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
    // getRoleAPI endpoint has been removed
    console.warn('AuthContext: getRoleFromCookie is no longer available - getRoleAPI endpoint was removed');
    setIsAuthLoading(false);
    return null;
  };

  // New method to check auth status before performing actions
  const checkAuthStatus = async (): Promise<boolean> => {
    console.log('AuthContext: Checking auth status before action');
    // getRoleAPI endpoint has been removed, using cached auth status
    return isAuthenticated && userId !== null;
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
