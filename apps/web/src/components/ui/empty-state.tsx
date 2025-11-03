import { Button } from './button'
import { cn } from '@/lib/utils'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  /**
   * Optional icon (defaults to PackageOpen)
   */
  icon?: React.ReactNode
  /**
   * Main title
   */
  title: string
  /**
   * Optional description
   */
  description?: string
  /**
   * Optional action button
   */
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
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
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-16 w-16',
    iconContainer: 'h-20 w-20',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    iconContainer: 'h-24 w-24',
    title: 'text-xl',
    description: 'text-base',
  },
}

/**
 * Empty state component for when there is no data
 * 
 * @example
 * <EmptyState
 *   title='No posts yet'
 *   description='Create your first post to get started'
 *   action={{ label: 'Create Post', onClick: () => {} }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const styles = sizeStyles[size]
  const IconComponent = icon || <PackageOpen className={cn(styles.icon, 'text-muted-foreground')} />

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', styles.container, className)}>
      {/* Icon */}
      <div className={cn('mb-4 flex items-center justify-center rounded-full bg-muted', styles.iconContainer)}>
        {IconComponent}
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold', styles.title)}>{title}</h3>

      {/* Description */}
      {description && (
        <p className={cn('mt-2 text-muted-foreground max-w-sm', styles.description)}>
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button variant={action.variant || 'default'} size='sm' onClick={action.onClick} className='mt-6'>
          {action.label}
        </Button>
      )}
    </div>
  )
}
