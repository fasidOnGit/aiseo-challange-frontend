#!/usr/bin/env node

/**
 * Simple Venue Generator Script
 * Generates a clean, static venue layout with multiple sections
 * 
 * Usage: node scripts/generateVenue.js
 * This will generate a fixed layout with ~300 seats in 6 sections
 */

const fs = require('fs');
const path = require('path');

// Simple, fixed venue configuration
const VENUE_CONFIG = {
  width: 1200,
  height: 800,
  seatSpacing: 40,
  rowSpacing: 45,
  sectionSpacing: 60
};

// Simple section templates with fixed positions
const SECTION_TEMPLATES = [
  // Lower Bowl - Premium
  {
    id: 'A',
    label: 'Lower Bowl A',
    priceTier: 1,
    x: 100,
    y: 100,
    rows: 6,
    seatsPerRow: 8,
    scale: 1.0
  },
  {
    id: 'B',
    label: 'Lower Bowl B',
    priceTier: 1,
    x: 500,
    y: 100,
    rows: 6,
    seatsPerRow: 8,
    scale: 1.0
  },
  
  // Upper Bowl - Standard
  {
    id: 'C',
    label: 'Upper Bowl C',
    priceTier: 2,
    x: 100,
    y: 400,
    rows: 5,
    seatsPerRow: 10,
    scale: 0.9
  },
  {
    id: 'D',
    label: 'Upper Bowl D',
    priceTier: 2,
    x: 600,
    y: 400,
    rows: 5,
    seatsPerRow: 10,
    scale: 0.9
  },
  
  // VIP Boxes
  {
    id: 'E',
    label: 'VIP Box E',
    priceTier: 3,
    x: 900,
    y: 150,
    rows: 4,
    seatsPerRow: 6,
    scale: 0.8
  },
  {
    id: 'F',
    label: 'VIP Box F',
    priceTier: 3,
    x: 900,
    y: 400,
    rows: 4,
    seatsPerRow: 6,
    scale: 0.8
  }
];

function generateSeats(sectionId, rowIndex, seatsPerRow, priceTier) {
  const seats = [];
  for (let col = 1; col <= seatsPerRow; col++) {
    const seatId = `${sectionId}-${rowIndex.toString().padStart(2, '0')}-${col.toString().padStart(2, '0')}`;
    const x = (col - 1) * VENUE_CONFIG.seatSpacing + 50; // 50 is offset within section
    const y = (rowIndex - 1) * VENUE_CONFIG.rowSpacing + 50; // 50 is offset within section
    
    // Randomly assign some seats as reserved/sold for variety
    let status = 'available';
    if (Math.random() < 0.1) status = 'reserved';
    if (Math.random() < 0.05) status = 'sold';
    
    seats.push({
      id: seatId,
      col,
      x,
      y,
      priceTier,
      status
    });
  }
  return seats;
}

function generateRows(section) {
  const rows = [];
  for (let rowIndex = 1; rowIndex <= section.rows; rowIndex++) {
    rows.push({
      index: rowIndex,
      seats: generateSeats(section.id, rowIndex, section.seatsPerRow, section.priceTier)
    });
  }
  return rows;
}

function generateVenue() {
  console.log('Generating simple, static venue layout...');
  
  const sections = SECTION_TEMPLATES.map(section => ({
    id: section.id,
    label: section.label,
    transform: {
      x: section.x,
      y: section.y,
      scale: section.scale
    },
    rows: generateRows(section)
  }));

  const venue = {
    venueId: 'simple-arena-01',
    name: 'Simple Arena',
    map: {
      width: VENUE_CONFIG.width,
      height: VENUE_CONFIG.height
    },
    sections
  };

  // Calculate total seats
  const totalSeats = sections.reduce((total, section) => {
    return total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0);
  }, 0);

  console.log(`\nGenerated ${sections.length} sections with ${totalSeats} total seats`);
  
  // Log section details
  sections.forEach(section => {
    const sectionSeats = section.rows.reduce((total, row) => total + row.seats.length, 0);
    console.log(`  ${section.id}: ${section.rows.length} rows, ${sectionSeats} seats at (${section.transform.x}, ${section.transform.y})`);
  });
  
  return venue;
}

function saveVenue(venue, outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(venue, null, 2));
  console.log(`\nVenue saved to: ${outputPath}`);
}

function main() {
  try {
    const venue = generateVenue();
    const outputPath = path.join(__dirname, '..', 'public', 'venue.json');
    saveVenue(venue, outputPath);
    
    console.log('\nVenue generation completed successfully!');
    console.log('This creates a clean, static layout that is easy to reason about.');
    console.log('No overlapping sections, fixed positions, and clear structure.');
    
  } catch (error) {
    console.error('Error generating venue:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateVenue };
