import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Venue } from '../lib/types';
import { useSeatSelection } from '../lib/hooks/useSeatSelection';
import { 
  SelectedSeatsSummary, 
  VenueChart, 
  VenueLegend 
} from './venue';

interface VenueSeatingProps {
  venue: Venue;
  onSeatClick?: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  selectedSeats: Set<string>;
  onSelectedSeatsChange: (seats: Set<string>) => void;
}

/**
 * Main venue seating component that orchestrates the seating chart interface
 * 
 * This component follows the Single Responsibility Principle by delegating
 * specific concerns to specialized child components and hooks:
 * - Seat selection logic: useSeatSelection hook
 * - Selected seats display: SelectedSeatsSummary component
 * - Seating chart rendering: VenueChart component
 * - Legend display: VenueLegend component
 */
export function VenueSeating({ 
  venue, 
  onSeatClick, 
  selectedSeats, 
  onSelectedSeatsChange 
}: VenueSeatingProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Use custom hook for seat selection logic
  const { 
    handleSeatClick, 
    clearAllSeats, 
    isAtSelectionLimit 
  } = useSeatSelection({
    venue,
    selectedSeats,
    onSelectedSeatsChange,
    onSeatClick
  });

  return (
    <Box 
      sx={{ 
        height: { xs: '100%', sm: '100%' }, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
        minHeight: { xs: 'calc(100vh - 140px)', sm: 'auto' }
      }} 
      role="region" 
      aria-label="Venue seating selection"
    >
      {/* Selected Seats Summary - Desktop Only */}
      <SelectedSeatsSummary
        selectedSeats={selectedSeats}
        venue={venue}
        onClearSelection={clearAllSeats}
      />

      {/* Interactive Seating Chart */}
      <VenueChart
        venue={venue}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        isAtSelectionLimit={isAtSelectionLimit}
      />

      {/* Legend */}
      <VenueLegend venue={venue} />
    </Box>
  );
}