import { readFile } from 'fs/promises';
import { join } from 'path';
import { Venue } from '../types';

/**
 * Server-side function to fetch venue data
 * Reads the venue.json file from the public directory
 */
export async function getVenueData(): Promise<Venue> {
  try {
    const venueFilePath = join(process.cwd(), 'public', 'venue.json');
    const fileContents = await readFile(venueFilePath, 'utf8');
    const venue: Venue = JSON.parse(fileContents);
    
    // Validate the venue data structure
    if (!venue.venueId || !venue.name || !venue.sections) {
      throw new Error('Invalid venue data structure');
    }
    
    return venue;
  } catch (error) {
    console.error('Failed to load venue data:', error);
    throw new Error('Failed to load venue data');
  }
}

/**
 * Client-side fallback function for when server data is not available
 * This maintains compatibility with the existing client-side fetching
 */
export async function fetchVenueClient(): Promise<Venue> {
  const response = await fetch('/venue.json');
  if (!response.ok) {
    throw new Error('Failed to fetch venue data');
  }
  return response.json();
}
