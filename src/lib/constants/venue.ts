/**
 * Venue seating chart constants and configuration
 */

export const VENUE_CONFIG = {
  seatSpacing: 40,
  rowSpacing: 45,
  maxSeatsSelection: 8,
  sectionPadding: 30,
  svgPadding: 80,
} as const;

export const SEAT_PRICES = {
  premium: 150,
  standard: 100,
  economy: 75,
} as const;

export const PRICE_TIER_CONFIG = {
  1: { label: 'Premium', price: SEAT_PRICES.premium, color: 'primary' },
  2: { label: 'Standard', price: SEAT_PRICES.standard, color: 'success' },
  3: { label: 'Economy', price: SEAT_PRICES.economy, color: 'secondary' },
} as const;

export const SEAT_STATUS_CONFIG = {
  available: { label: 'Available', symbol: 'seat-available' },
  selected: { label: 'Selected', symbol: 'seat-selected' },
  reserved: { label: 'Reserved', symbol: 'seat-reserved' },
  sold: { label: 'Sold', symbol: 'seat-sold' },
  held: { label: 'Held', symbol: 'seat-held' },
} as const;
