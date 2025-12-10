import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Trash2, Eye } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { useSearchParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
  startPrice: number;
  stepPrice: number;
  buyNowPrice?: number;
  status: "active" | "ended" | "draft";
  bids: number;
  createdAt: string;
}

const Products: React.FC = () => {
  // --------------------------------------
  // 1) DATA STATE (original + filtered)
  // --------------------------------------
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "iPhone 15 Pro Max",
      category: "Electronics",
      startPrice: 25000000,
      stepPrice: 100000,
      buyNowPrice: 28000000,
      status: "active",
      bids: 24,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Designer Handbag",
      category: "Fashion",
      startPrice: 5000000,
      stepPrice: 50000,
      status: "active",
      bids: 12,
      createdAt: "2024-01-16",
    },
    {
      id: "3",
      name: "Laptop Dell XPS 13",
      category: "Electronics",
      startPrice: 20000000,
      stepPrice: 200000,
      buyNowPrice: 25000000,
      status: "ended",
      bids: 8,
      createdAt: "2024-01-10",
    },
  ]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // --------------------------------------
  // 2) URL SYNC
  // --------------------------------------
  const [searchParams] = useSearchParams();

  const urlQ = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlStatus = searchParams.get("status") || "";

  // --------------------------------------
  // 3) SEARCH / FILTER STATE
  // --------------------------------------
  const [searchText, setSearchText] = useState(urlQ);
  const [filterCategory, setFilterCategory] = useState(urlCategory);
  const [filterStatus, setFilterStatus] = useState(urlStatus);

  // --------------------------------------
  // 4) LOADING STATE (giống ProductPage)
  // --------------------------------------
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // --------------------------------------
  // 5) APPLY URL FILTERS ON PAGE LOAD
  // --------------------------------------
  useEffect(() => {
    setSearchText(urlQ);
    setFilterCategory(urlCategory);
    setFilterStatus(urlStatus);
  }, [urlQ, urlCategory, urlStatus]);

  // --------------------------------------
  // 6) MAIN FILTER LOGIC (giống ProductPage)
  // --------------------------------------
  useEffect(() => {
    setIsSearching(true);

    let result = [...products];

    // Search text
    if (searchText.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory.trim()) {
      result = result.filter((p) => p.category === filterCategory);
    }

    // Status filter
    if (filterStatus.trim()) {
      result = result.filter((p) => p.status === filterStatus);
    }

    setFilteredProducts(result);
    setIsSearching(false);
  }, [products, searchText, filterCategory, filterStatus]);

  // --------------------------------------
  // 7) DELETE PRODUCT
  // --------------------------------------
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setViewDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Pagination logic
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#fdfcf9", p: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Products Management
            </Typography>
          </Box>

          {/* Search Bar (bạn sẽ xử lý truyền filter vào đây sau) */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <ProductSearchBar />
          </Box>

          {/* TABLE - giữ nguyên */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "rgba(195, 147, 124, 0.1)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Start Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Step Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Bids
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">
                            No products found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell align="right">
                            {formatPrice(product.startPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(product.stepPrice)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={product.status}
                              size="small"
                              color={
                                product.status === "active"
                                  ? "success"
                                  : product.status === "ended"
                                    ? "error"
                                    : "default"
                              }
                            />
                          </TableCell>

                          <TableCell align="center">{product.bids}</TableCell>
                          <TableCell>{product.createdAt}</TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
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
            Are you sure you want to remove this product? This action cannot be undone.
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
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  Product Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {viewingProduct.name}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Category
                  </Typography>
                  <Chip label={viewingProduct.category} size="small" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={viewingProduct.status}
                    size="small"
                    color={
                      viewingProduct.status === "active"
                        ? "success"
                        : viewingProduct.status === "ended"
                          ? "error"
                          : "default"
                    }
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Pricing Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Start Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatPrice(viewingProduct.startPrice)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Step Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatPrice(viewingProduct.stepPrice)}
                    </Typography>
                  </Box>
                  {viewingProduct.buyNowPrice && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Buy Now Price:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: "#C3937C" }}>
                        {formatPrice(viewingProduct.buyNowPrice)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Total Bids
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {viewingProduct.bids}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewingProduct.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setViewDialogOpen(false);
            setViewingProduct(null);

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

      <Footer />
    </div>
  );
};

export default Products;
