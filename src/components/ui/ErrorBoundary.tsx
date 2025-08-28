import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <ErrorState 
      error={error} 
      onRetry={resetErrorBoundary}
      title="Something went wrong"
    />
  );
}

export function ErrorBoundary({ children, fallback: Fallback = DefaultErrorFallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Here you could add error reporting service like Sentry
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
