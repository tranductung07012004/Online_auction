import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createAutoBid } from '../../../api/bidderManagement';

interface BidDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (bidAmount: number) => void;
  currentPrice: number;
  minimumBidStep: number;
  productId: string | number;
}

type BidResult = 'success' | 'pending' | 'failed' | null;

export default function BidDialog({
  open,
  onClose,
  onConfirm,
  currentPrice,
  minimumBidStep,
  productId,
}: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidResult, setBidResult] = useState<BidResult>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate suggested bid amount
  const suggestedAmount = currentPrice + minimumBidStep;

  // Initialize bid amount when dialog opens
  useEffect(() => {
    if (open) {
      setBidAmount(suggestedAmount.toString());
      setBidResult(null);
    }
  }, [open, suggestedAmount]);

  const handleConfirm = async () => {
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= currentPrice) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to create auto bid
      await createAutoBid({
        productId: typeof productId === 'string' ? parseInt(productId, 10) : productId,
        maxPrice: amount,
      });

      // Success
      setBidResult('success');
      onConfirm(amount); // Update price immediately
    } catch (error: any) {
      console.error('Error creating auto bid:', error);
      
      // Handle error based on status code or error message
      const errorMessage = error.response?.data?.message || 'Không thể đấu giá. Vui lòng thử lại.';
      toast.error(errorMessage);
      
      // Set result based on error (you can customize this based on error codes)
      if (error.response?.status === 400) {
        // Validation error or business logic error
        setBidResult('failed');
      } else {
        // Other errors
        setBidResult('failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBidAmount('');
    setBidResult(null);
    setIsSubmitting(false);
    onClose();
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isBidValid = () => {
    const amount = parseFloat(bidAmount);
    return !isNaN(amount) && amount > currentPrice;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ color: '#e79846', fontWeight: 600 }}>
        Place you bid
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {bidResult === null ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: '#666666' }}>
                Current price: <strong>{formatPrice(currentPrice)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#666666' }}>
                Minimum bid step: <strong>{formatPrice(minimumBidStep)}</strong>
              </Typography>

              <Typography variant="body2" sx={{ mb: 1, color: '#333333', fontWeight: 500 }}>
                Max price that you should afford:
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, color: '#e89b3e', fontWeight: 600 }}>
                {formatPrice(suggestedAmount)}
              </Typography>

              <TextField
                fullWidth
                label="Place the max price that you can afford here"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#a67c66',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a67c66',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused': {
                    backgroundColor: '#f8f3f0',
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
                helperText={
                  !isBidValid() && bidAmount !== ''
                    ? `Price must be at least ${formatPrice(currentPrice + minimumBidStep)}`
                    : ''
                }
                error={!isBidValid() && bidAmount !== ''}
                InputProps={{
                  inputProps: {
                    min: currentPrice + 1,
                    step: 1000,
                  },
                }}
              />
            </>
          ) : (
            <Box sx={{ py: 2 }}>
              {bidResult === 'success' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Placed bid successfully!
                  </Typography>
                  <Typography variant="body2">
                    You are the winner with the price of{formatPrice(parseFloat(bidAmount))}.
                    Because it is more than buy now price
                  </Typography>
                </Alert>
              )}

              {bidResult === 'pending' && (
                <Alert severity="info" sx={{
                  mb: 2,
                  backgroundColor: '#f8f3f0',
                  color: '#5a3e32',

                  '& .MuiAlert-icon': {
                    color: '#a67c66',
                  },

                  border: '1px solid #a67c66',
                  borderRadius: '8px',
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Đấu giá cần chờ xử lý
                  </Typography>
                  <Typography variant="body2">
                    Bạn chưa từng đấu giá trước đây. Yêu cầu của bạn đang được xem xét.
                  </Typography>
                </Alert>
              )}

              {bidResult === 'failed' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Đấu giá thất bại
                  </Typography>
                  <Typography variant="body2">
                    Điểm đánh giá của bạn hiện tại chưa đạt yêu cầu (at least 8/10).
                    Vui lòng cải thiện điểm đánh giá để có thể đấu giá.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {bidResult === null ? (
          <>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={!isBidValid() || isSubmitting}
              sx={{
                backgroundColor: '#EAD9C9',
                color: '#333333',
                '&:hover': {
                  backgroundColor: '#e0cbb9',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: '#EAD9C9',
              color: '#333333',
              '&:hover': {
                backgroundColor: '#e0cbb9',
              },
            }}
          >
            Đóng
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

