import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Paper } from "@mui/material";
import { Chat as ChatIcon } from "@mui/icons-material";
import Header from "../../components/header";
import Footer from "../../components/footer";
import ProfileSidebar from "./profile/sidebar";
import ChatList from "../../components/Chat/ChatList";
import { getAllConversations, ChatConversation } from "../../api/chat";
import { useAuthStore } from "../../stores/authStore";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, username } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/signin");
      return;
    }

    loadConversations();
  }, [userId, navigate]);

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
      <Container maxWidth="lg" sx={{ py: 4, minHeight: "70vh" }}>
        <Box display="flex" gap={3}>
          {/* Sidebar */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <ProfileSidebar
              activeTab="chat"
              userName={username || ""}
              userImage=""
            />
          </Box>

          {/* Main Content */}
          <Box flex={1}>
            <Paper elevation={2} sx={{ overflow: "hidden", borderRadius: 2 }}>
              {/* Header */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#C3937C",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <ChatIcon sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Tin nhắn
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    {conversations.length} cuộc trò chuyện
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
