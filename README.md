# Venue Seating System

A React-based venue seating visualization system built with Next.js, TypeScript, and SVG.

## Features

- **Interactive SVG-based seating chart** with over 100 seats across multiple sections
- **Real-time seat status visualization** (available, reserved, sold, held)
- **Responsive design** that works on desktop and mobile devices
- **React Query integration** for efficient data fetching
- **TypeScript support** with full type safety
- **Semantic SVG structure** using `<g>` elements for sections and `<use>` for seats

## Venue Structure

The system supports:
- **Multiple sections** (Lower Bowl A/B, Upper Bowl C/D, VIP Boxes E/F)
- **Flexible seating layouts** with custom transforms and scaling
- **Price tiers** for different seating categories
- **Seat status management** for booking systems

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Format

The venue data is stored in `public/venue.json` and follows this structure:

```json
{
  "venueId": "arena-01",
  "name": "Metropolis Arena",
  "map": { "width": 1024, "height": 768 },
  "sections": [
    {
      "id": "A",
      "label": "Lower Bowl A",
      "transform": { "x": 50, "y": 100, "scale": 1 },
      "rows": [
        {
          "index": 1,
          "seats": [
            {
              "id": "A-1-01",
              "col": 1,
              "x": 50,
              "y": 40,
              "priceTier": 1,
              "status": "available"
            }
          ]
        }
      ]
    }
  ]
}
```

## Seat Status Colors

- 🟢 **Available** - Green (#10b981)
- 🟡 **Reserved** - Amber (#f59e0b)
- 🔴 **Sold** - Red (#ef4444)
- 🟣 **Held** - Purple (#8b5cf6)

## Technical Details

- **SVG-based rendering** for crisp, scalable graphics
- **Event delegation** with single click handler on SVG parent
- **CSS transforms** for smooth hover effects and animations
- **Responsive grid layout** using Material-UI's responsive breakpoint system
- **Type-safe data handling** with TypeScript interfaces

## Customization

To add new sections or modify existing ones:
1. Update the `venue.json` file with new section data
2. The system automatically renders new sections based on the data
3. Customize colors and styling using Material-UI's theme system and sx props

## Performance

- **O(1) seat lookup** using data attributes
- **Efficient SVG rendering** with symbol definitions
- **React Query caching** for optimal data fetching
- **Minimal re-renders** with proper component structure
