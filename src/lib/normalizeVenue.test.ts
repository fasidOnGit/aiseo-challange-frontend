/**
 * Usage example and basic tests for normalizeVenue
 * 
 * This file demonstrates how to use the normalizeVenue function
 * and includes basic acceptance checks as mentioned in the requirements.
 */

import { normalizeVenue, type Venue } from './normalizeVenue';

// Sample venue data matching the input JSON shape
const sampleVenue: Venue = {
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
            { id: "A-1-02", col: 2, x: 80, y: 40, priceTier: 1, status: "reserved" },
            { id: "A-1-03", col: 3, x: 110, y: 40, priceTier: 2, status: "available" }
          ]
        },
        {
          index: 2,
          seats: [
            { id: "A-2-01", col: 1, x: 50, y: 70, priceTier: 1, status: "sold" },
            { id: "A-2-02", col: 2, x: 80, y: 70, priceTier: 1, status: "available" }
          ]
        }
      ]
    },
    {
      id: "B",
      label: "Upper Bowl B",
      transform: { x: 200, y: 100, scale: 0.8 },
      rows: [
        {
          index: 1,
          seats: [
            { id: "B-1-01", col: 1, x: 250, y: 140, priceTier: 3, status: "available" }
          ]
        }
      ]
    }
  ]
};

// Usage example
function demonstrateUsage() {
  console.log("=== Venue Normalization Demo ===\n");

  try {
    // Normalize venue with price tiers and neighbor computation
    const normalized = normalizeVenue(sampleVenue, {
      priceByTier: { 1: 120, 2: 90, 3: 60 },
      precomputeNeighbors: true
    });

    console.log(`Venue: ${normalized.venueId}`);
    console.log(`Map dimensions: ${normalized.map.width}x${normalized.map.height}`);
    console.log(`Total seats: ${normalized.flatSeats.length}`);
    console.log(`Sections: ${normalized.sections.length}`);

    // Test seatsById lookup
    const seatA101 = normalized.seatsById.get("A-1-01");
    console.log("\n=== Seat Lookup Test ===");
    console.log("seatsById.get('A-1-01'):", seatA101);

    // Test rowsBySection sorting
    const sectionA = normalized.rowsBySection.get("A");
    if (sectionA) {
      console.log("\n=== Row Sorting Test ===");
      console.log("Section A rows:", sectionA.map(row => ({
        rowIndex: row.rowIndex,
        seatCount: row.seats.length,
        firstSeat: row.seats[0]?.id,
        lastSeat: row.seats[row.seats.length - 1]?.id
      })));
      
      // Verify seats are sorted by col
      const row1 = sectionA.find(r => r.rowIndex === 1);
      if (row1) {
        console.log("Row 1 seats sorted by col:", row1.seats.map(s => ({ id: s.id, col: s.col, x: s.x })));
      }
    }

    // Test price helper
    console.log("\n=== Price Helper Test ===");
    console.log("Price tier 1:", normalized.getPrice(1));
    console.log("Price tier 2:", normalized.getPrice(2));
    console.log("Price tier 3:", normalized.getPrice(3));
    console.log("Price tier 4:", normalized.getPrice(4));

    // Test neighbors
    if (normalized.neighbors) {
      console.log("\n=== Neighbors Test ===");
      const neighborsA101 = normalized.neighbors.get("A-1-01");
      console.log("Neighbors for A-1-01:", neighborsA101);
      
      const neighborsA102 = normalized.neighbors.get("A-1-02");
      console.log("Neighbors for A-1-02:", neighborsA102);
    }

    // Test flatSeats
    console.log("\n=== Flat Seats Test ===");
    console.log("flatSeats length:", normalized.flatSeats.length);
    console.log("Expected total seats:", sampleVenue.sections.reduce((total, section) => 
      total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
    ));
    console.log("First few seats:", normalized.flatSeats.slice(0, 3).map(s => s.id));

  } catch (error) {
    console.error("Error during normalization:", error);
  }
}

// Acceptance checks
function runAcceptanceChecks() {
  console.log("\n=== Running Acceptance Checks ===\n");

  try {
    const normalized = normalizeVenue(sampleVenue, { priceByTier: { 1: 120, 2: 90, 3: 60 } });

    // Check 1: seatsById.get("A-1-01") returns expected meta
    const seatA101 = normalized.seatsById.get("A-1-01");
    if (seatA101 && 
        seatA101.id === "A-1-01" && 
        seatA101.sectionId === "A" && 
        seatA101.rowIndex === 1 && 
        seatA101.col === 1) {
      console.log("✓ seatsById lookup works correctly");
    } else {
      console.log("✗ seatsById lookup failed");
    }

    // Check 2: rowsBySection.get("A")![0].seats is sorted by col
    const sectionA = normalized.rowsBySection.get("A");
    if (sectionA && sectionA[0]) {
      const firstRow = sectionA[0];
      const isSorted = firstRow.seats.every((seat, i) => 
        i === 0 || seat.col >= firstRow.seats[i - 1].col
      );
      if (isSorted) {
        console.log("✓ Row seats are sorted by column");
      } else {
        console.log("✗ Row seats are not properly sorted");
      }
    }

    // Check 3: flatSeats.length === total seat count
    const expectedSeatCount = sampleVenue.sections.reduce((total, section) => 
      total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
    );
    if (normalized.flatSeats.length === expectedSeatCount) {
      console.log("✓ flatSeats contains all seats");
    } else {
      console.log("✗ flatSeats count mismatch");
    }

    // Check 4: Neighbors consistency (if enabled)
    if (normalized.neighbors) {
      const neighborsA101 = normalized.neighbors.get("A-1-01");
      const neighborsA102 = normalized.neighbors.get("A-1-02");
      
      if (neighborsA101?.right === "A-1-02" && neighborsA102?.left === "A-1-01") {
        console.log("✓ Left/right neighbors are consistent");
      } else {
        console.log("✗ Left/right neighbors are inconsistent");
      }
    }

    console.log("\n=== All Acceptance Checks Complete ===");

  } catch (error) {
    console.error("Error during acceptance checks:", error);
  }
}

// Run the demo if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  demonstrateUsage();
  runAcceptanceChecks();
}

export { demonstrateUsage, runAcceptanceChecks };
