import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Clear as ClearIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Venue } from '../../lib/types';
import { SelectedSeatsCard } from './SelectedSeatsCard';
import { calculateTotalPrice } from '../../lib/utils/venue';
import { VENUE_CONFIG } from '../../lib/constants/venue';

interface SelectedSeatsSummaryProps {
  selectedSeats: Set<string>;
  venue: Venue;
  onClearSelection: () => void;
}

/**
 * Component for displaying selected seats summary (desktop only)
 */
export const SelectedSeatsSummary = React.memo(function SelectedSeatsSummary({ 
  selectedSeats, 
  venue, 
  onClearSelection 
}: SelectedSeatsSummaryProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Don't show on mobile or when no seats selected
  if (isMobile || selectedSeats.size === 0) {
    return null;
  }
  
  const totalPrice = calculateTotalPrice(selectedSeats, venue);
  const isAtLimit = selectedSeats.size >= VENUE_CONFIG.maxSeatsSelection;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        mb: 2,
        borderRadius: 2,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[4]
      }}
      role="region"
      aria-label="Selected seats summary"
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2,
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShoppingCartIcon 
              color="primary" 
              sx={{ fontSize: { xs: 20, sm: 24 } }} 
              aria-hidden="true" 
            />
            <Box>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                fontWeight="bold" 
                color="text.primary"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Selected Seats ({selectedSeats.size}/{VENUE_CONFIG.maxSeatsSelection})
              </Typography>
              {isAtLimit && (
                <Typography 
                  variant="body2" 
                  color="warning.main" 
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  Maximum {VENUE_CONFIG.maxSeatsSelection} seats allowed
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size={isMobile ? "small" : "medium"}
            startIcon={<ClearIcon />}
            onClick={onClearSelection}
            sx={{ borderRadius: 2 }}
            aria-label="Clear all selected seats"
          >
            Clear All
          </Button>
        </Box>

        {/* Selected Seats Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(3, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: { xs: 1, sm: 1.5 }, 
          mb: 2 
        }} role="grid" aria-label="Selected seats grid">
          {Array.from(selectedSeats).slice(0, VENUE_CONFIG.maxSeatsSelection).map((seatId, index) => (
            <SelectedSeatsCard
              key={seatId}
              seatId={seatId}
              venue={venue}
              index={index}
            />
          ))}
        </Box>

        {/* Checkout Footer */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          pt: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="bold" 
              color="primary"
              sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}
            >
              Total: ${totalPrice}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {selectedSeats.size} seat{selectedSeats.size !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
          <Button
            variant="contained"
            size={isMobile ? "small" : "medium"}
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              px: { xs: 2, sm: 3 }, 
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 'bold',
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
            aria-label={`Continue to checkout with ${selectedSeats.size} selected seats`}
          >
            Continue to Checkout
          </Button>
        </Box>
      </Box>
    </Paper>
  );
});
