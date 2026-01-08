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
} from "@mui/material";
import {
  HourglassEmpty,
  CheckCircle,
  LocalShipping,
  Payment,
  Home,
} from "@mui/icons-material";
import { Order } from "../../../types/order";

interface SellerWaitingScreenProps {
  order: Order;
  message: string;
  icon?: "payment" | "address" | "confirm";
}

export default function SellerWaitingScreen({
  order,
  message,
  icon = "payment",
}: SellerWaitingScreenProps) {
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

  const getIcon = () => {
    switch (icon) {
      case "payment":
        return <Payment sx={{ fontSize: 64, color: "#8B7355" }} />;
      case "address":
        return <Home sx={{ fontSize: 64, color: "#8B7355" }} />;
      case "confirm":
        return <CheckCircle sx={{ fontSize: 64, color: "#8B7355" }} />;
      default:
        return <HourglassEmpty sx={{ fontSize: 64, color: "#8B7355" }} />;
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap: 3,
      }}
    >
      {/* Left Column - Waiting Message */}
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {getIcon()}

          <Typography variant="h5" fontWeight={600} color="#2C1810">
            {message}
          </Typography>

          <Alert severity="info" sx={{ width: "100%", maxWidth: 500 }}>
            <Typography variant="body2">
              You will be notified once the buyer completes this step. The order
              will automatically move to the next stage.
            </Typography>
          </Alert>

          {/* Timeline */}
          <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CheckCircle sx={{ color: "#4caf50" }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Order Created
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Box>
              </Box>

              {order.status !== "CREATED" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle sx={{ color: "#4caf50" }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Order Confirmed by Buyer
                    </Typography>
                  </Box>
                </Box>
              )}

              {(order.status === "ADDRESS_PROVIDED" ||
                order.status === "PAYMENT_PROOF_UPLOADED" ||
                order.status === "PAYMENT_CONFIRMED") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle sx={{ color: "#4caf50" }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Shipping Address Provided
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <HourglassEmpty sx={{ color: "#ff9800" }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#ff9800">
                    Waiting for Next Step...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
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
            <LocalShipping sx={{ mr: 1, verticalAlign: "middle" }} />
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
                label={order.status}
                size="small"
                color="warning"
                variant="outlined"
              />
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
                Total Amount:
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
