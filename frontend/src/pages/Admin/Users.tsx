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
  Stack,
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
  Pagination,
  Divider,
} from "@mui/material";
import { Trash2, Edit, Eye, Check, X, ThumbsUp, ThumbsDown } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "seller" | "admin";
  status: "active" | "inactive" | "blocked";
  likes: number;
  dislikes: number;
  joinedDate: string;
}

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
  likes?: number;
  dislikes?: number;
  totalBids?: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "nguyenvana",
      email: "nguyenvana@email.com",
      role: "seller",
      status: "active",
      likes: 124,
      dislikes: 7,
      joinedDate: "2023-06-15 09:15:30",
    },
    {
      id: "2",
      username: "tranthib",
      email: "tranthib@email.com",
      role: "user",
      status: "active",
      likes: 86,
      dislikes: 12,
      joinedDate: "2023-08-20 14:22:10",
    },
    {
      id: "3",
      username: "levanc",
      email: "levanc@email.com",
      role: "seller",
      status: "blocked",
      likes: 21,
      dislikes: 34,
      joinedDate: "2023-05-10 18:45:05",
    },
    {
      id: "4",
      username: "phamthid",
      email: "phamthid@email.com",
      role: "user",
      status: "active",
      likes: 95,
      dislikes: 8,
      joinedDate: "2023-09-12 11:30:45",
    },
    {
      id: "5",
      username: "hoangvane",
      email: "hoangvane@email.com",
      role: "seller",
      status: "active",
      likes: 205,
      dislikes: 14,
      joinedDate: "2023-04-22 16:40:12",
    },
    {
      id: "6",
      username: "lythif",
      email: "lythif@email.com",
      role: "user",
      status: "inactive",
      likes: 48,
      dislikes: 22,
      joinedDate: "2023-11-05 07:22:55",
    },
    {
      id: "7",
      username: "dovang",
      email: "dovang@email.com",
      role: "seller",
      status: "active",
      likes: 157,
      dislikes: 11,
      joinedDate: "2023-07-18 13:18:33",
    },
    {
      id: "8",
      username: "buithih",
      email: "buithih@email.com",
      role: "user",
      status: "active",
      likes: 77,
      dislikes: 9,
      joinedDate: "2023-10-30 10:55:20",
    },
    {
      id: "9",
      username: "vuvani",
      email: "vuvani@email.com",
      role: "admin",
      status: "active",
      likes: 342,
      dislikes: 3,
      joinedDate: "2023-01-10 08:00:00",
    },
    {
      id: "10",
      username: "dinhthij",
      email: "dinhthij@email.com",
      role: "user",
      status: "active",
      likes: 63,
      dislikes: 6,
      joinedDate: "2023-12-01 15:10:48",
    },
    {
      id: "11",
      username: "ngovank",
      email: "ngovank@email.com",
      role: "seller",
      status: "blocked",
      likes: 12,
      dislikes: 45,
      joinedDate: "2023-03-15 20:30:15",
    },
    {
      id: "12",
      username: "duongthil",
      email: "duongthil@email.com",
      role: "user",
      status: "active",
      likes: 89,
      dislikes: 5,
      joinedDate: "2024-01-08 12:25:33",
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Main tab state
  const [mainTab, setMainTab] = useState<"users" | "requests">("users");

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Search state for users
  const [userSearchField, setUserSearchField] = useState<"username" | "email">("username");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  type UserFormData = Pick<User, "username" | "email" | "role" | "status">;

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    role: "user",
    status: "active",
  });

  // Seller Requests State
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([
    {
      id: "1",
      userId: "user1",
      username: "nguyenvana",
      email: "nguyenvana@email.com",
      fullName: "Nguyễn Văn A",
      reason: "I want to sell used electronics. I have experience in evaluating and describing products.",
      status: "pending",
      createdAt: "2024-01-15T10:30:00",
      likes: 128,
      dislikes: 6,
      totalBids: 45,
    },
    {
      id: "2",
      userId: "user2",
      username: "tranthib",
      email: "tranthib@email.com",
      fullName: "Trần Thị B",
      reason: "I have many fashion items I want to auction. All products are new and of good quality.",
      status: "pending",
      createdAt: "2024-01-14T14:20:00",
      likes: 94,
      dislikes: 9,
      totalBids: 32,
    },
    {
      id: "3",
      userId: "user3",
      username: "levanc",
      email: "levanc@email.com",
      fullName: "Lê Văn C",
      reason: "I want to sell vintage watches and collectibles.",
      status: "approved",
      createdAt: "2024-01-10T09:15:00",
      updatedAt: "2024-01-12T11:00:00",
      likes: 73,
      dislikes: 11,
      totalBids: 28,
    },
    {
      id: "4",
      userId: "user4",
      username: "phamthid",
      email: "phamthid@email.com",
      fullName: "Phạm Thị D",
      reason: "I want to sell household products.",
      status: "rejected",
      createdAt: "2024-01-08T16:45:00",
      updatedAt: "2024-01-09T10:30:00",
      likes: 40,
      dislikes: 18,
      totalBids: 15,
    },
    {
      id: "5",
      userId: "user5",
      username: "hoangvane",
      email: "hoangvane@email.com",
      fullName: "Hoàng Văn E",
      reason: "I have a collection of antique items and want to reach more buyers through your platform.",
      status: "pending",
      createdAt: "2024-01-13T08:45:00",
      likes: 210,
      dislikes: 12,
      totalBids: 67,
    },
    {
      id: "6",
      userId: "user6",
      username: "lythif",
      email: "lythif@email.com",
      fullName: "Lý Thị F",
      reason: "I want to sell handmade jewelry and accessories.",
      status: "pending",
      createdAt: "2024-01-12T15:30:00",
      likes: 52,
      dislikes: 20,
      totalBids: 5,
    },
    {
      id: "7",
      userId: "user7",
      username: "dovang",
      email: "dovang@email.com",
      fullName: "Đỗ Văn G",
      reason: "I specialize in rare books and want to auction them.",
      status: "approved",
      createdAt: "2024-01-11T11:20:00",
      updatedAt: "2024-01-12T09:00:00",
      likes: 162,
      dislikes: 8,
      totalBids: 34,
    },
    {
      id: "8",
      userId: "user8",
      username: "buithih",
      email: "buithih@email.com",
      fullName: "Bùi Thị H",
      reason: "I want to sell sports equipment and memorabilia.",
      status: "pending",
      createdAt: "2024-01-10T14:15:00",
      likes: 81,
      dislikes: 7,
      totalBids: 9,
    },
    {
      id: "9",
      userId: "user9",
      username: "vuvani",
      email: "vuvani@email.com",
      fullName: "Vũ Văn I",
      reason: "I have vintage musical instruments to auction.",
      status: "rejected",
      createdAt: "2024-01-09T10:00:00",
      updatedAt: "2024-01-10T12:30:00",
      likes: 350,
      dislikes: 15,
      totalBids: 120,
    },
    {
      id: "10",
      userId: "user10",
      username: "dinhthij",
      email: "dinhthij@email.com",
      fullName: "Đinh Thị J",
      reason: "I want to sell art supplies and paintings.",
      status: "pending",
      createdAt: "2024-01-08T09:30:00",
      likes: 65,
      dislikes: 4,
      totalBids: 7,
    },
  ]);

  const [selectedRequestTab, setSelectedRequestTab] = useState<"pending" | "all">("pending");
  const [requestPage, setRequestPage] = useState(1);
  const [requestRowsPerPage] = useState(5);

  // Search state for seller requests
  const [requestSearchTerm, setRequestSearchTerm] = useState("");
  const [viewRequestDialogOpen, setViewRequestDialogOpen] = useState(false);
  const [approveRequestDialogOpen, setApproveRequestDialogOpen] = useState(false);
  const [rejectRequestDialogOpen, setRejectRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({ username: "", email: "", role: "user", status: "active" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setViewDialogOpen(true);
  };

  // Pagination logic
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const filteredUsers = users.filter((u) => {
    const term = userSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return userSearchField === "username"
      ? u.username.toLowerCase().includes(term)
      : u.email.toLowerCase().includes(term);
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
              ...u,
              username: formData.username,
              email: formData.email,
              role: formData.role,
              status: formData.status,
            }
            : u
        )
      );
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "seller":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "blocked":
        return "error";
      default:
        return "default";
    }
  };

  // Seller Requests Handlers
  const handleRequestTabChange = (_event: React.SyntheticEvent, newValue: "pending" | "all") => {
    setSelectedRequestTab(newValue);
    setRequestPage(1); // Reset to first page when changing tabs
  };

  const filteredRequestsByTab = selectedRequestTab === "pending"
    ? sellerRequests.filter((r) => r.status === "pending")
    : sellerRequests;

  const filteredRequests = filteredRequestsByTab.filter((r) => {
    const term = requestSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return r.email.toLowerCase().includes(term);
  });

  // Pagination for requests
  const paginatedRequests = filteredRequests.slice(
    (requestPage - 1) * requestRowsPerPage,
    requestPage * requestRowsPerPage
  );

  const requestTotalPages = Math.ceil(filteredRequests.length / requestRowsPerPage);

  const handleRequestPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setRequestPage(newPage);
  };

  const handleViewRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setViewRequestDialogOpen(true);
  };

  const handleApproveRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setApproveRequestDialogOpen(true);
  };

  const handleRejectRequest = (request: SellerRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectRequestDialogOpen(true);
  };

  const confirmApproveRequest = () => {
    if (selectedRequest) {
      setSellerRequests(
        sellerRequests.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "approved" as const, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setApproveRequestDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const confirmRejectRequest = () => {
    if (selectedRequest) {
      setSellerRequests(
        sellerRequests.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "rejected" as const, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setRejectRequestDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  const getRequestStatusColor = (status: string) => {
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

  const pendingRequestsCount = sellerRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#fdfcf9", p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Users Management
          </Typography>

          <Tabs
            value={mainTab}
            onChange={(_e, value) => {
              setMainTab(value);
              if (value === "users") {
                setPage(1);
              } else {
                setRequestPage(1);
              }
            }}
            sx={{
              mb: 3,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
            }}
          >
            <Tab label="Users" value="users" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>Seller Requests</span>
                  {pendingRequestsCount > 0 && (
                    <Chip
                      label={pendingRequestsCount}
                      size="small"
                      color="warning"
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  )}
                </Box>
              }
              value="requests"
            />
          </Tabs>

          {mainTab === "users" && (
            <>
              <Card>
                <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Search by</InputLabel>
                    <Select
                      label="Search by"
                      value={userSearchField}
                      onChange={(e) => {
                        setUserSearchField(e.target.value as "username" | "email");
                        setPage(1);
                      }}
                    >
                      <MenuItem value="username">Username</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    fullWidth
                    label={`Search by ${userSearchField === "username" ? "username" : "email"}`}
                    placeholder="Enter keyword..."
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: "rgba(195, 147, 124, 0.1)" }}>

                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Reactions
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography color="textSecondary">
                                No users found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {user.username}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  color={getRoleColor(user.role) as any}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={user.status}
                                  size="small"
                                  color={getStatusColor(user.status) as any}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <ThumbsUp size={16} color="#2e7d32" />
                                    <Typography variant="body2">{user.likes}</Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <ThumbsDown size={16} color="#c62828" />
                                    <Typography variant="body2">{user.dislikes}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{user.joinedDate}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleViewUser(user)}
                                    title="View Details"
                                  >
                                    <Eye size={18} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenDialog(user)}
                                    title="Edit"
                                  >
                                    <Edit size={18} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </IconButton>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "#333333",
                        "&.Mui-selected": {
                          backgroundColor: "#EAD9C9",
                          color: "#333333",
                          "&:hover": {
                            backgroundColor: "#EAD9C9",
                          },
                        },
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {mainTab === "requests" && (
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: "center" }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Search by email"
                    placeholder="Enter email..."
                    value={requestSearchTerm}
                    onChange={(e) => {
                      setRequestSearchTerm(e.target.value);
                      setRequestPage(1);
                    }}
                  />
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 2 }}>
                  <Tabs
                    value={selectedRequestTab}
                    onChange={handleRequestTabChange}
                    sx={{
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
                          {pendingRequestsCount > 0 && (
                            <Chip
                              label={pendingRequestsCount}
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
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Reactions
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
                      {paginatedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color="textSecondary">
                              No requests found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRequests.map((request) => (
                          <TableRow key={request.id} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "#C3937C",
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
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <ThumbsUp size={16} color="#2e7d32" />
                                  <Typography variant="body2">{request.likes ?? 0}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <ThumbsDown size={16} color="#c62828" />
                                  <Typography variant="body2">{request.dislikes ?? 0}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{request.totalBids || 0}</TableCell>
                            <TableCell>
                              <Chip
                                label={request.status}
                                size="small"
                                color={getRequestStatusColor(request.status) as any}
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

                {/* Pagination for Seller Requests */}
                {requestTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3, pb: 3 }}>
                    <Pagination
                      count={requestTotalPages}
                      page={requestPage}
                      onChange={handleRequestPageChange}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "#333333",
                          "&.Mui-selected": {
                            backgroundColor: "#EAD9C9",
                            color: "#333333",
                            "&:hover": {
                              backgroundColor: "#EAD9C9",
                            },
                          },
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              fullWidth
              disabled
              value={formData.username}
            />
            <TextField label="Email" fullWidth disabled value={formData.email} />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as any })
                }
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              bgcolor: "#C3937C",
              "&:hover": {
                bgcolor: "#A67C5A",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setViewingUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewingUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  Username
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {viewingUser.username}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {viewingUser.email}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Role
                  </Typography>
                  <Chip
                    label={viewingUser.role}
                    size="small"
                    color={getRoleColor(viewingUser.role) as any}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={viewingUser.status}
                    size="small"
                    color={getStatusColor(viewingUser.status) as any}
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Reactions
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <ThumbsUp size={18} color="#2e7d32" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {viewingUser.likes}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <ThumbsDown size={18} color="#c62828" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {viewingUser.dislikes}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Joined Date
                  </Typography>
                  <Typography variant="body1">
                    {viewingUser.joinedDate}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialogOpen(false);
            setViewingUser(null);
          }}
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (viewingUser) {
                handleOpenDialog(viewingUser);
                setViewDialogOpen(false);
                setViewingUser(null);
              }
            }}
            variant="contained"
            sx={{
              bgcolor: "#C3937C",
              "&:hover": {
                bgcolor: "#A67C5A",
              },
            }}
            startIcon={<Edit size={18} />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Details Dialog */}
      <Dialog
        open={viewRequestDialogOpen}
        onClose={() => {
          setViewRequestDialogOpen(false);
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
                    bgcolor: "#C3937C",
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
                    Reactions
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <ThumbsUp size={16} color="#2e7d32" />
                      <Typography sx={{ fontWeight: 500 }}>
                        {selectedRequest.likes ?? 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <ThumbsDown size={16} color="#c62828" />
                      <Typography sx={{ fontWeight: 500 }}>
                        {selectedRequest.dislikes ?? 0}
                      </Typography>
                    </Box>
                  </Box>
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
                    color={getRequestStatusColor(selectedRequest.status) as any}
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
                      bgcolor: "rgba(195, 147, 124, 0.05)",
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
            setViewRequestDialogOpen(false);
            setSelectedRequest(null);
          }}
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Request Confirmation Dialog */}
      <Dialog
        open={approveRequestDialogOpen}
        onClose={() => {
          setApproveRequestDialogOpen(false);
          setSelectedRequest(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Seller Request</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRequest && (
            <Box>
              <Alert severity="info" sx={{
                mb: 2, "& .MuiAlert-icon": {
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
              setApproveRequestDialogOpen(false);
              setSelectedRequest(null);
            }}
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApproveRequest}
            variant="contained"
            color="success"
            startIcon={<Check size={18} />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Request Confirmation Dialog */}
      <Dialog
        open={rejectRequestDialogOpen}
        onClose={() => {
          setRejectRequestDialogOpen(false);
          setSelectedRequest(null);
          setRejectReason("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Seller Request</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRequest && (
            <Box sx={{
              display: "flex", flexDirection: "column", gap: 2
            }}>
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
              setRejectRequestDialogOpen(false);
              setSelectedRequest(null);
              setRejectReason("");
            }}
            sx={{
              borderColor: '#c3937c',
              color: '#c3937c',
              '&:hover': {
                borderColor: '#a67c66',
                bgcolor: '#f8f3f0'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRejectRequest}
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

export default Users;
