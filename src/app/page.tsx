import { Suspense } from 'react';
import { getVenueData } from '../lib/server/venueData';
import { VenueClientWrapper } from '../components/VenueClientWrapper';

/**
 * Server-rendered home page component
 * Fetches venue data at build time/request time for better performance and SEO
 */
export default async function Home() {
  try {
    const venue = await getVenueData();

    return (
      <Suspense fallback={<ServerFallback />}>
        <VenueClientWrapper venue={venue} />
      </Suspense>
    );
  } catch (error) {
    console.error('Failed to load venue data on server:', error);
    
    // Return a fallback that will attempt client-side fetching
    return <ServerFallback />;
  }
}

/**
 * Server-safe fallback component
 */
function ServerFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px'
    }}>
      <h1>Loading Venue...</h1>
      <p>Preparing your seating experience...</p>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 2s linear infinite'
      }} />
    </div>
  );
}