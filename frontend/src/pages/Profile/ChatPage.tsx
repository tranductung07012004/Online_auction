import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Paper } from "@mui/material";
import { Message } from "@mui/icons-material";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Sidebar from "./profile/sidebar";
import ChatList from "../../components/Chat/ChatList";
import { getAllConversations, ChatConversation } from "../../api/chat";
import { useAuthStore } from "../../stores/authStore";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, username } = useAuthStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllConversations();
      setConversations(data);
    } catch (err: any) {
      console.error("Error loading conversations:", err);
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, minHeight: "70vh" }}>
        <Box display="flex" gap={3}>
          {/* Sidebar */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Sidebar activeTab="chat" userName={username || "User"} />
          </Box>

          {/* Main Content */}
          <Box flex={1}>
            <Paper elevation={2} sx={{ p: 3 }}>
              {/* Header */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={3}
                pb={2}
                borderBottom="2px solid"
                borderColor="divider"
              >
                <Message sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Tin nhắn
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý các cuộc trò chuyện của bạn
                  </Typography>
                </Box>
              </Box>

              {/* Chat List */}
              <ChatList
                conversations={conversations}
                loading={loading}
                error={error}
                currentUserId={userId ? Number(userId) : null}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default ChatPage;
