import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Custom className
   */
  className?: string;
  /**
   * Optional text to display below spinner
   */
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

/**
 * Loading spinner component
 *
 * @example
 * <LoadingSpinner size="md" text="Loading..." />
 */
export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3', className)}
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function LoadingSpinnerFullPage({ text }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Inline loading spinner for buttons
 */
export function LoadingSpinnerInline({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin', className)}
      aria-hidden="true"
    />
  );
}
