'use client';

import {
  Clear as ClearIcon,
  EventSeat as EventSeatIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Slide,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Venue } from '../lib/types';

interface SelectionBottomSheetProps {
  selectedSeats: string[];
  venue: Venue | null;
  onClearSelection: () => void;
}

export function SelectionBottomSheet({ selectedSeats, venue, onClearSelection }: SelectionBottomSheetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!venue) return null;

  // Get selected seat details
  const selectedSeatDetails = selectedSeats.map(seatId => {
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
          height: { xs: '200px', sm: '240px' },
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
          height: { xs: '50px', sm: '60px' },
          p: { xs: 1, sm: 1.5 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {selectedSeats.length === 0 ? (
            // Empty state - unified header and content
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventSeatIcon
                  sx={{
                    fontSize: { xs: 16, sm: 20 },
                    color: theme.palette.primary.main
                  }}
                />
                <Typography
                  variant={isMobile ? "subtitle2" : "h6"}
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
                >
                  No Seats Selected
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  textAlign: 'center'
                }}
              >
                Click on available seats to make your selection
              </Typography>
            </Box>
          ) : (
            // Seats selected header
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon
                  color="primary"
                  sx={{ fontSize: { xs: 16, sm: 20 } }}
                />
                <Box>
                  <Typography
                    variant={isMobile ? "subtitle2" : "h6"}
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
                  >
                    Selected Seats ({selectedSeats.length}/8)
                  </Typography>
                  {selectedSeats.length >= 8 && (
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      Maximum 8 seats allowed
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
                sx={{
                  borderRadius: 2,
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.25, sm: 0.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>

        {/* Content - Flexible height */}
        <Box sx={{
          flex: 1,
          p: { xs: 1, sm: 1.5 },
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {selectedSeats.length === 0 ? (
            // Empty state - just show the limit info
            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}
              >
                Select up to 8 seats to continue
              </Typography>
            </Box>
          ) : (
            // Seats selected content
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 1
            }}>
              {selectedSeatDetails.map((seat) => (
                <Card
                  key={seat?.id}
                  elevation={1}
                  sx={{
                    height: { xs: '75px', sm: '90px' },
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{
                    p: { xs: 0.75, sm: 1 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Chip
                        label={seat?.priceTier === 1 ? 'Premium' : seat?.priceTier === 2 ? 'Standard' : 'Economy'}
                        color={seat?.priceTier === 1 ? 'primary' : seat?.priceTier === 2 ? 'success' : 'secondary'}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          height: { xs: '16px', sm: '18px' }
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.65rem' }
                        }}
                      >
                        {seat?.sectionLabel}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.primary"
                      sx={{
                        textAlign: 'center',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
                      }}
                    >
                      Row {seat?.rowIndex}, Seat {seat?.col}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.65rem' }
                        }}
                      >
                        {seat?.id}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}
                      >
                        ${seat?.priceTier === 2 ? 100 : seat?.priceTier === 1 ? 150 : 75}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Footer - Fixed height */}
        <Box sx={{
          height: { xs: '60px', sm: '80px' },
          p: { xs: 1, sm: 1.5 },
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center'
        }}>
          {selectedSeats.length === 0 ? (
            // Empty state footer
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                Select up to 8 seats to continue
              </Typography>
            </Box>
          ) : (
            // Seats selected footer
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              width: '100%',
              gap: { xs: 1, sm: 0 }
            }}>
              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight="bold"
                  color="primary"
                  sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}
                >
                  Total: ${totalPrice}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.5, sm: 0.75 },
                  borderRadius: 2,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
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
