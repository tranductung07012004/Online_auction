import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Divider,
} from '@mui/material';
import Header from '../../components/header';
import Footer from '../../components/footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { addPhotographyToCart } from '../../api/photographyCart';
import { toast } from 'react-hot-toast';

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

// Sort options
type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'default';

const API_URL = 'http://localhost:3000/photography/services';

const Photography = () => {
  const [services, setServices] = useState<PhotographyService[]>([]);
  const [filteredServices, setFilteredServices] = useState<PhotographyService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch photography services from the backend
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PhotographyService[]>(API_URL);
        
        // Filter only available services
        const availableServices = response.data.filter(
          service => service.status === 'Available'
        );
        
        setServices(availableServices);
        setFilteredServices(availableServices);
        setError(null);
      } catch (err) {
        console.error('Error fetching photography services:', err);
        setError('Failed to load photography services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Apply sorting when sort option changes
  useEffect(() => {
    if (services.length === 0) return;
    
    let sortedServices = [...services];
    
    switch (sortOption) {
      case 'price-asc':
        sortedServices.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedServices.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sortedServices.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedServices.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Do not sort
        break;
    }
    
    setFilteredServices(sortedServices);
  }, [sortOption, services]);

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOption(event.target.value as SortOption);
  };

  const handleSelectPackage = async (serviceId: string) => {
    try {
      // Find the selected service
      const selectedService = services.find(service => service._id === serviceId);
      
      if (!selectedService) {
        toast.error('Service not found');
        return;
      }
      
      // Add to photography cart using localStorage service
      await addPhotographyToCart({
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        serviceType: selectedService.packageType,
        price: selectedService.price,
        imageUrl: selectedService.imageUrls[0] || '',
        bookingDate: new Date().toISOString(), // Default date (will be updated during checkout)
        location: selectedService.location
      });
      
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add service to cart. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div 
          className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
          style={{ 
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="text-center text-white z-10 px-4 md:px-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Capture Your Perfect Moments</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Professional wedding photography services to preserve your special memories for a lifetime
            </p>
            <a 
              href="#packages" 
              className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Book Now
            </a>
          </div>
        </div>
        
        <Container maxWidth="lg" className="my-12">
          <Typography variant="h4" component="h1" className="text-center mb-8" sx={{ fontWeight: 'bold' }}>
            Wedding Photography Booking
          </Typography>
          
          {/* Services Section */}
          <Box id="packages" sx={{ my: 6 }}>
            <Typography variant="h5" component="h2" className="text-center mb-8">
              Our Photography Packages
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
            ) : services.length === 0 ? (
              <Alert severity="info" sx={{ mb: 4 }}>No photography services available at the moment. Please check back later.</Alert>
            ) : (
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={0}>
                  {/* Sort Options - Left Column */}
                  <Grid sx={{ width: { xs: '100%', sm: '280px' }, padding: 1, position: { sm: 'sticky' }, top: { sm: 20 }, alignSelf: { sm: 'flex-start' } }}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: '8px' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Sort By
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="sort-options"
                          name="sort-options"
                          value={sortOption}
                          onChange={handleSortChange}
                        >
                          <FormControlLabel 
                            value="default" 
                            control={<Radio />} 
                            label="Default" 
                          />
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }}>
                            Price
                          </Typography>
                          <FormControlLabel 
                            value="price-asc" 
                            control={<Radio />} 
                            label="Low to High" 
                          />
                          <FormControlLabel 
                            value="price-desc" 
                            control={<Radio />} 
                            label="High to Low" 
                          />
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }}>
                            Name
                          </Typography>
                          <FormControlLabel 
                            value="name-asc" 
                            control={<Radio />} 
                            label="A to Z" 
                          />
                          <FormControlLabel 
                            value="name-desc" 
                            control={<Radio />} 
                            label="Z to A" 
                          />
                        </RadioGroup>
                      </FormControl>
                    </Paper>
                  </Grid>
                  
                  {/* Services - Right Column */}
                  <Grid sx={{ width: { xs: '100%', sm: 'calc(100% - 280px)' }, padding: 1 }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(3, 1fr)' 
                      }, 
                      gap: 3 
                    }}>
                      {filteredServices.map((service) => (
                        <Paper 
                          key={service._id}
                          elevation={3} 
                          sx={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            transition: 'transform 0.3s', 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': { transform: 'translateY(-5px)' } 
                          }}
                        >
                          <Box 
                            sx={{ 
                              height: 220, 
                              backgroundImage: `url(${service.imageUrls[0] || "https://images.unsplash.com/photo-1583939003579-730e3918a45a"})`, 
                              backgroundSize: 'cover', 
                              backgroundPosition: 'center' 
                            }} 
                          />
                          <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                              {service.name}
                            </Typography>
                            <Typography variant="h6" color="primary" gutterBottom>
                              ${service.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {service.description}
                            </Typography>
                            <ul className="list-disc pl-5 mb-4">
                              {service.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="text-sm mb-1">{feature}</li>
                              ))}
                              {service.features.length > 3 && (
                                <li key="more" className="text-sm mb-1 text-primary">
                                  +{service.features.length - 3} more features
                                </li>
                              )}
                            </ul>
                            <Box sx={{ display: 'flex', mt: 'auto' }}>
                              <Button 
                                variant="outlined" 
                                onClick={() => navigate(`/photography/service-detail/${service._id}`)}
                                sx={{ 
                                  width: '100%',
                                  borderColor: '#000',
                                  color: '#000',
                                  '&:hover': {
                                    borderColor: '#333',
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                  },
                                }}
                              >
                              View Details
                            </Button>
                          </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
          
          {/* Contact Section */}
          <Box sx={{ my: 8, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Ready to Book Your Photography Session?
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
              Contact our team to discuss your preferences and book your session. We'll create a custom photography plan that captures your special moments exactly how you envision them.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5,
                backgroundColor: '#000',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              Contact Us Now
            </Button>
          </Box>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Photography;
