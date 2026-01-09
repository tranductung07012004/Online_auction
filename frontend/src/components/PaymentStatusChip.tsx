import React from "react";
import { Chip } from "@mui/material";
import {
  HourglassEmpty,
  CloudUpload,
  CheckCircle,
  Cancel,
  Replay,
} from "@mui/icons-material";
import { PaymentStatus } from "../types/order";

interface PaymentStatusChipProps {
  status: string;
  size?: "small" | "medium";
}

const PaymentStatusChip: React.FC<PaymentStatusChipProps> = ({
  status,
  size = "small",
}) => {
  const getStatusConfig = () => {
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
          label: "Paid",
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

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
};

export default PaymentStatusChip;
