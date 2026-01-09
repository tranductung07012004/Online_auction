import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import { uploadPaymentProof } from "../../../api/order";
import { uploadImageToCloudinary } from "../../../api/cloudinary";
import toast from "react-hot-toast";
import { PaymentMethod } from "../../../types/order";

interface UploadPaymentProofProps {
  orderId: number;
  amount: number;
  onSuccess: () => void;
}

const UploadPaymentProof: React.FC<UploadPaymentProofProps> = ({
  orderId,
  amount,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please select payment proof image");
      return;
    }

    setUploading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(imageFile);

      // Submit payment proof
      await uploadPaymentProof(orderId, imageUrl, paymentMethod, notes);

      toast.success(
        "Payment proof uploaded successfully! Waiting for seller confirmation."
      );
      onSuccess();
    } catch (error: any) {
      console.error("Error uploading payment proof:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload payment proof"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "#8B7355", fontWeight: 600 }}
      >
        Upload Payment Proof
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Amount to pay: <strong>${amount.toFixed(2)}</strong>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            label="Payment Method"
          >
            <MenuItem value={PaymentMethod.BANK_TRANSFER}>
              Bank Transfer
            </MenuItem>
            <MenuItem value={PaymentMethod.PAYPAL}>PayPal</MenuItem>
            <MenuItem value={PaymentMethod.CREDIT_CARD}>Credit Card</MenuItem>
            <MenuItem value={PaymentMethod.COD}>Cash on Delivery</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="payment-proof-upload"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="payment-proof-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ py: 1.5, borderColor: "#8B7355", color: "#8B7355" }}
          >
            Select Payment Proof Image
          </Button>
        </label>
      </Box>

      {imagePreview && (
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <img
            src={imagePreview}
            alt="Payment proof preview"
            style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8 }}
          />
        </Box>
      )}

      <TextField
        label="Notes (Optional)"
        multiline
        rows={3}
        fullWidth
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any notes for the seller..."
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={uploading || !imageFile}
        sx={{
          bgcolor: "#8B7355",
          "&:hover": { bgcolor: "#6d5a43" },
          py: 1.5,
        }}
      >
        {uploading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
            Uploading...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </Button>
    </Paper>
  );
};

export default UploadPaymentProof;
