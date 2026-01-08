import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stack,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  ContentCopy,
  CloudUpload,
  AccountBalance,
  QrCode2,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  getOrderById,
  uploadPaymentProof,
  getOrderPayment,
} from "../../../api/order";
import { uploadImageToCloudinary } from "../../../api/cloudinary";
import { Order } from "../../../types/order";
import CancelOrderDialog from "../Components/CancelOrderDialog";

interface OrderPaymentProps {
  onSuccess?: () => void;
}

interface PaymentInfo {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentProofUrl: string | null;
  transactionId: string | null;
  vnpayTransactionNo: string | null;
  buyerPaidAt: string | null;
  sellerConfirmedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export default function OrderPayment({ onSuccess }: OrderPaymentProps) {
  const { id } = useParams<{ id: string }>();

  // State quản lý dữ liệu và UI
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // State quản lý phương thức thanh toán và file ảnh
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchOrderAndPayment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Fetch payment info if exists
        try {
          const paymentData = await getOrderPayment(Number(id));
          setPaymentInfo(paymentData);

          // If payment proof already uploaded, set preview
          if (paymentData.paymentProofUrl) {
            setPreviewUrl(paymentData.paymentProofUrl);
          }

          // Set payment method if exists
          if (paymentData.paymentMethod) {
            setPaymentMethod(paymentData.paymentMethod);
          }

          // Set notes if exists
          if (paymentData.notes) {
            setNotes(paymentData.notes);
          }
        } catch (paymentErr) {
          console.log("No payment info found yet");
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndPayment();
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage(`Copied: ${text}`);
  };

  const handleSubmit = async () => {
    if (!order || !selectedFile || !id) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(selectedFile);

      // 2. Submit proof to backend
      await uploadPaymentProof(order.id, imageUrl, paymentMethod, notes);

      setSuccessMessage("Payment proof submitted successfully!");

      // Navigate or reload after delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }, 2000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to submit payment proof.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "40vh",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state can remain independent or lift up.
  if (error && !order) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const orderAmount = order?.amount || 0;

  return (
    <>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
      <Snackbar
        open={!!(error && order)} // Show error snackbar if we are showing the form
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Center the entire payment form */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box sx={{ maxWidth: 1000, width: "100%" }}>
          <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
            {/* Left Side: Payment Options & Instructions */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Payment Method
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Stack spacing={2}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          borderColor:
                            paymentMethod === "BANK_TRANSFER"
                              ? "#8B7355"
                              : "divider",
                          backgroundColor:
                            paymentMethod === "BANK_TRANSFER"
                              ? "rgba(139, 115, 85, 0.04)"
                              : "inherit",
                        }}
                      >
                        <FormControlLabel
                          value="BANK_TRANSFER"
                          control={
                            <Radio
                              sx={{
                                color: "#8B7355",
                                "&.Mui-checked": { color: "#8B7355" },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <AccountBalance sx={{ color: "#8B7355" }} />
                              <Typography fontWeight={600}>
                                Bank Transfer (Manual Confirmation)
                              </Typography>
                            </Box>
                          }
                          sx={{ width: "100%", m: 0 }}
                        />
                      </Paper>

                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          opacity: 0.6,
                          cursor: "not-allowed",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <FormControlLabel
                          value="PAYPAL"
                          disabled
                          control={<Radio />}
                          label="PayPal (Coming Soon)"
                          sx={{ width: "100%", m: 0 }}
                        />
                      </Paper>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Paper>

              {/* Bank Transfer Details Section */}
              {paymentMethod === "BANK_TRANSFER" && (
                <Paper sx={{ p: 3, borderRadius: 2, flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Transfer Details
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Please transfer the exact amount and upload your receipt
                    below.
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            BANK NAME
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              bgcolor: "#f9f9f9",
                              p: 1.5,
                              borderRadius: 1,
                            }}
                          >
                            <Typography fontWeight={600}>
                              Vietcombank (VCB)
                            </Typography>
                            <IconButton
                              onClick={() => copyToClipboard("Vietcombank")}
                              size="small"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ACCOUNT NUMBER
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              bgcolor: "#f9f9f9",
                              p: 1.5,
                              borderRadius: 1,
                            }}
                          >
                            <Typography fontWeight={600} color="#8B7355">
                              1023456789
                            </Typography>
                            <IconButton
                              onClick={() => copyToClipboard("1023456789")}
                              size="small"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            AMOUNT TO PAY
                          </Typography>
                          <Box
                            sx={{ bgcolor: "#f9f9f9", p: 1.5, borderRadius: 1 }}
                          >
                            <Typography
                              fontWeight={700}
                              variant="h6"
                              color="#2C1810"
                            >
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(orderAmount)}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          bgcolor: "#fff",
                        }}
                      >
                        <QrCode2 sx={{ fontSize: 160, color: "#2C1810" }} />
                      </Box>
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        Scan to Pay
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Grid>

            {/* Right Side: Upload Proof & Order Summary */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Stack spacing={3} sx={{ height: "100%" }}>
                {/* Payment Proof Upload */}
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Upload Payment Proof
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Show payment status if proof already uploaded */}
                  {paymentInfo && paymentInfo.paymentProofUrl && (
                    <Alert
                      severity={
                        paymentInfo.paymentStatus === "CONFIRMED"
                          ? "success"
                          : paymentInfo.paymentStatus === "PROOF_UPLOADED"
                          ? "info"
                          : "warning"
                      }
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {paymentInfo.paymentStatus === "CONFIRMED" &&
                          "✓ Payment Confirmed by Seller"}
                        {paymentInfo.paymentStatus === "PROOF_UPLOADED" &&
                          "⏳ Waiting for seller confirmation"}
                        {paymentInfo.paymentStatus === "PENDING" &&
                          "⚠️ Payment proof pending"}
                      </Typography>
                      {paymentInfo.buyerPaidAt && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Submitted on:{" "}
                          {new Date(paymentInfo.buyerPaidAt).toLocaleString()}
                        </Typography>
                      )}
                      {paymentInfo.paymentStatus === "CONFIRMED" &&
                        paymentInfo.sellerConfirmedAt && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            Confirmed on:{" "}
                            {new Date(
                              paymentInfo.sellerConfirmedAt
                            ).toLocaleString()}
                          </Typography>
                        )}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      border: "2px dashed #ddd",
                      borderRadius: 2,
                      p: 4,
                      textAlign: "center",
                      cursor: "pointer",
                      position: "relative",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        borderColor: "#8B7355",
                        bgcolor: "rgba(139, 115, 85, 0.02)",
                      },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      disabled={paymentInfo?.paymentStatus === "CONFIRMED"}
                    />

