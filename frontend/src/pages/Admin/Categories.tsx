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
import { Edit, Trash2, Plus, Eye } from "lucide-react";
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
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

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
  const [error, setError] = useState<string | null>(null);

  // Optional counts for deletion checks
  const [productCountByCategoryId, setProductCountByCategoryId] = useState<
    Record<number, number>
  >({});
  const [childCountByParentId, setChildCountByParentId] = useState<
    Record<number, number>
  >({});

  const mapCategory = (c: CategoryApi): Category => ({
    id: c.id,
    name: c.name,
    parentId: c.parent_id ?? null,
  });

  const fetchCountsForCurrentPage = async (cats: Category[]) => {
    // Best-effort: if backend doesn't support these endpoints, we just skip.
    try {
      const ids = cats.map((c) => c.id);
      if (ids.length === 0) return;

      // Try common endpoints; ignore failures.
      const [productCountsRes, childCountsRes] = await Promise.allSettled([
        api.post<ApiResponse<Record<number, number>>>(
          "/api/main/categories/admin/product-counts",
          { ids }
        ),
        api.post<ApiResponse<Record<number, number>>>(
          "/api/main/categories/admin/child-counts",
          { ids }
        ),
      ]);

      if (
        productCountsRes.status === "fulfilled" &&
        productCountsRes.value?.data?.data
      ) {
        setProductCountByCategoryId((prev) => ({
          ...prev,
          ...productCountsRes.value.data.data,
        }));
      }
      if (
        childCountsRes.status === "fulfilled" &&
        childCountsRes.value?.data?.data
      ) {
        setChildCountByParentId((prev) => ({
          ...prev,
          ...childCountsRes.value.data.data,
        }));
      }
    } catch {
      // ignore
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
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

      // compute total pages from returned page data
      setTotalPages(pageData.totalPages || 1);

      // optional in-page counts
      void fetchCountsForCurrentPage(mapped);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load categories"
      );
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchName]);

  const parentOptions = useMemo(
    () => categories.filter((c) => c.parentId == null),
    [categories]
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
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    const name = formData.name.trim();
    const parentIdNum = formData.parentId ? Number(formData.parentId) : null;

    if (!name) {
      setError("Category name is required");
      return;
    }

    if (
      editingCategory &&
      parentIdNum != null &&
      parentIdNum === editingCategory.id
    ) {
      setError("Parent category cannot be itself");
      return;
    }

    setMutating(true);
    setError(null);
    try {
      if (editingCategory) {
        await api.put<ApiResponse<CategoryApi>>(
          `/api/main/admin/categories/${editingCategory.id}`,
          {
            name,
            parent_id: parentIdNum,
          }
        );
      } else {
        await api.post<ApiResponse<CategoryApi>>("/api/main/admin/categories", {
          name,
          parent_id: parentIdNum,
        });
      }

      handleCloseDialog();
      // refresh
      await fetchCategories();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to save category"
      );
    } finally {
      setMutating(false);
    }
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setViewDialogOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    const childCount = childCountByParentId[id] ?? 0;
    if (childCount > 0) {
      alert(
        "Cannot delete category that has subcategories. Remove subcategories first."
      );
      return;
    }

    const productCount = productCountByCategoryId[id] ?? 0;
    if (productCount > 0) {
      alert("Cannot delete category with products. Remove products first.");
      return;
    }

    if (!confirm("Delete this category?")) return;

    setMutating(true);
    setError(null);
    try {
      await api.delete(`/api/main/admin/categories/${id}`);

      // refresh
      await fetchCategories();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to delete category"
      );
    } finally {
      setMutating(false);
    }
  };

  // Pagination logic
  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const formatDateTime = (_value: string) => {
    // Backend currently doesn't return createdAt for categories; keep placeholder.
    return "—";
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
                }}
                startIcon={<Plus size={20} />}
                onClick={() => handleOpenDialog()}
                disabled={mutating}
              >
                Add Category
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">
                            No categories found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {category.parentId
                              ? categories.find(
                                  (c) => c.id === category.parentId
                                )?.name || "—"
                              : "—"}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={productCountByCategoryId[category.id] ?? 0}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDateTime("")}</TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
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
                                disabled={mutating}
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
              helperText="Chỉ 1 cấp con. Chọn trống nếu là category cha."
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
              "&:hover": { bgcolor: "#A67C5A" },
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
            sx={{ bgcolor: "#C3937C", "&:hover": { bgcolor: "#A67C5A" } }}
          >
            {mutating ? "Saving..." : "Save"}
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
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 0.5 }}
                >
                  Category Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {viewingCategory.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Parent
                  </Typography>
                  <Typography variant="body1">
                    {viewingCategory.parentId
                      ? categories.find(
                          (c) => c.id === viewingCategory.parentId
                        )?.name || "—"
                      : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Total Products
                  </Typography>
                  <Chip
                    label={productCountByCategoryId[viewingCategory.id] ?? 0}
                    size="small"
                  />
                </Box>
              </Box>

              {(productCountByCategoryId[viewingCategory.id] ?? 0) > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ fontStyle: "italic" }}
                  >
                    This category cannot be deleted because it contains
                    products.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setViewingCategory(null);
            }}
            sx={{
              color: "#f1efee",
              bgcolor: "#C3937C",
              "&:hover": { bgcolor: "#A67C5A" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Categories;
