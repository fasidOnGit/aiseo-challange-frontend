import React from 'react';
import { Box } from '@mui/material';
import { Venue } from '../lib/types';
import { useSeatSelectionStore } from '../lib/stores/seatSelectionStore';
import { 
  SelectedSeatsSummary, 
  VenueChart, 
  VenueLegend 
} from './venue';

interface VenueSeatingProps {
  venue: Venue;
  onSeatClick?: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
}

/**
 * Main venue seating component that orchestrates the seating chart interface
 * 
 * This component follows the Single Responsibility Principle by delegating
 * specific concerns to specialized child components and stores:
 * - Seat selection state: Zustand store
 * - Selected seats display: SelectedSeatsSummary component
 * - Seating chart rendering: VenueChart component
 * - Legend display: VenueLegend component
 */
export function VenueSeating({ 
  venue, 
  onSeatClick
}: VenueSeatingProps) {

  // Get state and actions from Zustand store
  const { 
    selectedSeats,
    toggleSeat,
    clearSelection,
    isAtLimit
  } = useSeatSelectionStore();

  function handleSeatClick(seatId: string, sectionId: string, rowIndex: number, col: number) {
    // Call external handler if provided
    if (onSeatClick) {
      onSeatClick(seatId, sectionId, rowIndex, col);
    }
    
    // Find the seat to pass to toggleSeat
    const seat = venue.sections
      .find(s => s.id === sectionId)
      ?.rows.find(r => r.index === rowIndex)
      ?.seats.find(s => s.col === col);
    
    if (seat) {
      toggleSeat(seatId, seat);
    }
  }

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
        onClearSelection={clearSelection}
      />

      {/* Interactive Seating Chart */}
      <VenueChart
        venue={venue}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        isAtSelectionLimit={isAtLimit()}
      />

      {/* Legend */}
      <VenueLegend venue={venue} />
    </Box>
  );
}