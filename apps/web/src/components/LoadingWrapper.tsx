/**
 * Loading Wrapper Component
 * Wraps content with loading state and skeleton
 */

import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface LoadingWrapperProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  skeleton?: ReactNode;
  loadingText?: string;
  errorText?: string;
  children: ReactNode;
  minHeight?: string;
}

export function LoadingWrapper({
  isLoading,
  isError = false,
  error = null,
  skeleton,
  loadingText,
  errorText,
  children,
  minHeight = '200px',
}: LoadingWrapperProps) {
  // Error state
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {errorText || error?.message || 'Une erreur est survenue lors du chargement.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }

    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight }}
        role="status"
        aria-busy="true"
        aria-label={loadingText || 'Chargement en cours'}
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          {loadingText && (
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          )}
        </div>
      </div>
    );
  }

  // Content loaded
  return <>{children}</>;
}

/**
 * Simple loading spinner
 */
export function LoadingSpinner({
  size = 'default',
  text,
}: {
  size?: 'sm' | 'default' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-busy="true"
      aria-label={text || 'Chargement en cours'}
    >
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * Loading overlay (full screen or container)
 */
export function LoadingOverlay({
  isLoading,
  text,
  fullScreen = false,
}: {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
}) {
  if (!isLoading) return null;

  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0' : 'absolute inset-0'
      } bg-background/80 backdrop-blur-sm flex items-center justify-center z-50`}
      role="status"
      aria-busy="true"
      aria-label={text || 'Chargement en cours'}
    >
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Inline loading indicator (for buttons, small areas)
 */
export function InlineLoader({
  text,
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </span>
  );
}

/**
 * Skeleton text (for inline text loading)
 */
export function SkeletonText({
  width = '100%',
  lines = 1,
  className = '',
}: {
  width?: string;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '80%' : width }}
        />
      ))}
    </div>
  );
}
