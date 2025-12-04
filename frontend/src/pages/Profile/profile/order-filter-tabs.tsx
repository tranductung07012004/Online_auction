import { JSX, useState, useEffect } from 'react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';

interface OrderFilterTabsProps {
  showCurrentOrders?: boolean;
  onToggleChange?: (show: boolean) => void;
}

export function OrderFilterTabs({ 
  showCurrentOrders = false, 
  onToggleChange 
}: OrderFilterTabsProps): JSX.Element {
  const [showCurrent, setShowCurrent] = useState<boolean>(showCurrentOrders);

  useEffect(() => {
    setShowCurrent(showCurrentOrders);
  }, [showCurrentOrders]);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setShowCurrent(newValue);
    onToggleChange?.(newValue);
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={showCurrent}
            onChange={handleToggleChange}
            color="primary"
          />
        }
        label={
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Current Orders
          </Typography>
        }
      />
    </Box>
  );
}
