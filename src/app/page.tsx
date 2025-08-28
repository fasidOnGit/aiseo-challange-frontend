'use client';

import { useVenue } from '../lib/hooks/useVenue';
import { VenueContent } from '../components/VenueContent';
import { ErrorBoundary, SuspenseWrapper, LoadingState, ErrorState } from '../components/ui';

/**
 * Home page component - now focused only on data fetching and error boundaries
 * All other responsibilities have been moved to appropriate components and stores
 */
export default function Home() {
  const { data: venue, isLoading, error, refetch } = useVenue();

  // Show loading during initial hydration or when actually loading
  if (isLoading || !venue) {
    return (
      <LoadingState 
        message="Loading Venue"
        description="Preparing your seating experience..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={refetch}
        title="Failed to Load Venue"
      />
    );
  }

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