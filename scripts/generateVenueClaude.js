#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Predefined section configurations
const SECTION_CONFIGS = [
  {
    id: 'A',
    label: 'Lower Bowl A',
    transform: { x: 50, y: 100, scale: 1 },
    priceTier: 1,
    weight: 1.0, // Relative size for seat distribution
    seatSpacing: { x: 35, y: 40 }, // Distance between seats
    maxSeatsPerRow: 20
  },
  {
    id: 'B', 
    label: 'Lower Bowl B',
    transform: { x: 400, y: 100, scale: 1 },
    priceTier: 1,
    weight: 1.0,
    seatSpacing: { x: 35, y: 40 },
    maxSeatsPerRow: 20
  },
  {
    id: 'C',
    label: 'Upper Bowl C',
    transform: { x: 50, y: 300, scale: 0.8 },
    priceTier: 2,
    weight: 1.2, // Upper bowl typically has more seats
    seatSpacing: { x: 30, y: 30 }, // Tighter spacing for upper bowl
    maxSeatsPerRow: 25
  },
  {
    id: 'D',
    label: 'Upper Bowl D', 
    transform: { x: 400, y: 300, scale: 0.8 },
    priceTier: 2,
    weight: 1.2,
    seatSpacing: { x: 30, y: 30 },
    maxSeatsPerRow: 25
  },
  {
    id: 'E',
    label: 'VIP Box E',
    transform: { x: 750, y: 50, scale: 0.9 },
    priceTier: 3,
    weight: 0.1, // VIP boxes are small
    seatSpacing: { x: 30, y: 30 },
    maxSeatsPerRow: 6
  },
  {
    id: 'F',
    label: 'VIP Box F',
    transform: { x: 750, y: 200, scale: 0.9 },
    priceTier: 3,
    weight: 0.1,
    seatSpacing: { x: 30, y: 30 },
    maxSeatsPerRow: 6
  },
  {
    id: 'G',
    label: 'Mezzanine G',
    transform: { x: 200, y: 500, scale: 0.85 },
    priceTier: 2,
    weight: 0.8,
    seatSpacing: { x: 32, y: 35 },
    maxSeatsPerRow: 18
  },
  {
    id: 'H',
    label: 'Mezzanine H',
    transform: { x: 500, y: 500, scale: 0.85 },
    priceTier: 2,
    weight: 0.8,
    seatSpacing: { x: 32, y: 35 },
    maxSeatsPerRow: 18
  }
];

// Seat status distribution (percentages)
const STATUS_DISTRIBUTION = {
  available: 0.65,  // 65% available
  reserved: 0.15,   // 15% reserved
  sold: 0.15,       // 15% sold
  held: 0.05        // 5% held
};

function generateRandomStatus() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [status, probability] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return status;
    }
  }
  return 'available';
}

function calculateSectionSeats(totalSeats, sectionConfigs) {
  const totalWeight = sectionConfigs.reduce((sum, config) => sum + config.weight, 0);
  
  return sectionConfigs.map(config => {
    const sectionSeats = Math.floor((totalSeats * config.weight) / totalWeight);
    return {
      ...config,
      totalSeats: sectionSeats
    };
  });
}

function generateSeatsForSection(sectionConfig) {
  const { totalSeats, maxSeatsPerRow, seatSpacing } = sectionConfig;
  
  // Calculate optimal rows and seats per row
  const estimatedRows = Math.ceil(Math.sqrt(totalSeats / maxSeatsPerRow * 2));
  const seatsPerRow = Math.min(maxSeatsPerRow, Math.ceil(totalSeats / estimatedRows));
  const actualRows = Math.ceil(totalSeats / seatsPerRow);
  
  const rows = [];
  let seatCount = 0;
  
  for (let rowIndex = 1; rowIndex <= actualRows && seatCount < totalSeats; rowIndex++) {
    const row = {
      index: rowIndex,
      seats: []
    };
    
    // Calculate how many seats in this row (last row might have fewer)
    const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
    
    // Center the row horizontally
    const totalRowWidth = (seatsInThisRow - 1) * seatSpacing.x;
    const startX = 50; // Base starting position
    
    for (let seatIndex = 1; seatIndex <= seatsInThisRow; seatIndex++) {
      const seatId = `${sectionConfig.id}-${rowIndex}-${seatIndex.toString().padStart(2, '0')}`;
      
      // Calculate seat position within the section (before transform)
      const seatX = startX + (seatIndex - 1) * seatSpacing.x;
      const seatY = 50 + (rowIndex - 1) * seatSpacing.y; // Start at y=50, add row spacing
      
      row.seats.push({
        id: seatId,
        col: seatIndex,
        x: seatX,
        y: seatY,
        priceTier: sectionConfig.priceTier,
        status: generateRandomStatus()
      });
      
      seatCount++;
    }
    
    if (row.seats.length > 0) {
      rows.push(row);
    }
  }
  
  return rows;
}

