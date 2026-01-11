import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  Stack,
  Divider,
  Card,
  CardMedia,
  LinearProgress,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  AttachMoney,
  HourglassEmpty,
} from "@mui/icons-material";
import { Order, OrderShipping } from "../../../types/order";

interface SellerWaitingForDeliveryProps {
  order: Order;
  shipping: OrderShipping | null;
}

export default function SellerWaitingForDelivery({
  order,
  shipping,
}: SellerWaitingForDeliveryProps) {
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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap: 3,
      }}
    >
      {/* Left Column - Delivery Status */}
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            textAlign: "center",
          }}
        >
          <LocalShipping sx={{ fontSize: 64, color: "#4caf50" }} />

          <Typography variant="h5" fontWeight={600} color="#2C1810">
            Item Shipped Successfully
          </Typography>

          <Alert severity="info" sx={{ width: "100%", maxWidth: 500 }}>
            <Typography variant="body2" fontWeight={600}>
              Waiting for buyer to confirm delivery
            </Typography>
            <Typography variant="caption">
              The buyer will confirm once they receive the item. You'll be
              notified when delivery is confirmed.
            </Typography>
          </Alert>

          {/* Shipping Information */}
          {shipping && (
            <Paper
              variant="outlined"
              sx={{ p: 3, width: "100%", maxWidth: 500, bgcolor: "#fafafa" }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mb: 2, color: "#2C1810" }}
              >
                Shipping Details
              </Typography>

              <Stack spacing={2}>
                {shipping.trackingNumber && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tracking Number:
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ fontFamily: "monospace", color: "#2C1810" }}
                      >
                        {shipping.trackingNumber}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {shipping.shippedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Shipped On:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ mt: 0.5 }}
                    >
                      {formatDate(shipping.shippedAt)}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Shipping Address:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {shipping.shippingAddress}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ textAlign: "center" }}>
                  <Chip
                    label="IN TRANSIT"
                    color="primary"
                    icon={<LocalShipping />}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Right Column - Order Summary */}
      <Box>
        {/* Order Summary */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3, bgcolor: "#fafafa" }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
          >
            <AttachMoney sx={{ mr: 1, verticalAlign: "middle" }} />
            Order Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Order ID:
              </Typography>
              <Chip label={`#${order.id}`} size="small" />
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                bgcolor: "#8B7355",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                Total Paid:
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {formatPrice(order.amount)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Product Info */}
        {order.product && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
            >
              Product Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Card
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
              onClick={() => navigate(`/product-page/${order.product?.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={order.product.thumbnailUrl || "/placeholder.jpg"}
                alt={order.product.productName}
                sx={{ objectFit: "cover" }}
              />
            </Card>

            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              {order.product.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Final Price: {formatPrice(order.product.currentPrice)}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
