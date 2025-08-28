import { Venue, Section, Seat } from '../lib/types';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Grid, 
  Divider,
  useTheme,
  alpha,
  Button,
  Card,
  CardContent
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} role="region" aria-label="Venue seating selection">
      {/* Legend Section - Above the SVG */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          background: theme.palette.background.paper
        }}
        role="region"
        aria-label="Venue legend and information"
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Venue Legend
        </Typography>
        
        <Grid container spacing={3}>
          {/* Section Types */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Section Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {priceTiers.map((tier) => {
                const color = tier === 1 ? 'primary' : tier === 2 ? 'success' : 'secondary';
                const label = tier === 1 ? 'Premium' : tier === 2 ? 'Standard' : 'Economy';
                return (
                  <Chip
                    key={tier}
                    label={label}
                    color={color}
                    variant="outlined"
                    size="small"
                    icon={<ChairIcon />}
                    role="status"
                    aria-label={`${label} section type`}
                  />
                );
              })}
            </Box>
          </Grid>

          {/* Seat Status */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Seat Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="Available"
                color="success"
                variant="outlined"
                size="small"
                icon={<EventSeatIcon />}
                role="status"
                aria-label="Available seat status"
              />
              <Chip
                label="Selected"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
                role="status"
                aria-label="Selected seat status"
              />
              <Chip
                label="Reserved"
                color="warning"
                size="small"
                icon={<BlockIcon />}
                role="status"
                aria-label="Reserved seat status"
              />
              <Chip
                label="Sold"
                color="error"
                size="small"
                icon={<BlockIcon />}
                role="status"
                aria-label="Sold seat status"
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        {/* Venue Info */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total Sections: <strong>{venue.sections.length}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total Seats: <strong>{totalSeats}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Selected: <strong>{selectedSeats.size}/8</strong>
              {selectedSeats.size >= 8 && (
                <Typography component="span" variant="body2" color="warning.main" sx={{ ml: 1, fontWeight: 'bold' }}>
                  (MAX)
                </Typography>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Sticky Selection Header */}
      {selectedSeats.size > 0 && (
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
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShoppingCartIcon color="primary" sx={{ fontSize: 24 }} aria-hidden="true" />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Selected Seats ({selectedSeats.size}/8)
                  </Typography>
                  {selectedSeats.size >= 8 && (
                    <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.8rem' }}>
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
                onClick={() => onSelectedSeatsChange(new Set())}
                sx={{ borderRadius: 2 }}
                aria-label="Clear all selected seats"
              >
                Clear All
              </Button>
            </Box>

            {/* Selected Seats Grid */}
            <Grid container spacing={1} sx={{ mb: 2 }} role="grid" aria-label="Selected seats grid">
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
                  <Grid item xs={6} sm={4} md={3} key={seatId} role="gridcell">
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '80px',
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
                      <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Chip
                            label={seat.priceTier === 1 ? 'Premium' : seat.priceTier === 2 ? 'Standard' : 'Economy'}
                            color={seat.priceTier === 1 ? 'primary' : seat.priceTier === 2 ? 'success' : 'secondary'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', height: '18px' }}
                            role="status"
                            aria-label={`${seat.priceTier === 1 ? 'Premium' : seat.priceTier === 2 ? 'Standard' : 'Economy'} price tier`}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {section?.label}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
                          Row {row?.index}, Seat {seat.col}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {seat.id}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{ fontSize: '0.8rem' }}>
                            ${seat.priceTier === 1 ? 150 : seat.priceTier === 2 ? 100 : 75}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Checkout Footer */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pt: 1,
              borderTop: `1px solid ${theme.palette.divider}`
            }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Total: ${Array.from(selectedSeats).reduce((total, seatId) => {
                    const seat = venue.sections
                      .flatMap(s => s.rows)
                      .flatMap(r => r.seats)
                      .find(s => s.id === seatId);
                    const basePrice = seat?.priceTier === 1 ? 150 : seat?.priceTier === 2 ? 100 : 75;
                    return total + basePrice;
                  }, 0)}
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
                  px: 3, 
                  py: 1,
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
          background: theme.palette.background.default
        }}
        role="region"
        aria-label="Interactive seating chart"
      >
        <Box sx={{ height: '100%', p: 2 }}>
          <svg
            viewBox={`${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              width: '100%', 
              height: '100%',
              cursor: 'pointer',
              borderRadius: theme.shape.borderRadius
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
