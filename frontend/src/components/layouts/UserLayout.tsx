import React, { ReactNode } from 'react';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

export default UserLayout;
