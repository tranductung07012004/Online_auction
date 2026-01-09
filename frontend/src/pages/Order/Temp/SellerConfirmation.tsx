import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  AttachMoney,
  Receipt,
  Home,
} from "@mui/icons-material";
import {
  getOrderById,
  confirmPaymentAndShipping,
  getOrderPayment,
  getOrderShipping,
} from "../../../api/order";
import { toast } from "react-hot-toast";
import { OrderPayment, OrderShipping } from "../../../types/order";

interface ProductBasicInfo {
  id: number;
  productName: string;
  thumbnailUrl: string;
  currentPrice: number;
}

interface OrderDetail {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  createdAt: string;
  isCancelled: boolean;
  product: ProductBasicInfo | null;
}

interface SellerConfirmationProps {
  onSuccess?: () => void;
}

export default function SellerConfirmation({
  onSuccess,
}: SellerConfirmationProps) {
  const { id } = useParams<{ id: string }>();
  // navigate less critical here as we shouldn't direct navigate out, but for error handling fallback
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [payment, setPayment] = useState<OrderPayment | null>(null);
  const [shipping, setShipping] = useState<OrderShipping | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [orderData, paymentData, shippingData] = await Promise.all([
          getOrderById(id),
          getOrderPayment(Number(id)).catch(() => null),
          getOrderShipping(Number(id)).catch(() => null),
        ]);

        setOrder(orderData);
        setPayment(paymentData);
        setShipping(shippingData);

        // Check if shipping info exists
        if (!shippingData) {
          setError("Buyer hasn't provided shipping address yet");
        }
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

    fetchData();
  }, [id]);

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
        // Fallback
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#8B7355" }} />
      </Box>
    );
  }

  // Error state can use Alert
  if (error || !order) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || "Order not found"}
      </Alert>
    );
  }

  return (
    <>
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
            Order Processing
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Shipping Address Display */}
          {shipping && (
            <Box
              sx={{
                mb: 4,
                p: 2,
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

          {/* Payment Verification Section */}
          <Box sx={{ mb: 4, p: 2, bgcolor: "#F5F5F5", borderRadius: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Receipt fontSize="small" /> Payment Verification
            </Typography>

            {payment ? (
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {payment.paymentMethod}
                  </Typography>
                </Box>
                {payment.notes && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Buyer's Note:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: "white",
                        p: 1,
                        borderRadius: 1,
                        mt: 0.5,
                        border: "1px solid #eee",
                      }}
                    >
                      {payment.notes}
                    </Typography>
                  </Box>
                )}
                {payment.paymentProofUrl ? (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Payment Proof:
                    </Typography>
                    <Box
                      component="img"
                      src={payment.paymentProofUrl}
                      alt="Payment Proof"
                      onClick={() =>
                        setPreviewImage(payment.paymentProofUrl || null)
                      }
                      sx={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "contain",
                        bgcolor: "white",
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Click to enlarge
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="warning" size="small">
                    No payment proof uploaded yet.
                  </Alert>
                )}
              </Stack>
            ) : (
              <Alert severity="warning">
                Could not load payment information.
              </Alert>
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2C1810", fontWeight: 600, mt: 4 }}
          >
            <LocalShipping sx={{ mr: 1, verticalAlign: "middle" }} />
            Shipping Details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography
                variant="body1"
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
              <Typography variant="caption" color="text.secondary">
                Provide the tracking number from your shipping carrier
              </Typography>
            </Box>

            <Alert severity="info">
              By clicking confirm, you are acknowledging that you have received
              payment and have shipped the item.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
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
                "Confirm Payment & Shipping"
              )}
            </Button>
          </Stack>
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
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
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

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0 }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Full Proof"
              style={{ width: "100%", display: "block" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
