import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { confirmPaymentReceived } from "../../../api/order";
import toast from "react-hot-toast";
import { OrderPayment } from "../../../types/order";

interface ConfirmPaymentProps {
  orderId: number;
  payment: OrderPayment;
  onSuccess: () => void;
}

const ConfirmPayment: React.FC<ConfirmPaymentProps> = ({
  orderId,
  payment,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmPaymentReceived(orderId, notes);
      toast.success("Payment confirmed successfully!");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: "#8B7355", fontWeight: 600 }}
        >
          Payment Proof Received
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Amount: <strong>${payment.amount.toFixed(2)}</strong>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Payment Method:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {payment.paymentMethod.replace(/_/g, " ")}
          </Typography>

          {payment.notes && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Buyer Notes:
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                {payment.notes}
              </Typography>
            </>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Payment Proof:
          </Typography>
          {payment.paymentProofUrl ? (
            <Box
              component="img"
              src={payment.paymentProofUrl}
              alt="Payment proof"
              sx={{
                maxWidth: "100%",
                maxHeight: 400,
                borderRadius: 2,
                border: "1px solid #ddd",
                cursor: "pointer",
              }}
              onClick={() => window.open(payment.paymentProofUrl, "_blank")}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No proof uploaded
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => setOpen(true)}
          startIcon={<CheckIcon />}
          sx={{
            bgcolor: "#4caf50",
            "&:hover": { bgcolor: "#388e3c" },
            py: 1.5,
          }}
        >
          Confirm Payment Received
        </Button>
      </Paper>

      <Dialog
        open={open}
        onClose={() => !confirming && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please verify that you have received the payment of{" "}
            <strong>${payment.amount.toFixed(2)}</strong> before confirming.
          </Typography>

          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={confirming}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={confirming}
            sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
          >
            {confirming ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Confirming...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmPayment;
