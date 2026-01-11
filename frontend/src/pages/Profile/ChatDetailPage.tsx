import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Header from "../../components/header";
import Footer from "../../components/footer";
import OrderChat from "../../components/OrderChat/OrderChat";
import { getOrderById } from "../../api/order";
import { checkChatAccess } from "../../api/chat";
import { useAuthStore } from "../../stores/authStore";
import { Order } from "../../types/order";

const ChatDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!orderId || !userId) {
      navigate("/chat");
      return;
    }

    loadOrderAndCheckAccess();
  }, [orderId, userId, navigate]);

  const loadOrderAndCheckAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check access first
      const access = await checkChatAccess(Number(orderId), Number(userId));
      setHasAccess(access);

      if (!access) {
        setError("Bạn không có quyền truy cập cuộc trò chuyện này");
        return;
      }

      // Load order details
      const orderData = await getOrderById(orderId!);
      setOrder(orderData);
    } catch (err: any) {
      console.error("Error loading chat:", err);
      setError(err.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/chat");
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, minHeight: "70vh" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !order || !hasAccess) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, minHeight: "70vh" }}>
          <Box>
            <IconButton onClick={handleBack} sx={{ mb: 2 }}>
              <ArrowBack />
            </IconButton>
            <Alert severity="error">{error || "Order not found"}</Alert>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: "70vh" }}>
        <Box>
          {/* Back Button */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton
              onClick={handleBack}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Chat Đơn Hàng #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.product?.productName}
              </Typography>
            </Box>
          </Box>

          {/* Chat Component */}
          <Paper elevation={2}>
            <OrderChat
              orderId={order.id}
              buyerId={order.buyerId}
              sellerId={order.sellerId}
            />
          </Paper>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default ChatDetailPage;
