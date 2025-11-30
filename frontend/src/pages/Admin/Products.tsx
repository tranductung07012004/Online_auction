import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  FormHelperText
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Visibility,
  Image,
  Close
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  getAllDresses,
  createDress,
  updateDress,
  deleteDress,
  removeImage,
  Dress,
  DressVariant
} from '../../api/dress';
import { getAllSizes, getAllColors, Size, Color } from '../../api/admin';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Products = () => {
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Dresses state
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [filteredDresses, setFilteredDresses] = useState<Dress[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDressId, setCurrentDressId] = useState<string | null>(null);
  
  // Form data
  const [name, setName] = useState('');
  const [dailyRentalPrice, setDailyRentalPrice] = useState<number | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState('');
  const [sizeAndFit, setSizeAndFit] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [material, setMaterial] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Array<{
    size: string; // Chỉ lưu ID của size
    color: string; // Chỉ lưu ID của color
    stock: number;
  }>>([]);
  const [showFullVariantForm, setShowFullVariantForm] = useState(true);
  
  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dressToDelete, setDressToDelete] = useState<string | null>(null);
  
  // Validation
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    dailyRentalPrice?: string;
    purchasePrice?: string;
    variants?: string;
  }>({});
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDresses();
    fetchSizesAndColors();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = dresses.filter(dress => 
        dress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dress.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dress.material?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDresses(filtered);
    } else {
      setFilteredDresses(dresses);
    }
  }, [searchTerm, dresses]);

  const fetchDresses = async () => {
    try {
      setLoading(true);
      const dressesData = await getAllDresses();
      setDresses(dressesData);
      setFilteredDresses(dressesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dresses:', error);
      setError('Failed to load dresses');
      setLoading(false);
    }
  };

  const fetchSizesAndColors = async () => {
    try {
      const [sizesData, colorsData] = await Promise.all([
        getAllSizes(),
        getAllColors()
      ]);
      
      console.log('Loaded sizes:', sizesData);
      console.log('Loaded colors:', colorsData);
      
      setSizes(sizesData);
      setColors(colorsData);
      
      if (!sizesData || sizesData.length === 0) {
        setError('No sizes available. Please add sizes first.');
      }
      
      if (!colorsData || colorsData.length === 0) {
        setError('No colors available. Please add colors first.');
      }
    } catch (error) {
      console.error('Error fetching sizes and colors:', error);
      setError('Failed to load sizes and colors');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (dress?: Dress) => {
    if (dress) {
      // Edit mode
      setEditMode(true);
      setCurrentDressId(dress._id);
      setName(dress.name);
      setDailyRentalPrice(dress.dailyRentalPrice);
      setPurchasePrice(dress.purchasePrice);
      setProductDetail(dress.description?.productDetail || '');
      setSizeAndFit(dress.description?.sizeAndFit || '');
      setDescription(dress.description?.description || '');
      setStyle(dress.style || '');
      setMaterial(dress.material || '');
      setExistingImages(dress.images || []);
      setShowFullVariantForm(true); // Luôn hiển thị form đầy đủ khi chỉnh sửa sản phẩm
      
      // Đảm bảo danh sách kích thước và màu sắc được tải trước khi thiết lập biến thể
      fetchSizesAndColors().then(() => {
        console.log('Loaded sizes:', sizes);
        console.log('Loaded colors:', colors);
        console.log('Dress variants:', JSON.stringify(dress.variants, null, 2));
        
        try {
          // Chuyển đổi biến thể sau khi kích thước và màu sắc được tải
          const formattedVariants = dress.variants.map(v => {
            // In ra để kiểm tra giá trị ban đầu
            console.log('Original variant:', JSON.stringify(v, null, 2));
            
            // Xử lý kỹ lưỡng để lấy ra ID
            let sizeId = '';
            if (v.size) {
              if (typeof v.size === 'object' && v.size._id) {
                sizeId = v.size._id;
              } else if (typeof v.size === 'string') {
                sizeId = v.size;
              }
            }
            
            let colorId = '';
            if (v.color) {
              if (typeof v.color === 'object' && v.color._id) {
                colorId = v.color._id;
              } else if (typeof v.color === 'string') {
                colorId = v.color;
              }
            }
            
            // Kiểm tra xem ID có trong danh sách sizes và colors không
            const sizeExists = sizes.some(s => s._id === sizeId);
            const colorExists = colors.some(c => c._id === colorId);
            
            console.log(`Processed IDs - Size: ${sizeId} (exists: ${sizeExists}), Color: ${colorId} (exists: ${colorExists})`);
            
            // Sử dụng ID đầu tiên trong danh sách nếu không tìm thấy
            if (!sizeExists && sizes.length > 0) {
              sizeId = sizes[0]._id;
              console.log(`Size ID not found, using default: ${sizeId}`);
            }
            
            if (!colorExists && colors.length > 0) {
              colorId = colors[0]._id;
              console.log(`Color ID not found, using default: ${colorId}`);
            }
            
            return {
              size: sizeId,
              color: colorId,
              stock: v.stock || 0
            };
          });
          
          console.log('Final formatted variants:', formattedVariants);
          setVariants(formattedVariants);
        } catch (error) {
          console.error('Error processing variants:', error);
          // Thiết lập một mảng rỗng trong trường hợp có lỗi
          setVariants([]);
        }
      });
    } else {
      // Add mode
      setEditMode(false);
      setCurrentDressId(null);
      resetForm();
      setShowFullVariantForm(true); // Luôn hiển thị form đầy đủ khi tạo mới sản phẩm
    }
    
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    resetForm();
    setFormErrors({});
  };

  const resetForm = () => {
    setName('');
    setDailyRentalPrice(null);
    setPurchasePrice(null);
    setProductDetail('');
    setSizeAndFit('');
    setDescription('');
    setStyle('');
    setMaterial('');
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
    setVariants([]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files);
      setSelectedImages(prev => [...prev, ...newImages]);
      
      // Create preview URLs
      const newImageUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Also remove the preview URL
    const urlToRevoke = imagePreviewUrls[index];
    URL.revokeObjectURL(urlToRevoke);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    if (!currentDressId) return;
    
    try {
      await removeImage(currentDressId, imageUrl);
      setExistingImages(prev => prev.filter(img => img !== imageUrl));
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image');
    }
  };

  const handleAddVariant = () => {
    if (sizes.length === 0 || colors.length === 0) {
      setError('Please wait for sizes and colors to load first');
      return;
    }
    
    const defaultSizeId = sizes[0]?._id || '';
    const defaultColorId = colors[0]?._id || '';
    
    console.log('Adding variant with default size:', defaultSizeId, 'color:', defaultColorId);
    
    setVariants([
      ...variants,
      {
        size: defaultSizeId,
        color: defaultColorId,
        stock: 0
      }
    ]);
  };

  const handleVariantChange = (index: number, field: 'size' | 'color' | 'stock', value: string | number) => {
    console.log(`Changing variant ${index} field ${field} to:`, value);
    
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    
    console.log('Updated variants:', newVariants);
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      dailyRentalPrice?: string;
      purchasePrice?: string;
      variants?: string;
    } = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (dailyRentalPrice === null || isNaN(dailyRentalPrice) || dailyRentalPrice <= 0) {
      errors.dailyRentalPrice = 'Daily rental price must be a positive number';
    }
    
    if (purchasePrice === null || isNaN(purchasePrice) || purchasePrice <= 0) {
      errors.purchasePrice = 'Purchase price must be a positive number';
    }
    
    if (variants.length === 0) {
      errors.variants = 'At least one variant is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('dailyRentalPrice', dailyRentalPrice?.toString() || '0');
    formData.append('purchasePrice', purchasePrice?.toString() || '0');
    
    if (productDetail) formData.append('description[productDetail]', productDetail);
    if (sizeAndFit) formData.append('description[sizeAndFit]', sizeAndFit);
    if (description) formData.append('description[description]', description);
    if (style) formData.append('style', style);
    if (material) formData.append('material', material);
    
    // Add variants
    variants.forEach((variant, index) => {
      formData.append(`variants[${index}][size]`, variant.size);
      formData.append(`variants[${index}][color]`, variant.color);
      formData.append(`variants[${index}][stock]`, variant.stock.toString());
    });
    
    // Add images
    selectedImages.forEach(image => {
      formData.append('images', image);
    });
    
    try {
      setLoading(true);
      
      if (editMode && currentDressId) {
        await updateDress(currentDressId, formData);
      } else {
        await createDress(formData);
      }
      
      await fetchDresses();
      handleCloseForm();
      setLoading(false);
    } catch (error) {
      console.error('Error saving dress:', error);
      setError('Failed to save dress');
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (dressId: string) => {
    setDressToDelete(dressId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!dressToDelete) return;
    
    try {
      setLoading(true);
      await deleteDress(dressToDelete);
      setConfirmDialogOpen(false);
      setDressToDelete(null);
      await fetchDresses();
      setLoading(false);
    } catch (error) {
      console.error('Error deleting dress:', error);
      setError('Failed to delete dress');
      setLoading(false);
    }
  };

  const getSizeLabel = (sizeId: string) => {
    const size = sizes.find(s => s._id === sizeId);
    return size ? size.label : 'Unknown Size';
  };

  const getColorName = (colorId: string) => {
    const color = colors.find(c => c._id === colorId);
    return color ? color.name : 'Unknown Color';
  };

  if (loading && dresses.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Product Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your wedding dress inventory
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenForm()}
          sx={{ height: 'fit-content' }}
        >
          Add New Product
        </Button>
      </Box>

      <Paper sx={{ mb: 4, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products by name, style, or material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Daily Rental Price</TableCell>
              <TableCell>Purchase Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Style</TableCell>
              <TableCell>Material</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDresses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((dress) => (
                <TableRow key={dress._id}>
                  <TableCell>{dress.name}</TableCell>
                  <TableCell>${dress.dailyRentalPrice}</TableCell>
                  <TableCell>${dress.purchasePrice}</TableCell>
                  <TableCell>
                    {dress.variants.reduce((total, v) => total + v.stock, 0)}
                  </TableCell>
                  <TableCell>{dress.style || 'N/A'}</TableCell>
                  <TableCell>{dress.material || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenForm(dress)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteConfirm(dress._id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {filteredDresses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No dresses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDresses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dress Form Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f5f5f5',
            mb: 2
          }}
        >
          {editMode ? 'Edit Dress' : 'Add New Dress'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitDress} noValidate sx={{ mt: 1 }}>
            {/* Basic Information Section */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: '#3f51b5' }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Daily Rental Price"
                    type="number"
                    InputProps={{ 
                      inputProps: { min: 0 },
                      startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                    }}
                    value={dailyRentalPrice === null ? '' : dailyRentalPrice}
                    onChange={(e) => setDailyRentalPrice(Number(e.target.value))}
                    error={!!formErrors.dailyRentalPrice}
                    helperText={formErrors.dailyRentalPrice}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    InputProps={{ 
                      inputProps: { min: 0 },
                      startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                    }}
                    value={purchasePrice === null ? '' : purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    error={!!formErrors.purchasePrice}
                    helperText={formErrors.purchasePrice}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Description Section */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: '#3f51b5' }}>
                Product Details & Description
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Product Detail"
                    multiline
                    rows={3}
                    value={productDetail}
                    onChange={(e) => setProductDetail(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Size and Fit"
                    multiline
                    rows={3}
                    value={sizeAndFit}
                    onChange={(e) => setSizeAndFit(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Variants Section */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#3f51b5' }}>
                  Variants
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddVariant}
                >
                  Add Variant
                </Button>
              </Box>

              {formErrors.variants && (
                <FormHelperText error sx={{ mb: 2 }}>{formErrors.variants}</FormHelperText>
              )}

              {variants.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No variants added yet. Click "Add Variant" to create size and color combinations.
                  </Typography>
                </Box>
              ) : (
                variants.map((variant, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      bgcolor: index % 2 === 0 ? '#f8f8f8' : 'white'
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        {true && (
                          <FormControl fullWidth size="small">
                            <InputLabel>Size</InputLabel>
                            <Select
                              value={variant.size || ''}
                              label="Size"
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            >
                              {sizes && sizes.length > 0 ? (
                                sizes.map((size) => (
                                  <MenuItem key={size._id} value={size._id}>
                                    {size.label}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled value="">
                                  No sizes available
                                </MenuItem>
                              )}
                            </Select>
                            {(!sizes || sizes.length === 0) && (
                              <FormHelperText error>No sizes available. Please add sizes first.</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {true && (
                          <FormControl fullWidth size="small">
                            <InputLabel>Color</InputLabel>
                            <Select
                              value={variant.color || ''}
                              label="Color"
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                            >
                              {colors && colors.length > 0 ? (
                                colors.map((color) => (
                                  <MenuItem key={color._id} value={color._id}>
                                    {color.name}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled value="">
                                  No colors available
                                </MenuItem>
                              )}
                            </Select>
                            {(!colors || colors.length === 0) && (
                              <FormHelperText error>No colors available. Please add colors first.</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Stock"
                          type="number"
                          size="small"
                          InputProps={{ inputProps: { min: 0 } }}
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => handleRemoveVariant(index)}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              )}
            </Paper>

            {/* Images Section */}
            <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: '#3f51b5' }}>
                Images
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Image />}
                size="small"
              >
                Add Images
                <VisuallyHiddenInput 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>

              {/* Image Previews */}
              {(imagePreviewUrls.length > 0 || existingImages.length > 0) ? (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {existingImages.map((img, index) => (
                    <Box
                      key={`existing-${index}`}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <img
                        src={img}
                        alt={`Dress Preview ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        onClick={() => handleRemoveExistingImage(img)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  {imagePreviewUrls.map((url, index) => (
                    <Box
                      key={`new-${index}`}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <img
                        src={url}
                        alt={`New Preview ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        onClick={() => handleRemoveSelectedImage(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ mt: 2, p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No images added yet. Click "Add Images" to upload product photos.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button onClick={handleCloseForm} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitDress} 
            variant="contained" 
            startIcon={editMode ? <Edit /> : <Add />}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this dress? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Products; 