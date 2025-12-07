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
} from "@mui/material";
import { Trash2, Edit, Eye } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import AdminSidebar from "./AdminSidebar";

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "seller" | "admin";
  status: "active" | "inactive" | "blocked";
  rating: number;
  joinedDate: string;
  totalTransactions: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "nguyenvana",
      email: "nguyenvana@email.com",
      role: "seller",
      status: "active",
      rating: 4.8,
      joinedDate: "2023-06-15",
      totalTransactions: 45,
    },
    {
      id: "2",
      username: "tranthib",
      email: "tranthib@email.com",
      role: "user",
      status: "active",
      rating: 4.5,
      joinedDate: "2023-08-20",
      totalTransactions: 12,
    },
    {
      id: "3",
      username: "levanc",
      email: "levanc@email.com",
      role: "seller",
      status: "blocked",
      rating: 2.1,
      joinedDate: "2023-05-10",
      totalTransactions: 8,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user" as const,
    status: "active" as const,
  });

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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1 }}>
        <AdminSidebar />

        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Users Management
            </Typography>

            <Card>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Rating
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Transactions
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
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
                          <TableCell align="center">⭐ {user.rating}</TableCell>
                          <TableCell align="center">
                            {user.totalTransactions}
                          </TableCell>
                          <TableCell>{user.joinedDate}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Edit size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Container>
        </Box>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{ bgcolor: "#E53935" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default Users;
