import { alpha } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { Venue, Seat } from '../types';
import { VENUE_CONFIG, PRICE_TIER_CONFIG } from '../constants/venue';

/**
 * Utility functions for venue seating calculations and transformations
 */

interface TransformedSeat extends Seat {
  absoluteX: number;
  absoluteY: number;
}

interface SeatWithDetails extends Seat {
  sectionLabel: string;
  rowIndex: number;
}

/**
 * Calculate the bounds of all seats in the venue
 */
export function calculateVenueBounds(venue: Venue) {
  const allSeats = venue.sections.flatMap(section => 
    section.rows.flatMap(row => row.seats)
  );
  
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
  
  const viewBoxWidth = maxX - minX + VENUE_CONFIG.svgPadding * 2;
  const viewBoxHeight = maxY - minY + VENUE_CONFIG.svgPadding * 2;

  return {
    minX,
    maxX,
    minY,
    maxY,
    viewBoxWidth,
    viewBoxHeight,
    transformedSeats
  };
}

/**
 * Get section background color based on price tier
 */
export function getSectionColor(priceTier: number, theme: Theme): string {
  const config = PRICE_TIER_CONFIG[priceTier as keyof typeof PRICE_TIER_CONFIG];
  if (!config) return alpha(theme.palette.grey[500], 0.1);
  
  return alpha(theme.palette[config.color].main, 0.1);
}

/**
 * Get section border color based on price tier
 */
export function getSectionBorderColor(priceTier: number, theme: Theme): string {
  const config = PRICE_TIER_CONFIG[priceTier as keyof typeof PRICE_TIER_CONFIG];
  if (!config) return alpha(theme.palette.grey[500], 0.3);
  
  return alpha(theme.palette[config.color].main, 0.3);
}

/**
 * Calculate section dimensions
 */
export function calculateSectionDimensions(section: Venue['sections'][0]) {
  const sectionWidth = section.rows[0]?.seats.length * VENUE_CONFIG.seatSpacing + 120;
  const sectionHeight = section.rows.length * VENUE_CONFIG.rowSpacing + 120;
  
  return { sectionWidth, sectionHeight };
}

/**
 * Get seat details with section and row information
 */
export function getSelectedSeatDetails(selectedSeats: string[], venue: Venue): SeatWithDetails[] {
  return selectedSeats.map(seatId => {
    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) {
          return {
            ...seat,
            sectionLabel: section.label,
            rowIndex: row.index
          };
        }
      }
    }
    return null;
  }).filter(Boolean) as SeatWithDetails[];
}

/**
 * Calculate total price for selected seats
 */
export function calculateTotalPrice(selectedSeats: string[], venue: Venue): number {
  const seatDetails = getSelectedSeatDetails(selectedSeats, venue);
  
  return seatDetails.reduce((total, seat) => {
    const config = PRICE_TIER_CONFIG[seat.priceTier as keyof typeof PRICE_TIER_CONFIG];
    return total + (config?.price ?? PRICE_TIER_CONFIG[3].price);
  }, 0);
}

/**
 * Get unique price tiers from venue
 */
export function getUniquePriceTiers(venue: Venue): number[] {
  const priceTiers = Array.from(new Set(venue.sections.map(section => 
    section.rows[0]?.seats[0]?.priceTier || 3
  )));
  
  return priceTiers.sort();
}

/**
 * Count total seats in venue
 */
export function getTotalSeatsCount(venue: Venue): number {
  return venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
  );
}

/**
 * Find seat by ID in venue
 */
export function findSeatById(seatId: string, venue: Venue): { seat: Seat; section: Venue['sections'][0]; row: Venue['sections'][0]['rows'][0] } | null {
  for (const section of venue.sections) {
    for (const row of section.rows) {
      const seat = row.seats.find(s => s.id === seatId);
      if (seat) {
        return { seat, section, row };
      }
    }
  }
  return null;
}
