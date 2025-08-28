'use client';

import { Venue } from '../lib/types';
import {
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
  Zoom
} from '@mui/material';
import {
  EventSeat as EventSeatIcon
} from '@mui/icons-material';

interface SelectedSeatsFloatingButtonProps {
  selectedSeats: string[];
  venue: Venue | null;
  onClick: () => void;
}

export function SelectedSeatsFloatingButton({ 
  selectedSeats, 
  venue, 
  onClick 
}: SelectedSeatsFloatingButtonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Only show on mobile
  if (!isMobile || !venue) {
    return null;
  }

  const seatCount = selectedSeats.length;

  return (
    <Zoom in={true} timeout={300}>
      <Fab
        color="primary"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 20, sm: 24 },
          right: { xs: 20, sm: 24 },
          zIndex: 1000,
          boxShadow: theme.shadows[6],
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out'
          },
          '&:active': {
            transform: 'scale(0.95)',
            transition: 'all 0.1s ease-in-out'
          }
        }}
        aria-label={seatCount > 0 ? `${seatCount} seats selected, tap to view details` : 'No seats selected'}
      >
        <Badge 
          badgeContent={seatCount} 
          color="error"
          max={8}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: 18,
              minWidth: 18,
              fontWeight: 'bold'
            }
          }}
          invisible={seatCount === 0}
        >
          <EventSeatIcon sx={{ fontSize: 28 }} />
        </Badge>
      </Fab>
    </Zoom>
  );
}
