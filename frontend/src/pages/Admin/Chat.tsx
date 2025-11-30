import React from 'react';
import AdminChatPanel from '../../components/AdminChat/AdminChatPanel';
import AdminLayout from './AdminLayout';

const AdminChat: React.FC = () => {
  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="page-title">Customer Support Chat</h1>
        <AdminChatPanel />
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
