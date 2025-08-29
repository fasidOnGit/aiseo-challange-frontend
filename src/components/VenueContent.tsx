'use client';

import { Box, Container } from '@mui/material';
import { Venue } from '../lib/types';
import { VenueHeader } from './ui';
import { VenueSeating } from './VenueSeating';
import { SelectedSeatsFloatingButton } from './SelectedSeatsFloatingButton';
import { SelectedSeatsModal } from './SelectedSeatsModal';
import { useSeatSelectionStore, useSeatSelectionSync } from '../lib/stores/seatSelectionStore';

interface VenueContentProps {
  venue: Venue;
}

export function VenueContent({ venue }: VenueContentProps) {
  const {
    selectedSeats,
    isModalOpen,
    openModal,
    closeModal,
    clearSelection,
  } = useSeatSelectionStore();

  // Handle venue sync and validation automatically
  useSeatSelectionSync(venue);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Skip link for accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: 'primary.main',
          color: 'primary.contrastText',
          padding: '8px 16px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 9999,
          fontSize: '0.875rem',
          '&:focus': {
            top: '6px',
            transition: 'top 0.3s ease'
          }
        }}
        aria-label="Skip to main content"
      >
        Skip to main content
      </Box>

      {/* Header */}
      <VenueHeader venue={venue} />

      {/* Main content */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 1, sm: 3 },
          px: { xs: 1, sm: 3 },
          height: { xs: 'calc(100vh - 120px)', sm: 'auto' }
        }} 
        role="main" 
        aria-label="Venue seating chart and selection" 
        id="main-content"
      >
        <VenueSeating 
          venue={venue}
        />
      </Container>

      {/* Mobile Components */}
      <SelectedSeatsFloatingButton
        selectedSeats={selectedSeats}
        venue={venue}
        onClick={openModal}
      />

      <SelectedSeatsModal
        open={isModalOpen}
        selectedSeats={selectedSeats}
        venue={venue}
        onClose={closeModal}
        onClearSelection={clearSelection}
      />
    </Box>
  );
}
