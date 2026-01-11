import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { useOrderChat } from "../../hooks/useOrderChat";
import { useAuthStore } from "../../stores/authStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderChatProps {
  orderId: number;
  buyerId: number;
  sellerId: number;
}

const OrderChat: React.FC<OrderChatProps> = ({
  orderId,
  buyerId,
  sellerId,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useAuthStore((state) => state.userId);

  const { messages, sendMessage, isConnected, loading, error } = useOrderChat({
    orderId,
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    sendMessage(inputMessage);
    setInputMessage("");
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const isMyMessage = (senderId: number) => {
    return userId ? senderId === Number(userId) : false;
  };

  const isBuyerMessage = (senderId: number) => senderId === buyerId;

  // Check if user is authenticated
  if (!userId) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <Alert severity="warning">
          Vui lòng đăng nhập để sử dụng chức năng chat
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ height: "600px", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          💬 Chat Đơn Hàng #{orderId}
        </Typography>
        <Chip
          label={isConnected ? "Đã kết nối" : "Mất kết nối"}
          color={isConnected ? "success" : "error"}
          size="small"
          sx={{ bgcolor: isConnected ? "#4caf50" : "#f44336", color: "white" }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => {}} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isMe = isMyMessage(msg.senderId);
            const isBuyer = isBuyerMessage(msg.senderId);

            return (
              <Box
                key={msg.id || index}
                sx={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: isBuyer ? "primary.main" : "secondary.main",
                    width: 36,
                    height: 36,
                  }}
                >
                  {isBuyer ? (
                    <PersonIcon fontSize="small" />
                  ) : (
                    <StoreIcon fontSize="small" />
                  )}
                </Avatar>

                {/* Message Bubble */}
                <Box
                  sx={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Sender Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      mb: 0.5,
                      px: 1,
                    }}
                  >
                    {isBuyer ? "Người mua" : "Người bán"}
                  </Typography>

                  {/* Message Content */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: isMe ? "primary.main" : "white",
                      color: isMe ? "white" : "text.primary",
                      borderRadius: 2,
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                  </Paper>

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                      px: 1,
                    }}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          bgcolor: "white",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
          size="small"
          multiline
          maxRows={3}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!isConnected || !inputMessage.trim()}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&:disabled": {
              bgcolor: "action.disabledBackground",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default OrderChat;
