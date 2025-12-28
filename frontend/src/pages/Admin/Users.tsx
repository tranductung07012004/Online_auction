import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { UserSearchBar } from "./components/UserSearchBar";
import * as adminUserApi from "../../api/adminUser";

interface User {
  id: number;
  email: string;
  role: string;
  fullname: string;
  avatar: string;
  address: string;
  verified: boolean;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userNameToDelete, setUserNameToDelete] = useState<string>("");
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<{
    role: string;
    verified: boolean;
  }>({
    role: "CUSTOMER",
    verified: false,
  });

  // Pagination & search
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");

  // Load states
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (filterRole) {
        response = await adminUserApi.getUsersByRole(
          filterRole,
          page - 1,
          rowsPerPage
        );
      } else {
        response = await adminUserApi.getAllUsers(
          searchKeyword,
          page - 1,
          rowsPerPage
        );
      }

      const pageData = response.data.data;
      setUsers(pageData.content);
      setTotalPages(pageData.totalPages || 1);
    } catch (e: any) {
      setUsers([]);
      setTotalPages(1);
      setWarningMessage(e?.response?.data?.message || "Failed to load users");
      setWarningDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchKeyword, filterRole]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        role: user.role,
        verified: user.verified,
      });
    } else {
      setEditingUser(null);
      setFormData({ role: "CUSTOMER", verified: false });
    }
    setDialogError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setDialogError(null);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setMutating(true);
    setDialogError(null);

    try {
      // Update role if changed
      if (formData.role !== editingUser.role) {
        await adminUserApi.updateUserRole(editingUser.id, {
          role: formData.role,
        });
      }

      // Update verification if changed
      if (formData.verified !== editingUser.verified) {
        await adminUserApi.updateUserVerification(editingUser.id, {
          verified: formData.verified,
        });
      }

      handleCloseDialog();
      await fetchUsers();
      setSuccessMessage("User updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setDialogError(
        e?.response?.data?.message || e?.message || "Failed to update user"
      );
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const userToDeleteName = users.find((u) => u.id === id)?.email || "";
    setUserToDelete(id);
    setUserNameToDelete(userToDeleteName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete === null) return;

    setMutating(true);
    try {
      await adminUserApi.deleteUser(userToDelete);
      await fetchUsers();
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setWarningMessage(
        e?.response?.data?.message || e?.message || "Failed to delete user"
      );
      setWarningDialogOpen(true);
    } finally {
      setMutating(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setUserNameToDelete("");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setUserNameToDelete("");
  };

  const handleCloseWarningDialog = () => {
    setWarningDialogOpen(false);
    setWarningMessage("");
  };

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#fdfcf9", p: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Users Management
            </Typography>
          </Box>

          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                border: "1px solid #c8e6c9",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              icon={<CheckCircle2 size={20} style={{ color: "#2e7d32" }} />}
            >
              {successMessage}
            </Alert>
          )}

          {/* User Search Bar */}
          <Box sx={{ mb: 3 }}>
            <UserSearchBar
              searchKeyword={searchKeyword}
              filterRole={filterRole}
              onSearchChange={(keyword) => {
                setPage(1);
                setSearchKeyword(keyword);
              }}
              onRoleFilterChange={(role) => {
                setPage(1);
                setFilterRole(role);
              }}
            />
          </Box>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "rgba(195, 147, 124, 0.1)" }}>
                    <TableRow
                      sx={{
                        borderBottom: "2px solid rgba(195, 147, 124, 0.3)",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#5d4037" }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#5d4037" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#5d4037" }}>
                        Role
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "#5d4037" }}
                        align="center"
                      >
                        Verified
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "#5d4037" }}
                        align="center"
                      >
                        Rating
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "#5d4037" }}
                        align="center"
                      >
                        Joined
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "#5d4037" }}
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(195, 147, 124, 0.05)",
                              transition: "background-color 0.2s ease",
                            },
                            borderBottom: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {user.email}
                          </TableCell>
                          <TableCell>{user.fullname || "—"}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              sx={{
                                backgroundColor:
                                  user.role === "ADMIN"
                                    ? "#ff6b6b"
                                    : user.role === "PHOTOGRAPHER"
                                    ? "#4ecdc4"
                                    : "#95e1d3",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {user.verified ? (
                              <CheckCircle2
                                size={20}
                                style={{ color: "#2e7d32" }}
                              />
                            ) : (
                              <AlertCircle
                                size={20}
                                style={{ color: "#f57c00" }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              👍 {user.likeCount} / 👎 {user.dislikeCount}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {formatDate(user.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(user)}
                                title="Edit"
                                disabled={mutating}
                                sx={{
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <Edit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete"
                                disabled={mutating}
                                sx={{
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                                    transform: "scale(1.1)",
                                  },
                                }}
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

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#C3937C",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#C3937C",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#A67C5A",
                    },
                  },
                }}
              />
            </Box>
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
        <DialogTitle
          sx={{ fontWeight: 600, color: "#5d4037", fontSize: "1.3rem" }}
        >
          Edit User
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                backgroundColor: "#ffebee",
                color: "#c62828",
                border: "1px solid #ffcdd2",
                borderRadius: 1,
              }}
              icon={<AlertCircle size={20} style={{ color: "#c62828" }} />}
            >
              {dialogError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>Email</Typography>
              <Typography sx={{ color: "#757575" }}>
                {editingUser?.email}
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                disabled={mutating}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <MenuItem value="CUSTOMER">Customer</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="PHOTOGRAPHER">Photographer</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={formData.verified ? "verified" : "unverified"}
                label="Verification Status"
                disabled={mutating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    verified: e.target.value === "verified",
                  })
                }
              >
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Not Verified</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button
            sx={{
              color: "#C3937C",
              bgcolor: "transparent",
              border: "1px solid #C3937C",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
            onClick={handleCloseDialog}
            disabled={mutating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={mutating}
            sx={{
              bgcolor: "#C3937C",
              "&:hover": { bgcolor: "#A67C5A" },
            }}
          >
            {mutating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: "#d32f2f", fontSize: "1.3rem" }}
        >
          Delete User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <AlertCircle
              size={24}
              style={{ color: "#d32f2f", marginTop: 4, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 2 }}>
                Are you sure you want to delete{" "}
                {userNameToDelete && (
                  <span style={{ fontWeight: 600, color: "#d32f2f" }}>
                    "{userNameToDelete}"
                  </span>
                )}
                ? This action cannot be undone.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              color: "#757575",
              bgcolor: "transparent",
              border: "1px solid #e0e0e0",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
            disabled={mutating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={mutating}
            sx={{
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#c62828" },
            }}
          >
            {mutating ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog
        open={warningDialogOpen}
        onClose={handleCloseWarningDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: "#f57c00", fontSize: "1.3rem" }}
        >
          Warning
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <AlertCircle
              size={24}
              style={{ color: "#f57c00", marginTop: 4, flexShrink: 0 }}
            />
            <Typography sx={{ color: "#5d4037" }}>{warningMessage}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button
            onClick={handleCloseWarningDialog}
            variant="contained"
            sx={{
              bgcolor: "#f57c00",
              "&:hover": { bgcolor: "#e65100" },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Users;
