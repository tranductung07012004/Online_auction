import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import { Check, X, Eye, UserCheck } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

interface SellerRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  totalBids?: number;
}

const SellerRequests: React.FC = () => {
  const [requests, setRequests] = useState<SellerRequest[]>([
    {
      id: "1",
      userId: "user1",
      username: "nguyenvana",
      email: "nguyenvana@email.com",
      fullName: "Nguyễn Văn A",
      reason: "Tôi muốn bán các sản phẩm điện tử đã qua sử dụng. Tôi có kinh nghiệm trong việc đánh giá và mô tả sản phẩm.",
      status: "pending",
      createdAt: "2024-01-15T10:30:00",
      rating: 4.8,
      totalBids: 45,
    },
    {
      id: "2",
      userId: "user2",
      username: "tranthib",
      email: "tranthib@email.com",
      fullName: "Trần Thị B",
      reason: "Tôi có nhiều quần áo thời trang muốn bán đấu giá. Các sản phẩm đều còn mới và chất lượng tốt.",
      status: "pending",
      createdAt: "2024-01-14T14:20:00",
      rating: 4.5,
      totalBids: 32,
    },
    {
      id: "3",
      userId: "user3",
      username: "levanc",
      email: "levanc@email.com",
      fullName: "Lê Văn C",
      reason: "Tôi muốn bán các sản phẩm đồng hồ cổ và đồ sưu tầm.",
      status: "approved",
      createdAt: "2024-01-10T09:15:00",
      updatedAt: "2024-01-12T11:00:00",
      rating: 4.2,
      totalBids: 28,
    },
    {
      id: "4",
      userId: "user4",
      username: "phamthid",
      email: "phamthid@email.com",
      fullName: "Phạm Thị D",
      reason: "Tôi muốn bán các sản phẩm gia dụng.",
      status: "rejected",
      createdAt: "2024-01-08T16:45:00",
      updatedAt: "2024-01-09T10:30:00",
      rating: 3.5,
      totalBids: 15,
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: "pending" | "all") => {
    setSelectedTab(newValue);
  };

  const filteredRequests = selectedTab === "pending"
    ? requests.filter((r) => r.status === "pending")
    : requests;

  const handleViewRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleApproveRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "approved" as const, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "rejected" as const, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <UserCheck size={32} color="#E53935" />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Seller Upgrade Requests
              </Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Card sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>Pending Requests</span>
                    {pendingCount > 0 && (
                      <Chip
                        label={pendingCount}
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>
                }
                value="pending"
              />
              <Tab label="All Requests" value="all" />
            </Tabs>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Rating
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Total Bids
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">
                            No requests found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: "#E53935",
                                }}
                              >
                                {request.fullName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {request.fullName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  @{request.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                              <span>⭐</span>
                              <Typography>{request.rating?.toFixed(1) || "N/A"}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{request.totalBids || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              size="small"
                              color={getStatusColor(request.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(request.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewRequest(request)}
                                title="View Details"
                              >
                                <Eye size={18} />
                              </IconButton>
                              {request.status === "pending" && (
                                <>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleApproveRequest(request)}
                                    title="Approve"
                                  >
                                    <Check size={18} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRejectRequest(request)}
                                    title="Reject"
                                  >
                                    <X size={18} />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* View Request Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedRequest(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRequest && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "#E53935",
                  }}
                >
                  {selectedRequest.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedRequest.fullName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{selectedRequest.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedRequest.email}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Rating
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    ⭐ {selectedRequest.rating?.toFixed(1) || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total Bids
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedRequest.totalBids || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedRequest.status}
                    size="small"
                    color={getStatusColor(selectedRequest.status) as any}
                  />
                </Box>
              </Box>

              <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Request Reason
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={selectedRequest.reason || "No reason provided"}
                  disabled
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "#f5f5f5",
                    },
                  }}
                />
              </Box>

              <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="body2" color="textSecondary">
                  Request Date
                </Typography>
                <Typography>{formatDate(selectedRequest.createdAt)}</Typography>
                {selectedRequest.updatedAt && (
                  <>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Updated Date
                    </Typography>
                    <Typography>{formatDate(selectedRequest.updatedAt)}</Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialogOpen(false);
            setSelectedRequest(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => {
          setApproveDialogOpen(false);
          setSelectedRequest(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Seller Request</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRequest && (
            <Box>
              <Alert
                severity="info"
                sx={{
                  "& .MuiAlert-icon": {
                    color: "#5c5752",        // ⚡ đây là màu của icon "i"
                  },
                  color: "#5c5752",
                  bgcolor: '#f5d3b0',
                  borderRadius: 2,
                }}>
                Are you sure you want to approve the seller request from{" "}
                <strong>{selectedRequest.fullName}</strong>?
              </Alert>
              <Typography variant="body2" color="textSecondary">
                This will upgrade the user from bidder to seller role. They will be
                able to create and manage products.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setApproveDialogOpen(false);
              setSelectedRequest(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApprove}
            variant="contained"
            color="success"
            startIcon={<Check size={18} />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedRequest(null);
          setRejectReason("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Seller Request</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRequest && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="warning">
                Are you sure you want to reject the seller request from{" "}
                <strong>{selectedRequest.fullName}</strong>?
              </Alert>
              <TextField
                label="Rejection Reason (Optional)"
                fullWidth
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setSelectedRequest(null);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReject}
            variant="contained"
            color="error"
            startIcon={<X size={18} />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SellerRequests;

