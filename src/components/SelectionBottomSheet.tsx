'use client';

import { Venue, Seat } from '../lib/types';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  useTheme,
  Slide,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  EventSeat as EventSeatIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface SelectionBottomSheetProps {
  selectedSeats: Set<string>;
  venue: Venue | null;
  onClearSelection: () => void;
}

export function SelectionBottomSheet({ selectedSeats, venue, onClearSelection }: SelectionBottomSheetProps) {
  const theme = useTheme();

  if (!venue) return null;

  // Get selected seat details
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

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '240px',
          borderRadius: '16px 16px 0 0',
          background: theme.palette.background.paper,
          borderTop: `2px solid ${theme.palette.primary.main}`,
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header - Fixed height */}
        <Box sx={{ 
          height: '60px',
          p: 1.5, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {selectedSeats.size === 0 ? (
            // Empty state - unified header and content
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventSeatIcon 
                  sx={{ 
                    fontSize: 20, 
                    color: theme.palette.primary.main
                  }} 
                />
                <Typography variant="h6" color="text.primary">
                  No Seats Selected
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Click on available seats to make your selection
              </Typography>
            </Box>
          ) : (
            // Seats selected header
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon color="primary" sx={{ fontSize: 20 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Selected Seats ({selectedSeats.size}/8)
                  </Typography>
                  {selectedSeats.size >= 8 && (
                    <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.75rem' }}>
                      Maximum 8 seats allowed
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ClearIcon />}
                onClick={onClearSelection}
                sx={{ borderRadius: 2, px: 1.5, py: 0.5 }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>

        {/* Content - Flexible height */}
        <Box sx={{ 
          flex: 1,
          p: 1.5, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {selectedSeats.size === 0 ? (
            // Empty state - just show the limit info
            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Select up to 8 seats to continue
              </Typography>
            </Box>
          ) : (
            // Seats selected content
            <Grid container spacing={1}>
              {selectedSeatDetails.map((seat) => (
                <Grid item xs={6} sm={4} md={3} key={seat?.id}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '90px',
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Chip
                          label={seat?.priceTier === 1 ? 'Premium' : seat?.priceTier === 2 ? 'Standard' : 'Economy'}
                          color={seat?.priceTier === 1 ? 'primary' : seat?.priceTier === 2 ? 'success' : 'secondary'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: '18px' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {seat?.sectionLabel}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
                        Row {seat?.rowIndex}, Seat {seat?.col}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {seat?.id}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary" sx={{ fontSize: '0.8rem' }}>
                          ${seat?.priceTier === 1 ? 150 : seat?.priceTier === 2 ? 100 : 75}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Footer - Fixed height */}
        <Box sx={{ 
          height: '80px',
          p: 1.5, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center'
        }}>
          {selectedSeats.size === 0 ? (
            // Empty state footer
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Select up to 8 seats to continue
              </Typography>
            </Box>
          ) : (
            // Seats selected footer
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Total: ${totalPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSeats.size} seat{selectedSeats.size !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="medium"
                startIcon={<ShoppingCartIcon />}
                sx={{ 
                  px: 2.5, 
                  py: 0.75,
                  borderRadius: 2,
                  fontSize: '0.9rem',
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
          )}
        </Box>
      </Paper>
    </Slide>
  );
}
