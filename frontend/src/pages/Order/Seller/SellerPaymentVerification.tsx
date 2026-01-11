import { useState } from "react";
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
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  AttachMoney,
  Receipt,
  Home,
  ZoomIn,
  Warning,
  Cancel,
} from "@mui/icons-material";
import { confirmPaymentAndShipping } from "../../../api/order";
import { toast } from "react-hot-toast";
import { Order, OrderPayment, OrderShipping } from "../../../types/order";
import CancelOrderDialog from "../Components/CancelOrderDialog";

interface SellerPaymentVerificationProps {
  order: Order;
  payment: OrderPayment | null;
  shipping: OrderShipping | null;
  onSuccess?: () => void;
}

export default function SellerPaymentVerification({
  order,
  payment,
  shipping,
  onSuccess,
}: SellerPaymentVerificationProps) {
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleApprovePayment = async () => {
    if (!order) return;

    if (!payment?.paymentProofUrl) {
      toast.error("No payment proof found");
      return;
    }

    try {
      setSubmitting(true);
      // Note: Backend confirmPaymentAndShipping combines both actions
      // For now, we'll use empty tracking number, then seller will update it in next step
      await confirmPaymentAndShipping(order.id, "PENDING_TRACKING");
      toast.success("Payment approved successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Error approving payment:", err);
      toast.error(err?.response?.data?.message || "Failed to approve payment");
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

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Left Column - Payment Verification */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
          >
            <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
            Payment Verification
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

          {/* Payment Details */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <AttachMoney fontSize="small" /> Payment Information
            </Typography>

            {payment ? (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {payment.paymentMethod}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="#8B7355"
                      >
                        {formatPrice(payment.amount)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {payment.buyerPaidAt && (
                  <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted At
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(payment.buyerPaidAt)}
                    </Typography>
                  </Box>
                )}

                {payment.notes && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Buyer's Notes:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: "white",
                        p: 2,
                        borderRadius: 1,
                        mt: 0.5,
                        border: "1px solid #eee",
                      }}
                    >
                      {payment.notes}
                    </Typography>
                  </Box>
                )}

                {/* Payment Proof Image */}
                {payment.paymentProofUrl ? (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      Payment Proof:
                    </Typography>
                    <Card
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: 4,
                          "& .zoom-icon": {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={() =>
                        setPreviewImage(payment.paymentProofUrl || null)
                      }
                    >
                      <CardMedia
                        component="img"
                        image={payment.paymentProofUrl}
                        alt="Payment Proof"
                        sx={{
                          width: "100%",
                          maxHeight: 400,
                          objectFit: "contain",
                          bgcolor: "#f5f5f5",
                          border: "1px solid #ddd",
                        }}
                      />
                      <Box
                        className="zoom-icon"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: 1,
                          p: 1,
                          opacity: 0,
                          transition: "opacity 0.3s",
                        }}
                      >
                        <ZoomIn />
                      </Box>
                    </Card>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Click to view full size
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="warning">
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

          {/* Verification Checklist */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              <Warning sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
              Verification Checklist:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                ✓ Verify the transfer amount matches the order total
              </Typography>
              <Typography variant="body2">
                ✓ Check the payment proof image for authenticity
              </Typography>
              <Typography variant="body2">
                ✓ Confirm payment has been received in your account
              </Typography>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={handleApprovePayment}
              disabled={submitting || !payment?.paymentProofUrl}
              sx={{
                bgcolor: "#8B7355",
                "&:hover": {
                  bgcolor: "#388e3c",
                },
                py: 1.5,
              }}
            >
              {submitting ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Approve Payment & Continue"
              )}
            </Button>

            {/* Cancel Order Button */}
            {!["SHIPPED", "DELIVERED", "REVIEWED", "CANCELLED"].includes(
              order.status
            ) && (
              <Box>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<Cancel />}
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={submitting}
                  sx={{ py: 1.5 }}
                >
                  Cancel Order
                </Button>
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", mt: 0.5, textAlign: "center" }}
                >
                  ⚠️ This action cannot be undone
                </Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
              By approving, you confirm that payment has been received and you
              are ready to ship the item.
            </Alert>
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
      </Box>{" "}
      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, bgcolor: "#000" }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Full Payment Proof"
              style={{ width: "100%", display: "block" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        orderId={order.id}
        userRole="seller"
        orderStatus={order.status}
        onSuccess={onSuccess || (() => window.location.reload())}
      />
    </>
  );
}
