import { cn } from '@/lib/utils'
import { Card } from './card'
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react'
import { Skeleton } from './skeleton'

interface KPICardProps {
  /**
   * Card title (e.g., 'Total Revenue')
   */
  title: string
  /**
   * Main value to display
   */
  value: string | number
  /**
   * Optional trend indicator
   */
  trend?: {
    value: string
    isPositive: boolean
    label?: string
  }
  /**
   * Optional icon component
   */
  icon?: React.ReactNode
  /**
   * Optional description below value
   */
  description?: string
  /**
   * Loading state
   */
  isLoading?: boolean
  /**
   * Custom className
   */
  className?: string
}

/**
 * KPI Card component for displaying key metrics
 * Used in dashboards (creator, admin, analytics)
 * 
 * @example
 * <KPICard
 *   title='Total Revenue'
 *   value='€24,500'
 *   trend={{ value: '+12.3%', isPositive: true }}
 * />
 */
export function KPICard({
  title,
  value,
  trend,
  icon,
  description,
  isLoading,
  className,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <Skeleton className='h-4 w-24 mb-4' />
        <Skeleton className='h-8 w-32 mb-2' />
        <Skeleton className='h-4 w-16' />
      </Card>
    )
  }

  return (
    <Card className={cn('p-6 transition-shadow hover:shadow-lg', className)}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {/* Title */}
          <h3 className='text-sm font-medium text-muted-foreground mb-2'>
            {title}
          </h3>
          
          {/* Value */}
          <p className='text-3xl font-bold tracking-tight mb-2'>
            {value}
          </p>
          
          {/* Trend */}
          {trend && (
            <div className='flex items-center gap-1 text-sm'>
              {trend.isPositive ? (
                <ArrowUpIcon className='h-4 w-4 text-success' />
              ) : (
                <ArrowDownIcon className='h-4 w-4 text-destructive' />
              )}
              <span className={cn(
                'font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.value}
              </span>
              {trend.label && (
                <span className='text-muted-foreground'>{trend.label}</span>
              )}
            </div>
          )}
          
          {/* Description */}
          {description && (
            <p className='mt-2 text-sm text-muted-foreground'>
              {description}
            </p>
          )}
        </div>
        
        {/* Icon */}
        {icon && (
          <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
