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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Chip,
  Stack,
  Pagination,
  MenuItem,
} from "@mui/material";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

interface Category {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
  parentId?: string | null;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Electronics",
      productCount: 45,
      createdAt: "2024-01-01T10:00:00Z",
      parentId: null,
    },
    {
      id: "2",
      name: "Fashion",
      productCount: 68,
      createdAt: "2024-01-02T12:30:00Z",
      parentId: null,
    },
    {
      id: "3",
      name: "Home & Garden",
      productCount: 32,
      createdAt: "2024-01-03T09:15:00Z",
      parentId: null,
    },
    {
      id: "4",
      name: "Smartphones",
      productCount: 20,
      createdAt: "2024-01-04T08:45:00Z",
      parentId: "1",
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "" });

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        parentId: category.parentId ?? "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", parentId: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, parentId: formData.parentId || null }
            : c
        )
      );
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        productCount: 0,
        createdAt: new Date().toISOString(),
        parentId: formData.parentId || null,
      };
      setCategories([...categories, newCategory]);
    }
    handleCloseDialog();
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setViewDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    const hasChild = categories.some((c) => c.parentId === id);
    if (hasChild) {
      alert("Cannot delete category that has subcategories. Remove subcategories first.");
      return;
    }
    const category = categories.find((c) => c.id === id);
    if (category && category.productCount > 0) {
      alert("Cannot delete category with products. Remove products first.");
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
  };

  // Pagination logic
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const paginatedCategories = categories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(categories.length / rowsPerPage);

  const parentOptions = categories.filter((c) => !c.parentId);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

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
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Categories Management
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#C3937C",
                "&:hover": {
                  bgcolor: "#A67C5A",
                },
              }}
              startIcon={<Plus size={20} />}
              onClick={() => handleOpenDialog()}
            >
              Add Category
            </Button>
          </Box>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "rgba(195, 147, 124, 0.1)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Products
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">
                            No categories found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCategories.map((category) => (
                        <TableRow key={category.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {category.name}
                          </TableCell>
                              <TableCell>
                                {category.parentId
                                  ? categories.find((c) => c.id === category.parentId)?.name ||
                                    "—"
                                  : "—"}
                              </TableCell>
                          <TableCell align="center">
                            <Chip label={category.productCount} size="small" />
                          </TableCell>
                          <TableCell>{formatDateTime(category.createdAt)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewCategory(category)}
                                title="View Details"
                              >
                                <Eye size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(category)}
                                title="Edit"
                              >
                                <Edit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCategory(category.id)}
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

      {/* Add/Edit Category Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a67c66',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a67c66',
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  backgroundColor: '#f8f3f0',
                },
              }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              select
              label="Parent Category (optional)"
              variant="outlined"
              fullWidth
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              helperText="Chỉ 1 cấp con. Chọn trống nếu là category cha."
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a67c66',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a67c66',
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  backgroundColor: '#f8f3f0',
                },
              }}
            >
              <MenuItem value="">(Không chọn)</MenuItem>
              {parentOptions
                .filter((c) => c.id !== editingCategory?.id)
                .map((parent) => (
                  <MenuItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              color: "#f1efee",
              bgcolor: "#C3937C",
              "&:hover": {
                bgcolor: "#A67C5A",
              },
            }}
            onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
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

      {/* View Category Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setViewingCategory(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Category Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewingCategory && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  Category Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {viewingCategory.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Parent
                  </Typography>
                  <Typography variant="body1">
                    {viewingCategory.parentId
                      ? categories.find((c) => c.id === viewingCategory.parentId)?.name ||
                        "—"
                      : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Total Products
                  </Typography>
                  <Chip
                    label={viewingCategory.productCount}
                    size="small"
                    sx={{
                      bgcolor: viewingCategory.productCount > 0
                        ? "rgba(195, 147, 124, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      color: viewingCategory.productCount > 0
                        ? "#C3937C"
                        : "text.secondary",
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(viewingCategory.createdAt)}
                  </Typography>
                </Box>
              </Box>

              {viewingCategory.productCount > 0 && (
                <Box>
                  <Typography variant="body2" color="warning.main" sx={{ fontStyle: "italic" }}>
                    ⚠️ This category cannot be deleted because it contains products.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialogOpen(false);
            setViewingCategory(null);
          }}
            sx={{
              color: "#f1efee",
              bgcolor: "#C3937C",
              "&:hover": {
                bgcolor: "#A67C5A",
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Categories;
