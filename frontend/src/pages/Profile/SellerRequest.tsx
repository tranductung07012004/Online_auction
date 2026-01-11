import { JSX, useState, useEffect } from "react";
import Header from "../../components/header";
import ProfileSidebar from "./profile/sidebar";
import Footer from "../../components/footer";
import { getUserProfile, UserProfileResponse } from "../../api/profileApi";
import {
  createSellerRequest,
  getMySellerRequest,
  type SellerRequestResponse,
} from "../../api/sellerRequest";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Paper,
} from "@mui/material";
import { Store, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SellerRequestPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [requestStatus, setRequestStatus] =
    useState<SellerRequestResponse | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch user profile
      try {
        const profile = await getUserProfile();
        setUserData(profile);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        toast.error(err.message || "Failed to load user profile");
      }

      // Fetch seller request status
      try {
        const status = await getMySellerRequest();
        setRequestStatus(status);
      } catch (err: any) {
        // Don't show error toast for seller request if it's just not found (404)
        const errorMessage = err.response.data.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    // Validate reason length (10-1000 characters as per backend)
    if (reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }

    if (reason.trim().length > 1000) {
      toast.error("Reason cannot exceed 1000 characters");
      return;
    }

    try {
      setSubmitting(true);
      const newRequest = await createSellerRequest({ reason: reason.trim() });
      setRequestStatus(newRequest);
      setReason("");
      toast.success(
        "Request submitted successfully! Admin will review your request."
      );
    } catch (err: any) {
      console.error("Error submitting request:", err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status?: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "approved":
        return (
          <Chip
            icon={<CheckCircle className="h-4 w-4" />}
            label="Approved"
            sx={{
              fontWeight: 600,
              bgcolor: "#81C784",
              color: "#fff",
              "& .MuiChip-icon": {
                color: "#fff",
              },
            }}
          />
        );
      case "rejected":
        return (
          <Chip
            icon={<XCircle className="h-4 w-4" />}
            label="Rejected"
            sx={{
              fontWeight: 600,
              bgcolor: "#E57373",
              color: "#fff",
              "& .MuiChip-icon": {
                color: "#fff",
              },
            }}
          />
        );
      case "pending":
      default:
        return (
          <Chip
            icon={<Clock className="h-4 w-4" />}
            label="Pending"
            sx={{
              fontWeight: 600,
              bgcolor: "#FFD54F",
              color: "#5d4037",
              "& .MuiChip-icon": {
                color: "#5d4037",
              },
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <CircularProgress sx={{ color: "#C3937C" }} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="become-seller"
              userName={userData?.email || "User"}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: "#fff", borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Store className="h-8 w-8" style={{ color: "#C3937C" }} />
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#5d4037" }}
                    >
                      Become a Seller
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Want to sell products on our platform? Submit a request for
                    admin to review and approve your seller account.
                  </Typography>

                  {/* Current Request Status */}
                  {requestStatus && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor:
                          requestStatus.status?.toLowerCase() === "approved"
                            ? "#E8F5E9"
                            : requestStatus.status?.toLowerCase() === "rejected"
                            ? "#FFEBEE"
                            : "#FFF9E6",
                        borderRadius: 2,
                        border: 1,
                        borderColor:
                          requestStatus.status?.toLowerCase() === "approved"
                            ? "#81C784"
                            : requestStatus.status?.toLowerCase() === "rejected"
                            ? "#E57373"
                            : "#FFD54F",
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Request Status
                          </Typography>
                          {getStatusChip(requestStatus.status)}
                        </Box>
                        {requestStatus.reason && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, display: "block", mb: 1 }}
                            >
                              Reason:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              {requestStatus.reason}
                            </Typography>
                          </Box>
                        )}
                        {requestStatus.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            Submitted at:{" "}
                            {new Date(requestStatus.createdAt).toLocaleString(
                              "en-US"
                            )}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Request Form */}
                  {(!requestStatus ||
                    requestStatus.status?.toLowerCase() === "rejected") && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {requestStatus?.status?.toLowerCase() === "rejected"
                          ? "Resubmit Request"
                          : "Submit Seller Request"}
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          label="Why do you want to become a Seller?"
                          multiline
                          rows={6}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Example: I have extensive experience selling traditional clothing and want to expand my business on this platform..."
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "#fff",
                              "&:hover fieldset": {
                                borderColor: "#C3937C",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#C3937C",
                              },
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: "#C3937C",
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleSubmit}
                          disabled={submitting || !reason.trim()}
                          startIcon={
                            submitting ? (
                              <CircularProgress
                                size={20}
                                sx={{ color: "#fff" }}
                              />
                            ) : (
                              <Send className="h-5 w-5" />
                            )
                          }
                          sx={{
                            bgcolor: "#C3937C",
                            "&:hover": {
                              bgcolor: "#a67c66",
                            },
                            fontWeight: 600,
                            py: 1.5,
                            textTransform: "none",
                          }}
                        >
                          {submitting ? "Submitting..." : "Submit Request"}
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Approved Message */}
                  {requestStatus?.status?.toLowerCase() === "approved" && (
                    <Alert
                      severity="success"
                      sx={{
                        borderRadius: 2,
                        bgcolor: "#E8F5E9",
                        color: "#2E7D32",
                        "& .MuiAlert-icon": {
                          color: "#2E7D32",
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Congratulations! Your request has been approved.
                      </Typography>
                      <Typography variant="body2">
                        You can now start listing products and selling on our
                        platform.
                      </Typography>
                    </Alert>
                  )}

                  {/* Pending Message */}
                  {requestStatus?.status?.toLowerCase() === "pending" && (
                    <Alert
                      severity="info"
                      sx={{
                        borderRadius: 2,
                        bgcolor: "#FFF9E6",
                        color: "#5d4037",
                        "& .MuiAlert-icon": {
                          color: "#C3937C",
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Your request is under review
                      </Typography>
                      <Typography variant="body2">
                        Admin will review your request as soon as possible.
                        Please wait for notification.
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
