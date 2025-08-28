# Venue Generation Scripts

This directory contains scripts for generating venue data programmatically.

## generateVenue.js

A Node.js script that generates venue sections and seats based on a total number of seats.

### Features

- **Dynamic Section Generation**: Creates sections based on seat count with reasonable caps
- **Non-overlapping Layout**: Ensures sections don't overlap by calculating proper transforms
- **Multiple Section Types**: Supports different section types (Lower Bowl, Upper Bowl, VIP Box, Premium, General)
- **Price Tiers**: Automatically assigns price tiers to sections
- **Flexible Seating**: Adapts rows and seats per row based on section capacity

### Usage

```bash
# Basic usage
node scripts/generateVenue.js <totalSeats>

# Examples
node scripts/generateVenue.js 500
node scripts/generateVenue.js 1000
node scripts/generateVenue.js 1500
```

### Parameters

- `totalSeats` (required): The total number of seats to generate (1-2000)

### Output

The script generates a new file at `public/generated-venue.json` with the following structure:

```json
{
  "venueId": "arena-1234567890",
  "name": "Generated Arena (500 seats)",
  "map": { "width": 1024, "height": 768 },
  "sections": [
    {
      "id": "A",
      "label": "Lower Bowl A",
      "transform": { "x": 50, "y": 100, "scale": 1.0 },
      "rows": [...]
    }
  ]
}
```

### Section Types

| Section | Price Tier | Scale | Max Width | Max Height | Description |
|---------|------------|-------|-----------|------------|-------------|
| A, B    | 1          | 1.0   | 350       | 200        | Lower Bowl (Premium) |
| C, D    | 2          | 0.8   | 400       | 180        | Upper Bowl (Standard) |
| E, F    | 3          | 0.9   | 200       | 120        | VIP Box (Luxury) |
| G, H    | 2          | 0.85  | 300       | 160        | Premium (Mid-tier) |
| I, J    | 3          | 0.75  | 250       | 140        | General (Economy) |

### Configuration

The script uses the following configuration constants:

- **Venue Dimensions**: 1024x768 pixels
- **Margins**: 50px from edges
- **Section Spacing**: 20px between sections
- **Seat Spacing**: 35px between seats horizontally
- **Row Spacing**: 40px between rows vertically
- **Max Seats per Row**: 12
- **Max Rows per Section**: 8
- **Min/Max Seats per Section**: 20-120

### Algorithm

1. **Section Layout Calculation**: Determines optimal positioning to avoid overlaps
2. **Seat Distribution**: Distributes seats across sections based on capacity
3. **Transform Calculation**: Calculates proper x, y coordinates and scale for each section
4. **Coordinate Generation**: Generates absolute seat coordinates within each section

### Error Handling

- Validates input parameters
- Ensures sections don't exceed venue boundaries
- Provides meaningful error messages
- Graceful fallback for edge cases

### Integration

The generated venue data can be used directly with the existing venue seating components by updating the venue data source to point to the generated file.
