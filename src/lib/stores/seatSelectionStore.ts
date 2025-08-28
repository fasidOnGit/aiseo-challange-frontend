import { create } from 'zustand';
import { useDebounce } from 'use-debounce';
import { useEffect } from 'react';
import { storageAdapter } from '../adapters/localStorage';
import { Venue, Seat } from '../types';
import { VENUE_CONFIG } from '../constants/venue';

interface SeatSelectionState {
  selectedSeats: Set<string>;
  isModalOpen: boolean;
  // Actions
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  toggleSeat: (seatId: string, seat: Seat) => void;
  clearSelection: () => void;
  setSelectedSeats: (seats: Set<string>) => void;
  openModal: () => void;
  closeModal: () => void;
  // Computed
  isAtLimit: () => boolean;
  isSeatSelected: (seatId: string) => boolean;
  canSelectSeat: (seat: Seat) => boolean;
}

export const useSeatSelectionStore = create<SeatSelectionState>((set, get) => ({
  selectedSeats: new Set(),
  isModalOpen: false,

  selectSeat: (seatId) => {
    const { selectedSeats, isAtLimit } = get();
    if (!isAtLimit() && !selectedSeats.has(seatId)) {
      const newSelectedSeats = new Set(selectedSeats);
      newSelectedSeats.add(seatId);
      set({ selectedSeats: newSelectedSeats });
    }
  },

  deselectSeat: (seatId) => {
    const { selectedSeats } = get();
    if (selectedSeats.has(seatId)) {
      const newSelectedSeats = new Set(selectedSeats);
      newSelectedSeats.delete(seatId);
      set({ selectedSeats: newSelectedSeats });
    }
  },

  toggleSeat: (seatId, seat) => {
    if (seat.status !== 'available') return;
    
    const { selectedSeats, selectSeat, deselectSeat } = get();
    if (selectedSeats.has(seatId)) {
      deselectSeat(seatId);
    } else {
      selectSeat(seatId);
    }
  },

  clearSelection: () => {
    set({ selectedSeats: new Set() });
  },

  setSelectedSeats: (seats) => {
    set({ selectedSeats: seats });
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
    return selectedSeats.size >= VENUE_CONFIG.maxSeatsSelection;
  },

  isSeatSelected: (seatId) => {
    const { selectedSeats } = get();
    return selectedSeats.has(seatId);
  },

  canSelectSeat: (seat) => {
    return seat.status === 'available';
  },
}));

/**
 * Hook to handle seat selection persistence with localStorage
 * Handles loading and saving seat selections automatically
 */
export function useSeatSelectionPersistence(venue?: Venue) {
  const store = useSeatSelectionStore();
  
  // Convert Set to Array for debouncing
  const selectedSeatsArray = Array.from(store.selectedSeats);
  const [debouncedSeats] = useDebounce(selectedSeatsArray, 500);

  // Save immediately before page unload to prevent data loss
  useEffect(() => {
    if (!venue?.venueId) return;

    const handleBeforeUnload = async () => {
      try {
        // Save current state immediately (not debounced)
        await storageAdapter.save(venue.venueId, selectedSeatsArray);
      } catch (error) {
        console.warn('Failed emergency save:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [venue?.venueId, selectedSeatsArray]);

  // Load from localStorage on venue change
  useEffect(() => {
    if (!venue?.venueId) {
      return;
    }

    async function loadSeats() {
      try {
        const savedSeatIds = await storageAdapter.load(venue!.venueId);
        
        if (savedSeatIds.length === 0) {
          return;
        }
        
        // Validate that saved seats still exist and are available
        const validSeatIds = savedSeatIds.filter(seatId =>
          venue!.sections.some(section =>
            section.rows.some(row =>
              row.seats.some(seat => 
                seat.id === seatId && seat.status === 'available'
              )
            )
          )
        );

        if (validSeatIds.length > 0) {
          store.setSelectedSeats(new Set(validSeatIds));
        }
      } catch (error) {
        console.warn('Failed to load seat selection from storage:', error);
        store.setSelectedSeats(new Set());
      }
    }

    loadSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue?.venueId]);

  // Save to localStorage when selection changes (debounced)
  useEffect(() => {
    if (!venue?.venueId) {
      return;
    }

    async function saveSeats() {
      try {
        await storageAdapter.save(venue!.venueId, debouncedSeats);
      } catch (error) {
        console.warn('Failed to save seat selection to storage:', error);
      }
    }

    saveSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue?.venueId, debouncedSeats]);
}
