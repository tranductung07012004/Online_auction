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
  Tooltip,
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Mail,
  Phone,
  LocationOn,
  Person,
  Add,
  Check,
  Close,
} from '@mui/icons-material';
import { 
  getAllContacts, 
  getContactById, 
  createContact,
  updateContact,
  deleteContact,
  markContactAsContacted,
  updateContactStatus 
} from '../../api/admin';

// Define Contact interface
interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  isContacted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Contact form
  const [formOpen, setFormOpen] = useState(false);
  const [formContact, setFormContact] = useState<Partial<Contact>>({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });
  
  // Alerts
  const [alert, setAlert] = useState<{show: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning'}>({
    show: false,
    message: '',
    severity: 'info'
  });
  
  // Dialogs
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    fetchContacts();
  }, []);
  
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await getAllContacts();
      setContacts(contactsData);
      setFilteredContacts(contactsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setAlert({
        show: true,
        message: 'Failed to load contacts. Please try again.',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Apply filters
    let results = contacts;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(contact => contact.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        contact =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          contact.phoneNumber.includes(searchTerm)
      );
    }
    
    setFilteredContacts(results);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, contacts]);
  
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
  
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  const handleDeleteConfirm = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    
    try {
      setLoading(true);
      await deleteContact(contactToDelete);
      
      // Remove the contact from the list
      setContacts(prev => prev.filter(c => c._id !== contactToDelete));
      setAlert({
        show: true,
        message: 'Contact deleted successfully',
        severity: 'success'
      });
      
      setDeleteDialogOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setAlert({
        show: true,
        message: 'Failed to delete contact',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };
  
  const handleMarkAsContacted = async (contactId: string) => {
    try {
      setLoading(true);
      const updatedContact = await markContactAsContacted(contactId);
      
      // Update contact in the list
      setContacts(prev => 
        prev.map(contact => 
          contact._id === contactId ? updatedContact : contact
        )
      );
      
      setAlert({
        show: true,
        message: 'Contact marked as contacted',
        severity: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error marking contact as contacted:', error);
      setAlert({
        show: true,
        message: 'Failed to mark contact as contacted',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      setLoading(true);
      const updatedContact = await updateContactStatus(contactId, newStatus);
      
      // Update contact in the list
      setContacts(prev => 
        prev.map(contact => 
          contact._id === contactId ? updatedContact : contact
        )
      );
      
      setAlert({
        show: true,
        message: `Contact status updated to ${newStatus}`,
        severity: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error updating contact status:', error);
      setAlert({
        show: true,
        message: 'Failed to update contact status',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleEditContact = (contact: Contact) => {
    setFormContact({
      _id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email || '',
      address: contact.address || '',
      city: contact.city || '',
      postalCode: contact.postalCode || '',
      notes: contact.notes || '',
    });
    setFormOpen(true);
  };
  
  const handleOpenAddForm = () => {
    setFormContact({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
    });
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormContact({
      ...formContact,
      [event.target.name]: event.target.value,
    });
  };
  
  const handleSubmitForm = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formContact.name || !formContact.phoneNumber) {
        setAlert({
          show: true,
          message: 'Name and phone number are required',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      let result;
      
      if (formContact._id) {
        // Update existing contact
        result = await updateContact(formContact._id, formContact);
        setContacts(prev => 
          prev.map(contact => 
            contact._id === formContact._id ? result : contact
          )
        );
        setAlert({
          show: true,
          message: 'Contact updated successfully',
          severity: 'success'
        });
      } else {
        // Create new contact
        result = await createContact(formContact);
        setContacts(prev => [...prev, result]);
        setAlert({
          show: true,
          message: 'Contact created successfully',
          severity: 'success'
        });
      }
      
      setFormOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      setAlert({
        show: true,
        message: 'Failed to save contact',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'contacted':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <Box p={3}>
        {/* Page Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Contact Management</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleOpenAddForm}
          >
            Add New Contact
          </Button>
        </Box>
        
        {/* Filters */}
        <Box display="flex" mb={3} gap={2} flexWrap="wrap">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Contacts Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact Info</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ height: 300 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}
                
                {!loading && filteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ height: 100 }}>
                      <Typography variant="body1">No contacts found</Typography>
                    </TableCell>
                  </TableRow>
                )}
                
                {!loading &&
                  filteredContacts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((contact) => (
                      <TableRow key={contact._id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleViewContact(contact)}
                          >
                            <Person sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body1" fontWeight="medium">
                              {contact.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Stack spacing={1}>
                            <Box display="flex" alignItems="center">
                              <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{contact.phoneNumber}</Typography>
                            </Box>
                            {contact.email && (
                              <Box display="flex" alignItems="center">
                                <Mail fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">{contact.email}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </TableCell>
                        
                        <TableCell>
                          {contact.address && (
                            <Box display="flex" alignItems="flex-start">
                              <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {contact.address}
                                {contact.city && `, ${contact.city}`}
                                {contact.postalCode && ` (${contact.postalCode})`}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(contact.createdAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={contact.status.charAt(0).toUpperCase() + contact.status.slice(1)} 
                            color={getStatusColor(contact.status) as any}
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex">
                            <Tooltip title="Mark as Contacted">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleMarkAsContacted(contact._id)}
                                disabled={contact.isContacted}
                              >
                                <Check />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit">
                              <IconButton 
                                color="info" 
                                onClick={() => handleEditContact(contact)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteConfirm(contact._id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredContacts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      
      {/* Contact Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedContact && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Person color="primary" />
                <Typography variant="h6">{selectedContact.name}</Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Contact Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body1">{selectedContact.phoneNumber}</Typography>
                      </Box>
                    </Grid>
                    
                    {selectedContact.email && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Mail fontSize="small" color="action" />
                          <Typography variant="body1">{selectedContact.email}</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedContact.address && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <LocationOn fontSize="small" color="action" sx={{ mt: 0.5 }} />
                          <Typography variant="body1">
                            {selectedContact.address}
                            {selectedContact.city && `, ${selectedContact.city}`}
                            {selectedContact.postalCode && ` (${selectedContact.postalCode})`}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
              
              {selectedContact.notes && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">{selectedContact.notes}</Typography>
                  </CardContent>
                </Card>
              )}
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Contact Status
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip 
                      label={selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)} 
                      color={getStatusColor(selectedContact.status) as any}
                      size="small"
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {selectedContact.isContacted ? 'Has been contacted' : 'Not contacted yet'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(selectedContact.createdAt)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {formatDate(selectedContact.updatedAt)}
                  </Typography>
                </CardContent>
              </Card>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Close</Button>
              <Button 
                color="primary" 
                onClick={() => handleMarkAsContacted(selectedContact._id)}
                disabled={selectedContact.isContacted}
              >
                Mark as Contacted
              </Button>
              <Button 
                color="info" 
                onClick={() => {
                  handleCloseDetailDialog();
                  handleEditContact(selectedContact);
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Contact Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', mb: 2 }}>
          {formContact._id ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ p: 1 }}>
            {/* Personal Information */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} /> Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Name"
                    value={formContact.name}
                    onChange={handleFormChange}
                    fullWidth
                    required
                    size="small"
                    InputProps={{
                      startAdornment: <Person fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    name="phoneNumber"
                    label="Phone Number"
                    value={formContact.phoneNumber}
                    onChange={handleFormChange}
                    fullWidth
                    required
                    size="small"
                    InputProps={{
                      startAdornment: <Phone fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formContact.email}
                    onChange={handleFormChange}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <Mail fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {/* Address Information */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} /> Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="address"
                    label="Address"
                    value={formContact.address}
                    onChange={handleFormChange}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <LocationOn fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="city"
                    label="City"
                    value={formContact.city}
                    onChange={handleFormChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="postalCode"
                    label="Postal Code"
                    value={formContact.postalCode}
                    onChange={handleFormChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {/* Notes */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Notes
              </Typography>
              <TextField
                name="notes"
                label="Additional Notes"
                value={formContact.notes}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Enter any additional information about this contact..."
              />
            </Paper>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseForm} 
            variant="outlined"
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSubmitForm}
            startIcon={<Check />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alerts */}
      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default Contacts; 