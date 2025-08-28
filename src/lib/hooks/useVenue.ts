import { useQuery } from '@tanstack/react-query';
import { Venue } from '../types';
import { useState, useEffect } from 'react';

async function fetchVenue(): Promise<Venue> {
  const response = await fetch('/venue.json');
  if (!response.ok) {
    throw new Error('Failed to fetch venue data');
  }
  return response.json();
}

export function useVenue() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: ['venue'],
    queryFn: fetchVenue,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isClient, // Only run after hydration
  });
}
