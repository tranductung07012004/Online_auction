import { useRef, useState } from 'react';
import { Controller, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PhotoCamera,
} from '@mui/icons-material';
import { ProductFormData } from './types';

interface ImageUploadSectionProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  onError: (message: string) => void;
}

export default function ImageUploadSection({
  control,
  errors,
  watch,
  setValue,
  onError,
}: ImageUploadSectionProps) {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const additionalImages = watch('additionalImages');

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onError('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onError('');
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) {
      return;
    }

    const currentImages = watch('additionalImages');

    if (files.length + currentImages.length > 10) {
      onError('Maximum 10 additional images allowed');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      onError('All files must be images');
      return;
    }

    const newImages = [...currentImages, ...imageFiles];
    setValue('additionalImages', newImages, { shouldValidate: true });

    const newPreviews = [...additionalImagePreviews];
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setAdditionalImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    onError('');
    event.target.value = '';
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const currentImages = watch('additionalImages');
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setValue('additionalImages', newImages, { shouldValidate: true });
    setAdditionalImagePreviews(newPreviews);
  };

  return (
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
        <Controller
          name="mainImage"
          control={control}
          rules={{
            required: 'Main image is required',
          }}
          render={({ field }) => (
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
                  border: '2px dashed',
                  borderColor: errors.mainImage ? '#D32F2F' : '#D4C4B0',
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
                        field.onChange(null);
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
                onChange={(e) => {
                  handleMainImageChange(e);
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                  }
                }}
              />
              {errors.mainImage && (
                <Typography variant="caption" sx={{ color: '#D32F2F', mt: 0.5, display: 'block' }}>
                  {errors.mainImage.message}
                </Typography>
              )}
            </Box>
          )}
        />

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
              Upload Images ({additionalImages.length}/10)
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
  );
}








