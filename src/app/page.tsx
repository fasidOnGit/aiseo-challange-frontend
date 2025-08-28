'use client';

import { VenueSeating } from '../components/VenueSeating';
import { useVenue } from '../lib/hooks/useVenue';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  EventSeat as EventSeatIcon
} from '@mui/icons-material';

// Debounce hook for localStorage updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const { data: venue, isLoading, error, refetch } = useVenue();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Debounce selectedSeats for localStorage updates
  const debouncedSelectedSeats = useDebounce(selectedSeats, 500);

  // Load selections from localStorage on mount
  useEffect(() => {
    if (venue) {
      try {
        const savedSeats = localStorage.getItem(`venue-seats-${venue.venueId}`);
        if (savedSeats) {
          const parsedSeats = JSON.parse(savedSeats);
          // Validate that saved seats still exist in current venue
          const validSeats = new Set<string>();
          parsedSeats.forEach((seatId: string) => {
            const seatExists = venue.sections.some(section =>
              section.rows.some(row =>
                row.seats.some(seat => seat.id === seatId && seat.status === 'available')
              )
            );
            if (seatExists) {
              validSeats.add(seatId);
            }
          });
          setSelectedSeats(validSeats);
        }
      } catch (error) {
        console.warn('Failed to load saved seats from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(`venue-seats-${venue.venueId}`);
      }
    }
  }, [venue]);

  // Save selections to localStorage with debouncing
  useEffect(() => {
    if (venue && debouncedSelectedSeats.size > 0) {
      try {
        localStorage.setItem(`venue-seats-${venue.venueId}`, JSON.stringify(Array.from(debouncedSelectedSeats)));
      } catch (error) {
        console.warn('Failed to save seats to localStorage:', error);
      }
    } else if (venue && debouncedSelectedSeats.size === 0) {
      // Clear localStorage when no seats are selected
      localStorage.removeItem(`venue-seats-${venue.venueId}`);
    }
  }, [venue, debouncedSelectedSeats]);

  const handleSeatClick = (seatId: string, sectionId: string, rowIndex: number, col: number) => {
    console.log('Seat clicked:', { seatId, sectionId, rowIndex, col });
  };

  const handleSelectedSeatsChange = useCallback((seats: Set<string>) => {
    setSelectedSeats(seats);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
        }}
        role="main"
        aria-label="Loading venue data"
        aria-live="polite"
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={isMobile ? 48 : 64} 
            color="primary" 
            sx={{ mb: { xs: 2, sm: 3 } }} 
            aria-label="Loading indicator" 
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            color="text.primary" 
            gutterBottom
          >
            Loading Venue
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Preparing your seating experience...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
        }}
        role="main"
        aria-label="Error loading venue"
        aria-live="assertive"
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              textAlign: 'center',
              borderRadius: 3,
              background: theme.palette.background.paper
            }}
          >
            <EventSeatIcon 
              sx={{ 
                fontSize: { xs: 48, sm: 64 }, 
                color: theme.palette.error.main, 
                mb: { xs: 1.5, sm: 2 } 
              }} 
              aria-hidden="true"
            />
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              fontWeight="bold" 
              color="error" 
              gutterBottom
            >
              Failed to Load Venue
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: { xs: 2, sm: 3 } }}
            >
              {error.message || 'An error occurred while loading the venue data.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ borderRadius: 2 }}
              aria-label="Retry loading venue data"
            >
              Try Again
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!venue) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
        }}
        role="main"
        aria-label="No venue data available"
        aria-live="polite"
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={isMobile ? 48 : 64} 
            color="primary" 
            sx={{ mb: { xs: 2, sm: 3 } }} 
            aria-label="Loading indicator" 
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            color="text.primary" 
            gutterBottom
          >
            No Venue Data
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Please check your venue configuration and try again.
          </Typography>
        </Box>
      </Box>
    );
  }

  const totalSeats = venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
  );

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Skip link for accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
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
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper
        }}
        role="banner"
        aria-label="Venue header information"
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ py: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  fontWeight="bold" 
                  color="text.primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
                >
                  {venue.name}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Interactive Seating Chart
                </Typography>
              </Box>
              <Box sx={{ 
                textAlign: { xs: 'left', sm: 'right' },
                alignSelf: { xs: 'flex-start', sm: 'flex-end' }
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total Seats
                </Typography>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  fontWeight="bold" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
                >
                  {totalSeats}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main content */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 }
        }} 
        role="main" 
        aria-label="Venue seating chart and selection" 
        id="main-content"
      >
        <VenueSeating 
          venue={venue} 
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
          onSelectedSeatsChange={handleSelectedSeatsChange}
        />
      </Container>
    </Box>
  );
}
