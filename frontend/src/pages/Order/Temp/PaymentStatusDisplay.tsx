import React from "react";
import {
  Box,
  Chip,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  HourglassEmpty,
  CloudUpload,
  CheckCircle,
  Cancel,
  Replay,
} from "@mui/icons-material";
import { OrderPayment, PaymentStatus } from "../../../types/order";

interface PaymentStatusDisplayProps {
  payment: OrderPayment;
}

const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({
  payment,
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return {
          label: "Pending Payment",
          icon: <HourglassEmpty />,
          color: "warning" as const,
        };
      case PaymentStatus.PROOF_UPLOADED:
        return {
          label: "Proof Uploaded",
          icon: <CloudUpload />,
          color: "info" as const,
        };
      case PaymentStatus.CONFIRMED:
        return {
          label: "Payment Confirmed",
          icon: <CheckCircle />,
          color: "success" as const,
        };
      case PaymentStatus.FAILED:
        return {
          label: "Payment Failed",
          icon: <Cancel />,
          color: "error" as const,
        };
      case PaymentStatus.REFUNDED:
        return {
          label: "Refunded",
          icon: <Replay />,
          color: "default" as const,
        };
      default:
        return {
          label: status,
          icon: <HourglassEmpty />,
          color: "default" as const,
        };
    }
  };

  const statusInfo = getStatusInfo(payment.paymentStatus);

  const getActiveStep = () => {
    switch (payment.paymentStatus) {
      case PaymentStatus.PENDING:
        return 0;
      case PaymentStatus.PROOF_UPLOADED:
        return 1;
      case PaymentStatus.CONFIRMED:
        return 2;
      default:
        return 0;
    }
  };

  const steps = ["Waiting for Payment", "Proof Uploaded", "Payment Confirmed"];

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#8B7355" }}>
          Payment Status
        </Typography>
        <Chip
          icon={statusInfo.icon}
          label={statusInfo.label}
          color={statusInfo.color}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Stepper activeStep={getActiveStep()} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Amount
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            ${payment.amount.toFixed(2)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body1">
            {payment.paymentMethod.replace(/_/g, " ")}
          </Typography>
        </Box>

        {payment.buyerPaidAt && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Buyer Paid At
            </Typography>
            <Typography variant="body2">
              {new Date(payment.buyerPaidAt).toLocaleString()}
            </Typography>
          </Box>
        )}

        {payment.sellerConfirmedAt && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Seller Confirmed At
            </Typography>
            <Typography variant="body2">
              {new Date(payment.sellerConfirmedAt).toLocaleString()}
            </Typography>
          </Box>
        )}

        {payment.transactionId && (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="caption" color="text.secondary">
              Transaction ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {payment.transactionId}
            </Typography>
          </Box>
        )}

        {payment.notes && (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="caption" color="text.secondary">
              Notes
            </Typography>
            <Typography variant="body2">{payment.notes}</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PaymentStatusDisplay;
