# Venue Seating Normalization Module

A framework-agnostic TypeScript module that normalizes venue seating JSON into fast lookup structures for rendering and keyboard navigation.

## Features

- **O(1) seat lookup** by ID using `Map<string, SeatMeta>`
- **Sorted row data** for efficient rendering and navigation
- **Optional neighbor computation** for keyboard navigation (up/down/left/right)
- **Price tier support** with configurable pricing
- **Defensive validation** with helpful error messages
- **Pure TypeScript** - no external dependencies

## Usage

```typescript
import { normalizeVenue, type Venue } from './normalizeVenue';

const venue: Venue = {
  venueId: "arena-01",
  name: "Metropolis Arena",
  map: { width: 1024, height: 768 },
  sections: [
    {
      id: "A",
      label: "Lower Bowl A",
      transform: { x: 0, y: 0, scale: 1 },
      rows: [
        {
          index: 1,
          seats: [
            { id: "A-1-01", col: 1, x: 50, y: 40, priceTier: 1, status: "available" },
            { id: "A-1-02", col: 2, x: 80, y: 40, priceTier: 1, status: "reserved" }
          ]
        }
      ]
    }
  ]
};

// Basic normalization
const normalized = normalizeVenue(venue);

// With price tiers and neighbor computation
const normalizedWithOptions = normalizeVenue(venue, {
  priceByTier: { 1: 120, 2: 90, 3: 60 },
  precomputeNeighbors: true
});

// Fast lookups
const seat = normalized.seatsById.get("A-1-01");
const sectionRows = normalized.rowsBySection.get("A");
const allSeats = normalized.flatSeats;

// Price lookup
const price = normalized.getPrice(1); // Returns 120
```

## API Reference

### `normalizeVenue(venue, opts?)`

Normalizes venue data into efficient lookup structures.

**Parameters:**
- `venue: Venue` - Raw venue data
- `opts?: NormalizeOptions` - Optional configuration

**Returns:** `NormalizedVenue` with the following structure:

```typescript
{
  venueId: string;
  map: { width: number; height: number };
  sections: Array<{ id: string; label: string; transform: Transform }>;
  seatsById: Map<string, SeatMeta>;           // O(1) lookup by seat ID
  rowsBySection: Map<string, Array<RowData>>; // Sorted rows by section
  neighbors?: Map<string, SeatNeighbors>;     // Optional keyboard navigation
  flatSeats: SeatMeta[];                      // All seats in input order
  getPrice: (tier: number) => number | undefined;
}
```

### Types

- `Venue` - Input venue structure
- `Section` - Venue section with rows
- `Row` - Row with seats
- `Seat` - Individual seat data
- `SeatMeta` - Enhanced seat data with section context
- `SeatStatus` - 'available' | 'reserved' | 'sold' | 'held'
- `SeatNeighbors` - Adjacent seats for navigation

## Performance

- **Time Complexity:** O(N) where N = total seat count
- **Space Complexity:** O(N)
- **Safe for:** Up to 15,000+ seats
- **Lookup Performance:** O(1) for seat ID, section, and row access

## Error Handling

The module validates input data and throws descriptive errors for:
- Duplicate seat IDs
- Invalid seat status values
- Missing required fields
- Non-numeric coordinates

## Examples

See `normalizeVenue.test.ts` for comprehensive usage examples and acceptance tests.
