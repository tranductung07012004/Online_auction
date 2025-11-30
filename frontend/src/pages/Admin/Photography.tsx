import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, SelectChangeEvent, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const API_URL = 'http://localhost:3000/admin/photography/services';

type PackageType = 'Pre-Wedding' | 'Wedding Day' | 'Studio' | 'Outdoor' | 'Custom';
type ServiceStatus = 'Available' | 'Paused' | 'Booked';

interface PhotographyService {
  _id: string;
  name: string;
  packageType: PackageType;
  description: string;
  price: number;
  duration: string;
  location: string;
  photographer: string;
  status: ServiceStatus;
  imageUrls: string[];
  features: string[];
}

interface ServiceFormData {
  name: string;
  packageType: PackageType;
  description: string;
  price: number;
  duration: string;
  location: string;
  photographer: string;
  status: ServiceStatus;
  imageUrls: string[];
  features: string[];
}

const initialServiceData: ServiceFormData = {
  name: '',
  packageType: 'Wedding Day',
  description: '',
  price: 0,
  duration: '',
  location: '',
  photographer: '',
  status: 'Available',
  imageUrls: [],
  features: []
};

const PhotographyAdmin = () => {
  const [services, setServices] = useState<PhotographyService[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceFormData>(initialServiceData);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [feature, setFeature] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true
      });
      
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching photography services:', error);
      setAlert({
        open: true,
        message: 'Failed to load photography services',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenDialog = (isEdit = false, service?: PhotographyService) => {
    if (isEdit && service) {
      setServiceData({
        name: service.name,
        packageType: service.packageType,
        description: service.description,
        price: service.price,
        duration: service.duration,
        location: service.location,
        photographer: service.photographer,
        status: service.status,
        imageUrls: service.imageUrls,
        features: service.features
      });
      setSelectedServiceId(service._id);
      setIsEditing(true);
    } else {
      setServiceData(initialServiceData);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setServiceData(initialServiceData);
    setImageUrl('');
    setFeature('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setServiceData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setServiceData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setServiceData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = () => {
    if (feature.trim()) {
      setServiceData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
      setFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedServiceId) {
        await axios.put(`${API_URL}/${selectedServiceId}`, serviceData, { 
          withCredentials: true 
        });
        setAlert({
          open: true,
          message: 'Photography service updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(API_URL, serviceData, { 
          withCredentials: true 
        });
        setAlert({
          open: true,
          message: 'Photography service created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Error saving photography service:', error);
      setAlert({
        open: true,
        message: 'Failed to save photography service',
        severity: 'error'
      });
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedServiceId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedServiceId(null);
  };

  const handleDelete = async () => {
    if (!selectedServiceId) return;
    
    try {
      await axios.delete(`${API_URL}/${selectedServiceId}`, {
        withCredentials: true
      });
      
      setAlert({
        open: true,
        message: 'Photography service deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      fetchServices();
    } catch (error) {
      console.error('Error deleting photography service:', error);
      setAlert({
        open: true,
        message: 'Failed to delete photography service',
        severity: 'error'
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: ServiceStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status }, {
        withCredentials: true
      });
      
      setAlert({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
      
      fetchServices();
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Paused':
        return 'warning';
      case 'Booked':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAlert({
        open: true,
        message: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF files are allowed.',
        severity: 'error'
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAlert({
        open: true,
        message: 'File size exceeds the 5MB limit.',
        severity: 'error'
      });
      return;
    }

    // Upload the file
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://localhost:3000/admin/photography/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      // Add the image URL to the service data
      if (response.data && response.data.imageUrl) {
        setServiceData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, response.data.imageUrl]
        }));
        
        setAlert({
          open: true,
          message: 'Image uploaded successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlert({
        open: true,
        message: 'Failed to upload image. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h1">Photography Services Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => handleOpenDialog()}
            sx={{ 
              backgroundColor: '#3f51b5',
              '&:hover': {
                backgroundColor: '#303f9f',
              }
            }}
          >
            Add New Service
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><Typography fontWeight="bold">Name</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Package Type</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Price</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Duration</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service._id} hover>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.packageType}</TableCell>
                    <TableCell>${service.price}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>
                      <Chip 
                        label={service.status} 
                        color={getStatusColor(service.status)}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleOpenDialog(true, service)}
                        size="small"
                        sx={{ color: '#2196f3' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(service._id)}
                        size="small"
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <FormControl variant="outlined" size="small" sx={{ ml: 1, minWidth: 120 }}>
                        <Select
                          value=""
                          displayEmpty
                          onChange={(e) => handleUpdateStatus(service._id, e.target.value as ServiceStatus)}
                          renderValue={() => "Status"}
                          size="small"
                        >
                          <MenuItem value="Available">Available</MenuItem>
                          <MenuItem value="Paused">Paused</MenuItem>
                          <MenuItem value="Booked">Booked</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={3} color="text.secondary">
                      No photography services found. Click "Add New Service" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Service Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{isEditing ? 'Edit Photography Service' : 'Add New Photography Service'}</DialogTitle>
          <DialogContent dividers>
            <Box component="form" sx={{ '& .MuiTextField-root': { my: 1 } }}>
              <TextField
                fullWidth
                label="Service Name"
                name="name"
                value={serviceData.name}
                onChange={handleInputChange}
                required
              />
              
              <FormControl fullWidth sx={{ my: 1 }}>
                <InputLabel>Package Type</InputLabel>
                <Select
                  name="packageType"
                  value={serviceData.packageType}
                  onChange={handleSelectChange}
                  label="Package Type"
                >
                  <MenuItem value="Pre-Wedding">Pre-Wedding</MenuItem>
                  <MenuItem value="Wedding Day">Wedding Day</MenuItem>
                  <MenuItem value="Studio">Studio</MenuItem>
                  <MenuItem value="Outdoor">Outdoor</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={serviceData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Price ($)"
                  name="price"
                  type="number"
                  value={serviceData.price}
                  onChange={handleInputChange}
                  required
                  sx={{ flex: 1 }}
                />
                
                <TextField
                  label="Duration (e.g. 4 hours)"
                  name="duration"
                  value={serviceData.duration}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Location"
                  name="location"
                  value={serviceData.location}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
                
                <TextField
                  label="Photographer"
                  name="photographer"
                  value={serviceData.photographer}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <FormControl fullWidth sx={{ my: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={serviceData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Paused">Paused</MenuItem>
                  <MenuItem value="Booked">Booked</MenuItem>
                </Select>
              </FormControl>
              
              {/* Image URLs */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Images</Typography>
                
                {/* Upload Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                    disabled={uploadingImage}
                    sx={{ 
                      backgroundColor: '#3f51b5',
                      '&:hover': {
                        backgroundColor: '#303f9f',
                      }
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                    />
                  </Button>
                  
                  <Typography variant="caption" color="textSecondary">
                    Upload images (JPG, PNG, WEBP, GIF - max 5MB)
                  </Typography>
                </Box>

                {/* Display Uploaded Images */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {serviceData.imageUrls.map((url, index) => (
                    <Box key={index} sx={{ position: 'relative', mb: 2, mr: 2 }}>
                      <img 
                        src={url} 
                        alt={`Service image ${index + 1}`} 
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover', 
                          borderRadius: '4px' 
                        }} 
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImageUrl(index)}
                        sx={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: -10, 
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' }
                        }}
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                
                {/* Optional: Keep manual URL input for special cases */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Or add image URL manually"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    size="small"
                  />
                  <Button variant="outlined" onClick={handleAddImageUrl}>Add</Button>
                </Box>
              </Box>
              
              {/* Features */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Features</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Feature"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    size="small"
                  />
                  <Button variant="outlined" onClick={handleAddFeature}>Add</Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {serviceData.features.map((feat, index) => (
                    <Chip
                      key={index}
                      label={feat}
                      onDelete={() => handleRemoveFeature(index)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ 
                backgroundColor: '#3f51b5',
                '&:hover': {
                  backgroundColor: '#303f9f',
                }
              }}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this photography service?</Typography>
            <Typography variant="caption" color="error">This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Alert Snackbar */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default PhotographyAdmin;
