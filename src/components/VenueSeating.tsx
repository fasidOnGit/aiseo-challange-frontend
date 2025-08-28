import { Venue, Section, Seat } from '../lib/types';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Divider,
  useTheme,
  alpha,
  Button,
  Card,
  CardContent,
  useMediaQuery
} from '@mui/material';
import { 
  Chair as ChairIcon,
  EventSeat as EventSeatIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface VenueSeatingProps {
  venue: Venue;
  onSeatClick?: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  selectedSeats: Set<string>;
  onSelectedSeatsChange: (seats: Set<string>) => void;
}

export function VenueSeating({ venue, onSeatClick, selectedSeats, onSelectedSeatsChange }: VenueSeatingProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleSeatClick = (seatId: string, sectionId: string, rowIndex: number, col: number) => {
    if (onSeatClick) {
      onSeatClick(seatId, sectionId, rowIndex, col);
    }
    
    // Toggle selection for available seats only
    const seat = venue.sections
      .find(s => s.id === sectionId)
      ?.rows.find(r => r.index === rowIndex)
      ?.seats.find(s => s.col === col);
    
    if (seat && seat.status === 'available') {
      const newSelectedSeats = new Set(selectedSeats);
      
      // If seat is already selected, allow deselection
      if (newSelectedSeats.has(seatId)) {
        newSelectedSeats.delete(seatId);
        onSelectedSeatsChange(newSelectedSeats);
      } 
      // If seat is not selected, only allow if under 8 seats limit
      else if (newSelectedSeats.size < 8) {
        newSelectedSeats.add(seatId);
        onSelectedSeatsChange(newSelectedSeats);
      }
      // If already at 8 seats limit, don't allow more selections
      // (could show a toast/alert here if desired)
    }
  };

  // Calculate the actual bounds of all seats to determine viewBox
  const allSeats = venue.sections.flatMap(section => 
    section.rows.flatMap(row => row.seats)
  );
  
  // Apply section transforms to get absolute coordinates
  const transformedSeats = allSeats.map(seat => {
    const section = venue.sections.find(s => 
      s.rows.some(r => r.seats.some(seatInRow => seatInRow.id === seat.id))
    );
    if (section) {
      const transform = section.transform;
      return {
        ...seat,
        absoluteX: seat.x * transform.scale + transform.x,
        absoluteY: seat.y * transform.scale + transform.y
      };
    }
    return { ...seat, absoluteX: seat.x, absoluteY: seat.y };
  });
  
  const minX = Math.min(...transformedSeats.map(seat => seat.absoluteX));
  const maxX = Math.max(...transformedSeats.map(seat => seat.absoluteX));
  const minY = Math.min(...transformedSeats.map(seat => seat.absoluteY));
  const maxY = Math.max(...transformedSeats.map(seat => seat.absoluteY));
  
  // Add padding around the bounds
  const padding = 80;
  const viewBoxWidth = maxX - minX + padding * 2;
  const viewBoxHeight = maxY - minY + padding * 2;

  // Get section colors
  const getSectionColor = (priceTier: number) => {
    switch (priceTier) {
      case 1: return alpha(theme.palette.primary.main, 0.1);
      case 2: return alpha(theme.palette.success.main, 0.1);
      case 3: return alpha(theme.palette.secondary.main, 0.1);
      default: return alpha(theme.palette.grey[500], 0.1);
    }
  };

  const getSectionBorderColor = (priceTier: number) => {
    switch (priceTier) {
      case 1: return alpha(theme.palette.primary.main, 0.3);
      case 2: return alpha(theme.palette.success.main, 0.3);
      case 3: return alpha(theme.palette.secondary.main, 0.3);
      default: return alpha(theme.palette.grey[500], 0.3);
    }
  };

  const totalSeats = venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
  );

  // Get unique price tiers for legend
  const priceTiers = Array.from(new Set(venue.sections.map(section => 
    section.rows[0]?.seats[0]?.priceTier || 3
  ))).sort();

  return (
    <Box sx={{ 
      height: { xs: '100%', sm: '100%' }, 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      overflow: 'hidden',
      minHeight: { xs: 'calc(100vh - 140px)', sm: 'auto' } // Use most of screen height on mobile
    }} role="region" aria-label="Venue seating selection">


      {/* Sticky Selection Header - Desktop Only */}
      {selectedSeats.size > 0 && !isMobile && (
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
                    Selected Seats ({selectedSeats.size}/8)
                  </Typography>
                  {selectedSeats.size >= 8 && (
                    <Typography 
                      variant="body2" 
                      color="warning.main" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
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
                onClick={() => onSelectedSeatsChange(new Set())}
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
              {Array.from(selectedSeats).slice(0, 8).map((seatId) => {
                const seat = venue.sections
                  .flatMap(s => s.rows)
                  .flatMap(r => r.seats)
                  .find(s => s.id === seatId);
                
                if (!seat) return null;
                
                const section = venue.sections.find(s => 
                  s.rows.some(r => r.seats.some(seatInRow => seatInRow.id === seatId))
                );
                const row = section?.rows.find(r => 
                  r.seats.some(s => s.id === seatId)
                );
                
                return (
                  <Box key={seatId} role="gridcell">
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: { xs: '70px', sm: '80px' },
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                      role="article"
                      aria-label={`Selected seat ${seat.col} in row ${row?.index} of ${section?.label}`}
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
                            label={seat.priceTier === 1 ? 'Premium' : seat.priceTier === 2 ? 'Standard' : 'Economy'}
                            color={seat.priceTier === 1 ? 'primary' : seat.priceTier === 2 ? 'success' : 'secondary'}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: { xs: '0.6rem', sm: '0.65rem' }, 
                              height: { xs: '16px', sm: '18px' }
                            }}
                            role="status"
                            aria-label={`${seat.priceTier === 1 ? 'Premium' : seat.priceTier === 2 ? 'Standard' : 'Economy'} price tier`}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
                          >
                            {section?.label}
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
                          Row {row?.index}, Seat {seat.col}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
                          >
                            {seat.id}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold" 
                            color="primary" 
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          >
                            ${seat.priceTier === 1 ? 150 : seat.priceTier === 2 ? 100 : 75}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
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
                  Total: ${Array.from(selectedSeats).reduce((total, seatId) => {
                    const seat = venue.sections
                      .flatMap(s => s.rows)
                      .flatMap(r => r.seats)
                      .find(s => s.id === seatId);
                    const basePrice = seat?.priceTier === 1 ? 150 : seat?.priceTier === 2 ? 100 : 75;
                    return total + basePrice;
                  }, 0)}
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
      )}

      {/* SVG Container */}
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          borderRadius: 2,
          overflow: 'hidden',
          background: theme.palette.background.default,
          width: '100%',
          minHeight: { xs: '70vh', sm: 'auto' } // Ensure minimum height on mobile
        }}
        role="region"
        aria-label="Interactive seating chart"
      >
        <Box sx={{ 
          height: '100%', 
          p: { xs: 0.5, sm: 2 }, // Reduce padding on mobile for more space
          width: '100%',
          overflow: 'hidden',
          minHeight: { xs: '70vh', sm: 'auto' } // Match parent min height
        }}>
          <svg
            viewBox={`${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              width: '100%', 
              height: '100%',
              cursor: 'pointer',
              borderRadius: theme.shape.borderRadius,
              maxWidth: '100%',
              overflow: 'visible',
              minHeight: isMobile ? '60vh' : 'auto' // Ensure good minimum height on mobile
            }}
            role="img"
            aria-label="Interactive venue seating chart"
            aria-describedby="seating-chart-description"
          >
            {/* Hidden description for screen readers */}
            <desc id="seating-chart-description">
              Interactive seating chart with {venue.sections.length} sections and {totalSeats} total seats. 
              Available seats can be selected by clicking or using keyboard navigation. 
              Maximum of 8 seats can be selected.
            </desc>
            
            {/* Define seat symbols */}
            <defs>
              <symbol id="seat-available" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill="white"
                  stroke={theme.palette.success.main}
                  strokeWidth="2"
                />
              </symbol>
              <symbol id="seat-selected" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill={theme.palette.success.main}
                  stroke={theme.palette.success.main}
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
              </symbol>
              <symbol id="seat-reserved" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill={theme.palette.warning.main}
                  stroke={theme.palette.warning.main}
                  strokeWidth="2"
                />
              </symbol>
              <symbol id="seat-sold" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill={theme.palette.error.main}
                  stroke={theme.palette.error.main}
                  strokeWidth="2"
                />
              </symbol>
              <symbol id="seat-held" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill={theme.palette.secondary.main}
                  stroke={theme.palette.secondary.main}
                  strokeWidth="2"
                />
              </symbol>
            </defs>
            
            {/* Render section backgrounds */}
            {venue.sections.map((section) => {
              const transform = section.transform;
              const sectionWidth = section.rows[0]?.seats.length * VENUE_CONFIG.seatSpacing + 120;
              const sectionHeight = section.rows.length * VENUE_CONFIG.rowSpacing + 120;
              const priceTier = section.rows[0]?.seats[0]?.priceTier || 3;
              
              return (
                <g key={`section-${section.id}`} role="group" aria-label={`${section.label} section`}>
                  {/* Section background */}
                  <rect
                    x={transform.x - 30}
                    y={transform.y - 30}
                    width={sectionWidth}
                    height={sectionHeight}
                    fill={getSectionColor(priceTier)}
                    stroke={getSectionBorderColor(priceTier)}
                    strokeWidth="2"
                    rx="8"
                    role="presentation"
                    aria-hidden="true"
                  />
                  
                  {/* Section label */}
                  <text
                    x={transform.x + sectionWidth / 2}
                    y={transform.y - 15}
                    textAnchor="middle"
                    fill={theme.palette.text.primary}
                    fontSize="12"
                    fontWeight="600"
                    role="text"
                    aria-label={`Section ${section.label}`}
                  >
                    {section.label}
                  </text>
                </g>
              );
            })}
            
            {/* Render all seats */}
            {venue.sections.map((section) => 
              section.rows.map((row) => 
                row.seats.map((seat) => {
                  const transform = section.transform;
                  const absoluteX = seat.x * transform.scale + transform.x;
                  const absoluteY = seat.y * transform.scale + transform.y;
                  
                  return (
                    <SeatElement
                      key={seat.id}
                      seat={seat}
                      sectionId={section.id}
                      rowIndex={row.index}
                      onSeatClick={handleSeatClick}
                      isSelected={selectedSeats.has(seat.id)}
                      absoluteX={absoluteX}
                      absoluteY={absoluteY}
                      selectedSeats={selectedSeats}
                    />
                  );
                })
              )
            )}
          </svg>
        </Box>
      </Paper>

      {/* Compact Legend Below SVG */}
      <Box
        sx={{
          mt: 2,
          p: { xs: 1, sm: 1.5 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          background: theme.palette.background.paper
        }}
        role="region"
        aria-label="Venue legend"
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 3 },
          alignItems: { xs: 'flex-start', sm: 'center' }
        }}>
          {/* Section Types */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                minWidth: 'fit-content'
              }}
            >
              Sections:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {priceTiers.map((tier) => {
                const color = tier === 1 ? 'primary' : tier === 2 ? 'success' : 'secondary';
                const label = tier === 1 ? 'Premium' : tier === 2 ? 'Standard' : 'Economy';
                return (
                  <Box
                    key={tier}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.75,
                      py: 0.25,
                      border: `1px solid ${theme.palette[color].main}`,
                      borderRadius: 0.5,
                      fontSize: { xs: '0.6rem', sm: '0.7rem' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        backgroundColor: theme.palette[color].main,
                        borderRadius: '50%'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Seat Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                minWidth: 'fit-content'
              }}
            >
              Seats:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[
                { label: 'Available', color: theme.palette.success.main },
                { label: 'Selected', color: theme.palette.success.main, filled: true },
                { label: 'Reserved', color: theme.palette.warning.main },
                { label: 'Sold', color: theme.palette.error.main }
              ].map((status, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 0.75,
                    py: 0.25,
                    border: `1px solid ${status.color}`,
                    borderRadius: 0.5,
                    fontSize: { xs: '0.6rem', sm: '0.7rem' }
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: status.filled ? status.color : 'transparent',
                      border: status.filled ? 'none' : `1px solid ${status.color}`,
                      borderRadius: '2px'
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                    {status.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

interface SeatElementProps {
  seat: Seat;
  sectionId: string;
  rowIndex: number;
  onSeatClick: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  isSelected: boolean;
  absoluteX: number;
  absoluteY: number;
  selectedSeats: Set<string>;
}

function SeatElement({ seat, sectionId, rowIndex, onSeatClick, isSelected, absoluteX, absoluteY, selectedSeats }: SeatElementProps) {
  const getSeatSymbol = () => {
    if (seat.status === 'available') {
      return isSelected ? 'seat-selected' : 'seat-available';
    }
    return `seat-${seat.status}`;
  };

  const isClickable = seat.status === 'available';
  const isAtLimit = !isSelected && selectedSeats.size >= 8;
  const cursor = isClickable && !isAtLimit ? 'pointer' : 'not-allowed';

  const handleClick = () => {
    if (isClickable && !isAtLimit) {
      onSeatClick(seat.id, sectionId, rowIndex, seat.col);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGUseElement>) => {
    if (!isClickable || isAtLimit) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSeatClick(seat.id, sectionId, rowIndex, seat.col);
    }
  };

  return (
    <use
      href={`#${getSeatSymbol()}`}
      x={absoluteX - 12}
      y={absoluteY - 12}
      width="24"
      height="24"
      style={{ cursor }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable && !isAtLimit ? 0 : -1}
      aria-label={`Seat ${seat.col} in row ${rowIndex} of section ${sectionId}${isAtLimit ? ' - Maximum seats reached' : ''}`}
      aria-pressed={isSelected}
      aria-disabled={!isClickable || isAtLimit}
      focusable={isClickable && !isAtLimit ? 'true' : undefined}
    />
  );
}

// Add VENUE_CONFIG for section background calculations
const VENUE_CONFIG = {
  seatSpacing: 40,
  rowSpacing: 45
};
