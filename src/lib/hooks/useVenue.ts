import { useQuery } from '@tanstack/react-query';
import { Venue } from '../types';
import { fetchVenueClient } from '../server/venueData';

/**
 * Client-side hook for venue data updates and mutations
 * When used with SSR, the initial data should be provided to avoid refetching
 */
export function useVenue(initialData?: Venue) {
  return useQuery({
    queryKey: ['venue'],
    queryFn: fetchVenueClient,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData, // Use server-provided data as initial data
    refetchOnMount: false, // Don't refetch if we have initial data
    refetchOnWindowFocus: false, // Don't refetch on window focus for static venue data
  });
}


