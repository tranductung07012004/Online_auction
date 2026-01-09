import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  ShoppingCart,
  Person,
  AttachMoney,
  CalendarToday,
  LocalShipping,
  Cancel,
  Payment,
} from "@mui/icons-material";
import { getOrderById, updateOrderStatus } from "../../api/order";
import { toast } from "react-hot-toast";

interface ProductBasicInfo {
  id: number;
  productName: string;
  thumbnailUrl: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
}

interface OrderDetail {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  status: string;
  createdAt: string;
  isCancelled: boolean;
  hasShippingAddress: boolean;
  cancelledReason: string | null;
  product: ProductBasicInfo | null;
}

interface OrderDetailProps {
  onProceedToNext: () => void;
}

export default function OrderDetail({ onProceedToNext }: OrderDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error("Error fetching order detail:", err);
        setError(
          err?.response?.data?.message || "Failed to load order details"
        );
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handleSubmit = async () => {
    if (!order) return;

    try {
      // 1. Gọi API để chuyển trạng thái đơn hàng lên CONFIRMED
      await updateOrderStatus(order.id, "CONFIRMED");

      toast.success("Order confirmed!");

      // 2. Thông báo cho cha để fetch lại data và tự chuyển sang Step 1
      onProceedToNext();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to confirm order");
    } finally {
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#8B7355" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 900, width: "100%" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Order not found"}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/order-history")}
            sx={{ color: "#8B7355" }}
          >
            Back to Order History
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box sx={{ maxWidth: 1000, width: "100%" }}>
          {/* Order Status */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ color: "#2C1810" }}>
                  Status:
                </Typography>
                {order.isCancelled ? (
                  <Chip
                    label="Cancelled"
                    color="error"
                    icon={<Cancel />}
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    label={order.hasShippingAddress ? "Shipped" : "Processing"}
                    color={order.hasShippingAddress ? "success" : "warning"}
                    icon={
                      order.hasShippingAddress ? (
                        <LocalShipping />
                      ) : (
                        <ShoppingCart />
                      )
                    }
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                <CalendarToday
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                />
                Created: {formatDate(order.createdAt)}
              </Typography>
            </Box>

            {order.isCancelled && order.cancelledReason && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Cancellation Reason:
                </Typography>
                <Typography variant="body2">{order.cancelledReason}</Typography>
              </Alert>
            )}
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: 3,
            }}
          >
            {/* Product Information */}
            <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
              >
                Product Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {order.product ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Card
                    sx={{
                      width: 200,
                      height: 200,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={order.product.thumbnailUrl || "/placeholder.jpg"}
                      alt={order.product.productName}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Card>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "#2C1810",
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": { color: "#8B7355" },
                      }}
                      onClick={() =>
                        navigate(`/product-page/${order.product?.id}`)
                      }
                    >
                      {order.product.productName}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Start Price:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPrice(order.product.startPrice)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Final Price:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {formatPrice(order.product.currentPrice)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Product ID:
                        </Typography>
                        <Typography variant="body2">
                          #{order.product.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">Product information not available</Alert>
              )}
            </Paper>

            {/* Order Summary */}
            <Box>
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
                >
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Order ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      #{order.id}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <Person
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                      />
                      Buyer ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      #{order.buyerId}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <Person
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                      />
                      Seller ID:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      #{order.sellerId}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#2C1810" }}>
                      Total Amount:
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#8B7355",
                        fontWeight: 700,
                      }}
                    >
                      <AttachMoney
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />
                      {formatPrice(order.amount)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Action Buttons */}
              {!order.isCancelled && (
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      color: "#8B7355",
                      borderColor: "#8B7355",
                      "&:hover": {
                        borderColor: "#6D5940",
                        backgroundColor: "rgba(139, 115, 85, 0.04)",
                      },
                    }}
                    onClick={() => navigate(`/product-page/${order.productId}`)}
                  >
                    View Product
                  </Button>
                </Paper>
              )}
            </Box>
          </Box>

          {!order.isCancelled && order.status === "CREATED" && (
            <Box
              sx={{
                mt: 5,
                mb: 2,
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Payment />}
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "#8B7355",
                  color: "#fff",
                  px: 6,
                  py: 1.5,
                  borderRadius: "30px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(139, 115, 85, 0.3)",
                  "&:hover": {
                    backgroundColor: "#6D5940",
                    boxShadow: "0 6px 16px rgba(139, 115, 85, 0.4)",
                  },
                }}
              >
                Proceed to Payment
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
