import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Divider,
  Stack,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  AttachMoney,
  RateReview,
} from "@mui/icons-material";
import {
  getOrderById,
  submitOrderReview,
  getOrderReviews,
} from "../../../api/order";
import { getUserById } from "../../../api/profileApi";
import { toast } from "react-hot-toast";

interface ProductBasicInfo {
  id: number;
  productName: string;
  thumbnailUrl: string;
  currentPrice: number;
}

interface OrderDetail {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  createdAt: string;
  isCancelled: boolean;
  hasShippingAddress: boolean;
  product: ProductBasicInfo | null;
}

interface UserInfo {
  fullname: string;
  email: string;
  avatar?: string;
}

interface Review {
  id: number;
  orderId: number;
  userId: number;
  status: number;
  comment: string;
  createdAt: string;
}

export default function OrderReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [otherParty, setOtherParty] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<string>("1");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Get current user ID from localStorage or auth context
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id);

          // Determine if current user is buyer or seller
          const otherPartyId =
            user.id === orderData.buyerId
              ? orderData.sellerId
              : orderData.buyerId;

          // Fetch other party info
          try {
            const userData = await getUserById(otherPartyId);
            setOtherParty(userData);
          } catch (err) {
            console.error("Error fetching user info:", err);
          }
        }

        // Fetch existing reviews
        try {
          const reviews = await getOrderReviews(Number(id));
          setExistingReviews(reviews || []);
        } catch (err) {
          console.error("Error fetching reviews:", err);
        }
      } catch (err: any) {
        console.error("Error fetching order detail:", err);
        setError(
          err?.response?.data?.message || "Failed to load order details"
        );
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const hasAlreadyReviewed = existingReviews.some(
    (review) => review.userId === currentUserId
  );

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!order) return;

    try {
      setSubmitting(true);
      await submitOrderReview(order.id, Number(rating), comment);
      toast.success("Review submitted successfully!");
      // Since wrapper logic, we might need to refresh parent or just navigate/reload.
      // Parent component handles order flow. If we just reviewed, maybe we stay here to see the review?
      // Or go to order-history.
      // Assuming parent refresh data logic is not triggering automatically as OrderReview might NOT take props in previous def.
      // But we can just reload or navigate to self to update.
      window.location.reload();
      // Or if prop passed in future, use it.
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error(err?.response?.data?.message || "Failed to submit review");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#8B7355" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || "Order not found"}
      </Alert>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Left Column - Review Form */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
          >
            <RateReview sx={{ mr: 1, verticalAlign: "middle" }} />
            Rate Your Experience
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {hasAlreadyReviewed ? (
            <Alert severity="info">
              You have already submitted a review for this order. You can view
              your review below.
            </Alert>
          ) : (
            <Stack spacing={3}>
              <Alert severity="info">
                Your honest feedback helps build trust in our community.
              </Alert>

              {/* Rating with the other party */}
              {otherParty && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                    You are rating: {otherParty.fullname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {otherParty.email}
                  </Typography>
                </Box>
              )}

              {/* Rating Selection */}
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: 600,
                    color: "#2C1810",
                    mb: 1,
                    "&.Mui-focused": {
                      color: "#2C1810",
                    },
                  }}
                >
                  How was your transaction? *
                </FormLabel>
                <RadioGroup
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      border: rating === "1" ? "2px solid #4caf50" : undefined,
                      bgcolor: rating === "1" ? "#f1f8e9" : undefined,
                    }}
                  >
                    <FormControlLabel
                      value="1"
                      control={<Radio sx={{ color: "#4caf50" }} />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ThumbUp sx={{ mr: 1, color: "#4caf50" }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              Positive (+1)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              The transaction went smoothly
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: rating === "-1" ? "2px solid #f44336" : undefined,
                      bgcolor: rating === "-1" ? "#ffebee" : undefined,
                    }}
                  >
                    <FormControlLabel
                      value="-1"
                      control={<Radio sx={{ color: "#f44336" }} />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ThumbDown sx={{ mr: 1, color: "#f44336" }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              Negative (-1)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              There were issues with the transaction
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>

              {/* Comment */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{ mb: 1, fontWeight: 600, color: "#2C1810" }}
                >
                  Your Comment *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Share your experience with this transaction..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#8B7355",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#8B7355",
                      },
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Be specific and constructive in your feedback
                </Typography>
              </Box>

              {/* Guidelines */}
              <Alert severity="warning">
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Review Guidelines:
                </Typography>
                <Typography variant="body2">
                  • Be honest and fair
                  <br />
                  • Focus on the transaction experience
                  <br />
                  • Avoid offensive language
                  <br />• You can update your review later if needed
                </Typography>
              </Alert>

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<RateReview />}
                onClick={handleSubmitReview}
                disabled={submitting || !comment.trim()}
                sx={{
                  bgcolor: "#8B7355",
                  "&:hover": {
                    bgcolor: "#6D5940",
                    py: 1.5,
                    mt: 2,
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Submit Review"
                )}
              </Button>
            </Stack>
          )}

          {/* Existing Reviews */}
          {existingReviews.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
              >
                Reviews for this Order
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {existingReviews.map((review) => (
                  <Paper key={review.id} variant="outlined" sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={review.status === 1 ? "Positive" : "Negative"}
                        color={review.status === 1 ? "success" : "error"}
                        icon={review.status === 1 ? <ThumbUp /> : <ThumbDown />}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{review.comment}</Typography>
                    {review.userId === currentUserId && (
                      <Chip label="Your Review" size="small" sx={{ mt: 1 }} />
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Right Column - Order Summary */}
        <Box>
          {/* Order Summary */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3, bgcolor: "#fafafa" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
            >
              <AttachMoney sx={{ mr: 1, verticalAlign: "middle" }} />
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Order ID:
                </Typography>
                <Chip label={`#${order.id}`} size="small" />
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "#8B7355",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  Total Amount:
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {formatPrice(order.amount)}
                </Typography>
              </Box>

              <Chip
                label="Transaction Completed"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Paper>

          {/* Product Info */}
          {order.product && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#2C1810", fontWeight: 600 }}
              >
                Product Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Card
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
                onClick={() => navigate(`/product-page/${order.product?.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={order.product.thumbnailUrl || "/placeholder.jpg"}
                  alt={order.product.productName}
                  sx={{ objectFit: "cover" }}
                />
              </Card>

              <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                {order.product.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Final Price: {formatPrice(order.product.currentPrice)}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
}
