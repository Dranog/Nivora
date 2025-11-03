import { Skeleton } from './skeleton'
import { Card } from './card'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  /**
   * Size variant (based on Image 3)
   */
  variant?: 'small' | 'medium' | 'large'
  /**
   * Number of skeleton items to show
   */
  count?: number
  /**
   * Custom className
   */
  className?: string
}

const variantStyles = {
  small: 'h-20',
  medium: 'h-32',
  large: 'h-48',
}

/**
 * Generic loading skeleton
 * Based on Image 3 (3 size variants)
 * 
 * @example
 * <LoadingSkeleton variant='medium' count={3} />
 */
export function LoadingSkeleton({
  variant = 'medium',
  count = 1,
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className={cn('w-full rounded-lg', variantStyles[variant])} />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      ))}
    </div>
  )
}

/**
 * Post card skeleton (for grid layouts)
 */
export function PostCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className='p-6'>
          <Skeleton className='h-48 w-full rounded-lg mb-4' />
          <Skeleton className='h-4 w-3/4 mb-2' />
          <Skeleton className='h-4 w-1/2' />
        </Card>
      ))}
    </div>
  )
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className='space-y-2'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex gap-4 items-center'>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className='h-10 flex-1' />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * KPI card skeleton
 */
export function KPICardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className='p-6'>
          <Skeleton className='h-4 w-24 mb-4' />
          <Skeleton className='h-8 w-32 mb-2' />
          <Skeleton className='h-4 w-16' />
        </Card>
      ))}
    </div>
  )
}
