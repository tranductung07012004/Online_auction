import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Store as StoreIcon, Person as PersonIcon } from "@mui/icons-material";
import { ChatConversation } from "../../api/chat";

interface ChatListProps {
  conversations: ChatConversation[];
  loading: boolean;
  error: string | null;
  currentUserId: number | null;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  loading,
  error,
  currentUserId,
}) => {
  const navigate = useNavigate();

  const handleConversationClick = (orderId: number) => {
    navigate(`/chat/${orderId}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        p={3}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có cuộc trò chuyện nào
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Các cuộc trò chuyện với người mua/bán sẽ xuất hiện ở đây
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {conversations.map((conversation, index) => {
        const isSeller = conversation.otherUserId !== currentUserId;

        return (
          <React.Fragment key={conversation.orderId}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "translateX(4px)",
                },
              }}
              onClick={() => handleConversationClick(conversation.orderId)}
            >
              <Box display="flex" alignItems="center" gap={2}>
                {/* Product Image */}
                <Avatar
                  src={conversation.productThumbnail}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />

                {/* Chat Info */}
                <Box flex={1} minWidth={0}>
                  {/* Product Name */}
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      noWrap
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {conversation.productName}
                    </Typography>
                  </Box>

                  {/* Other User */}
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: isSeller ? "secondary.main" : "primary.main",
                      }}
                    >
                      {isSeller ? (
                        <StoreIcon sx={{ fontSize: 12 }} />
                      ) : (
                        <PersonIcon sx={{ fontSize: 12 }} />
                      )}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {conversation.otherUserName}
                    </Typography>
                  </Box>

                  {/* Order Info */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      #ORDER-{conversation.orderId}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: "action.selected",
                      }}
                    >
                      {conversation.orderStatus}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {index < conversations.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default ChatList;
