import React, { useState, useEffect, useCallback } from "react";
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
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { Trash2, Eye } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { useSearchParams } from "react-router-dom";
import {
  getAdminProducts,
  deleteAdminProduct,
  AdminProduct,
} from "../../api/adminProduct";

interface Product {
  id: number;
  name: string;
  thumbnailUrl: string;
  category: string;
  startPrice: number;
  currentPrice: number | null;
  buyNowPrice: number | null;
  status: "ACTIVE" | "ENDED" | "CANCELLED";
  bids: number;
  createdAt: string;
  endAt: string;
  sellerName: string | null;
  sellerEmail: string | null;
  topBidderName: string | null;
}

const Products: React.FC = () => {
  // --------------------------------------
  // 1) DATA STATE
  // --------------------------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --------------------------------------
  // 2) URL SYNC
  // --------------------------------------
  const [searchParams] = useSearchParams();

  const urlQ = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);

  // --------------------------------------
  // 3) SEARCH / FILTER STATE
  // --------------------------------------
  const [searchText, setSearchText] = useState(urlQ);
  const [filterCategory, setFilterCategory] = useState(urlCategory);
  const [filterStatus, setFilterStatus] = useState(urlStatus);

  // --------------------------------------
  // 4) LOADING STATE
  // --------------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [, setDeleteLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Pagination state
  const [page, setPage] = useState(urlPage);
  const [rowsPerPage] = useState(10);

  // --------------------------------------
  // 5) FETCH PRODUCTS FROM API
  // --------------------------------------
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminProducts({
        page: page - 1, // API uses 0-based index
        size: rowsPerPage,
        search: searchText.trim() || undefined,
        status:
          filterStatus === "ALL"
            ? undefined
            : (filterStatus as "ACTIVE" | "ENDED"),
        categoryId: filterCategory ? parseInt(filterCategory) : undefined,
      });

      const pageData = response.data;

      // Map API response to local Product format
      const mappedProducts: Product[] = pageData.content.map(
        (p: AdminProduct) => ({
          id: p.id,
          name: p.productName,
          thumbnailUrl: p.thumbnailUrl,
          category: p.categoryName || "Uncategorized",
          startPrice: p.startPrice,
          currentPrice: p.currentPrice,
          buyNowPrice: p.buyNowPrice,
          status: p.status,
          bids: p.bidCount,
          createdAt: p.createdAt,
          endAt: p.endAt,
          sellerName: p.sellerName,
          sellerEmail: p.sellerEmail,
          topBidderName: p.topBidderName,
        })
      );

      setProducts(mappedProducts);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchText, filterStatus, filterCategory]);

  // --------------------------------------
  // 6) APPLY URL FILTERS ON PAGE LOAD
  // --------------------------------------
  useEffect(() => {
    setSearchText(urlQ);
    setFilterCategory(urlCategory);
    setFilterStatus(urlStatus);
    setPage(urlPage);
  }, [urlQ, urlCategory, urlStatus, urlPage]);

  // --------------------------------------
  // 7) FETCH PRODUCTS WHEN FILTERS CHANGE
  // --------------------------------------
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --------------------------------------
  // 8) DELETE PRODUCT
  // --------------------------------------
  const handleDeleteProduct = async (id: number) => {
    setDeleteLoading(true);
    try {
      await deleteAdminProduct(id);
      // Refetch products after deletion
      await fetchProducts();
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setViewDialogOpen(true);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Pagination logic
  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // --------------------------------------
  // RENDER
  // --------------------------------------
  if (loading && products.length === 0) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: "#C3937C" }} />
        </Box>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#fdfcf9", p: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Products Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total: {totalElements} products
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Search Bar */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <ProductSearchBar />
          </Box>

          {/* Loading Overlay */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CircularProgress size={24} sx={{ color: "#C3937C" }} />
            </Box>
          )}

          {/* TABLE */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "rgba(195, 147, 124, 0.1)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Current Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Buy Now
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Bids
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">
                            No products found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product: Product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={product.thumbnailUrl}
                                variant="rounded"
                                sx={{ width: 48, height: 48 }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {product.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Seller: {product.sellerName || "Unknown"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.category}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(
                              product.currentPrice || product.startPrice
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(product.buyNowPrice)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={product.status}
                              size="small"
                              color={
                                product.status === "ACTIVE"
                                  ? "success"
                                  : product.status === "ENDED"
                                  ? "error"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell align="center">{product.bids}</TableCell>
                          <TableCell>
                            {new Date(product.endAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>

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
                                onClick={() => handleViewProduct(product)}
                                title="View Details"
                              >
                                <Eye size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setProductToDelete(product.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                title="Remove Product"
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Remove Product</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to remove this product? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (productToDelete) handleDeleteProduct(productToDelete);
              setDeleteConfirmOpen(false);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Product Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setViewingProduct(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewingProduct && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Product Image and Name */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Avatar
                  src={viewingProduct.thumbnailUrl}
                  variant="rounded"
                  sx={{ width: 120, height: 120 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {viewingProduct.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    ID: {viewingProduct.id}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Category
                  </Typography>
                  <Chip label={viewingProduct.category} size="small" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Status
                  </Typography>
                  <Chip
                    label={viewingProduct.status}
                    size="small"
                    color={
                      viewingProduct.status === "ACTIVE"
                        ? "success"
                        : viewingProduct.status === "ENDED"
                        ? "error"
                        : "default"
                    }
                  />
                </Box>
              </Box>

              <Divider />

              {/* Seller Info */}
              <Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Seller Information
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography variant="body1">
                    Name:{" "}
                    <strong>{viewingProduct.sellerName || "Unknown"}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email: {viewingProduct.sellerEmail || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Pricing Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Start Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatPrice(viewingProduct.startPrice)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Current Price:</Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: "#C3937C" }}
                    >
                      {formatPrice(
                        viewingProduct.currentPrice || viewingProduct.startPrice
                      )}
                    </Typography>
                  </Box>
                  {viewingProduct.buyNowPrice && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">Buy Now Price:</Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "#2e7d32" }}
                      >
                        {formatPrice(viewingProduct.buyNowPrice)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Total Bids
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {viewingProduct.bids}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Top Bidder
                  </Typography>
                  <Typography variant="body1">
                    {viewingProduct.topBidderName || "No bids yet"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewingProduct.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewingProduct.endAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setViewingProduct(null);
            }}
            sx={{
              borderColor: "#c3937c",
              color: "#c3937c",
              "&:hover": {
                borderColor: "#a67c66",
                bgcolor: "#f8f3f0",
              },
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

export default Products;
