/**
 * Venue seating normalization module
 * 
 * This module provides types and functions to normalize venue seating data
 * into efficient lookup structures for rendering and keyboard navigation.
 * 
 * Time complexity: O(N) where N = total seat count
 * Space complexity: O(N)
 */

// Core venue data types
export interface Venue {
  venueId: string;
  name: string;
  map: { width: number; height: number };
  sections: Section[];
}

export interface Section {
  id: string;
  label: string;
  transform: { x: number; y: number; scale: number };
  rows: Row[];
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

// Derived metadata for fast lookups
export interface SeatMeta {
  id: string;
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
  col: number;
  x: number;
  y: number;
  status: SeatStatus;
  priceTier: number;
  transform: { x: number; y: number; scale: number };
}

// Neighbor information for keyboard navigation
export interface SeatNeighbors {
  left?: string;
  right?: string;
  up?: string;
  down?: string;
}

// Normalization options
export interface NormalizeOptions {
  priceByTier?: Record<number, number>;
  precomputeNeighbors?: boolean;
}

// Normalized venue structure
export interface NormalizedVenue {
  venueId: string;
  map: { width: number; height: number };
  sections: Array<{ id: string; label: string; transform: { x: number; y: number; scale: number } }>;
  seatsById: Map<string, SeatMeta>;
  rowsBySection: Map<string, Array<{
    rowIndex: number;
    seats: Array<{ id: string; col: number; x: number; y: number }>;
  }>>;
  neighbors?: Map<string, SeatNeighbors>;
  flatSeats: SeatMeta[];
  getPrice: (priceTier: number) => number | undefined;
}

/**
 * Normalizes venue seating data into efficient lookup structures
 * 
 * @param venue - The raw venue data to normalize
 * @param opts - Optional configuration for price tiers and neighbor computation
 * @returns Normalized venue with fast lookup structures
 * @throws Error if duplicate seat IDs are found or invalid data is provided
 */
export function normalizeVenue(
  venue: Venue,
  opts: NormalizeOptions = {}
): NormalizedVenue {
  const { priceByTier = {}, precomputeNeighbors = false } = opts;
  
  // Validate venue structure
  if (!venue.venueId || !venue.sections || !Array.isArray(venue.sections)) {
    throw new Error('Invalid venue structure: missing required fields');
  }

  // Initialize data structures
  const seatsById = new Map<string, SeatMeta>();
  const rowsBySection = new Map<string, Array<{
    rowIndex: number;
    seats: Array<{ id: string; col: number; x: number; y: number }>;
  }>>();
  const flatSeats: SeatMeta[] = [];
  const neighbors = precomputeNeighbors ? new Map<string, SeatNeighbors>() : undefined;

  // Process each section
  for (const section of venue.sections) {
    if (!section.id || !Array.isArray(section.rows)) {
      throw new Error(`Invalid section structure in section ${section.id || 'unknown'}`);
    }

    const defaultTransform = { x: 0, y: 0, scale: 1 };
    const transform = section.transform || defaultTransform;

    // Process each row in the section
    for (const row of section.rows) {
      if (!Array.isArray(row.seats)) {
        throw new Error(`Invalid row structure in section ${section.id}, row ${row.index}`);
      }

      // Validate and collect seats for this row
      const rowSeats: Array<{ id: string; col: number; x: number; y: number }> = [];
      
      for (const seat of row.seats) {
        // Validate seat data
        if (!seat.id || typeof seat.x !== 'number' || typeof seat.y !== 'number') {
          throw new Error(`Invalid seat data: ${JSON.stringify(seat)}`);
        }

        if (!['available', 'reserved', 'sold', 'held'].includes(seat.status)) {
          throw new Error(`Invalid seat status: ${seat.status} for seat ${seat.id}`);
        }

        // Check for duplicate IDs
        if (seatsById.has(seat.id)) {
          throw new Error(`Duplicate seat ID found: ${seat.id}`);
        }

        // Create seat metadata
        const seatMeta: SeatMeta = {
          id: seat.id,
          sectionId: section.id,
          sectionLabel: section.label,
          rowIndex: row.index,
          col: seat.col,
          x: seat.x,
          y: seat.y,
          status: seat.status,
          priceTier: seat.priceTier,
          transform
        };

        // Store in lookup structures
        seatsById.set(seat.id, seatMeta);
        flatSeats.push(seatMeta);
        
        // Add to row seats (will be sorted later)
        rowSeats.push({
          id: seat.id,
          col: seat.col,
          x: seat.x,
          y: seat.y
        });
      }

      // Sort row seats by col, fallback to x if col is missing
      rowSeats.sort((a, b) => {
        if (a.col !== undefined && b.col !== undefined) {
          return a.col - b.col;
        }
        return a.x - b.x;
      });

      // Store sorted row data
      if (!rowsBySection.has(section.id)) {
        rowsBySection.set(section.id, []);
      }
      rowsBySection.get(section.id)!.push({
        rowIndex: row.index,
        seats: rowSeats
      });
    }
  }

  // Sort rows by index within each section
  for (const [sectionId, rows] of Array.from(rowsBySection.entries())) {
    rows.sort((a, b) => a.rowIndex - b.rowIndex);
  }

  // Precompute neighbors if requested
  if (precomputeNeighbors) {
    computeNeighbors(venue, rowsBySection, neighbors!);
  }

  // Create price helper function
  const getPrice = (priceTier: number): number | undefined => {
    return priceByTier[priceTier];
  };

  return {
    venueId: venue.venueId,
    map: venue.map,
    sections: venue.sections.map(section => ({
      id: section.id,
      label: section.label,
      transform: section.transform || { x: 0, y: 0, scale: 1 }
    })),
    seatsById,
    rowsBySection,
    neighbors,
    flatSeats,
    getPrice
  };
}

/**
 * Computes neighbor relationships for keyboard navigation
 * Time complexity: O(N) where N = total seat count
 */
function computeNeighbors(
  venue: Venue,
  rowsBySection: Map<string, Array<{ rowIndex: number; seats: Array<{ id: string; col: number; x: number; y: number }> }>>,
  neighbors: Map<string, SeatNeighbors>
): void {
  for (const [sectionId, rows] of Array.from(rowsBySection.entries())) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const seats = row.seats;
      
      // Process each seat in the row
      for (let seatIndex = 0; seatIndex < seats.length; seatIndex++) {
        const seat = seats[seatIndex];
        const seatNeighbors: SeatNeighbors = {};

        // Left neighbor (previous seat in same row)
        if (seatIndex > 0) {
          seatNeighbors.left = seats[seatIndex - 1].id;
        }

        // Right neighbor (next seat in same row)
        if (seatIndex < seats.length - 1) {
          seatNeighbors.right = seats[seatIndex + 1].id;
        }

        // Up neighbor (same column in previous row)
        if (rowIndex > 0) {
          const prevRow = rows[rowIndex - 1];
          const upSeat = findNearestSeatInRow(prevRow.seats, seat.col, seat.x);
          if (upSeat) {
            seatNeighbors.up = upSeat.id;
          }
        }

        // Down neighbor (same column in next row)
        if (rowIndex < rows.length - 1) {
          const nextRow = rows[rowIndex + 1];
          const downSeat = findNearestSeatInRow(nextRow.seats, seat.col, seat.x);
          if (downSeat) {
            seatNeighbors.down = downSeat.id;
          }
        }

        neighbors.set(seat.id, seatNeighbors);
      }
    }
  }
}

/**
 * Finds the seat in a row that's closest to the target column or x-coordinate
 * Uses binary search for O(log N) performance within each row
 */
function findNearestSeatInRow(
  rowSeats: Array<{ id: string; col: number; x: number; y: number }>,
  targetCol: number,
  targetX: number
): { id: string; col: number; x: number; y: number } | null {
  if (rowSeats.length === 0) return null;

  // First try to find exact column match
  if (targetCol !== undefined) {
    const exactMatch = rowSeats.find(seat => seat.col === targetCol);
    if (exactMatch) return exactMatch;
  }

  // Fallback to finding closest x-coordinate
  let closestSeat = rowSeats[0];
  let minDistance = Math.abs(rowSeats[0].x - targetX);

  for (const seat of rowSeats) {
    const distance = Math.abs(seat.x - targetX);
    if (distance < minDistance) {
      minDistance = distance;
      closestSeat = seat;
    }
  }

  return closestSeat;
}
