// path: apps/web/src/components/media/ProtectedImage.tsx
/**
 * ProtectedImage — F5 Anti-Leak
 * Image Next.js + options de protection (watermark, anti-clic droit, anti-drag, blur teaser).
 */
'use client'

import { useState, type MouseEvent, type DragEvent } from 'react'
import Image from 'next/image'
import type { WatermarkConfig } from '@/types/protection'
import { WatermarkOverlay } from './WatermarkOverlay'
import { cn } from '@/lib/utils'

type ProtectedImageProps = {
  src: string
  alt: string
  userId: string
  username: string
  locked?: boolean
  watermarkConfig?: WatermarkConfig
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
}

export function ProtectedImage({
  src,
  alt,
  userId,
  username,
  locked = false,
  watermarkConfig,
  className,
  width,
  height,
  fill = false,
  priority = false,
}: ProtectedImageProps) {
  const [hasError, setHasError] = useState(false)

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
  }

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault()
  }

  if (hasError) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}
        style={{ width, height }}
        role="img"
        aria-label="Failed to load image"
      >
        <p className="text-sm">Failed to load image</p>
      </div>
    )
  }

  return (
    <figure
      className={cn('relative overflow-hidden', className)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    >
      {/* Image (teaser blur si locked) */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        draggable={false}
        onError={() => setHasError(true)}
        className={cn('select-none', locked && 'blur-[20px]', fill && 'object-cover')}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      />

      {/* Watermark visible uniquement si non verrouillé */}
      {!locked && (
        <WatermarkOverlay userId={userId} username={username} config={watermarkConfig} />
      )}

      {/* Bandeau verrouillé */}
      {locked && (
        <figcaption className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="text-center text-white">
            <svg className="mx-auto mb-2 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden={true}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-medium">Locked Content</p>
          </div>
        </figcaption>
      )}

      {/* Calque empêchant la sélection */}
      <div
        className="pointer-events-none absolute inset-0 select-none"
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
        aria-hidden={true}
      />
    </figure>
  )
}
