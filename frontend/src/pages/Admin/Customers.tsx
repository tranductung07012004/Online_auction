import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  Box,
  Button,
  CircularProgress,
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
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Grid,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Mail,
  Phone,
  LocationOn,
  Person,
  MoreVert,
  AccountCircle,
} from '@mui/icons-material';
import { CustomerUser, getAllCustomers, getCustomerById, updateCustomerStatus, deleteCustomer } from '../../api/admin';

// Map data from API to component's data model
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  lastLogin: string;
  totalOrders: number;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  username: string;
}

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Alerts
  const [alert, setAlert] = useState<{show: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning'}>({
    show: false,
    message: '',
    severity: 'info'
  });
  
  // Dialogs
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Real API call to fetch customers
        const customersData = await getAllCustomers();
        
        // Transform API data to match component's data model
        const mappedCustomers: Customer[] = customersData.map(customer => ({
          _id: customer._id,
          name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.username,
          email: customer.email,
          phone: customer.phone || 'No phone',
          address: customer.addresses && customer.addresses.length > 0 
            ? `${customer.addresses[0].address}, ${customer.addresses[0].city}`
            : 'No address',
          createdAt: customer.createdAt,
          lastLogin: customer.lastLogin || customer.updatedAt || customer.createdAt,
          totalOrders: customer.totalOrders || 0,
          status: customer.status || (customer.isVerified ? 'active' : 'inactive'),
          avatar: customer.profileImageUrl,
          username: customer.username,
        }));
        
        setCustomers(mappedCustomers);
        setFilteredCustomers(mappedCustomers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setAlert({
          show: true,
          message: 'Failed to load customers. Please try again.',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let results = customers;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
    }
    
    setFilteredCustomers(results);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, customers]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as string);
  };
  
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  const handleDeleteConfirm = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      setLoading(true);
      // Real API call to delete customer
      const result = await deleteCustomer(customerToDelete);
      
      if (result.success) {
        // Remove the customer from the list
        setCustomers(prev => prev.filter(c => c._id !== customerToDelete));
        setAlert({
          show: true,
          message: 'Customer deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(result.message);
      }
      
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setAlert({
        show: true,
        message: error.message || 'Failed to delete customer',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (customerId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    try {
      setLoading(true);
      // Real API call to update status
      const updatedCustomer = await updateCustomerStatus(customerId, newStatus);
      
      // Update the customer in the list
      setCustomers(prev => prev.map(c => {
        if (c._id === customerId) {
          return {
            ...c,
            status: newStatus
          };
        }
        return c;
      }));
      
      if (selectedCustomer && selectedCustomer._id === customerId) {
        setSelectedCustomer({
          ...selectedCustomer,
          status: newStatus
        });
      }
      
      setAlert({
        show: true,
        message: `Customer status updated to ${newStatus}`,
        severity: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error updating customer status:', error);
      setAlert({
        show: true,
        message: 'Failed to update customer status',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleCloseAlert = () => {
    setAlert({...alert, show: false});
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading && customers.length === 0) {
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
        <Typography variant="h4" fontWeight="bold">Customer Management</Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your customer database
        </Typography>
      </Box>
      
      <Snackbar 
        open={alert.show} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ flexGrow: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Customers
            </Typography>
            <Typography variant="h4">
              {customers.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Customers
            </Typography>
            <Typography variant="h4">
              {customers.filter(c => c.status === 'active').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              New this Month
            </Typography>
            <Typography variant="h4">
              {customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }} src={customer.avatar}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      {customer.name}
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.status.charAt(0).toUpperCase() + customer.status.slice(1)} 
                      color={getStatusColor(customer.status) as "success" | "warning" | "error" | "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewCustomer(customer)}
                      size="small"
                    >
                      <Person />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteConfirm(customer._id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Customer Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2 }} src={selectedCustomer.avatar}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{selectedCustomer.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  @{selectedCustomer.username}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Chip 
                    label={selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)} 
                    color={getStatusColor(selectedCustomer.status) as "success" | "warning" | "error" | "default"}
                    size="small"
                  />
                  <Chip 
                    label={`${selectedCustomer.totalOrders} Orders`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Mail sx={{ color: 'text.secondary', mr: 2 }} />
                  <Typography>{selectedCustomer.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ color: 'text.secondary', mr: 2 }} />
                  <Typography>{selectedCustomer.phone}</Typography>
                </Box>
                {selectedCustomer.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                    <Typography>{selectedCustomer.address}</Typography>
                  </Box>
                )}
                
                <Divider />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Registered
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedCustomer.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedCustomer.lastLogin)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider />
                
                <Typography variant="subtitle2" color="text.secondary">
                  Change Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={selectedCustomer.status === 'active' ? 'contained' : 'outlined'}
                    color="success"
                    size="small"
                    onClick={() => handleUpdateStatus(selectedCustomer._id, 'active')}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={selectedCustomer.status === 'inactive' ? 'contained' : 'outlined'}
                    color="warning"
                    size="small"
                    onClick={() => handleUpdateStatus(selectedCustomer._id, 'inactive')}
                  >
                    Inactive
                  </Button>
                  <Button 
                    variant={selectedCustomer.status === 'blocked' ? 'contained' : 'outlined'}
                    color="error"
                    size="small"
                    onClick={() => handleUpdateStatus(selectedCustomer._id, 'blocked')}
                  >
                    Blocked
                  </Button>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this customer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

const Divider = () => <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 1 }} />;

export default Customers; 