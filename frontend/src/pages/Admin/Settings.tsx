import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

// Khai báo interface Size và Color để làm việc với ứng dụng
interface Size {
  _id: string;
  label: string;
}

interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State for sizes
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [editSizeId, setEditSizeId] = useState<string | null>(null);
  const [sizeLabel, setSizeLabel] = useState('');
  
  // State for colors
  const [colors, setColors] = useState<Color[]>([]);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [editColorId, setEditColorId] = useState<string | null>(null);
  const [colorName, setColorName] = useState('');
  const [hexCode, setHexCode] = useState('#000000');
  
  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'size' | 'color' } | null>(null);

  // Fetch data
  useEffect(() => {
    fetchSizes();
    fetchColors();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Size functions
  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/admin/sizes', {
        withCredentials: true
      });
      if (response.data && response.data.success) {
        setSizes(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch sizes');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      toast.error('Failed to load sizes');
      setLoading(false);
    }
  };

  const handleOpenSizeDialog = (size?: Size) => {
    if (size) {
      setEditSizeId(size._id);
      setSizeLabel(size.label);
    } else {
      setEditSizeId(null);
      setSizeLabel('');
    }
    setSizeDialogOpen(true);
  };

  const handleCloseSizeDialog = () => {
    setSizeDialogOpen(false);
    setEditSizeId(null);
    setSizeLabel('');
  };

  const handleSaveSize = async () => {
    try {
      if (!sizeLabel.trim()) {
        toast.error('Size label is required');
        return;
      }

      setLoading(true);
      
      if (editSizeId) {
        // Update existing size
        const response = await axios.put(`http://localhost:3000/admin/sizes/${editSizeId}`, 
          { label: sizeLabel }, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.success) {
          toast.success('Size updated successfully');
          fetchSizes();
        } else {
          toast.error(response.data.message || 'Failed to update size');
        }
      } else {
        // Create new size
        const response = await axios.post('http://localhost:3000/admin/sizes', 
          { label: sizeLabel }, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.success) {
          toast.success('Size created successfully');
          fetchSizes();
        } else {
          toast.error(response.data.message || 'Failed to create size');
        }
      }
      
      handleCloseSizeDialog();
      setLoading(false);
    } catch (error: any) {
      console.error('Error saving size:', error);
      toast.error(error.response?.data?.message || 'An error occurred while saving size');
      setLoading(false);
    }
  };
  
  const handleDeleteSize = (id: string) => {
    setItemToDelete({ id, type: 'size' });
    setConfirmDialogOpen(true);
  };

  // Color functions
  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/admin/colors', {
        withCredentials: true
      });
      if (response.data && response.data.success) {
        setColors(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch colors');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast.error('Failed to load colors');
      setLoading(false);
    }
  };

  const handleOpenColorDialog = (color?: Color) => {
    if (color) {
      setEditColorId(color._id);
      setColorName(color.name);
      setHexCode(color.hexCode);
    } else {
      setEditColorId(null);
      setColorName('');
      setHexCode('#000000');
    }
    setColorDialogOpen(true);
  };

  const handleCloseColorDialog = () => {
    setColorDialogOpen(false);
    setEditColorId(null);
    setColorName('');
    setHexCode('#000000');
  };

  const handleSaveColor = async () => {
    try {
      if (!colorName.trim()) {
        toast.error('Color name is required');
        return;
      }
      
      if (!hexCode || !/^#[0-9A-F]{6}$/i.test(hexCode)) {
        toast.error('Valid hex code is required (format: #RRGGBB)');
        return;
      }

      setLoading(true);
      
      if (editColorId) {
        // Update existing color
        const response = await axios.put(`http://localhost:3000/admin/colors/${editColorId}`, 
          { name: colorName, hexCode }, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.success) {
          toast.success('Color updated successfully');
          fetchColors();
        } else {
          toast.error(response.data.message || 'Failed to update color');
        }
      } else {
        // Create new color
        const response = await axios.post('http://localhost:3000/admin/colors', 
          { name: colorName, hexCode }, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.success) {
          toast.success('Color created successfully');
          fetchColors();
        } else {
          toast.error(response.data.message || 'Failed to create color');
        }
      }
      
      handleCloseColorDialog();
      setLoading(false);
    } catch (error: any) {
      console.error('Error saving color:', error);
      toast.error(error.response?.data?.message || 'An error occurred while saving color');
      setLoading(false);
    }
  };
  
  const handleDeleteColor = (id: string) => {
    setItemToDelete({ id, type: 'color' });
    setConfirmDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      
      if (itemToDelete.type === 'size') {
        const response = await axios.delete(`http://localhost:3000/admin/sizes/${itemToDelete.id}`, {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          toast.success('Size deleted successfully');
          fetchSizes();
        } else {
          toast.error(response.data.message || 'Failed to delete size');
        }
      } else {
        const response = await axios.delete(`http://localhost:3000/admin/colors/${itemToDelete.id}`, {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          toast.success('Color deleted successfully');
          fetchColors();
        } else {
          toast.error(response.data.message || 'Failed to delete color');
        }
      }
      
      setConfirmDialogOpen(false);
      setItemToDelete(null);
      setLoading(false);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'An error occurred while deleting item');
      setLoading(false);
    }
  };

  if (loading && sizes.length === 0 && colors.length === 0) {
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Settings</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system settings
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sizes" />
          <Tab label="Colors" />
        </Tabs>

        {/* Sizes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Available Sizes</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenSizeDialog()}
            >
              Add Size
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {sizes.map((size) => (
              <Grid item key={size._id}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    minWidth: '120px'
                  }}
                >
                  <Typography variant="body1">{size.label}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenSizeDialog(size)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteSize(size._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
            {sizes.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1">No sizes available. Add one to get started.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Colors Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Available Colors</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenColorDialog()}
            >
              Add Color
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {colors.map((color) => (
              <Grid item key={color._id}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    minWidth: '150px'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: color.hexCode,
                      border: `1px solid ${theme.palette.divider}`,
                      mr: 1
                    }} 
                  />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>{color.name}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenColorDialog(color)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteColor(color._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
            {colors.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1">No colors available. Add one to get started.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Size Dialog */}
      <Dialog open={sizeDialogOpen} onClose={handleCloseSizeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editSizeId ? 'Edit Size' : 'Add New Size'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Size Label"
            fullWidth
            value={sizeLabel}
            onChange={(e) => setSizeLabel(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSizeDialog}>Cancel</Button>
          <Button onClick={handleSaveSize} variant="contained">
            {editSizeId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Color Dialog */}
      <Dialog open={colorDialogOpen} onClose={handleCloseColorDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editColorId ? 'Edit Color' : 'Add New Color'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Color Name"
            fullWidth
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Hex Code"
            fullWidth
            value={hexCode}
            onChange={(e) => setHexCode(e.target.value)}
            helperText="Format: #RRGGBB (e.g., #FF0000 for red)"
            sx={{ mb: 1 }}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>Preview:</Typography>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: hexCode,
                border: `1px solid ${theme.palette.divider}`
              }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseColorDialog}>Cancel</Button>
          <Button onClick={handleSaveColor} variant="contained">
            {editColorId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Note: {itemToDelete?.type === 'size' ? 'Sizes' : 'Colors'} used in products cannot be deleted.
          </Typography>
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

export default Settings;
