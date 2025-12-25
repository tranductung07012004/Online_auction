import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close,
} from '@mui/icons-material';

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ open, message, onClose }: ErrorDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#EAD9C9',
          color: '#4A3C2F',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#4A3C2F' }}>
          Error
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#8B7355',
            '&:hover': {
              backgroundColor: 'rgba(139, 115, 85, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, backgroundColor: '#FAF7F4' }}>
        <Typography sx={{ color: '#4A3C2F' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E8DED1', backgroundColor: '#FAF7F4' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#8B7355',
            color: 'white',
            '&:hover': {
              backgroundColor: '#6D5943',
            },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}








