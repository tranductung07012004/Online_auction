import React, { useEffect, useMemo, useState } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, Trash2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import api from "../../api/apiClient";

// Backend DTOs
interface CategoryApi {
  id: number;
  name: string;
  parent_id: number | null;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// UI model
interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // Cache of all categories for name lookups & parent dropdown (pagination only loads a slice)
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryNameToDelete, setCategoryNameToDelete] = useState<string>("");
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<{ name: string; parentId: string }>({
    name: "",
    parentId: "",
  });

  // Server-side pagination/search
  const [page, setPage] = useState(1); // UI is 1-based
  const [rowsPerPage] = useState(10);
  const [searchName, setSearchName] = useState("");

  // Load states
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Optional counts for deletion checks
  const [productCountByCategoryId, setProductCountByCategoryId] = useState<
    Record<number, number>
  >({});

  const mapCategory = (c: CategoryApi): Category => ({
    id: c.id,
    name: c.name,
    parentId: c.parent_id ?? null,
  });

  const fetchCountsForCurrentPage = async (cats: Category[]) => {
    // Fetch product counts for each category individually
    try {
      const countPromises = cats.map((cat) =>
        api
          .get<ApiResponse<number>>(
            `/api/main/categories/product-count/${cat.id}`
          )
          .then((res) => ({
            categoryId: cat.id,
            count: res.data.data ?? 0,
          }))
          .catch(() => ({
            categoryId: cat.id,
            count: 0,
          }))
      );

      const results = await Promise.all(countPromises);
      const countMap = results.reduce((acc, { categoryId, count }) => {
        acc[categoryId] = count;
        return acc;
      }, {} as Record<number, number>);

      setProductCountByCategoryId((prev) => ({
        ...prev,
        ...countMap,
      }));
    } catch {
      // ignore
    }
  };

  const fetchAllCategories = async () => {
    // Best-effort: this endpoint may be pageable. We only need a full list for lookups.
    try {
      const res = await api.get<ApiResponse<PageResponse<CategoryApi>>>(
        "/api/main/categories/search-norm",
        {
          params: {
            name: "",
            page: 0,
            size: 1000,
          },
        }
      );

      const pageData = res.data.data;
      setAllCategories(pageData.content.map(mapCategory));
    } catch {
      // ignore, fall back to current page data only
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<CategoryApi>>>(
        "/api/main/categories/search-norm",
        {
          params: {
            name: searchName,
            page: page - 1,
            size: rowsPerPage,
          },
        }
      );

      const pageData = res.data.data;
      const mapped = pageData.content.map(mapCategory);
      setCategories(mapped);

      // Keep allCategories warm so parent labels render correctly even with pagination
      if (allCategories.length === 0) {
        void fetchAllCategories();
      }

      // compute total pages from returned page data
      setTotalPages(pageData.totalPages || 1);

      // optional in-page counts
      void fetchCountsForCurrentPage(mapped);
    } catch (e: any) {
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const [totalPages, setTotalPages] = useState(1);

  // Load all categories once on mount (for parent dropdown)
  useEffect(() => {
    void fetchAllCategories();
  }, []);

  // Load current page when pagination/search changes
  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchName]);

  const parentOptions = useMemo(
    () =>
      (allCategories.length ? allCategories : categories).filter(
        (c) => c.parentId == null
      ),
    [allCategories, categories]
  );

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        parentId: category.parentId ? String(category.parentId) : "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", parentId: "" });
    }
    setDialogError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setDialogError(null);
  };

  const handleSaveCategory = async () => {
    const name = formData.name.trim();
    const parentIdNum = formData.parentId ? Number(formData.parentId) : null;

    if (!name) {
      setDialogError("Category name is required");
      return;
    }

    if (
      editingCategory &&
      parentIdNum != null &&
      parentIdNum === editingCategory.id
    ) {
      setDialogError("Parent category cannot be itself");
      return;
    }

    setMutating(true);
    setDialogError(null);
    try {
      if (editingCategory) {
        await api.put<ApiResponse<CategoryApi>>(
          `/api/main/categories/${editingCategory.id}`,
          {
            name,
            parent_id: parentIdNum,
          }
        );
      } else {
        await api.post<ApiResponse<CategoryApi>>("/api/main/categories", {
          name,
          parent_id: parentIdNum,
        });
      }

      handleCloseDialog();
      // refresh
      await fetchAllCategories();
      await fetchCategories();

      // Show success message
      setSuccessMessage(
        editingCategory
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setDialogError(
        e?.response?.data?.message || e?.message || "Failed to save category"
      );
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const productCount = productCountByCategoryId[id] ?? 0;
    if (productCount > 0) {
      setWarningMessage(
        "Cannot delete category with products. Remove products first."
      );
      setWarningDialogOpen(true);
      return;
    }

    // Get the category name
    const categoryToDeleteName =
      categories.find((c) => c.id === id)?.name || "";

    // Open delete confirmation dialog
    setCategoryToDelete(id);
    setCategoryNameToDelete(categoryToDeleteName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete === null) return;

    setMutating(true);
    try {
      await api.delete(`/api/main/categories/${categoryToDelete}`);

      // refresh
      await fetchCategories();
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setWarningMessage(
        e?.response?.data?.message || e?.message || "Failed to delete category"
      );
      setWarningDialogOpen(true);
    } finally {
      setMutating(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      setCategoryNameToDelete("");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    setCategoryNameToDelete("");
  };

  const handleCloseWarningDialog = () => {
    setWarningDialogOpen(false);
    setWarningMessage("");
  };

  // Pagination logic
  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
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
              Categories Management
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                label="Search"
                value={searchName}
                onChange={(e) => {
                  setPage(1);
                  setSearchName(e.target.value);
                }}
              />

              <Button
                variant="contained"
                sx={{
                  bgcolor: "#C3937C",
                  "&:hover": {
                    bgcolor: "#A67C5A",
                  },
                  transition: "all 0.2s ease",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                startIcon={<Plus size={20} />}
                onClick={() => handleOpenDialog()}
                disabled={mutating}
              >
                Add Category
              </Button>
            </Box>
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
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#5d4037" }}>
                        Parent
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "#5d4037" }}
                        align="center"
                      >
                        Products
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
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">
                            No categories found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow
                          key={category.id}
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
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {category.parentId
                              ? categories.find(
                                  (c) => c.id === category.parentId
                                )?.name ||
                                (allCategories.length
                                  ? allCategories.find(
                                      (c) => c.id === category.parentId
                                    )?.name
                                  : undefined) ||
                                "—"
                              : "—"}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={productCountByCategoryId[category.id] ?? 0}
                              size="small"
                            />
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
                                onClick={() => handleOpenDialog(category)}
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
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
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
        <DialogTitle
          sx={{ fontWeight: 600, color: "#5d4037", fontSize: "1.3rem" }}
        >
          {editingCategory ? "Edit Category" : "Add New Category"}
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
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              icon={<AlertCircle size={20} style={{ color: "#c62828" }} />}
            >
              {dialogError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              disabled={mutating}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              select
              label="Parent Category (optional)"
              variant="outlined"
              fullWidth
              value={formData.parentId}
              disabled={mutating}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              helperText="Only 1 level of subcategory. Leave empty if this is a parent category."
            >
              <MenuItem value="">(None)</MenuItem>
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
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button
            sx={{
              color: "#C3937C",
              bgcolor: "transparent",
              border: "1px solid #C3937C",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
              transition: "all 0.2s ease",
            }}
            onClick={handleCloseDialog}
            disabled={mutating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={mutating}
            sx={{
              bgcolor: "#C3937C",
              "&:hover": { bgcolor: "#A67C5A" },
              transition: "all 0.2s ease",
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
          Delete Category
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
                {categoryNameToDelete && (
                  <span style={{ fontWeight: 600, color: "#d32f2f" }}>
                    "{categoryNameToDelete}"
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
              transition: "all 0.2s ease",
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
              transition: "all 0.2s ease",
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
              transition: "all 0.2s ease",
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

export default Categories;
