import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { Venue, Seat } from '../types';
import { VENUE_CONFIG } from '../constants/venue';

interface SeatSelectionState {
  selectedSeats: string[]; // Array for JSON serialization
  isModalOpen: boolean;
  venueId?: string; // Track which venue the selections belong to
  // Actions
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  toggleSeat: (seatId: string, seat: Seat) => void;
  clearSelection: () => void;
  setSelectedSeats: (seats: string[]) => void;
  setVenueId: (venueId: string) => void;
  openModal: () => void;
  closeModal: () => void;
  // Computed
  isAtLimit: () => boolean;
  isSeatSelected: (seatId: string) => boolean;
  canSelectSeat: (seat: Seat) => boolean;
}

export const useSeatSelectionStore = create<SeatSelectionState>()(
  persist(
    (set, get) => ({
      selectedSeats: [],
      isModalOpen: false,
      venueId: undefined,

      selectSeat: (seatId) => {
        const { selectedSeats, isAtLimit } = get();
        if (!isAtLimit() && !selectedSeats.includes(seatId)) {
          set({ selectedSeats: [...selectedSeats, seatId] });
        }
      },

      deselectSeat: (seatId) => {
        const { selectedSeats } = get();
        set({ selectedSeats: selectedSeats.filter(id => id !== seatId) });
      },

      toggleSeat: (seatId, seat) => {
        if (seat.status !== 'available') return;
        
        const { selectedSeats, selectSeat, deselectSeat } = get();
        if (selectedSeats.includes(seatId)) {
          deselectSeat(seatId);
        } else {
          selectSeat(seatId);
        }
      },

      clearSelection: () => {
        set({ selectedSeats: [] });
      },

      setSelectedSeats: (seats) => {
        set({ selectedSeats: seats });
      },

      setVenueId: (venueId) => {
        const { venueId: currentVenueId, clearSelection } = get();
        if (currentVenueId && currentVenueId !== venueId) {
          // Clear selections when switching venues
          clearSelection();
        }
        set({ venueId });
      },

      openModal: () => {
        set({ isModalOpen: true });
      },

      closeModal: () => {
        set({ isModalOpen: false });
      },

      // Computed getters
      isAtLimit: () => {
        const { selectedSeats } = get();
        return selectedSeats.length >= VENUE_CONFIG.maxSeatsSelection;
      },

      isSeatSelected: (seatId) => {
        const { selectedSeats } = get();
        return selectedSeats.includes(seatId);
      },

      canSelectSeat: (seat) => {
        return seat.status === 'available';
      },
    }),
    {
      name: 'venue-seat-selection',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ 
        selectedSeats: state.selectedSeats,
        venueId: state.venueId 
      }),
      // Only persist selectedSeats and venueId, not modal state
    }
  )
);

/**
 * Hook to handle venue changes and validate persisted seat selections
 * Zustand persist middleware handles the actual persistence automatically
 */
export function useSeatSelectionSync(venue?: Venue) {
  const { setVenueId, selectedSeats, setSelectedSeats } = useSeatSelectionStore();
  
  // Set venue ID and validate selections when venue changes
  useEffect(() => {
    if (!venue?.venueId) return;
    
    setVenueId(venue.venueId);
    
    // Validate that persisted seats still exist and are available
    if (selectedSeats.length > 0) {
      const validSeatIds = selectedSeats.filter(seatId =>
        venue.sections.some(section =>
          section.rows.some(row =>
            row.seats.some(seat => 
              seat.id === seatId && seat.status === 'available'
            )
          )
        )
      );
      
      // Update selections if some seats are no longer valid
      if (validSeatIds.length !== selectedSeats.length) {
        setSelectedSeats(validSeatIds);
      }
    }
  }, [venue?.venueId, venue?.sections, selectedSeats, setVenueId, setSelectedSeats]);
}
