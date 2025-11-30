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
  Tab,
  Tabs,
  Chip,
  Stack,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment,
  FormHelperText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Person,
  Straighten,
  Photo,
  Palette,
  Image,
  Close,
  Email,
  Phone,
  Event,
  Notes,
  Error,
  CheckCircle,
  Timelapse,
  Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  CustomerFitting as CustomerFittingType,
  Measurement,
  PhotographyConcept,
  getAllCustomerFittings,
  getCustomerFittingById,
  createCustomerFitting,
  updateCustomerFitting,
  deleteCustomerFitting,
  uploadPhotoReference,
  CreateCustomerFittingDto
} from '../../api/customerFitting';
import { getAllDresses, Dress } from '../../api/dress';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// TabPanel component for tab content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, sx, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fitting-tabpanel-${index}`}
      aria-labelledby={`fitting-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={sx || { p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `fitting-tab-${index}`,
    'aria-controls': `fitting-tabpanel-${index}`,
  };
};

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

// Main component
const CustomerFitting = () => {
  const { userId } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Customer fitting list state
  const [fittings, setFittings] = useState<CustomerFittingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFittings, setFilteredFittings] = useState<CustomerFittingType[]>([]);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [currentFittingId, setCurrentFittingId] = useState<string | null>(null);

  // Form data
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bust, setBust] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);
  const [hips, setHips] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [shoulderWidth, setShoulderWidth] = useState<number | null>(null);
  const [armLength, setArmLength] = useState<number | null>(null);
  const [legLength, setLegLength] = useState<number | null>(null);
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [photographyConcept, setPhotographyConcept] = useState<PhotographyConcept | ''>('');
  const [photoReferenceUrls, setPhotoReferenceUrls] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  // Available styles (dresses)
  const [dresses, setDresses] = useState<Dress[]>([]);

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fittingToDelete, setFittingToDelete] = useState<string | null>(null);

  // Validation
  const [formErrors, setFormErrors] = useState<{
    customerName?: string;
    email?: string;
    phone?: string;
    bust?: string;
    waist?: string;
    hips?: string;
    height?: string;
    photographyConcept?: string;
  }>({});

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Add this new state for tracking tabs with errors
  const [tabsWithErrors, setTabsWithErrors] = useState<number[]>([]);
  // Add state to track whether fields have been touched (for error display)
  const [formTouched, setFormTouched] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = fittings.filter(
        fitting =>
          fitting.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fitting.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fitting.phone.includes(searchTerm)
      );
      setFilteredFittings(filtered);
    } else {
      setFilteredFittings(fittings);
    }
  }, [searchTerm, fittings]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fittingsData, dressesData] = await Promise.all([
        getAllCustomerFittings(),
        getAllDresses()
      ]);
      setFittings(fittingsData);
      setFilteredFittings(fittingsData);
      setDresses(dressesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tab handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Form handling
  const handleOpenForm = (fitting?: CustomerFittingType) => {
    if (fitting) {
      // Edit mode
      setEditMode(true);
      setCurrentFittingId(fitting._id);
      setCustomerName(fitting.customerName);
      setEmail(fitting.email);
      setPhone(fitting.phone);
      setBust(fitting.measurements.bust);
      setWaist(fitting.measurements.waist);
      setHips(fitting.measurements.hips);
      setHeight(fitting.measurements.height);
      setShoulderWidth(fitting.measurements.shoulderWidth || null);
      setArmLength(fitting.measurements.armLength || null);
      setLegLength(fitting.measurements.legLength || null);
      setMeasurementNotes(fitting.measurements.notes || '');
      setPreferredStyles(fitting.preferredStyles);
      setPhotographyConcept(fitting.photographyConcept);
      setPhotoReferenceUrls(fitting.photoReferenceUrls);
      setGeneralNotes(fitting.notes || '');
      setAppointmentDate(fitting.appointmentDate ? new Date(fitting.appointmentDate) : null);
      setStatus(fitting.status as 'pending' | 'in-progress' | 'completed');
    } else {
      // Add mode
      setEditMode(false);
      setCurrentFittingId(null);
      resetForm();
    }
    
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    resetForm();
    setFormErrors({});
    setTabValue(0);
    setTabsWithErrors([]);
    setFormTouched(false);
  };

  const resetForm = () => {
    setCustomerName('');
    setEmail('');
    setPhone('');
    setBust(null);
    setWaist(null);
    setHips(null);
    setHeight(null);
    setShoulderWidth(null);
    setArmLength(null);
    setLegLength(null);
    setMeasurementNotes('');
    setPreferredStyles([]);
    setPhotographyConcept('');
    setPhotoReferenceUrls([]);
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setGeneralNotes('');
    setAppointmentDate(null);
    setStatus('pending');
  };

  // Update the validateForm function to use simpler error messages
  const validateForm = () => {
    const errors: {
      customerName?: string;
      email?: string;
      phone?: string;
      bust?: string;
      waist?: string;
      hips?: string;
      height?: string;
      photographyConcept?: string;
    } = {};

    const tabsWithErrorsTemp: number[] = [];

    if (!customerName) {
      errors.customerName = 'Required';
      if (!tabsWithErrorsTemp.includes(0)) tabsWithErrorsTemp.push(0);
    }
    
    if (!email) {
      errors.email = 'Required';
      if (!tabsWithErrorsTemp.includes(0)) tabsWithErrorsTemp.push(0);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid format';
      if (!tabsWithErrorsTemp.includes(0)) tabsWithErrorsTemp.push(0);
    }
    
    if (!phone) {
      errors.phone = 'Required';
      if (!tabsWithErrorsTemp.includes(0)) tabsWithErrorsTemp.push(0);
    }

    if (bust === null) {
      errors.bust = 'Required';
      if (!tabsWithErrorsTemp.includes(1)) tabsWithErrorsTemp.push(1);
    }
    
    if (waist === null) {
      errors.waist = 'Required';
      if (!tabsWithErrorsTemp.includes(1)) tabsWithErrorsTemp.push(1);
    }
    
    if (hips === null) {
      errors.hips = 'Required';
      if (!tabsWithErrorsTemp.includes(1)) tabsWithErrorsTemp.push(1);
    }
    
    if (height === null) {
      errors.height = 'Required';
      if (!tabsWithErrorsTemp.includes(1)) tabsWithErrorsTemp.push(1);
    }
    
    if (!photographyConcept) {
      errors.photographyConcept = 'Required';
      if (!tabsWithErrorsTemp.includes(3)) tabsWithErrorsTemp.push(3);
    }

    setFormErrors(errors);
    setTabsWithErrors(tabsWithErrorsTemp);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmitFitting = async () => {
    // Mark all fields as touched to show all validation errors
    setFormTouched(true);
    
    if (!validateForm()) {
      // Always go back to the first tab with errors
      if (tabsWithErrors.length > 0) {
        setTabValue(tabsWithErrors[0]);
      }
      return;
    }

    try {
      // Make sure preferredStyles are properly formatted as strings
      const styleIds = preferredStyles.map(id => id.toString());
      
      const fittingData: CreateCustomerFittingDto = {
        userId: userId || '',
        customerName,
        email,
        phone,
        measurements: {
          bust: bust!,
          waist: waist!,
          hips: hips!,
          height: height!,
          shoulderWidth: shoulderWidth || undefined,
          armLength: armLength || undefined,
          legLength: legLength || undefined,
          notes: measurementNotes || undefined
        },
        preferredStyles: styleIds,
        photographyConcept: photographyConcept as PhotographyConcept,
        photoReferenceUrls,
        status,
        appointmentDate: appointmentDate || undefined,
        notes: generalNotes || undefined
      };

      let result: CustomerFittingType;
      
      if (editMode && currentFittingId) {
        result = await updateCustomerFitting(currentFittingId, fittingData);
      } else {
        result = await createCustomerFitting(fittingData);
      }

      // Upload new images if there are any
      if (selectedImages.length > 0 && result._id) {
        const uploadPromises = selectedImages.map(file => uploadPhotoReference(result._id, file));
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Update the fitting with new image URLs
        const updatedPhotoReferenceUrls = [...photoReferenceUrls, ...uploadedUrls];
        await updateCustomerFitting(result._id, { 
          photoReferenceUrls: updatedPhotoReferenceUrls 
        });
        
        // Update local state to reflect changes
        result.photoReferenceUrls = updatedPhotoReferenceUrls;
      }

      // Update local state
      if (editMode) {
        setFittings(fittings.map(f => (f._id === result._id ? result : f)));
      } else {
        setFittings([...fittings, result]);
      }

      handleCloseForm();
      showSnackbar(
        `Customer fitting ${editMode ? 'updated' : 'created'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error saving customer fitting:', error);
      let errorMessage = `Failed to ${editMode ? 'update' : 'create'} customer fitting`;
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  // Confirmation dialog for deletion
  const handleOpenConfirmDialog = (id: string) => {
    setFittingToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setFittingToDelete(null);
  };

  const handleDeleteFitting = async () => {
    if (!fittingToDelete) return;

    try {
      await deleteCustomerFitting(fittingToDelete);
      setFittings(fittings.filter(f => f._id !== fittingToDelete));
      handleCloseConfirmDialog();
      showSnackbar('Customer fitting deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting customer fitting:', error);
      showSnackbar('Failed to delete customer fitting', 'error');
    }
  };

  // Image handling
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
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);

    const newImagePreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImagePreviewUrls[index]);
    newImagePreviewUrls.splice(index, 1);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const handleRemovePhotoReference = (url: string) => {
    setPhotoReferenceUrls(photoReferenceUrls.filter(u => u !== url));
  };

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render the table
  const renderFittingsTable = () => {
    return (
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Measurements</TableCell>
                <TableCell>Preferred Styles</TableCell>
                <TableCell>Photography</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? filteredFittings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredFittings
              ).map((fitting) => (
                <TableRow key={fitting._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {fitting.customerName.charAt(0).toUpperCase()}
                      </Avatar>
                      {fitting.customerName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{fitting.email}</Typography>
                    <Typography variant="body2" color="textSecondary">{fitting.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1} sx={{ maxWidth: 320 }}>
                      <Grid item xs={6}>
                        <Chip 
                          icon={<Straighten />} 
                          label={`Bust: ${fitting.measurements.bust}cm`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ width: '100%', justifyContent: 'flex-start' }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip 
                          icon={<Straighten />} 
                          label={`Waist: ${fitting.measurements.waist}cm`} 
                          size="small" 
                          variant="outlined"
                          sx={{ width: '100%', justifyContent: 'flex-start' }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip 
                          icon={<Straighten />} 
                          label={`Hips: ${fitting.measurements.hips}cm`} 
                          size="small" 
                          variant="outlined"
                          sx={{ width: '100%', justifyContent: 'flex-start' }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip 
                          icon={<Straighten />} 
                          label={`Height: ${fitting.measurements.height}cm`} 
                          size="small" 
                          variant="outlined"
                          sx={{ width: '100%', justifyContent: 'flex-start' }}
                        />
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    {fitting.preferredStyles.length > 0 ? (
                      <Chip 
                        icon={<Palette />} 
                        label={`${fitting.preferredStyles.length} styles`} 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">None selected</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {fitting.photographyConcept ? (
                      <Chip 
                        icon={<Photo />} 
                        label={fitting.photographyConcept} 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not specified</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={
                        fitting.status === 'completed' 
                          ? <CheckCircle fontSize="small" /> 
                          : fitting.status === 'in-progress' 
                            ? <Timelapse fontSize="small" />
                            : <Schedule fontSize="small" />
                      }
                      label={fitting.status.charAt(0).toUpperCase() + fitting.status.slice(1)} 
                      color={
                        fitting.status === 'completed' 
                          ? 'success' 
                          : fitting.status === 'in-progress' 
                            ? 'primary' 
                            : 'default'
                      }
                      size="small"
                      onClick={() => {
                        // Create a cycling function for status
                        const nextStatus = 
                          fitting.status === 'pending' ? 'in-progress' :
                          fitting.status === 'in-progress' ? 'completed' : 'pending';
                        
                        // Update the status in the database
                        updateCustomerFitting(fitting._id, { status: nextStatus })
                          .then(updatedFitting => {
                            // Update local state
                            setFittings(fittings.map(f => 
                              f._id === fitting._id ? { ...f, status: nextStatus } : f
                            ));
                            showSnackbar(`Status updated to ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`, 'success');
                          })
                          .catch(error => {
                            showSnackbar('Failed to update status', 'error');
                          });
                      }}
                      sx={{ 
                        minWidth: '90px',
                        '& .MuiChip-label': { fontWeight: 'medium' },
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          opacity: 0.9
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenForm(fitting)}
                      aria-label="edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenConfirmDialog(fitting._id)}
                      aria-label="delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFittings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    );
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Customer Fitting
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Manage customer measurements, style preferences, and photography concepts in one place.
        </Typography>

        {/* Search and Add button */}
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ mr: 2, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <Search color="action" sx={{ mr: 1 }} />
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
          >
            Add New Fitting
          </Button>
        </Box>

        {/* Customer Fittings Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredFittings.length > 0 ? (
          renderFittingsTable()
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No customer fittings found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first customer fitting to get started'}
            </Typography>
          </Paper>
        )}

        {/* Form Dialog */}
        <Dialog 
          open={formOpen} 
          onClose={handleCloseForm} 
          fullWidth 
          maxWidth="md"
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: { xs: '100%', sm: 'md' },
              margin: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: '10px' },
              maxHeight: { xs: '100vh', sm: '90vh' },
              height: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 }, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
              {editMode ? 'Edit Customer Fitting' : 'Add New Customer Fitting'}
            </Typography>
            <IconButton onClick={handleCloseForm} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
          
          {/* Error Summary */}
          {formTouched && Object.keys(formErrors).length > 0 && (
            <Alert 
              severity="error" 
              sx={{ 
                mx: 2, 
                mt: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                borderRadius: '8px',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Please fill in the required fields:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(formErrors.customerName || formErrors.email || formErrors.phone) && (
                  <Chip 
                    icon={<Person />} 
                    label="Customer Info" 
                    color="error" 
                    size="small" 
                    onClick={() => setTabValue(0)}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      px: 1,
                      '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        bgcolor: 'error.dark'
                      }
                    }}
                  />
                )}
                {(formErrors.bust || formErrors.waist || formErrors.hips || formErrors.height) && (
                  <Chip 
                    icon={<Straighten />} 
                    label="Measurements" 
                    color="error" 
                    size="small"
                    onClick={() => setTabValue(1)}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      px: 1,
                      '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        bgcolor: 'error.dark'
                      }
                    }}
                  />
                )}
                {formErrors.photographyConcept && (
                  <Chip 
                    icon={<Photo />} 
                    label="Photography" 
                    color="error" 
                    size="small"
                    onClick={() => setTabValue(3)}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      px: 1,
                      '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        bgcolor: 'error.dark'
                      }
                    }}
                  />
                )}
              </Box>
            </Alert>
          )}
          
          <Box sx={{ 
            display: 'flex',
            bgcolor: '#f5f5f5',
            borderBottom: 1, 
            borderColor: 'divider' 
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="fitting tabs"
              sx={{ 
                '& .MuiTab-root': {
                  minHeight: { xs: 56, sm: 64 },
                  py: { xs: 1, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                },
                '& .Mui-selected': {
                  bgcolor: 'white',
                  fontWeight: 'bold',
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person />
                    <span>Customer Info</span>
                    {formTouched && tabsWithErrors.includes(0) && (
                      <Box 
                        component="span" 
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 18, 
                          height: 18, 
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        !
                      </Box>
                    )}
                  </Box>
                } 
                {...a11yProps(0)} 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Straighten />
                    <span>Measurements</span>
                    {formTouched && tabsWithErrors.includes(1) && (
                      <Box 
                        component="span" 
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 18, 
                          height: 18, 
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        !
                      </Box>
                    )}
                  </Box>
                } 
                {...a11yProps(1)} 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Palette />
                    <span>Style Preferences</span>
                  </Box>
                } 
                {...a11yProps(2)} 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Photo />
                    <span>Photography</span>
                    {formTouched && tabsWithErrors.includes(3) && (
                      <Box 
                        component="span" 
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 18, 
                          height: 18, 
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        !
                      </Box>
                    )}
                  </Box>
                } 
                {...a11yProps(3)} 
              />
            </Tabs>
          </Box>

          {/* Customer Info Tab */}
          <TabPanel value={tabValue} index={0} sx={{ p: { xs: 1, sm: 3 } }}>
            <Box sx={{ py: 1 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2, fontWeight: 'medium', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Customer Details
              </Typography>
              
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={formTouched && !!formErrors.customerName}
                    helperText={formTouched ? formErrors.customerName : undefined}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          <Person fontSize="small" />
                        </Box>
                      ),
                    }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={formTouched && !!formErrors.email}
                    helperText={formTouched ? formErrors.email : undefined}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          <Email fontSize="small" />
                        </Box>
                      ),
                    }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={formTouched && !!formErrors.phone}
                    helperText={formTouched ? formErrors.phone : undefined}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          <Phone fontSize="small" />
                        </Box>
                      ),
                    }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Date"
                    type="date"
                    value={appointmentDate ? format(appointmentDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setAppointmentDate(e.target.value ? new Date(e.target.value) : null)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          <Event fontSize="small" />
                        </Box>
                      ),
                    }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                      {status === 'completed' ? (
                        <CheckCircle fontSize="small" color="success" />
                      ) : status === 'in-progress' ? (
                        <Timelapse fontSize="small" color="primary" />
                      ) : (
                        <Schedule fontSize="small" color="action" />
                      )}
                    </Box>
                    <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="General Notes"
                    multiline
                    rows={2}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1, mt: 1 }}>
                          <Notes fontSize="small" />
                        </Box>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Measurements Tab */}
          <TabPanel value={tabValue} index={1} sx={{ overflowY: 'auto', maxHeight: { xs: 'calc(100vh - 170px)', sm: '75vh' }, p: { xs: 1, sm: 3 } }}>
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Straighten color="primary" sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography variant="h6" color="primary" fontWeight="medium" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Body Measurements (cm)
                </Typography>
              </Box>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 3, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Essential Measurements
                </Typography>
                
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      required
                      fullWidth
                      label="Bust"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={bust === null ? '' : bust}
                      onChange={(e) => setBust(e.target.value ? Number(e.target.value) : null)}
                      error={formTouched && !!formErrors.bust}
                      helperText={formTouched ? formErrors.bust : undefined}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      required
                      fullWidth
                      label="Waist"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={waist === null ? '' : waist}
                      onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : null)}
                      error={formTouched && !!formErrors.waist}
                      helperText={formTouched ? formErrors.waist : undefined}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      required
                      fullWidth
                      label="Hips"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={hips === null ? '' : hips}
                      onChange={(e) => setHips(e.target.value ? Number(e.target.value) : null)}
                      error={formTouched && !!formErrors.hips}
                      helperText={formTouched ? formErrors.hips : undefined}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      required
                      fullWidth
                      label="Height"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={height === null ? '' : height}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
                      error={formTouched && !!formErrors.height}
                      helperText={formTouched ? formErrors.height : undefined}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 3, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Additional Measurements (Optional)
                </Typography>
                
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Shoulder Width"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={shoulderWidth === null ? '' : shoulderWidth}
                      onChange={(e) => setShoulderWidth(e.target.value ? Number(e.target.value) : null)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Arm Length"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={armLength === null ? '' : armLength}
                      onChange={(e) => setArmLength(e.target.value ? Number(e.target.value) : null)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Leg Length"
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>
                      }}
                      value={legLength === null ? '' : legLength}
                      onChange={(e) => setLegLength(e.target.value ? Number(e.target.value) : null)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <TextField
                fullWidth
                label="Measurement Notes"
                multiline
                rows={2}
                value={measurementNotes}
                onChange={(e) => setMeasurementNotes(e.target.value)}
                placeholder="Note any special considerations or additional measurements here"
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  mt: 1 
                }}
              />
            </Box>
          </TabPanel>

          {/* Style Preferences Tab */}
          <TabPanel value={tabValue} index={2} sx={{ overflowY: 'auto', maxHeight: { xs: 'calc(100vh - 170px)', sm: '75vh' }, p: { xs: 1, sm: 3 } }}>
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette color="primary" sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography variant="h6" color="primary" fontWeight="medium" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Preferred Dress Styles
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 'medium' }}>
                Select Preferred Styles
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <Select
                  displayEmpty
                  multiple
                  value={preferredStyles}
                  onChange={(e) => setPreferredStyles(e.target.value as string[])}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Choose styles...</em>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const dress = dresses.find(d => d._id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={dress ? dress.name : value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  {dresses.map((dress) => (
                    <MenuItem key={dress._id} value={dress._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {dress.images && dress.images.length > 0 && (
                          <Avatar 
                            src={dress.images[0]} 
                            alt={dress.name}
                            sx={{ width: 30, height: 30, mr: 1 }}
                            variant="rounded"
                          />
                        )}
                        <Box>
                          <Typography variant="body2">{dress.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {dress.style}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {preferredStyles.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Selected Styles:
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {preferredStyles.map(styleId => {
                      const dress = dresses.find(d => d._id === styleId);
                      return dress ? (
                        <Grid item xs={6} sm={4} md={3} key={dress._id}>
                          <Card sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                            {dress.images && dress.images.length > 0 && (
                              <Box 
                                component="img"
                                src={dress.images[0]}
                                alt={dress.name}
                                sx={{ 
                                  width: '100%',
                                  height: { xs: 100, sm: 120 },
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <CardContent sx={{ p: { xs: 0.75, sm: 1 } }}>
                              <Typography variant="subtitle2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {dress.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Style: {dress.style}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ) : null;
                    })}
                  </Grid>
                </Paper>
              )}
            </Box>
          </TabPanel>

          {/* Photography Tab */}
          <TabPanel value={tabValue} index={3} sx={{ overflowY: 'auto', maxHeight: { xs: 'calc(100vh - 170px)', sm: '75vh' }, p: { xs: 1, sm: 3 } }}>
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Photo color="primary" sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography variant="h6" color="primary" fontWeight="medium" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Photography Concept
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" sx={{ mb: 3 }} error={formTouched && !!formErrors.photographyConcept}>
                    <InputLabel>Select Photography Concept</InputLabel>
                    <Select
                      value={photographyConcept}
                      onChange={(e) => setPhotographyConcept(e.target.value as PhotographyConcept)}
                      required
                    >
                      <MenuItem value="">
                        <em>Select a concept</em>
                      </MenuItem>
                      <MenuItem value="Traditional">Traditional</MenuItem>
                      <MenuItem value="Modern">Modern</MenuItem>
                      <MenuItem value="Beach">Beach</MenuItem>
                      <MenuItem value="Garden">Garden</MenuItem>
                      <MenuItem value="Classic">Classic</MenuItem>
                      <MenuItem value="Vintage">Vintage</MenuItem>
                      <MenuItem value="Artistic">Artistic</MenuItem>
                      <MenuItem value="Minimalist">Minimalist</MenuItem>
                    </Select>
                    {formTouched && formErrors.photographyConcept && (
                      <FormHelperText>{formErrors.photographyConcept}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Reference Photos
                  </Typography>
                  
                  {/* Reference Photos Section */}
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {/* Upload Button */}
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<Image />}
                      sx={{ mb: 2 }}
                    >
                      Add Reference Photos
                      <VisuallyHiddenInput 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    
                    {/* Existing Photos */}
                    {photoReferenceUrls.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 }, mb: 1 }}>
                        {photoReferenceUrls.map((url, index) => (
                          <Paper
                            key={`ref-${index}`}
                            elevation={1}
                            sx={{
                              position: 'relative',
                              width: { xs: 80, sm: 100 },
                              height: { xs: 80, sm: 100 },
                              borderRadius: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src={url}
                              alt={`Reference ${index + 1}`}
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
                                padding: '4px',
                              }}
                              onClick={() => handleRemovePhotoReference(url)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    )}
                    
                    {/* Image Previews for new uploads */}
                    {imagePreviewUrls.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
                        {imagePreviewUrls.map((url, index) => (
                          <Paper
                            key={`new-${index}`}
                            elevation={2}
                            sx={{
                              position: 'relative',
                              width: { xs: 80, sm: 100 },
                              height: { xs: 80, sm: 100 },
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '2px solid #2196f3',
                            }}
                          >
                            <img
                              src={url}
                              alt={`New Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(33, 150, 243, 0.7)',
                              color: 'white',
                              py: 0.3,
                              fontSize: '10px',
                              textAlign: 'center',
                              fontWeight: 'bold'
                            }}>
                              New
                            </Box>
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bgcolor: 'rgba(255, 255, 255, 0.7)',
                                padding: '4px',
                              }}
                              onClick={() => handleRemoveSelectedImage(index)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <DialogActions sx={{ 
            px: { xs: 2, sm: 3 }, 
            py: { xs: 1.5, sm: 2 }, 
            bgcolor: '#f5f5f5', 
            borderTop: '1px solid #e0e0e0',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch'
          }}>
            <Button 
              onClick={handleCloseForm}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 'medium',
                mb: { xs: 1, sm: 0 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmitFitting}
              sx={{ 
                borderRadius: '8px', 
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 'medium',
                boxShadow: 2,
                width: { xs: '100%', sm: 'auto' }
              }}
              startIcon={Object.keys(formErrors).length > 0 ? <Error /> : undefined}
            >
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this customer fitting? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
            <Button onClick={handleDeleteFitting} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default CustomerFitting; 