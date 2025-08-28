import { useQuery } from '@tanstack/react-query';
import { Venue } from '../types';

async function fetchVenue(): Promise<Venue> {
  const response = await fetch('/venue.json');
  if (!response.ok) {
    throw new Error('Failed to fetch venue data');
  }
  return response.json();
}

export function useVenue() {
  return useQuery({
    queryKey: ['venue'],
    queryFn: fetchVenue,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
