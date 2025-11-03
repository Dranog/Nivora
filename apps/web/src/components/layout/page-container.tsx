'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  /**
   * Page title
   */
  title: string
  /**
   * Optional page description
   */
  description?: string
  /**
   * Optional breadcrumbs navigation
   */
  breadcrumbs?: Array<{ label: string; href?: string }>
  /**
   * Optional action buttons/elements (rendered on the right side of header)
   */
  actions?: React.ReactNode
  /**
   * Page content
   */
  children: React.ReactNode
  /**
   * Custom className for the container
   */
  className?: string
}

export function PageContainer({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="px-4 md:px-6 py-3 border-b border-border">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <li key={index} className="flex items-center gap-2">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-smooth focus-ring rounded"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden={true} />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {/* Page Header */}
      <div className="px-4 md:px-6 py-6 border-b border-border bg-background">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 px-4 md:px-6 py-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
