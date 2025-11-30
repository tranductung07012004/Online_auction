import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  Chip,
  Stack
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface LocationDateSelectionProps {
  selectedPackage: string;
  onSubmit: (data: {
    location: string;
    date: string;
    time: string;
    additionalRequests: string;
  }) => void;
}

// Available time slots
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
  '2:00 PM', '3:00 PM', '4:00 PM'
];

// Available locations
const LOCATIONS = [
  {
    id: 'studio',
    name: 'In-Studio Photography',
    address: '123 Studio Way, Downtown',
    image: 'https://images.unsplash.com/photo-1604014053305-39018c3b9236?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'beach',
    name: 'Beach Photography',
    address: 'Sunset Beach, Coastal Blvd',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80'
  },
  {
    id: 'garden',
    name: 'Botanical Garden',
    address: 'Floral Gardens, 456 Park Avenue',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80'
  },
  {
    id: 'urban',
    name: 'Urban Setting',
    address: 'Downtown Historic District',
    image: 'https://images.unsplash.com/photo-1597157639073-69284dc0fdaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'custom',
    name: 'Custom Location',
    address: 'Specify your preferred location',
    image: 'https://images.unsplash.com/photo-1501759774251-b67cfdf1c24f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

const LocationDateSelection: React.FC<LocationDateSelectionProps> = ({ selectedPackage, onSubmit }) => {
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');
  const [errors, setErrors] = useState({
    location: false,
    date: false,
    time: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors = {
      location: !location,
      date: !date,
      time: !time
    };

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // Handle final location value
    const finalLocation = location === 'custom' ? customLocation : LOCATIONS.find(loc => loc.id === location)?.name || '';

    onSubmit({
      location: finalLocation,
      date,
      time,
      additionalRequests
    });
  };

  return (
    <div>
      <Typography variant="h5" component="h2" className="text-center mb-6">
        {selectedPackage === 'pre-wedding' ? 'Pre-Wedding' : 
         selectedPackage === 'wedding-day' ? 'Wedding Day' : 'Custom'} Photography Session
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Location Selection */}
            <div>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1 }} /> Choose a Location
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {LOCATIONS.map((loc) => (
                  <Box 
                    key={loc.id} 
                    sx={{ 
                      width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                      mb: 2
                    }}
                  >
                    <Paper 
                      elevation={location === loc.id ? 8 : 2}
                      onClick={() => setLocation(loc.id)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: location === loc.id ? '2px solid #000' : 'none',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: 120, 
                          borderRadius: '4px',
                          backgroundImage: `url(${loc.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          mb: 2
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {loc.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {loc.address}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
              
              {location === 'custom' && (
                <TextField
                  fullWidth
                  label="Enter your custom location"
                  variant="outlined"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  margin="normal"
                  required
                  error={errors.location && !customLocation}
                  helperText={errors.location && !customLocation ? "Custom location is required" : ""}
                />
              )}
              
              {errors.location && !location && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  Please select a location
                </Typography>
              )}
            </div>
            
            {/* Date and Time Selection */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Select Date
                </Typography>
                <TextField
                  fullWidth
                  label="Photography Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0],
                  }}
                  error={errors.date}
                  helperText={errors.date ? "Please select a date" : ""}
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1 }} /> Select Time
                </Typography>
                <FormControl fullWidth error={errors.time}>
                  <InputLabel id="time-slot-label">Available Time Slots</InputLabel>
                  <Select
                    labelId="time-slot-label"
                    id="time-slot"
                    value={time}
                    label="Available Time Slots"
                    onChange={(e) => setTime(e.target.value)}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.time && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      Please select a time slot
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>
            
            {/* Additional Requests */}
            <div>
              <Typography variant="h6" gutterBottom>
                Additional Requests or Special Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Please share any special requests or details about your photography session..."
                value={additionalRequests}
                onChange={(e) => setAdditionalRequests(e.target.value)}
              />
            </div>
            
            {/* Summary Section */}
            <div>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0, 0, 0, 0.02)', 
                  borderRadius: '8px'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={selectedPackage === 'pre-wedding' ? 'Pre-Wedding Package' : 
                           selectedPackage === 'wedding-day' ? 'Wedding Day Package' : 
                           'Custom Package'} 
                    color="primary" 
                    variant="outlined" 
                  />
                  
                  {location && location !== 'custom' && (
                    <Chip 
                      label={LOCATIONS.find(loc => loc.id === location)?.name} 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  
                  {location === 'custom' && customLocation && (
                    <Chip 
                      label={customLocation} 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  
                  {date && (
                    <Chip 
                      label={date} 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  
                  {time && (
                    <Chip 
                      label={time} 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Please confirm your selection before proceeding. Our team will review your booking request and contact you within 24 hours.
                </Typography>
              </Paper>
            </div>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                sx={{ 
                  minWidth: 200,
                  backgroundColor: '#000',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
              >
                Confirm Booking Request
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </div>
  );
};

export default LocationDateSelection;
