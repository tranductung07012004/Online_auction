import React from 'react';
import { Navigate } from 'react-router-dom';

interface AuthenticatedRouteProps {
  isAuthenticated: boolean;
  redirectedPath?: string;
  children: React.ReactNode;
}
const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  isAuthenticated,
  redirectedPath = '/signin',
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectedPath} replace/>;
  }
  return children;
} 
export default AuthenticatedRoute;
