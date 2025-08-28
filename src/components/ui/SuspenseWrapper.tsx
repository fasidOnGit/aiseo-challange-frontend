import { Suspense } from 'react';
import { LoadingState } from './LoadingState';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingMessage?: string;
  loadingDescription?: string;
}

export function SuspenseWrapper({ 
  children, 
  fallback,
  loadingMessage,
  loadingDescription 
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <LoadingState 
      message={loadingMessage} 
      description={loadingDescription} 
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}
