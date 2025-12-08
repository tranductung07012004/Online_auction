import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PhotoCamera,
  ArrowBack,
  Category as CategoryIcon,
  ExpandLess,
  ExpandMore,
  Close,
} from '@mui/icons-material';
import { createProduct } from '../../api/product';

// Available categories with parent-child structure
const CATEGORY_GROUPS = [
  {
    parent: 'smartphone',
    label: 'Smartphone',
    children: [
      { value: 'iphone', label: 'iPhone' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'xiaomi', label: 'Xiaomi' },
      { value: 'oppo', label: 'Oppo' },
    ],
  },
  {
    parent: 'clothes',
    label: 'Clothes',
    children: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
      { value: 'kids', label: 'Kids' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    parent: 'book',
    label: 'Book',
    children: [
      { value: 'fiction', label: 'Fiction' },
      { value: 'non-fiction', label: 'Non-Fiction' },
      { value: 'educational', label: 'Educational' },
    ],
  },
];

interface ProductFormData {
  name: string;
  buyNowPrice: string;
  startDate: string;
  endDate: string;
  description: string;
  categories: string[];
  mainImage: File | null;
  additionalImages: File[];
}

export default function CreateProduct() {
  const navigate = useNavigate();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    buyNowPrice: '',
    startDate: '',
    endDate: '',
    description: '',
    categories: [],
    mainImage: null,
    additionalImages: [],
  });

  // UI state
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Handle main image upload
  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFormData({ ...formData, mainImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Check if no files selected
    if (files.length === 0) {
      return;
    }

    // Check maximum limit
    if (files.length + formData.additionalImages.length > 10) {
      setError('Maximum 10 additional images allowed');
      return;
    }

    // Check if all files are images
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError('All files must be images');
      return;
    }

    // Add new images to existing ones
    const newImages = [...formData.additionalImages, ...imageFiles];
    setFormData({ ...formData, additionalImages: newImages });

    // Generate previews for new images
    const newPreviews = [...additionalImagePreviews];
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setAdditionalImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear error if any
    setError(null);
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  // Remove additional image
  const handleRemoveAdditionalImage = (index: number) => {
    const newImages = formData.additionalImages.filter((_, i) => i !== index);
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalImages: newImages });
    setAdditionalImagePreviews(newPreviews);
  };

  // Handle category selection
  const handleOpenCategoryDialog = () => {
    setTempSelectedCategories([...formData.categories]);
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setTempSelectedCategories([]);
  };

  const handleConfirmCategories = () => {
    setFormData({ ...formData, categories: tempSelectedCategories });
    setCategoryDialogOpen(false);
  };

  const handleToggleGroup = (parent: string) => {
    setExpandedGroups((prev) =>
      prev.includes(parent)
        ? prev.filter((g) => g !== parent)
        : [...prev, parent]
    );
  };

  const handleToggleCategory = (value: string) => {
    setTempSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  const handleToggleParentCategory = (_parent: string, children: { value: string }[]) => {
    const childValues = children.map((c) => c.value);
    const allSelected = childValues.every((v) => tempSelectedCategories.includes(v));
    
    if (allSelected) {
      // Deselect all children
      setTempSelectedCategories((prev) => prev.filter((cat) => !childValues.includes(cat)));
    } else {
      // Select all children
      const newCategories = [...tempSelectedCategories];
      childValues.forEach((v) => {
        if (!newCategories.includes(v)) {
          newCategories.push(v);
        }
      });
      setTempSelectedCategories(newCategories);
    }
  };

  const getCategoryLabel = (value: string): string => {
    for (const group of CATEGORY_GROUPS) {
      if (group.parent === value) return group.label;
      const child = group.children.find((c) => c.value === value);
      if (child) return child.label;
    }
    return value;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.mainImage) {
      setError('Main image is required');
      return;
    }

    if (formData.additionalImages.length < 3) {
      setError('At least 3 additional images are required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Auction start and end dates are required');
      return;
    }

    const startDateTime = new Date(formData.startDate);
    const endDateTime = new Date(formData.endDate);

    if (startDateTime >= endDateTime) {
      setError('End date must be after start date');
      return;
    }

    if (formData.categories.length === 0) {
      setError('At least one category is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    // Prepare form data for API
    setLoading(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      if (formData.buyNowPrice) {
        apiFormData.append('buyNowPrice', formData.buyNowPrice);
      }
      apiFormData.append('startDate', formData.startDate);
      apiFormData.append('endDate', formData.endDate);
      apiFormData.append('description', formData.description);
      apiFormData.append('categories', JSON.stringify(formData.categories));
      apiFormData.append('mainImage', formData.mainImage);
      formData.additionalImages.forEach((image, index) => {
        apiFormData.append(`additionalImage${index}`, image);
      });

      // Call API to create product
      await createProduct(apiFormData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create product. Please try again.');
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF7F4', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              color: '#8B7355',
              mb: 2,
              '&:hover': {
                backgroundColor: '#EAD9C9',
              },
            }}
          >
            Back
          </Button>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#4A3C2F',
              mb: 1,
            }}
          >
            Create New Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details below to list your product for auction
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product created successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Images Section */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              border: '1px solid #E8DED1',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: '#4A3C2F',
              }}
            >
              Product Images
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Main Image Section */}
              <Box sx={{ flex: { xs: '1', md: '0 0 40%' } }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: '#4A3C2F',
                  }}
                >
                  Main Image *
                </Typography>
                
                <Box
                  sx={{
                    border: '2px dashed #D4C4B0',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: mainImagePreview ? 'transparent' : '#FAF7F4',
                    cursor: 'pointer',
                    position: 'relative',
                    height: 450,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      borderColor: '#8B7355',
                      backgroundColor: '#F5EFE7',
                    },
                  }}
                  onClick={() => mainImageInputRef.current?.click()}
                >
                  {mainImagePreview ? (
                    <>
                      <img
                        src={mainImagePreview}
                        alt="Main product"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '420px',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'white',
                          '&:hover': {
                            backgroundColor: '#FFE5E5',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, mainImage: null });
                          setMainImagePreview(null);
                        }}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </>
                  ) : (
                    <Box>
                      <PhotoCamera sx={{ fontSize: 60, color: '#D4C4B0', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#8B7355', mb: 1 }}>
                        Click to upload main image
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#A0907C' }}>
                        PNG, JPG up to 10MB
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleMainImageChange}
                />
              </Box>

              {/* Additional Images Section */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: '#4A3C2F',
                  }}
                >
                  Additional Images * (Minimum 3)
                </Typography>

                <Box
                  sx={{
                    height: 450,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    onClick={() => additionalImagesInputRef.current?.click()}
                    sx={{
                      mb: 2,
                      py: 1.2,
                      borderColor: '#D4C4B0',
                      color: '#8B7355',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#8B7355',
                        backgroundColor: '#FAF7F4',
                      },
                    }}
                  >
                    Upload Images ({formData.additionalImages.length}/10)
                  </Button>
                  <input
                    ref={additionalImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleAdditionalImagesChange}
                  />

                  <Box
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: '#F5F5F5',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#D4C4B0',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: '#8B7355',
                        },
                      },
                    }}
                  >
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                      gap: 2
                    }}>
                      {additionalImagePreviews.map((preview, index) => (
                        <Box 
                          key={index}
                          sx={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #E8DED1',
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Additional ${index + 1}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'white',
                              '&:hover': {
                                backgroundColor: '#FFE5E5',
                              },
                            }}
                            onClick={() => handleRemoveAdditionalImage(index)}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Product Information */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              border: '1px solid #E8DED1',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: '#4A3C2F',
              }}
            >
              Product Information
            </Typography>

            <Stack spacing={3}>
              {/* Product Name - Full Width */}
              <TextField
                fullWidth
                label="Product Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#8B7355',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B7355',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B7355',
                  },
                }}
              />

              {/* Buy Now Price, Start Date, End Date - 3 columns */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Buy Now Price (Optional)"
                  type="number"
                  value={formData.buyNowPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, buyNowPrice: e.target.value })
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#8B7355',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B7355',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8B7355',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Auction Start Date"
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#8B7355',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B7355',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8B7355',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Auction End Date"
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#8B7355',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B7355',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8B7355',
                    },
                  }}
                />
              </Box>

              {/* Categories - Full Width with Dialog */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: '#4A3C2F',
                    fontWeight: 500,
                  }}
                >
                  Categories *
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={handleOpenCategoryDialog}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    borderColor: formData.categories.length === 0 ? '#D32F2F' : '#D4C4B0',
                    color: '#8B7355',
                    fontWeight: 400,
                    '&:hover': {
                      borderColor: '#8B7355',
                      backgroundColor: '#FAF7F4',
                    },
                  }}
                >
                  {formData.categories.length === 0
                    ? 'Select Categories'
                    : `${formData.categories.length} categories selected`}
                </Button>
                {formData.categories.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {formData.categories.map((value) => (
                      <Chip
                        key={value}
                        label={getCategoryLabel(value)}
                        size="small"
                        onDelete={() => {
                          setFormData({
                            ...formData,
                            categories: formData.categories.filter((c) => c !== value),
                          });
                        }}
                        sx={{
                          backgroundColor: '#EAD9C9',
                          color: '#4A3C2F',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Product Description - Full Width */}
              <TextField
                fullWidth
                label="Product Description"
                required
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Provide detailed information about your product, including condition, specifications, and any other relevant details..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#8B7355',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B7355',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B7355',
                  },
                }}
              />
            </Stack>
          </Paper>

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
              sx={{
                px: 4,
                py: 1,
                borderColor: '#D4C4B0',
                color: '#8B7355',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#8B7355',
                  backgroundColor: '#FAF7F4',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                backgroundColor: '#8B7355',
                color: 'white',
                px: 5,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#6D5943',
                },
                '&:disabled': {
                  backgroundColor: '#D4C4B0',
                },
              }}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </Box>
        </form>

        {/* Category Selection Dialog */}
        <Dialog
          open={categoryDialogOpen}
          onClose={handleCloseCategoryDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#EAD9C9',
              color: '#4A3C2F',
              fontWeight: 600,
            }}
          >
            Select Categories
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ py: 0 }}>
              {CATEGORY_GROUPS.map((group, index) => {
                const isExpanded = expandedGroups.includes(group.parent);
                const childValues = group.children.map((c) => c.value);
                const allChildrenSelected = childValues.every((v) =>
                  tempSelectedCategories.includes(v)
                );
                const someChildrenSelected =
                  childValues.some((v) => tempSelectedCategories.includes(v)) &&
                  !allChildrenSelected;

                return (
                  <Box key={group.parent}>
                    <ListItem
                      disablePadding
                      sx={{
                        borderBottom:
                          index < CATEGORY_GROUPS.length - 1 ? '1px solid #E8DED1' : 'none',
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleToggleGroup(group.parent)}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: '#FAF7F4',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={allChildrenSelected}
                            indeterminate={someChildrenSelected}
                            onChange={() =>
                              handleToggleParentCategory(group.parent, group.children)
                            }
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: '#8B7355',
                              '&.Mui-checked': {
                                color: '#8B7355',
                              },
                              '&.MuiCheckbox-indeterminate': {
                                color: '#8B7355',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={group.label}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            color: '#4A3C2F',
                          }}
                        />
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {group.children.map((child) => (
                          <ListItem
                            key={child.value}
                            disablePadding
                            sx={{
                              backgroundColor: '#FAF7F4',
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleToggleCategory(child.value)}
                              sx={{
                                pl: 8,
                                py: 1,
                                '&:hover': {
                                  backgroundColor: '#F5EFE7',
                                },
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={tempSelectedCategories.includes(child.value)}
                                  sx={{
                                    color: '#8B7355',
                                    '&.Mui-checked': {
                                      color: '#8B7355',
                                    },
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  color: '#6D5943',
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              borderTop: '1px solid #E8DED1',
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseCategoryDialog}
              sx={{
                color: '#8B7355',
                '&:hover': {
                  backgroundColor: '#FAF7F4',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCategories}
              variant="contained"
              disabled={tempSelectedCategories.length === 0}
              sx={{
                backgroundColor: '#8B7355',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#6D5943',
                },
                '&:disabled': {
                  backgroundColor: '#D4C4B0',
                },
              }}
            >
              Confirm ({tempSelectedCategories.length})
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Dialog */}
        <Dialog
          open={!!error}
          onClose={() => setError(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#EAD9C9',
              color: '#4A3C2F',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#4A3C2F' }}>
              Error
            </Typography>
            <IconButton
              onClick={() => setError(null)}
              size="small"
              sx={{
                color: '#8B7355',
                '&:hover': {
                  backgroundColor: 'rgba(139, 115, 85, 0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 3, backgroundColor: '#FAF7F4' }}>
            <Typography sx={{ color: '#4A3C2F' }}>
              {error}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #E8DED1', backgroundColor: '#FAF7F4' }}>
            <Button
              onClick={() => setError(null)}
              variant="contained"
              sx={{
                backgroundColor: '#8B7355',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#6D5943',
                },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
