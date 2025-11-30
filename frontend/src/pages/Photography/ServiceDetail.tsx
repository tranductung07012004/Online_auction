import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
  ImageList,
  ImageListItem,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Add calendar icon
import Header from '../../components/header';
import Footer from '../../components/footer';
import axios from 'axios';
import { addPhotographyToCart } from '../../api/photographyCart';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns'; // Add this import
import DatePicker from './components/DatePicker'; // Import the DatePicker component

// API service type definition
interface PhotographyService {
  _id: string;
  name: string;
  packageType: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  photographer: string;
  status: string;
  imageUrls: string[];
  features: string[];
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
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
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

const API_URL = 'http://localhost:3000/photography/services';

// Generate time slots from 8:00 AM to 6:00 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    // Full hour
    slots.push({
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: `${hourFormatted}:00 ${ampm}`
    });
    // Half hour
    if (hour < 18) {
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hourFormatted}:30 ${ampm}`
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<PhotographyService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Add state for date and time selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PhotographyService>(`${API_URL}/${id}`);
        setService(response.data);
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          setSelectedImage(response.data.imageUrls[0]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetail();
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle date selection
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };
  
  // Handle time selection
  const handleTimeChange = (event: SelectChangeEvent) => {
    setSelectedTime(event.target.value as string);
    setTimeError(null);
  };

  const handleSelectPackage = async () => {
    if (service) {
      try {
        // Check if a date is selected
        if (!selectedDate) {
          toast.error('Please select a booking date');
          return;
        }
        
        // Check if a time is selected
        if (!selectedTime) {
          setTimeError('Please select a booking time');
          return;
        }
        
        // Combine date and time
        const bookingDate = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        
        // Add to photography cart using localStorage service
        await addPhotographyToCart({
          serviceId: service._id,
          serviceName: service.name,
          serviceType: service.packageType,
          price: service.price,
          imageUrl: service.imageUrls[0] || '',
          bookingDate: bookingDate.toISOString(), // Use the combined date and time
          location: service.location
        });
        
        // Navigate to cart page
        navigate('/cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add service to cart. Please try again.');
      }
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
          <Grid container spacing={4}>
            <Grid sx={{ width: { xs: '100%', md: '58.33%' }, padding: 1 }}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
              <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} variant="rectangular" width={100} height={100} sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '41.67%' }, padding: 1 }}>
              <Skeleton variant="text" height={60} width="80%" />
              <Skeleton variant="text" height={40} width="40%" />
              <Skeleton variant="text" height={100} width="100%" sx={{ mt: 2 }} />
              <Skeleton variant="rectangular" height={200} width="100%" sx={{ mt: 3, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={50} width="100%" sx={{ mt: 3, borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert 
            severity="error" 
            sx={{ width: '100%', maxWidth: 600 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/photography')}>
                Back to Packages
              </Button>
            }
          >
            {error || 'Service not found. Please try a different package.'}
          </Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Container maxWidth="xl" sx={{ py: 6 }}>
          {/* Breadcrumb */}
          <Typography 
            variant="body2" 
            sx={{ mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/photography')}
          >
            &larr; Back to all packages
          </Typography>

          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 6 }}>
            <Grid container>
              {/* Left Column - Image */}
              <Grid sx={{ width: { xs: '100%', md: '60%' } }}>
                <Box
                  sx={{ 
                    height: { xs: 350, sm: 450, md: 600 },
                    backgroundImage: `url(${selectedImage || service.imageUrls[0] || "https://images.unsplash.com/photo-1583939003579-730e3918a45a"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                />
                
                {/* Thumbnail Gallery */}
                {service.imageUrls.length > 1 && (
                  <Box sx={{ p: 2 }}>
                    <ImageList sx={{ height: { xs: 80, md: 100 } }} cols={service.imageUrls.length > 4 ? 5 : service.imageUrls.length} rowHeight={100} gap={8}>
                      {service.imageUrls.map((image, index) => (
                        <ImageListItem 
                          key={index}
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedImage === image ? '2px solid #000' : 'none',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                          onClick={() => handleImageSelect(image)}
                        >
                          <img
                            src={image}
                            alt={`${service.name} - image ${index + 1}`}
                            loading="lazy"
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </Grid>
              
              {/* Right Column - Service Details */}
              <Grid sx={{ width: { xs: '100%', md: '40%' }, p: 4 }}>
                <Chip 
                  label={service.packageType}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {service.name}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="medium" sx={{ mb: 3 }}>
                  ${service.price}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {service.description}
                </Typography>

                {/* Service Details */}
                <List sx={{ mb: 3, backgroundColor: '#f9f9f9', borderRadius: 2, py: 1 }}>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duration" 
                      secondary={service.duration}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Location" 
                      secondary={service.location}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CameraAltIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Photographer" 
                      secondary={service.photographer}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
                
                {/* Date and Time Picker Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ mr: 1, fontSize: 20 }} />
                    Select Booking Date and Time
                  </Typography>
                  
                  {/* Date Picker */}
                  <DatePicker
                    label="Booking Date"
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    showPicker={showDatePicker}
                    onPickerChange={setShowDatePicker}
                    minDate={new Date()} // Can't select dates in the past
                  />
                  
                  {/* Time Picker */}
                  <FormControl 
                    fullWidth 
                    sx={{ mt: 2 }}
                    error={!!timeError}
                  >
                    <InputLabel id="time-select-label">Select Time</InputLabel>
                    <Select
                      labelId="time-select-label"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      label="Select Time"
                      disabled={!selectedDate}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <MenuItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {timeError && <FormHelperText>{timeError}</FormHelperText>}
                  </FormControl>
                  
                  {(!selectedDate || !selectedTime) && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      Please select both date and time to book this package
                    </Typography>
                  )}
                </Box>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth 
                  onClick={handleSelectPackage}
                  disabled={!selectedDate || !selectedTime}
                  sx={{ 
                    py: 1.5,
                    backgroundColor: (selectedDate && selectedTime) ? '#000' : '#ccc',
                    '&:hover': {
                      backgroundColor: (selectedDate && selectedTime) ? '#333' : '#ccc',
                    },
                    mb: 4
                  }}
                >
                  BOOK THIS PACKAGE
                </Button>
                
                {/* Features List */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Package Features
                  </Typography>
                  <List dense>
                    {service.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Additional Info Tabs */}
          <Box sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="What to Expect" />
                <Tab label="Preparation Tips" />
                <Tab label="FAQ" />
              </Tabs>

              {/* Tab panels remain unchanged */}
              {/* ... */}
            </Paper>
          </Box>

          {/* Related Packages */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              You May Also Like
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Explore our other popular photography packages
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/photography')}
              sx={{ 
                borderColor: '#000',
                color: '#000',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              View All Packages
            </Button>
          </Box>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;