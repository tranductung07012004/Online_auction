import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    unreadCount,
    isChatOpen, 
    toggleChat,
    isConnected,
    markAsRead
  } = useChatContext();
  const { userId, role } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !userId) return;

    // In a real app, we'd have the admin's ID, here we're just using an empty string
    // which our backend will handle appropriately
    sendMessage(newMessage);
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button with notification badge */}
      <div className="chat-button" onClick={toggleChat}>
        <i className="fas fa-comments"></i>
        {unreadCount > 0 && <span className="chat-notification">{unreadCount}</span>}
      </div>

      {/* Chat window */}
      {isChatOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>Chat with {role === 'admin' ? 'Customer' : 'Support'}</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`chat-message ${
                    msg.senderRole === 'user' ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-content">
                    <p>{msg.message}</p>
                    <span className="message-time">{formatTimestamp(msg.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
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

          {!isConnected && (
            <div className="connection-status">
              <p>Connecting...</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
