import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

interface PackageProps {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  image: string;
}

interface PhotoPackageSelectionProps {
  onSelect: (packageType: string) => void;
}

const PHOTO_PACKAGES: PackageProps[] = [
  {
    id: 'pre-wedding',
    title: 'Pre-Wedding',
    description: 'Capture the romance and excitement before your big day',
    price: '$599',
    features: [
      '4-hour photoshoot session',
      '2 outfit changes',
      '100+ professionally edited photos',
      'Online gallery for sharing',
      'Print release rights',
      '1 premium photo album (20 pages)'
    ],
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80'
  },
  {
    id: 'wedding-day',
    title: 'Wedding Day',
    description: 'Comprehensive coverage of your special day from start to finish',
    price: '$1,299',
    features: [
      '8-hour coverage with 2 photographers',
      'Getting ready, ceremony & reception',
      '300+ professionally edited photos',
      'Online gallery for sharing',
      'Print release rights',
      'Premium wedding album (30 pages)',
      'Engagement session included'
    ],
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'custom',
    title: 'Custom Package',
    description: 'Tailor-made photography package designed to your specific requirements',
    price: 'Custom',
    features: [
      'Flexible session duration',
      'Multiple locations possible',
      'Custom number of edited photos',
      'Online gallery for sharing',
      'Print release rights',
      'Custom album options',
      'Add-on services available (drone, video, etc.)'
    ],
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b3ce551?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

const PhotoPackageSelection: React.FC<PhotoPackageSelectionProps> = ({ onSelect }) => {
  return (
    <div id="packages">
      <Typography variant="h5" component="h2" className="text-center mb-8">
        Choose the Perfect Photography Package for Your Special Day
      </Typography>
      
      <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
        {PHOTO_PACKAGES.map((pkg) => (
          <Grid item xs={12} md={4} key={pkg.id} sx={{ display: 'flex' }}>
            <Card 
              className="h-full flex flex-col transition-all duration-300 hover:shadow-xl"
              sx={{ 
                borderRadius: '12px',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={pkg.image}
                alt={pkg.title}
                sx={{ height: 240 }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {pkg.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {pkg.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {pkg.description}
                </Typography>
                
                <Box sx={{ mt: 2, mb: 3, flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Package includes:
                  </Typography>
                  <ul className="list-disc pl-5">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="text-sm mb-1">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Box>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => onSelect(pkg.id)}
                  sx={{ 
                    mt: 'auto', 
                    backgroundColor: '#000',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  Select Package
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default PhotoPackageSelection;
