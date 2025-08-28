# Venue Seating System

A high-performance, accessible venue seating visualization system built with Next.js, TypeScript, and SVG.

## Features

- **Interactive SVG-based seating chart** with 100+ seats across multiple sections
- **Real-time seat selection** with persistent state management
- **Responsive design** with mobile-first approach and adaptive UI
- **Type-safe architecture** with full TypeScript coverage
- **Accessible interface** with ARIA compliance and keyboard navigation

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Architecture Decisions

### SVG over Canvas
We chose **SVG over Canvas** for several key reasons:
- **Accessibility**: Native support for ARIA labels, semantic structure, and screen readers
- **Scalability**: Vector-based rendering ensures crisp display at any zoom level
- **DOM Integration**: Direct CSS styling, hover states, and event handling
- **SEO**: Searchable and indexable content

### Performance Optimization
For large-scale venue rendering, we implement:
- **SVG `<symbol>` definitions**: Reusable seat templates defined once, referenced everywhere
- **`<use>` elements**: Lightweight instances that dramatically reduce DOM size
- **Event delegation**: Single click handler on SVG parent instead of individual seat listeners
- **React.memo**: Prevents unnecessary re-renders of static components

### Responsive Design
The system adapts to different screen sizes:
- **Desktop**: Full seating chart with side panel summary
- **Mobile**: Floating action button + bottom sheet for seat details
- **Progressive enhancement**: Core functionality works across all devices

## State Management

We use **Zustand** for global state with strategic middleware:

```typescript
// Clean, boilerplate-free store definition
const useSeatSelectionStore = create<SeatSelectionState>()(
  persist(
    (set, get) => ({
      selectedSeats: [],
      toggleSeat: (seatId, seat) => { /* logic */ }
    }),
    {
      name: 'venue-seat-selection',
      partialize: (state) => ({ 
        selectedSeats: state.selectedSeats,
        venueId: state.venueId 
      })
    }
  )
);
```

**Why Zustand + Middleware:**
- **Simplicity**: No boilerplate, direct state mutations
- **Persistence**: Automatic localStorage sync with SSR safety
- **Performance**: Selective subscriptions, minimal re-renders
- **TypeScript**: Full type inference and safety
- **DevTools**: Built-in debugging support

## Tech Stack

- **Next.js 15** - React framework with Turbopack
- **TypeScript** - Type safety and developer experience
- **Material-UI** - Component library and theming
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **SVG** - Scalable graphics rendering

## Data Structure

Venue data follows a hierarchical structure:
```
Venue → Sections → Rows → Seats
```

Each seat contains position, status, and pricing information for flexible venue configurations.
