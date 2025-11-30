import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Chip,
  Divider,
  Grid
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface BookingStatusProps {
  bookingData: {
    package: string;
    location: string;
    date: string;
    time: string;
    additionalRequests: string;
    status: string;
  };
}

const BookingStatus: React.FC<BookingStatusProps> = ({ bookingData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    // Generate a random booking ID
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    setBookingId(randomId);
    
    // Simulate booking progress
    // In a real application, this would come from an API
    const timer = setTimeout(() => {
      // Move to confirmed state after 3 seconds for demo
      setActiveStep(1);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusDisplay = () => {
    switch (activeStep) {
      case 0:
        return (
          <Chip 
            icon={<AccessTimeIcon />} 
            label="Processing" 
            color="warning" 
            sx={{ fontWeight: 'bold' }} 
          />
        );
      case 1:
        return (
          <Chip 
            icon={<CheckCircleOutlineIcon />} 
            label="Confirmed" 
            color="success" 
            sx={{ fontWeight: 'bold' }} 
          />
        );
      default:
        return (
          <Chip 
            icon={<AccessTimeIcon />} 
            label="Pending" 
            color="default" 
            sx={{ fontWeight: 'bold' }} 
          />
        );
    }
  };

  const getPackageTitle = () => {
    switch (bookingData.package) {
      case 'pre-wedding':
        return 'Pre-Wedding Photography Package';
      case 'wedding-day':
        return 'Wedding Day Photography Package';
      case 'custom':
        return 'Custom Photography Package';
      default:
        return 'Photography Package';
    }
  };

  return (
    <Box>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: '12px',
          mb: 4,
          backgroundColor: activeStep === 1 ? 'rgba(76, 175, 80, 0.08)' : 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Booking Status
          </Typography>
          {getStatusDisplay()}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary">
            Booking Reference
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            #{bookingId}
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Booking Submitted</StepLabel>
          </Step>
          <Step>
            <StepLabel>Booking Confirmed</StepLabel>
          </Step>
          <Step>
            <StepLabel>Photoshoot Day</StepLabel>
          </Step>
          <Step>
            <StepLabel>Photos Delivered</StepLabel>
          </Step>
        </Stepper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Package Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom>
                {getPackageTitle()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {bookingData.package === 'pre-wedding' ? 
                  'Pre-wedding photoshoot to capture your romance and excitement before the big day.' :
                bookingData.package === 'wedding-day' ?
                  'Comprehensive coverage of your wedding day from start to finish with professional photographers.' :
                  'Custom photography package designed to your specific requirements and preferences.'}
              </Typography>
              
              {bookingData.additionalRequests && (
                <>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Special Requests:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {bookingData.additionalRequests}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Session Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {bookingData.location}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {bookingData.date}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {bookingData.time}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
        {activeStep === 1 ? (
          <Box>
            <CheckCircleOutlineIcon 
              color="success" 
              sx={{ fontSize: 64, mb: 2 }} 
            />
            <Typography variant="h5" gutterBottom>
              Your booking has been confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a confirmation email with all the details. Our team will contact you shortly to discuss any additional requirements.
            </Typography>
          </Box>
        ) : (
          <Box>
            <AccessTimeIcon 
              color="warning" 
              sx={{ fontSize: 64, mb: 2 }} 
            />
            <Typography variant="h5" gutterBottom>
              Processing your booking...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please wait while we confirm the availability of your selected date and time.
            </Typography>
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => window.print()}
        >
          Print Details
        </Button>
        
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#000',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
          href="/"
        >
          Return to Homepage
        </Button>
      </Box>
    </Box>
  );
};

export default BookingStatus;
