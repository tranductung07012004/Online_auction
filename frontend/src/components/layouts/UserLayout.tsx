import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatWidget from '../ChatWidget/ChatWidget';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  
  return (
    <>
      {children}
      
      {/* Only show chat widget for authenticated users with role 'user' */}
      {isAuthenticated && role === 'user' && <ChatWidget />}
    </>
  );
};

export default UserLayout;
