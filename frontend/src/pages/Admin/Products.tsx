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
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import AdminSidebar from "./AdminSidebar";

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

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    startPrice: "",
    stepPrice: "",
    buyNowPrice: "",
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        startPrice: product.startPrice.toString(),
        stepPrice: product.stepPrice.toString(),
        buyNowPrice: product.buyNowPrice?.toString() || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        startPrice: "",
        stepPrice: "",
        buyNowPrice: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                category: formData.category,
                startPrice: parseInt(formData.startPrice),
                stepPrice: parseInt(formData.stepPrice),
                buyNowPrice: formData.buyNowPrice
                  ? parseInt(formData.buyNowPrice)
                  : undefined,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        startPrice: parseInt(formData.startPrice),
        stepPrice: parseInt(formData.stepPrice),
        buyNowPrice: formData.buyNowPrice
          ? parseInt(formData.buyNowPrice)
          : undefined,
        status: "draft",
        bids: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setProducts([...products, newProduct]);
    }
    handleCloseDialog();
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1 }}>
        <AdminSidebar />

        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
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
                Products Management
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: "#E53935" }}
                startIcon={<Plus size={20} />}
                onClick={() => handleOpenDialog()}
              >
                Add Product
              </Button>
            </Box>

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
                      {products.map((product) => (
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
                              color="primary"
                              onClick={() => handleOpenDialog(product)}
                            >
                              <Edit size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Product Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
          <TextField
            label="Start Price"
            type="number"
            fullWidth
            value={formData.startPrice}
            onChange={(e) =>
              setFormData({ ...formData, startPrice: e.target.value })
            }
          />
          <TextField
            label="Step Price"
            type="number"
            fullWidth
            value={formData.stepPrice}
            onChange={(e) =>
              setFormData({ ...formData, stepPrice: e.target.value })
            }
          />
          <TextField
            label="Buy Now Price (Optional)"
            type="number"
            fullWidth
            value={formData.buyNowPrice}
            onChange={(e) =>
              setFormData({ ...formData, buyNowPrice: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
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

export default Products;
