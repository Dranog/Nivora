import { Button } from './button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  /**
   * Error title
   */
  title?: string
  /**
   * Error message
   */
  message?: string
  /**
   * Retry callback
   */
  onRetry?: () => void
  /**
   * Show retry button even without callback
   */
  showRetry?: boolean
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Custom className
   */
  className?: string
}

const sizeStyles = {
  sm: {
    container: 'py-8',
    icon: 'h-12 w-12',
    iconContainer: 'h-16 w-16',
    title: 'text-base',
    message: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-16 w-16',
    iconContainer: 'h-20 w-20',
    title: 'text-lg',
    message: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    iconContainer: 'h-24 w-24',
    title: 'text-xl',
    message: 'text-base',
  },
}

/**
 * Error state component for error handling
 * 
 * @example
 * <ErrorState
 *   title='Failed to load data'
 *   message='Please check your connection and try again'
 *   onRetry={() => refetch()}
 * />
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  showRetry = true,
  size = 'md',
  className,
}: ErrorStateProps) {
  const styles = sizeStyles[size]

  return (
    <div role="alert" aria-live="assertive" className={cn('flex flex-col items-center justify-center text-center', styles.container, className)}>
      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-full bg-destructive/10',
          styles.iconContainer
        )}
      >
        <AlertCircle className={cn(styles.icon, 'text-destructive')} />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold', styles.title)}>{title}</h3>

      {/* Message */}
      <p className={cn('mt-2 text-muted-foreground max-w-sm', styles.message)}>
        {message}
      </p>

      {/* Retry button */}
      {showRetry && (
        <Button variant='outline' size='sm' onClick={onRetry} className='mt-6'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Try again
        </Button>
      )}
    </div>
  )
}
