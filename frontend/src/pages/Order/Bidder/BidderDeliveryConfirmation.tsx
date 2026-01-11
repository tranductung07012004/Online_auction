import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle,
  AttachMoney,
  LocalShipping,
  Inventory,
  HourglassEmpty,
} from "@mui/icons-material";
import {
  getOrderById,
  confirmDelivery,
  getOrderShipping,
} from "../../../api/order";
import { toast } from "react-hot-toast";

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
  hasShippingAddress: boolean;
  product: ProductBasicInfo | null;
}

interface ShippingInfo {
  id: number;
  orderId: number;
  shippingAddress: string;
  shippedAt: string;
  deliveryStatus: number;
  trackingNumber?: string;
}

interface BuyerDeliveryConfirmationProps {
  onSuccess?: () => void;
}

export default function BuyerDeliveryConfirmation({
  onSuccess,
}: BuyerDeliveryConfirmationProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Fetch shipping info
        try {
          const shippingData = await getOrderShipping(Number(id));
          setShipping(shippingData);
        } catch (err) {
          console.log("Shipping info not found or error:", err);
          // It's possible shipping info doesn't exist yet if seller hasn't confirmed
          setShipping(null);
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

    fetchOrderDetail();
  }, [id]);

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      setSubmitting(true);
      await confirmDelivery(order.id);
      toast.success("Delivery confirmed successfully!");
      setConfirmDialog(false);

      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Error confirming delivery:", err);
      toast.error(err?.response?.data?.message || "Failed to confirm delivery");
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
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#8B7355" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || "Order not found"}
      </Alert>
    );
  }

  // Check if seller has shipped yet
  const isShipped = shipping && shipping.trackingNumber;

  if (!isShipped) {
    // Return "Wait" status content only, wrapper handled by parent
    return (
      <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
        <HourglassEmpty
          sx={{ fontSize: 80, color: "#8B7355", mb: 2, opacity: 0.5 }}
        />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Waiting for Shipment
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto", mb: 3 }}
        >
          You have submitted your payment proof. The seller preparing your item
          for shipment.
          <br />
          Once confirmed, you will see the shipping details here.
        </Typography>
        <Chip label="Status: Preparing Shipment" color="warning" />
      </Paper>
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
        {/* Left Column - Delivery Confirmation */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
          >
            <Inventory sx={{ mr: 1, verticalAlign: "middle" }} />
            Delivery Confirmation
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Alert severity="info" sx={{ mb: 3 }}>
            Please confirm that you have received your item in good condition.
          </Alert>

          <Stack spacing={3}>
            {/* Shipping Status */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                <LocalShipping sx={{ mr: 1, verticalAlign: "middle" }} />
                Shipping Information
              </Typography>

              {shipping ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Number:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {shipping.trackingNumber || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Shipped At:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(shipping.shippedAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Status:
                    </Typography>
                    <Chip
                      label={
                        shipping.deliveryStatus === 1
                          ? "Delivered"
                          : "In Transit"
                      }
                      color={
                        shipping.deliveryStatus === 1 ? "success" : "warning"
                      }
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Shipping Address:
                    </Typography>
                    <Typography variant="body1">
                      {shipping.shippingAddress}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Alert severity="warning">
                  Shipping information not available
                </Alert>
              )}
            </Paper>

            {/* Confirm Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={() => setConfirmDialog(true)}
              disabled={submitting}
              sx={{
                bgcolor: "#4caf50",
                "&:hover": {
                  bgcolor: "#388e3c",
                },
                py: 1.5,
                mt: 2,
              }}
            >
              Confirm Delivery Received
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => !submitting && setConfirmDialog(false)}
      >
        <DialogTitle>Confirm Delivery Received?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you have received your item in good condition? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelivery}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#4caf50",
              "&:hover": {
                bgcolor: "#388e3c",
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
