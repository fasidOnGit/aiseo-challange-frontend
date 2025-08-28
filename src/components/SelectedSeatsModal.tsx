'use client';

import { Venue } from '../lib/types';
import {
  Dialog,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Slide,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  EventSeat as EventSeatIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, ReactElement, Ref } from 'react';

interface SelectedSeatsModalProps {
  open: boolean;
  selectedSeats: Set<string>;
  venue: Venue | null;
  onClose: () => void;
  onClearSelection: () => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function SelectedSeatsModal({ 
  open, 
  selectedSeats, 
  venue, 
  onClose, 
  onClearSelection 
}: SelectedSeatsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Only show on mobile
  if (!isMobile || !venue) {
    return null;
  }

  const selectedSeatDetails = Array.from(selectedSeats).map(seatId => {
    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) {
          return {
            ...seat,
            sectionLabel: section.label,
            rowIndex: row.index
          };
        }
      }
    }
    return null;
  }).filter(Boolean);

  // Calculate total price
  const totalPrice = selectedSeatDetails.reduce((total, seat) => {
    const basePrice = seat?.priceTier === 1 ? 150 : seat?.priceTier === 2 ? 100 : 75;
    return total + basePrice;
  }, 0);

  const handleClearAndClose = () => {
    onClearSelection();
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
      sx={{
        '& .MuiDialog-paper': {
          background: theme.palette.background.default
        }
      }}
    >
      {/* App Bar Header */}
      <AppBar 
        position="relative" 
        elevation={2}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="Close selection details"
            sx={{ mr: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <EventSeatIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" component="div" fontWeight="bold">
              Selected Seats
            </Typography>
            <Chip
              label={`${selectedSeats.size}/8`}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <DialogContent sx={{ p: 0, flex: 1 }}>
        {selectedSeats.size === 0 ? (
          // Empty state
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}>
            <EventSeatIcon 
              sx={{ 
                fontSize: 80, 
                color: theme.palette.grey[400], 
                mb: 2 
              }} 
            />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="text.primary" 
              gutterBottom
            >
              No Seats Selected
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ maxWidth: 300, mb: 3 }}
            >
              Start selecting seats from the venue map to see them here
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ borderRadius: 2 }}
            >
              Back to Venue Map
            </Button>
          </Box>
        ) : (
          // Seats selected
          <Box sx={{ p: 2 }}>
            {/* Selected Seats Header with Clear Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6" fontWeight="bold">
                Selected Seats
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearAndClose}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 2,
              mb: 3
            }}>
              {selectedSeatDetails.map((seat, index) => (
                <Card 
                  key={seat?.id}
                  elevation={2}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={seat?.priceTier === 1 ? 'Premium' : seat?.priceTier === 2 ? 'Standard' : 'Economy'}
                        color={seat?.priceTier === 1 ? 'primary' : seat?.priceTier === 2 ? 'success' : 'secondary'}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Row {seat?.rowIndex}, Seat {seat?.col}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Section:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {seat?.sectionLabel}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Seat ID:
                      </Typography>
                      <Typography variant="body2" fontWeight="mono">
                        {seat?.id}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Price:
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${seat?.priceTier === 1 ? 150 : seat?.priceTier === 2 ? 100 : 75}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      {selectedSeats.size > 0 && (
        <DialogActions sx={{
          p: 2,
          background: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Total: ${totalPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSeats.size} seat{selectedSeats.size !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Continue to Checkout
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}
