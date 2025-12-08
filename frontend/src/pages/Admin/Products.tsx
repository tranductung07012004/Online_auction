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
} from "@mui/material";
import { Trash2 } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { ProductSearchBar } from "./ProductSearchBar";
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
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

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
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
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
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
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
                    {filteredProducts.map((product) => (
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
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setProductToDelete(product.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography>No products found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>

        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn
            tác.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (productToDelete) handleDeleteProduct(productToDelete);
              setDeleteConfirmOpen(false);
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Products;
