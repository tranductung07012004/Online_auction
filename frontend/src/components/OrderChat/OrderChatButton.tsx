import React, { useState } from "react";
import { Button, Badge } from "@mui/material";
import { Chat as ChatIcon } from "@mui/icons-material";
import OrderChatDialog from "./OrderChatDialog";

interface OrderChatButtonProps {
  orderId: number;
  buyerId: number;
  sellerId: number;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  unreadCount?: number;
}

const OrderChatButton: React.FC<OrderChatButtonProps> = ({
  orderId,
  buyerId,
  sellerId,
  variant = "contained",
  size = "medium",
  fullWidth = false,
  unreadCount = 0,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        }
        onClick={handleOpenDialog}
        sx={{
          textTransform: "none",
          bgcolor: variant === "contained" ? "#C3937C" : "transparent",
          color: variant === "contained" ? "white" : "#C3937C",
          borderColor: "#C3937C",
          "&:hover": {
            bgcolor: variant === "contained" ? "#A67C5A" : "#f5f0eb",
            borderColor: "#A67C5A",
          },
        }}
      >
        Nhắn tin với {buyerId === sellerId ? "người mua" : "người bán"}
      </Button>

      <OrderChatDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        orderId={orderId}
        buyerId={buyerId}
        sellerId={sellerId}
      />
    </>
  );
};

export default OrderChatButton;
