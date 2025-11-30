import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminChatPanel.css';
import { io, Socket } from 'socket.io-client';

interface User {
  userId: string;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  senderRole: string;
  createdAt: string;
  updatedAt: string;
}

const AdminChatPanel: React.FC = () => {
  const { userId, role } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId || role !== 'admin') return;

    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected');
      setIsConnected(true);
      
      // Register as admin
      newSocket.emit('register', { 
        userId: userId, 
        role: 'admin' 
      });

      // Get list of users with conversations
      refreshConversations();
    });
    
    // Function to refresh conversations list
    const refreshConversations = () => {
      console.log('Refreshing conversations list');
      
      // Call API with credentials to send cookie instead of token
      fetch('http://localhost:3000/api/chat/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched conversations:', data);
        if (data.success && data.conversations) {
          if (data.conversations.length === 0) {
            console.log('No conversations returned from API');
          } else {
            console.log('Setting users with:', data.conversations.length, 'conversations');
            setUsers(data.conversations);
            
            // If we have a selectedUser, make sure it's still in the list
            if (selectedUser) {
              const stillExists = data.conversations.some((u: User) => u.userId === selectedUser.userId);
              if (!stillExists) {
                console.log('Selected user no longer in list, clearing selection');
                setSelectedUser(null);
                setMessages([]);
              }
            }
          }
        } else {
          console.error('Invalid response format or no conversations:', data);
        }
      })
      .catch(err => console.error('Error fetching conversations:', err));
    };

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Admin received new message:', message);
      
      // If message is from or to the currently selected user, add it to messages
      if (selectedUser && 
          (message.senderId === selectedUser.userId || 
           message.receiverId === selectedUser.userId || 
           message.receiverId === null)) {
        
        // Skip messages sent by the current admin user (we've already added these in handleSendMessage)
        if (message.senderId === userId && message.senderRole === 'admin') {
          console.log('Skipping duplicate admin message:', message._id);
          return;
        }
        
        setMessages(prev => {
          // Check if this message already exists in our state
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) {
            console.log('Message already exists, not adding duplicate:', message._id);
            return prev;
          }
          
          // Add message and remove any duplicates
          return removeDuplicateMessages([...prev, message]);
        });
        
        // Mark message as read if it's to the admin
        if ((message.receiverId === userId || message.receiverId === null) && !message.isRead) {
          newSocket.emit('markAsRead', { messageId: message._id });
        }
      }
      
      // Update preloaded conversations when a new message arrives
      setPreloadedConversations(prev => {
        const updated = {...prev};
        let targetUserId = '';
        
        if (message.senderRole === 'user') {
          targetUserId = message.senderId;
        } else {
          targetUserId = message.receiverId;
        }
        
        if (targetUserId && updated[targetUserId]) {
          updated[targetUserId] = removeDuplicateMessages([...updated[targetUserId], message]);
        }
        
        return updated;
      });
      
      // Always refresh the conversation list when a new message arrives
      refreshConversations();
      
      // Update user list to show new message
      setUsers(prev => {
        const updatedUsers = [...prev];
        
        // Determine the user ID to find in the list
        let targetUserId = '';
        if (message.senderRole === 'user') {
          targetUserId = message.senderId;
        } else {
          targetUserId = message.receiverId;
        }
        
        // Update the relevant user if found
        const userIndex = updatedUsers.findIndex(u => u.userId === targetUserId);
        
        if (userIndex !== -1) {
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            lastMessage: message.message,
            lastMessageTime: message.createdAt,
            unreadCount: selectedUser && selectedUser.userId === updatedUsers[userIndex].userId
              ? 0
              : updatedUsers[userIndex].unreadCount + (message.senderRole === 'user' ? 1 : 0)
          };
        } else if (message.senderRole === 'user') {
          // User not in list but should be - add them
          console.log('Adding new user to list:', message.senderId);
          updatedUsers.push({
            userId: message.senderId,
            name: 'User ' + message.senderId.substring(0, 5),
            email: 'user@example.com',
            lastMessage: message.message,
            lastMessageTime: message.createdAt,
            unreadCount: 1
          });
        }
        
        // Sort by most recent message
        return updatedUsers.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, role, selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Debug log số lượng tin nhắn hiện tại
    console.log(`Messages updated, now showing ${messages.length} messages`);
    if (messages.length > 0) {
      console.log('First message:', messages[0].message);
      console.log('Last message:', messages[messages.length - 1].message);
    }
  }, [messages]);

  // Store for preloaded conversations
  const [preloadedConversations, setPreloadedConversations] = useState<{[key: string]: Message[]}>({});

  // Preload conversations for all users
  useEffect(() => {
    if (!socket || !users.length) return;
    
    // Preload conversations for all users in the background
    users.forEach(user => {
      if (!preloadedConversations[user.userId]) {
        console.log('Preloading conversation for user:', user.userId);
        socket.emit('getConversation', { userId: user.userId }, (response: any) => {
          if (response.status === 'success' && Array.isArray(response.data)) {
            console.log('Preloaded conversation for user:', user.userId, 'with', response.data.length, 'messages');
            setPreloadedConversations(prev => ({
              ...prev,
              [user.userId]: response.data
            }));
          }
        });
      }
    });
  }, [socket, users, preloadedConversations]);

  // Load conversation when selecting a user
  const handleSelectUser = (user: User) => {
    console.log('Selected user:', user);
    setSelectedUser(user);
    
    // Reset unread count for this user
    setUsers(prev => prev.map((u: User) => 
      u.userId === user.userId 
        ? { ...u, unreadCount: 0 }
        : u
    ));
    
    // First check if we have preloaded messages for this user
    if (preloadedConversations[user.userId]) {
      console.log('Using preloaded conversation for user:', user.userId);
      setMessages(preloadedConversations[user.userId]);
      
      // Mark messages as read
      preloadedConversations[user.userId].forEach((msg: Message) => {
        if ((msg.receiverId === userId || msg.receiverId === null) && !msg.isRead && socket) {
          socket.emit('markAsRead', { messageId: msg._id });
        }
      });
    } else {
      // If not preloaded, fetch them right now
      if (socket) {
        console.log('Fetching conversation for user:', user.userId);
        
        // Show loading indicator but don't clear existing messages immediately
        // Instead of setMessages([]) which creates a flash of empty content
        
        console.log('Loading conversation for selected user:', user.userId);
        socket.emit('getConversation', { userId: user.userId }, (response: any) => {
          console.log('Conversation response for user:', user.userId);
          
          if (response.status === 'success' && Array.isArray(response.data)) {
            console.log('Conversation loaded via socket:', response.data.length, 'messages');
            
            // Save to preloaded conversations for future use
            setPreloadedConversations(prev => ({
              ...prev,
              [user.userId]: response.data
            }));
            
            // Show messages
            setMessages(response.data);
            
            // Mark messages as read
            response.data.forEach((msg: Message) => {
              if ((msg.receiverId === userId || msg.receiverId === null) && !msg.isRead) {
                socket.emit('markAsRead', { messageId: msg._id });
              }
            });
          } else {
            console.error('Response data is not an array:', response.data);
            setMessages([]);
          }
        });
      } else {
        console.error('Socket not connected');
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !socket || !selectedUser || !userId) return;

    console.log('Admin sending message to:', selectedUser.userId);
    const messageData = {
      senderId: userId,
      receiverId: selectedUser.userId,
      message: newMessage,
      senderRole: 'admin',
    };
    
    // Create a temporary message with a unique ID for immediate display
    const tempId = 'temp_' + Date.now().toString();
    const tempMsg: Message = {
      _id: tempId,
      senderId: userId || '',
      receiverId: selectedUser.userId,
      message: newMessage,
      isRead: false,
      senderRole: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Immediately add the message to UI for better UX
    setMessages(prev => removeDuplicateMessages([...prev, tempMsg]));
    
    // Send message to server
    socket.emit('sendMessage', messageData, (response: any) => {
      console.log('Send message response:', response);
      if (response.status === 'success') {
        // Replace temporary message with the actual one from server
        const actualMsg = response.data;
        
        // Store the real message ID for tracking
        const realMessageId = actualMsg._id;
        console.log(`Message sent successfully: ${tempId} -> ${realMessageId}`);
        
        setMessages(prev => {
          // First remove any messages with the same real ID (avoid duplicates)
          const filteredMessages = prev.filter(msg => 
            msg._id !== realMessageId && msg._id !== tempId
          );
          
          // Then add the actual message
          return removeDuplicateMessages([...filteredMessages, actualMsg]);
        });
        
        // Update preloaded conversation
        setPreloadedConversations(prev => {
          const updated = {...prev};
          if (updated[selectedUser.userId]) {
            // Remove both temp message and any duplicates of the real message
            const filteredConvo = updated[selectedUser.userId].filter(msg => 
              msg._id !== realMessageId && msg._id !== tempId
            );
            // Add actual message
            updated[selectedUser.userId] = [...filteredConvo, actualMsg];
          }
          return updated;
        });
        
        // Also update the user's last message in the sidebar
        setUsers(prev => prev.map((u: User) => 
          u.userId === selectedUser.userId ? {
            ...u,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString()
          } : u
        ));
      } else {
        console.error('Failed to send message:', response);
        // Remove the temporary message since it failed
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    });
    
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If less than 7 days, show day of week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Function to remove duplicate messages and sort by time
  const removeDuplicateMessages = (messages: Message[]): Message[] => {
    // Improved deduplication that prioritizes server messages over temporary ones
    const messageMap = new Map<string, Message>();
    
    // First process all non-temporary messages
    messages.forEach(message => {
      // Skip temporary messages in this first pass
      if (!message._id.startsWith('temp_')) {
        // If we already have this message, don't replace it
        if (!messageMap.has(message._id)) {
          messageMap.set(message._id, message);
        }
      }
    });
    
    // Now process temporary messages, but only add them if we don't have a real version
    messages.forEach(message => {
      if (message._id.startsWith('temp_')) {
        // Check if we already have a real version of this message
        const hasRealMessage = Array.from(messageMap.values()).some(msg => 
          msg.senderId === message.senderId && 
          msg.message === message.message && 
          Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
        );
        
        if (!hasRealMessage) {
          messageMap.set(message._id, message);
        }
      }
    });
    
    // Convert to array and sort by creation time
    const uniqueMessages = Array.from(messageMap.values());
    
    // Sort messages by creation time
    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };
  
  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Conversations</h2>
        </div>
        <div className="admin-chat-users">
          {users.length === 0 ? (
            <div className="admin-chat-no-users">No active conversations</div>
          ) : (
            users.map((user) => (
              <div 
                key={user.userId}
                className={`admin-chat-user ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="admin-chat-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-chat-user-info">
                  <div className="admin-chat-user-name">{user.name}</div>
                  <div className="admin-chat-user-last-message">{user.lastMessage}</div>
                </div>
                <div className="admin-chat-user-meta">
                  <div className="admin-chat-user-time">{formatLastMessageTime(user.lastMessageTime)}</div>
                  {user.unreadCount > 0 && (
                    <div className="admin-chat-user-unread">{user.unreadCount}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="admin-chat-main">
        {selectedUser ? (
          <>
            <div className="admin-chat-header">
              <div className="admin-chat-header-user">
                <div className="admin-chat-header-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-chat-header-info">
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <div className="admin-chat-header-actions">
                {/* Add actions like calling or viewing user profile */}
              </div>
            </div>
            
            <div className="admin-chat-messages">
              {messages.length === 0 ? (
                <div className="admin-chat-no-messages">
                  <p>No messages yet. Start the conversation!</p>
                  <div className="debug-info" style={{fontSize: '10px', color: '#888', textAlign: 'left', overflowWrap: 'break-word'}}>
                    <p><strong>Debug Info:</strong></p>
                    <p>MessagesCount: {messages.length}</p>
                    <p>SelectedUser: {selectedUser?.userId}</p>
                    <p>Admin ID: {userId}</p>
                    <p>Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
                    <button 
                      onClick={() => {
                        if (selectedUser) {
                          console.log('Manual refresh for:', selectedUser.userId);
                          // Tải lại tin nhắn từ server - Dùng cùng tham số với handleSelectUser
                          socket?.emit('getConversation', { userId: selectedUser.userId }, (response: any) => {
                            console.log('Manual refresh response:', response);
                            if (response.status === 'success' && Array.isArray(response.data)) {
                              // Hiển thị trực tiếp tin nhắn gốc không qua xử lý
                              setMessages(response.data);
                              
                              // Also update preloaded conversations
                              setPreloadedConversations(prev => ({
                                ...prev,
                                [selectedUser.userId]: response.data
                              }));
                              
                              console.log('Manually refreshed. New message count:', response.data.length);
                              
                              // Hiển thị thông tin về tin nhắn được tải
                              response.data.forEach((msg: any, idx: number) => {
                                console.log(`Refreshed msg ${idx}: ${msg.message} | From: ${msg.senderId} to: ${msg.receiverId || 'ADMIN'}`);
                              });
                            }
                          });
                        }
                      }}
                      style={{marginTop: '10px', padding: '3px 8px', fontSize: '11px'}}
                    >
                      Refresh Conversation
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  // Debug log cho mỗi tin nhắn được hiển thị
                  console.log(`Rendering message: ${msg.message}, from: ${msg.senderId}, to: ${msg.receiverId || 'ADMIN'}`);
                  
                  return (
                    <div
                      key={msg._id}
                      className={`admin-chat-message ${
                        msg.senderRole === 'admin' ? 'sent' : 'received'
                      }`}
                    >
                      <div className="admin-chat-message-content">
                        <p>{msg.message}</p>
                        <span className="admin-chat-message-time">{formatTimestamp(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form className="admin-chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              <button type="submit" disabled={!isConnected || newMessage.trim() === ''}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="admin-chat-select-prompt">
            <div>
              <i className="fas fa-comments admin-chat-large-icon"></i>
              <h2>Select a conversation</h2>
              <p>Choose a customer from the list to start chatting</p>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="admin-chat-connection-status">
            <p>Connecting to chat server...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;
