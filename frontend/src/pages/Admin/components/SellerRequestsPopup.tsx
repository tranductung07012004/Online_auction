import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  TextField,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Pagination,
  Tooltip,
} from "@mui/material";
import { Check, Close, Clear, Visibility } from "@mui/icons-material";
import * as sellerRequestApi from "../../../api/sellerRequest";
import type {
  SellerRequestResponse,
  SellerRequestStatus,
  SellerRequestStatistics,
} from "../../../api/sellerRequest";

interface SellerRequestsPopupProps {
  open: boolean;
  onClose: () => void;
  onRequestProcessed?: () => void;
}

const SellerRequestsPopup: React.FC<SellerRequestsPopupProps> = ({
  open,
  onClose,
  onRequestProcessed,
}) => {
  const [requests, setRequests] = useState<SellerRequestResponse[]>([]);
  const [statistics, setStatistics] = useState<SellerRequestStatistics | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<SellerRequestStatus | "ALL">(
    "PENDING"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  // Detail dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SellerRequestResponse | null>(null);

  // Approve/Reject dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (selectedTab === "ALL") {
        response = await sellerRequestApi.getAllSellerRequests(
          page - 1,
          pageSize
        );
      } else {
        response = await sellerRequestApi.getSellerRequestsByStatus(
          selectedTab,
          page - 1,
          pageSize
        );
      }
      setRequests(response.data.data.content);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await sellerRequestApi.getSellerRequestStatistics();
      setStatistics(response.data.data);
    } catch (e) {
      console.error("Failed to load statistics", e);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRequests();
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedTab, page]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: SellerRequestStatus | "ALL"
  ) => {
    setSelectedTab(newValue);
    setPage(1);
  };

  const handleViewRequest = (request: SellerRequestResponse) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleOpenActionDialog = (
    request: SellerRequestResponse,
    type: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNote("");
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await sellerRequestApi.reviewSellerRequest(selectedRequest.id, {
        approved: actionType === "approve",
        adminNote: adminNote || undefined,
      });

      setSuccessMessage(
        actionType === "approve"
          ? "Request approved successfully! User is now a seller."
          : "Request rejected successfully."
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      setActionDialogOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
      await fetchStatistics();
      onRequestProcessed?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (
    status: SellerRequestStatus
  ): "warning" | "success" | "error" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: SellerRequestStatus) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Main Popup */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: "70vh", maxHeight: "90vh" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#C3937C",
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Seller Upgrade Requests
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Statistics */}
          {statistics && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                p: 2,
                bgcolor: "#fdfcf9",
                borderBottom: "1px solid #eee",
              }}
            >
              <Chip
                label={`Total: ${statistics.totalRequests}`}
                sx={{ bgcolor: "#e0e0e0" }}
              />
              <Chip
                label={`Pending: ${statistics.pendingCount}`}
                color="warning"
              />
              <Chip
                label={`Approved: ${statistics.approvedCount}`}
                color="success"
              />
              <Chip
                label={`Rejected: ${statistics.rejectedCount}`}
                color="error"
              />
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
                "& .Mui-selected": { color: "#C3937C" },
                "& .MuiTabs-indicator": { bgcolor: "#C3937C" },
              }}
            >
              <Tab label="Pending" value="PENDING" />
              <Tab label="Approved" value="APPROVED" />
              <Tab label="Rejected" value="REJECTED" />
              <Tab label="All" value="ALL" />
            </Tabs>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ m: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Table */}
          <TableContainer sx={{ maxHeight: "50vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    User
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Business Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Created At
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        No requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={request.userAvatar}
                            sx={{ width: 32, height: 32 }}
                          >
                            {request.userFullname?.[0] ||
                              request.userEmail?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {request.userFullname || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {request.userEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {request.businessName || (
                          <Typography variant="caption" color="textSecondary">
                            Not provided
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRequest(request)}
                            sx={{ color: "#1976d2" }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {request.status === "PENDING" && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenActionDialog(request, "approve")
                                }
                                sx={{ color: "#2e7d32" }}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenActionDialog(request, "reject")
                                }
                                sx={{ color: "#d32f2f" }}
                              >
                                <Clear fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
          Request Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={selectedRequest.userAvatar}
                  sx={{ width: 56, height: 56 }}
                >
                  {selectedRequest.userFullname?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedRequest.userFullname || "N/A"}
                  </Typography>
                  <Typography color="textSecondary">
                    {selectedRequest.userEmail}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(selectedRequest.status)}
                  color={getStatusColor(selectedRequest.status)}
                  sx={{ ml: "auto" }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Reason for Upgrade
                </Typography>
                <Typography>
                  {selectedRequest.reason || "Not provided"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Business Name
                  </Typography>
                  <Typography>
                    {selectedRequest.businessName || "Not provided"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone Number
                  </Typography>
                  <Typography>
                    {selectedRequest.phoneNumber || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Business Address
                </Typography>
                <Typography>
                  {selectedRequest.businessAddress || "Not provided"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography>
                    {formatDate(selectedRequest.createdAt)}
                  </Typography>
                </Box>
                {selectedRequest.reviewedAt && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reviewed At
                    </Typography>
                    <Typography>
                      {formatDate(selectedRequest.reviewedAt)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedRequest.adminNote && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Admin Note
                  </Typography>
                  <Typography>{selectedRequest.adminNote}</Typography>
                </Box>
              )}

              {selectedRequest.reviewerEmail && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Reviewed By
                  </Typography>
                  <Typography>{selectedRequest.reviewerEmail}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedRequest?.status === "PENDING" && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenActionDialog(selectedRequest!, "approve");
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenActionDialog(selectedRequest!, "reject");
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: actionType === "approve" ? "#e8f5e9" : "#ffebee",
            color: actionType === "approve" ? "#2e7d32" : "#c62828",
            fontWeight: 600,
          }}
        >
          {actionType === "approve" ? "Approve Request" : "Reject Request"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography>
                {actionType === "approve"
                  ? `Are you sure you want to approve the seller upgrade request from "${
                      selectedRequest.userFullname || selectedRequest.userEmail
                    }"? This will change their role to SELLER.`
                  : `Are you sure you want to reject the seller upgrade request from "${
                      selectedRequest.userFullname || selectedRequest.userEmail
                    }"?`}
              </Typography>
              <TextField
                label="Admin Note (Optional)"
                multiline
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Add any notes about the approval..."
                    : "Please provide a reason for rejection..."
                }
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            onClick={handleConfirmAction}
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={20} color="inherit" />
            ) : actionType === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SellerRequestsPopup;
