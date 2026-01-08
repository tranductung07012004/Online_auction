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

          {/* Progress Timeline */}
          <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 2, textAlign: "left" }}
            >
              Order Progress
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CheckCircle sx={{ color: "#4caf50" }} />
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography variant="body2" fontWeight={600}>
                    Payment Confirmed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payment verified and accepted
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CheckCircle sx={{ color: "#4caf50" }} />
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography variant="body2" fontWeight={600}>
                    Item Shipped
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {shipping?.shippedAt
                      ? formatDate(shipping.shippedAt)
                      : "Just now"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <HourglassEmpty sx={{ color: "#ff9800" }} />
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography variant="body2" fontWeight={600} color="#ff9800">
                    Awaiting Delivery Confirmation
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Buyer will confirm upon receipt
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#4caf50",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block", textAlign: "center" }}
                >
                  75% Complete
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Info Alert */}
          <Alert severity="success" sx={{ width: "100%", maxWidth: 500 }}>
            <Typography variant="body2">
              <strong>Good job!</strong> The item is on its way. Funds will be
              released to you once the buyer confirms delivery.
            </Typography>
          </Alert>
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

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label="SHIPPED"
                size="small"
                color="primary"
                icon={<LocalShipping />}
              />
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                bgcolor: "#4caf50",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "white" }}>
                Amount (On Hold):
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

            <Alert severity="info" icon={false} sx={{ fontSize: "0.75rem" }}>
              Funds will be released after buyer confirms delivery
            </Alert>
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
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={order.product?.thumbnailUrl || "/placeholder.jpg"}
                alt={order.product?.productName || "Product"}
                sx={{ objectFit: "cover" }}
              />
            </Card>

            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
              {order.product?.productName || "Unknown Product"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Final Price:{" "}
              {formatPrice(order.product?.currentPrice || order.amount)}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
