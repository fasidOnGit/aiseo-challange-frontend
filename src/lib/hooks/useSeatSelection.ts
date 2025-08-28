import { useCallback } from 'react';
import { Venue, Seat } from '../types';
import { VENUE_CONFIG } from '../constants/venue';

interface UseSeatSelectionProps {
  venue: Venue;
  selectedSeats: Set<string>;
  onSelectedSeatsChange: (seats: Set<string>) => void;
  onSeatClick?: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
}

interface UseSeatSelectionReturn {
  handleSeatClick: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  clearAllSeats: () => void;
  isAtSelectionLimit: boolean;
  canSelectSeat: (seat: Seat) => boolean;
  isSeatSelected: (seatId: string) => boolean;
}

/**
 * Custom hook for managing seat selection logic
 */
export function useSeatSelection({
  venue,
  selectedSeats,
  onSelectedSeatsChange,
  onSeatClick
}: UseSeatSelectionProps): UseSeatSelectionReturn {
  
  const isAtSelectionLimit = selectedSeats.size >= VENUE_CONFIG.maxSeatsSelection;
  
  const canSelectSeat = useCallback((seat: Seat): boolean => {
    return seat.status === 'available';
  }, []);
  
  const isSeatSelected = useCallback((seatId: string): boolean => {
    return selectedSeats.has(seatId);
  }, [selectedSeats]);
  
  const handleSeatClick = useCallback((seatId: string, sectionId: string, rowIndex: number, col: number) => {
    // Call external handler if provided
    if (onSeatClick) {
      onSeatClick(seatId, sectionId, rowIndex, col);
    }
    
    // Find the seat to check if it's available
    const seat = venue.sections
      .find(s => s.id === sectionId)
      ?.rows.find(r => r.index === rowIndex)
      ?.seats.find(s => s.col === col);
    
    if (!seat || !canSelectSeat(seat)) {
      return;
    }
    
    const newSelectedSeats = new Set(selectedSeats);
    const isCurrentlySelected = newSelectedSeats.has(seatId);
    
    if (isCurrentlySelected) {
      // Always allow deselection
      newSelectedSeats.delete(seatId);
      onSelectedSeatsChange(newSelectedSeats);
    } else if (newSelectedSeats.size < VENUE_CONFIG.maxSeatsSelection) {
      // Only allow selection if under limit
      newSelectedSeats.add(seatId);
      onSelectedSeatsChange(newSelectedSeats);
    }
    // If at limit and trying to select new seat, do nothing
    
  }, [venue, selectedSeats, onSelectedSeatsChange, onSeatClick, canSelectSeat]);
  
  const clearAllSeats = useCallback(() => {
    onSelectedSeatsChange(new Set());
  }, [onSelectedSeatsChange]);
  
  return {
    handleSeatClick,
    clearAllSeats,
    isAtSelectionLimit,
    canSelectSeat,
    isSeatSelected
  };
}
