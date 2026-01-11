import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import OrderChat from "./OrderChat";

interface OrderChatDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  buyerId: number;
  sellerId: number;
}

const OrderChatDialog: React.FC<OrderChatDialogProps> = ({
  open,
  onClose,
  orderId,
  buyerId,
  sellerId,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          height: fullScreen ? "100%" : "700px",
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#C3937C",
          color: "white",
        }}
      >
        <Box />
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              bgcolor: "#A67C5A",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, height: "100%" }}>
        <OrderChat orderId={orderId} buyerId={buyerId} sellerId={sellerId} />
      </DialogContent>
    </Dialog>
  );
};

export default OrderChatDialog;
