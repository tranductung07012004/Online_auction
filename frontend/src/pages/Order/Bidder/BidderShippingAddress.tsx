import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { LocationOn, Payment } from "@mui/icons-material";
import {
  getOrderById,
  updateShippingAddress,
  getOrderShipping,
} from "../../../api/order";
import { OrderShipping } from "../../../types/order";
import { toast } from "react-hot-toast";

interface OrderDetail {
  id: number;
  productId: number;
  amount: number;
  product: {
    id: number;
    productName: string;
    thumbnailUrl: string;
    currentPrice: number;
  } | null;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

interface ShippingAddressProps {
  onSuccess?: () => void;
}

export default function ShippingAddress({ onSuccess }: ShippingAddressProps) {
  const { id } = useParams<{ id: string }>();
  // navigate likely not needed unless error flow redirect
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Separate address fields
  const [country, setCountry] = useState("Vietnam");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);

        // Fetch existing shipping address if available
        try {
          const shippingData: OrderShipping = await getOrderShipping(
            Number(id)
          );
          if (shippingData && shippingData.shippingAddress) {
            // Parse existing address and populate fields
            const addr = shippingData.shippingAddress;
            setAddressLoaded(true);

            // Simple parsing - you may need to adjust based on your address format
            const parts = addr.split(",").map((p) => p.trim());
            if (parts.length >= 4) {
              setStreet(parts[0] || "");
              setWard(parts[1] || "");
              setDistrict(parts[2] || "");
              setCity(parts[3] || "");
              if (parts.length > 4) {
                setCountry(parts[4] || "Vietnam");
              }
              if (parts.length > 5) {
                setAdditionalInfo(parts.slice(5).join(", "));
              }
            }
          }
        } catch (shippingErr: any) {
          // If shipping doesn't exist yet (404), that's okay - leave address empty
          console.log("No existing shipping address found");
        }
      } catch (err: any) {
        console.error("Error fetching order detail:", err);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  const handleSubmit = async () => {
    // Validation - Only Street and City are required
    if (!street.trim()) {
      toast.error("Please enter street address");
      return;
    }
    if (!city.trim()) {
      toast.error("Please enter city");
      return;
    }

    try {
      setSubmitting(true);
      // Combine all fields into one address string
      const fullAddress = [
        street,
        ward,
        district,
        city,
        country,
        additionalInfo,
      ]
        .filter((part) => part.trim())
        .join(", ");

      await updateShippingAddress(Number(id), fullAddress);
      toast.success("Shipping address saved!");

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update address");
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
          minHeight: "40vh", // Reduced height as it's inside a container
        }}
      >
        <CircularProgress sx={{ color: "#8B7355" }} />
      </Box>
    );
  }

  return (
    <>
      {/* Main Content: Address Form - Centered */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 2,
            maxWidth: 1000,
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <LocationOn sx={{ color: "#8B7355", fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#2C1810" }}>
              Shipping Address
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Please enter the precise location where you would like to receive
            your item. The seller will use this information for shipping.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Street Address */}
            <TextField
              fullWidth
              label="Street Address"
              placeholder="e.g., 123 Ly Thuong Kiet Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              disabled={submitting}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
                "& .MuiInputLabel-asterisk": {
                  color: "#f44336",
                },
              }}
            />

            {/* Ward and District - Side by side - Optional */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Ward (Optional)"
                placeholder="e.g., Ward 14"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
                }}
              />
              <TextField
                fullWidth
                label="District (Optional)"
                placeholder="e.g., District 10"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
                }}
              />
            </Box>

            {/* City and Country - Side by side */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="City/Province"
                placeholder="e.g., Ho Chi Minh City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={submitting}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
                  "& .MuiInputLabel-asterisk": {
                    color: "#f44336",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
                }}
              />
            </Box>

            {/* Additional Information */}
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional Information (Optional)"
              placeholder="e.g., Building name, floor, apartment number, delivery notes..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#8B7355" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#8B7355" },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Action Button Area - Standing alone at the bottom */}
      {order && order.status === "CONFIRMED" && (
        <Box
          sx={{
            mt: 6,
            mb: 4,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Payment />
              )
            }
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              backgroundColor: "#8B7355",
              color: "#fff",
              px: 8,
              py: 2,
              borderRadius: "30px",
              fontSize: "1.1rem",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(139, 115, 85, 0.3)",
              "&:hover": {
                backgroundColor: "#6D5940",
                boxShadow: "0 6px 16px rgba(139, 115, 85, 0.4)",
              },
            }}
          >
            {submitting ? "Processing..." : "Confirm & Proceed to Payment"}
          </Button>
        </Box>
      )}
    </>
  );
}
