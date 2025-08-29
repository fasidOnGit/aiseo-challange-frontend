'use client';

import { useEffect } from 'react';
import { VenueContent } from './VenueContent';
import { ErrorBoundary, SuspenseWrapper } from './ui';
import { useSeatSelectionStore } from '../lib/stores/seatSelectionStore';
import { Venue } from '../lib/types';

interface VenueClientWrapperProps {
  venue: Venue;
}

/**
 * Client-side wrapper that handles interactive features and state management
 * while allowing the main page to be server-rendered
 */
export function VenueClientWrapper({ venue }: VenueClientWrapperProps) {
  const { initializeFromServerData } = useSeatSelectionStore();

  // Initialize the client store with server data on hydration
  useEffect(() => {
    initializeFromServerData(venue);
  }, [venue, initializeFromServerData]);

  return (
    <ErrorBoundary>
      <SuspenseWrapper
        loadingMessage="Loading Venue Components"
        loadingDescription="Setting up your seating experience..."
      >
        <VenueContent venue={venue} />
      </SuspenseWrapper>
    </ErrorBoundary>
  );
}
