import { Controller, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  Button,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Category as CategoryIcon,
} from '@mui/icons-material';
import { ProductFormData } from './types';
import { getCategoryLabel, CATEGORY_GROUPS } from './constants';
import RichTextEditor from './RichTextEditor';

interface ProductInfoFormProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  onOpenCategoryDialog: () => void;
}

export default function ProductInfoForm({
  control,
  errors,
  watch,
  setValue,
  onOpenCategoryDialog,
}: ProductInfoFormProps) {
  const categories = watch('categories');

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
        Product Information
      </Typography>

      <Stack spacing={3}>
        {/* Product Name - Full Width */}
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Product name is required',
            validate: (value) => value.trim().length > 0 || 'Product name is required',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Product Name"
              required
              error={!!errors.name}
              helperText={errors.name?.message}
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
          )}
        />

        {/* Start Price, Minimum Bid Step - 2 columns */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Controller
            name="startPrice"
            control={control}
            rules={{
              required: 'Start price is required',
              validate: (value) => {
                const num = parseFloat(value);
                return !isNaN(num) && num > 0 || 'Start price must be greater than 0';
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Start Price"
                type="number"
                required
                error={!!errors.startPrice}
                helperText={errors.startPrice?.message}
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
            )}
          />

          <Controller
            name="minimumBidStep"
            control={control}
            rules={{
              required: 'Minimum bid step is required',
              validate: (value) => {
                const num = parseFloat(value);
                return !isNaN(num) && num > 0 || 'Minimum bid step must be greater than 0';
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Minimum Bid Step"
                type="number"
                required
                error={!!errors.minimumBidStep}
                helperText={errors.minimumBidStep?.message}
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
            )}
          />
        </Box>

        {/* Buy Now Price, End Date - 2 columns */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Controller
            name="buyNowPrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Buy Now Price (Optional)"
                type="number"
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
            )}
          />

          <Controller
            name="endDate"
            control={control}
            rules={{
              required: 'Auction end date is required',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Auction End Date"
                type="datetime-local"
                required
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
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
            )}
          />
        </Box>

        {/* Auto Extend Enabled - Full Width */}
        <Controller
          name="autoExtendEnabled"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  sx={{
                    color: '#8B7355',
                    '&.Mui-checked': {
                      color: '#8B7355',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: '#4A3C2F' }}>
                  Enable Auto Extend (Automatically extend auction if there are bids near the end time)
                </Typography>
              }
            />
          )}
        />

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
          <Controller
            name="categories"
            control={control}
            rules={{
              required: 'At least one category is required',
              validate: (value) => value.length > 0 || 'At least one category is required',
            }}
            render={({ field }) => (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={onOpenCategoryDialog}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    borderColor: field.value.length === 0 ? '#D32F2F' : '#D4C4B0',
                    color: '#8B7355',
                    fontWeight: 400,
                    '&:hover': {
                      borderColor: '#8B7355',
                      backgroundColor: '#FAF7F4',
                    },
                  }}
                >
                  {field.value.length === 0
                    ? 'Select Categories'
                    : `${field.value.length} categories selected`}
                </Button>
                {field.value.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {field.value.map((value: string) => (
                      <Chip
                        key={value}
                        label={getCategoryLabel(value, CATEGORY_GROUPS)}
                        size="small"
                        onDelete={() => {
                          const newCategories = field.value.filter((c: string) => c !== value);
                          field.onChange(newCategories);
                        }}
                        sx={{
                          backgroundColor: '#EAD9C9',
                          color: '#4A3C2F',
                        }}
                      />
                    ))}
                  </Box>
                )}
                {errors.categories && (
                  <Typography variant="caption" sx={{ color: '#D32F2F', mt: 0.5, display: 'block' }}>
                    {errors.categories.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Box>

        {/* Product Description - Full Width */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: '#4A3C2F',
              fontWeight: 500,
            }}
          >
            Product Description *
          </Typography>
          <Controller
            name="description"
            control={control}
            rules={{
              required: 'Product description is required',
              validate: (value) => {
                // Remove HTML tags and check if there's actual content
                const textContent = value.replace(/<[^>]*>/g, '').trim();
                return textContent.length > 0 || 'Product description is required';
              },
            }}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Provide detailed information about your product, including condition, specifications, and any other relevant details..."
              />
            )}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

