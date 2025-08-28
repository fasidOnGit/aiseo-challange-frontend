import React from 'react';
import {
  Box,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Venue } from '../../lib/types';
import { SeatElement } from './SeatElement';
import { SectionBackground } from './SectionBackground';
import { SeatSymbolDefinitions } from './SeatSymbolDefinitions';
import { calculateVenueBounds, getTotalSeatsCount } from '../../lib/utils/venue';
import { VENUE_CONFIG } from '../../lib/constants/venue';

interface VenueChartProps {
  venue: Venue;
  selectedSeats: string[];
  onSeatClick: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  isAtSelectionLimit: boolean;
}

/**
 * Component for rendering the SVG venue seating chart
 * Remove React.memo - selectedSeats and isAtSelectionLimit change frequently
 * making memo comparison overhead > benefit
 */
export function VenueChart({ 
  venue, 
  selectedSeats, 
  onSeatClick, 
  isAtSelectionLimit 
}: VenueChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { minX, minY, viewBoxWidth, viewBoxHeight } = calculateVenueBounds(venue);
  const totalSeats = getTotalSeatsCount(venue);
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        flex: 1, 
        borderRadius: 2,
        overflow: 'hidden',
        background: theme.palette.background.default,
        width: '100%',
        minHeight: { xs: '70vh', sm: 'auto' }
      }}
      role="region"
      aria-label="Interactive seating chart"
    >
      <Box sx={{ 
        height: '100%', 
        p: { xs: 0.5, sm: 2 },
        width: '100%',
        overflow: 'hidden',
        minHeight: { xs: '70vh', sm: 'auto' }
      }}>
        <svg
          viewBox={`${minX - VENUE_CONFIG.svgPadding} ${minY - VENUE_CONFIG.svgPadding} ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            width: '100%', 
            height: '100%',
            cursor: 'pointer',
            borderRadius: theme.shape.borderRadius,
            maxWidth: '100%',
            overflow: 'visible',
            minHeight: isMobile ? '60vh' : 'auto',
            maxHeight: isMobile ? '40vh' : isTablet ? '50vh' : '70vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
          }}
          role="img"
          aria-label="Interactive venue seating chart"
          aria-describedby="seating-chart-description"
        >
          {/* Hidden description for screen readers */}
          <desc id="seating-chart-description">
            Interactive seating chart with {venue.sections.length} sections and {totalSeats} total seats. 
            Available seats can be selected by clicking or using keyboard navigation. 
            Maximum of {VENUE_CONFIG.maxSeatsSelection} seats can be selected.
          </desc>
          
          {/* Seat symbol definitions */}
          <SeatSymbolDefinitions />
          
          {/* Render section backgrounds */}
          {venue.sections.map((section) => (
            <SectionBackground
              key={`section-${section.id}`}
              section={section}
            />
          ))}
          
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
                    onSeatClick={onSeatClick}
                    isSelected={selectedSeats.includes(seat.id)}
                    absoluteX={absoluteX}
                    absoluteY={absoluteY}
                    isAtSelectionLimit={isAtSelectionLimit && !selectedSeats.includes(seat.id)}
                  />
                );
              })
            )
          )}
        </svg>
      </Box>
    </Paper>
  );
}
