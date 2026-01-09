import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  AttachMoney,
  Home,
  Inventory,
} from "@mui/icons-material";
import { confirmPaymentAndShipping } from "../../../api/order";
import { toast } from "react-hot-toast";
import { Order, OrderShipping } from "../../../types/order";

interface SellerShippingProps {
  order: Order;
  shipping: OrderShipping | null;
  onSuccess?: () => void;
}

export default function SellerShipping({
  order,
  shipping,
  onSuccess,
}: SellerShippingProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmShipping = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter tracking number");
      return;
    }

    if (!order) return;

    try {
      setSubmitting(true);
      await confirmPaymentAndShipping(order.id, trackingNumber);
      toast.success("Shipping confirmed successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Error confirming shipping:", err);
      toast.error(err?.response?.data?.message || "Failed to confirm shipping");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap: 3,
      }}
    >
      {/* Left Column - Shipping Form */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
        >
          <LocalShipping sx={{ mr: 1, verticalAlign: "middle" }} />
          Shipping Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Payment Confirmed Badge */}
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          <Typography variant="body2" fontWeight={600}>
            ✓ Payment Confirmed
          </Typography>
          <Typography variant="caption">
            Payment has been verified. You can now ship the item.
          </Typography>
        </Alert>

        {/* Shipping Address Display */}
        {shipping && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#ecf3f4",
              borderRadius: 2,
              border: "1px solid #c0dadd",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#006064",
              }}
            >
              <Home fontSize="small" /> Ship To:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {shipping.shippingAddress}
            </Typography>
          </Box>
        )}

        {/* Shipping Form */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Inventory fontSize="small" /> Package Information
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: "#2C1810" }}
              >
                Tracking Number *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter shipping tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                variant="outlined"
                helperText="Provide the tracking number from your shipping carrier (e.g., FedEx, UPS, DHL)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#8B7355",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8B7355",
                    },
                  },
                }}
              />
            </Box>

            {/* Instructions */}
            <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Shipping Instructions:
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  • Package the item securely to prevent damage
                </Typography>
                <Typography variant="body2">
                  • Use a reliable shipping carrier
                </Typography>
                <Typography variant="body2">
                  • Keep the shipping receipt for your records
                </Typography>
                <Typography variant="body2">
                  • Enter the tracking number to allow buyer to track shipment
                </Typography>
              </Stack>
            </Box>

            <Alert severity="info">
              By confirming shipping, you acknowledge that the item has been
              packaged and handed over to the carrier.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LocalShipping />}
              onClick={handleConfirmShipping}
              disabled={submitting || !trackingNumber.trim()}
              sx={{
                bgcolor: "#4caf50",
                "&:hover": {
                  bgcolor: "#388e3c",
                },
                py: 1.5,
                mt: 2,
              }}
            >
              {submitting ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Confirm Shipping"
              )}
            </Button>
          </Stack>
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
                Payment Status:
              </Typography>
              <Chip
                label="CONFIRMED"
                size="small"
                color="success"
                icon={<CheckCircle />}
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
