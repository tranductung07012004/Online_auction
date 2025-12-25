import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
} from '@mui/icons-material';
import { createProduct, CreateProductRequest } from '../../api/product';
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '../../api/cloudinary';
import { mapCategoriesToIds } from '../../utils/categoryMapping';
import { useAuth } from '../../context/AuthContext';
import ImageUploadSection from './components/ImageUploadSection';
import ProductInfoForm from './components/ProductInfoForm';
import CategoryDialog from './components/CategoryDialog';
import ErrorDialog from './components/ErrorDialog';
import { ProductFormData } from './components/types';

export default function CreateProduct() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      startPrice: '',
      minimumBidStep: '',
      buyNowPrice: '',
      endDate: '',
      description: '',
      categories: [],
      autoExtendEnabled: false,
      mainImage: null,
      additionalImages: [],
    },
    mode: 'onBlur',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Handle category selection
  const handleOpenCategoryDialog = () => {
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
  };

  const handleConfirmCategories = (categories: string[]) => {
    setValue('categories', categories, { shouldValidate: true });
    setCategoryDialogOpen(false);
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    setError(null);

    // Validate seller ID
    if (!userId) {
      setError('You must be logged in to create a product');
      return;
    }

    // Additional business logic validation
    if (data.additionalImages.length < 3) {
      setError('At least 3 additional images are required');
      return;
    }

    if (!data.mainImage) {
      setError('Main image is required');
      return;
    }

    const startPrice = parseFloat(data.startPrice);
    if (isNaN(startPrice) || startPrice <= 0) {
      setError('Start price must be greater than 0');
      return;
    }

    const minimumBidStep = parseFloat(data.minimumBidStep);
    if (isNaN(minimumBidStep) || minimumBidStep <= 0) {
      setError('Minimum bid step must be greater than 0');
      return;
    }

    const endDateTime = new Date(data.endDate);
    const now = new Date();

    if (endDateTime <= now) {
      setError('End date must be in the future');
      return;
    }

    if (data.categories.length === 0) {
      setError('At least one category is required');
      return;
    }

    // Upload images to Cloudinary first
    setUploadingImages(true);
    try {
      // Upload main image
      const thumbnailUrl = await uploadImageToCloudinary(data.mainImage);

      // Upload additional images
      const pictureUrls = await uploadMultipleImagesToCloudinary(data.additionalImages);

      setUploadingImages(false);
      setLoading(true);

      // Convert endDate to ISO 8601 format with timezone (OffsetDateTime format)
      const endAt = new Date(data.endDate).toISOString();

      // Map categories to integer IDs
      const categoryIds = mapCategoriesToIds(data.categories);

      // Prepare request data matching backend DTO
      const request: CreateProductRequest = {
        productName: data.name,
        thumbnailUrl: thumbnailUrl,
        startPrice: startPrice,
        minimumBidStep: minimumBidStep,
        endAt: endAt,
        autoExtendEnabled: data.autoExtendEnabled,
        descriptionContent: data.description,
        sellerId: parseInt(userId),
        categoryIds: categoryIds,
        pictureUrls: pictureUrls,
      };

      // Add buyNowPrice if provided
      if (data.buyNowPrice && data.buyNowPrice.trim() !== '') {
        const buyNowPrice = parseFloat(data.buyNowPrice);
        if (!isNaN(buyNowPrice) && buyNowPrice > 0) {
          request.buyNowPrice = buyNowPrice;
        }
      }

      // Call API to create product
      await createProduct(request);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-products');
      }, 1500);
    } catch (err: any) {
      const errMessage = err.response?.data?.data?.errorCode || err.response?.data?.message || 'Failed to create product';
      setError(errMessage);
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const categories = watch('categories');

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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Images Section */}
          <ImageUploadSection
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onError={(message) => setError(message)}
          />

          {/* Product Information */}
          <ProductInfoForm
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onOpenCategoryDialog={handleOpenCategoryDialog}
          />

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
              disabled={loading || uploadingImages}
              startIcon={(loading || uploadingImages) ? <CircularProgress size={20} /> : null}
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
              {uploadingImages ? 'Uploading Images...' : loading ? 'Creating...' : 'Create Product'}
            </Button>
          </Box>
        </form>

        {/* Category Selection Dialog */}
        <CategoryDialog
          open={categoryDialogOpen}
          selectedCategories={categories}
          onClose={handleCloseCategoryDialog}
          onConfirm={handleConfirmCategories}
        />

        {/* Error Dialog */}
        <ErrorDialog
          open={!!error}
          message={error || ''}
          onClose={() => setError(null)}
        />
      </Container>
    </Box>
  );
}