function generateVenue(totalSeats) {
  console.log(`Generating venue with ${totalSeats} seats...`);
  
  // Calculate seats per section
  const sectionsWithSeats = calculateSectionSeats(totalSeats, SECTION_CONFIGS);
  
  // Generate sections
  const sections = sectionsWithSeats.map(sectionConfig => {
    console.log(`  Section ${sectionConfig.id}: ${sectionConfig.totalSeats} seats`);
    
    return {
      id: sectionConfig.id,
      label: sectionConfig.label,
      transform: sectionConfig.transform,
      rows: generateSeatsForSection(sectionConfig)
    };
  }).filter(section => section.rows.length > 0); // Remove empty sections
  
  // Calculate actual total seats generated
  const actualTotal = sections.reduce((total, section) => 
    total + section.rows.reduce((sectionTotal, row) => 
      sectionTotal + row.seats.length, 0), 0);
  
  console.log(`Generated ${actualTotal} seats across ${sections.length} sections`);
  
  return {
    venueId: "arena-01",
    name: "Metropolis Arena",
    map: { width: 1024, height: 768 },
    sections
  };
}

function validateCoordinates(venue) {
  console.log('Validating coordinates...');
  
  for (const section of venue.sections) {
    const { transform } = section;
    
    for (const row of section.rows) {
      for (const seat of row.seats) {
        // Calculate absolute coordinates (section coordinates + transform)
        const absoluteX = (seat.x * transform.scale) + transform.x;
        const absoluteY = (seat.y * transform.scale) + transform.y;
        
        // Check if coordinates are within venue bounds
        if (absoluteX < 0 || absoluteX > venue.map.width || 
            absoluteY < 0 || absoluteY > venue.map.height) {
          console.warn(`Warning: Seat ${seat.id} at absolute position (${absoluteX.toFixed(1)}, ${absoluteY.toFixed(1)}) is outside venue bounds`);
        }
      }
    }
  }
  
  console.log('Coordinate validation complete');
}

function printSectionStats(venue) {
  console.log('\nSection Statistics:');
  console.log('===================');
  
  for (const section of venue.sections) {
    const seatCount = section.rows.reduce((total, row) => total + row.seats.length, 0);
    const rowCount = section.rows.length;
    const avgSeatsPerRow = (seatCount / rowCount).toFixed(1);
    
    // Calculate absolute bounds for this section
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (const row of section.rows) {
      for (const seat of row.seats) {
        const absX = (seat.x * section.transform.scale) + section.transform.x;
        const absY = (seat.y * section.transform.scale) + section.transform.y;
        minX = Math.min(minX, absX);
        maxX = Math.max(maxX, absX);
        minY = Math.min(minY, absY);
        maxY = Math.max(maxY, absY);
      }
    }
    
    console.log(`${section.label} (${section.id}):`);
    console.log(`  Seats: ${seatCount} | Rows: ${rowCount} | Avg/Row: ${avgSeatsPerRow}`);
    console.log(`  Bounds: (${minX.toFixed(0)}, ${minY.toFixed(0)}) to (${maxX.toFixed(0)}, ${maxY.toFixed(0)})`);
    console.log(`  Transform: x=${section.transform.x}, y=${section.transform.y}, scale=${section.transform.scale}`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node generate-venue.js <total_seats> [output_file]');
    console.log('Example: node generate-venue.js 15000 venue-15k.json');
    process.exit(1);
  }
  
  const totalSeats = parseInt(args[0]);
  const outputFile = args[1] || `venue-${totalSeats}.json`;
  
  if (isNaN(totalSeats) || totalSeats <= 0) {
    console.error('Error: Total seats must be a positive number');
    process.exit(1);
  }
  
  if (totalSeats > 50000) {
    console.warn('Warning: Generating more than 50,000 seats may impact performance');
  }
  
  try {
    // Generate venue
    const venue = generateVenue(totalSeats);
    
    // Validate coordinates
    validateCoordinates(venue);
    
    // Print statistics
    printSectionStats(venue);
    
    // Save to file
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(venue, null, 2));
    
    console.log(`\nVenue saved to: ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error generating venue:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateVenue, SECTION_CONFIGS };