'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

const variantStyles = {
  default: 'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export function ProgressBar({
  value = 0,
  showLabel,
  variant = 'default',
  className,
  ...props
}: ProgressBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <ProgressPrimitive.Root
        value={value}
        {...props}
        className='relative h-2 w-full overflow-hidden rounded-full bg-muted'
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full transition-all duration-300', variantStyles[variant])}
          style={{ width: `${value}%` }}
        />
      </ProgressPrimitive.Root>
      
      {showLabel && (
        <div className='text-sm text-muted-foreground text-right'>
          {Math.round(value)}%
        </div>
      )}
    </div>
  )
}
