import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { cancelOrder } from "../../../api/order";
import { toast } from "react-hot-toast";

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  userRole: "buyer" | "seller";
  orderStatus: string;
  onSuccess?: () => void;
}

const BUYER_CANCEL_REASONS = [
  "Changed my mind",
  "Found a better deal elsewhere",
  "Ordered by mistake",
  "Seller not responding",
  "Delivery time too long",
  "Other (please specify)",
];

const SELLER_CANCEL_REASONS = [
  "Item out of stock",
  "Unable to ship to buyer's location",
  "Buyer not responding to messages",
  "Payment verification failed",
  "Product damaged/defective",
  "Other (please specify)",
];

export default function CancelOrderDialog({
  open,
  onClose,
  orderId,
  userRole,
  orderStatus,
  onSuccess,
}: CancelOrderDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons =
    userRole === "buyer" ? BUYER_CANCEL_REASONS : SELLER_CANCEL_REASONS;

  const handleClose = () => {
    if (!submitting) {
      setSelectedReason("");
      setCustomReason("");
      onClose();
    }
  };

  const handleSubmit = async () => {
    let finalReason = selectedReason;

    if (selectedReason === "Other (please specify)") {
      if (!customReason.trim()) {
        toast.error("Please specify the reason for cancellation");
        return;
      }
      finalReason = customReason.trim();
    } else if (!selectedReason) {
      toast.error("Please select a reason for cancellation");
      return;
    }

    try {
      setSubmitting(true);
      await cancelOrder(orderId, finalReason);
      toast.success("Order cancelled successfully");

      handleClose();

      if (onSuccess) {
        onSuccess();
      } else {
        // Reload page after short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if cancellation is allowed based on order status
  const isCancellable = () => {
    const nonCancellableStatuses = [
      "SHIPPED",
      "DELIVERED",
      "REVIEWED",
      "CANCELLED",
    ];
    return !nonCancellableStatuses.includes(orderStatus);
  };

  if (!isCancellable()) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cannot Cancel Order</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            This order cannot be cancelled because it has already been{" "}
            {orderStatus.toLowerCase()}.
            {orderStatus === "SHIPPED" &&
              " Please wait for delivery or contact support."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning sx={{ color: "#f44336" }} />
          <Typography variant="h6" component="span">
            Cancel Order
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            Are you sure you want to cancel this order?
          </Typography>
          <Typography variant="caption">
            This action cannot be undone.{" "}
            {userRole === "buyer" && "Any payment made will be refunded."}
          </Typography>
        </Alert>

        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Please select a reason for cancellation:
          </Typography>

          <RadioGroup
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            {reasons.map((reason) => (
              <FormControlLabel
                key={reason}
                value={reason}
                control={<Radio />}
                label={reason}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.02)",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {selectedReason === "Other (please specify)" && (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Please provide more details..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Please explain why you want to cancel this order"
          />
        )}

        {userRole === "buyer" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Note:</strong> If you've already made a payment, it will
              be processed for refund within 5-7 business days.
            </Typography>
          </Alert>
        )}

        {userRole === "seller" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Note:</strong> The buyer will be notified immediately.
              This may affect your seller rating.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Keep Order
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedReason}
          variant="contained"
          color="error"
          sx={{ minWidth: 100 }}
          startIcon={
            submitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {submitting ? "Cancelling..." : "Cancel Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