                    {previewUrl ? (
                      <Box sx={{ width: "100%" }}>
                        <img
                          src={previewUrl}
                          alt="Payment Proof"
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                        />
                        {paymentInfo?.paymentProofUrl ? (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 2, color: "#8B7355", fontWeight: 600 }}
                          >
                            {paymentInfo.paymentStatus === "CONFIRMED"
                              ? "✓ Payment proof submitted and confirmed"
                              : "✓ Payment proof uploaded - Click to change"}
                          </Typography>
                        ) : (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 2, color: "#8B7355", fontWeight: 600 }}
                          >
                            ✓ Image selected - Click to change
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CloudUpload
                          sx={{ fontSize: 64, color: "#bbb", mb: 1 }}
                        />
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="text.primary"
                        >
                          Click or Drag image to upload
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          JPG, PNG or PDF (Max 5MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Notes for Seller"
                    placeholder="Enter transfer content or reference..."
                    multiline
                    rows={2}
                    sx={{ mt: 3 }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={paymentInfo?.paymentStatus === "CONFIRMED"}
                    InputProps={{
                      readOnly: paymentInfo?.paymentStatus === "CONFIRMED",
                    }}
                  />
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {/* Big Action Button */}
          {order && order.status === "ADDRESS_PROVIDED" && (
            <Box sx={{ mt: 6, mb: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                disabled={
                  !selectedFile ||
                  uploading ||
                  paymentInfo?.paymentStatus === "CONFIRMED" ||
                  paymentInfo?.paymentStatus === "PROOF_UPLOADED"
                }
                onClick={handleSubmit}
                startIcon={
                  uploading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <CheckCircle />
                  )
                }
                sx={{
                  backgroundColor: "#8B7355",
                  color: "#fff",
                  px: 10,
                  py: 2,
                  borderRadius: "30px",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(139, 115, 85, 0.3)",
                  "&:hover": {
                    backgroundColor: "#6D5940",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#ccc",
                  },
                }}
              >
                {uploading
                  ? "Submitting..."
                  : paymentInfo?.paymentStatus === "CONFIRMED"
                  ? "Payment Confirmed"
                  : paymentInfo?.paymentStatus === "PROOF_UPLOADED"
                  ? "Proof Already Submitted"
                  : "I Have Transferred - Submit Proof"}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {paymentInfo?.paymentStatus === "CONFIRMED"
                  ? "Your payment has been confirmed by the seller."
                  : paymentInfo?.paymentStatus === "PROOF_UPLOADED"
                  ? "Your payment proof is being verified by the seller."
                  : "Your payment will be verified by the seller within 24 hours."}
              </Typography>

              {/* Cancel Order Button */}
              <Box sx={{ mt: 4, maxWidth: 500, mx: "auto" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<Cancel />}
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={uploading}
                  sx={{
                    py: 2,
                    borderRadius: "30px",
                    textTransform: "none",
                  }}
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
            </Box>
          )}
        </Box>
      </Box>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        orderId={order?.id || 0}
        userRole="buyer"
        orderStatus={order?.status || ""}
        onSuccess={onSuccess || (() => window.location.reload())}
      />
    </>
  );
}
