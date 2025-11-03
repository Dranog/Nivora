'use client'

import { Pause, Check, X, RotateCcw, Image } from 'lucide-react'
import { Card } from '@/components/ui/card'

export type UploadStatus = 'uploading' | 'watermarking' | 'complete' | 'failed'

export interface UploadItem {
  id: string
  name: string
  size: string
  progress: number
  status: UploadStatus
}

interface UploadProgressProps {
  uploads: UploadItem[]
}

export function UploadProgress({ uploads }: UploadProgressProps) {
  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'uploading':
      case 'watermarking':
        return 'bg-blue-500'
      case 'complete':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-muted'
    }
  }

  const getStatusText = (item: UploadItem) => {
    switch (item.status) {
      case 'uploading':
        return `${item.progress}% in`
      case 'watermarking':
        return 'Adding watermark... ~30min'
      case 'complete':
        return 'Complete'
      case 'failed':
        return 'Upload failed'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploading':
        return <Pause className="w-4 h-4" />
      case 'watermarking':
        return <Pause className="w-4 h-4" />
      case 'complete':
        return <Check className="w-4 h-4" />
      case 'failed':
        return <RotateCcw className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-sm font-medium mb-4">
        <span>Uploading</span>
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
          {uploads.length}
        </span>
      </div>

      <div className="space-y-2">
        {uploads.map((item) => (
          <div
            key={item.id}
            className="relative bg-background border border-border rounded-lg overflow-hidden"
          >
            {/* Thumbnail/Icon */}
            <div className="absolute left-3 top-3 w-12 h-12 bg-muted rounded flex items-center justify-center">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="pl-20 pr-12 py-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {(item.status === 'uploading' || item.status === 'watermarking') && (
                <div className="mt-2 mb-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(item.status)} transition-all duration-300`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Text */}
              <div className="flex items-center justify-between mt-1">
                <p
                  className={`text-xs font-medium ${
                    item.status === 'failed'
                      ? 'text-red-500'
                      : item.status === 'complete'
                      ? 'text-green-500'
                      : 'text-blue-500'
                  }`}
                >
                  {getStatusText(item)}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="absolute right-3 top-3">
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${
                    item.status === 'failed'
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      : item.status === 'complete'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                  }
                `}
              >
                {getStatusIcon(item.status)}
              </button>
            </div>

            {/* Status Badge (for failed/complete) */}
            {item.status === 'failed' && (
              <div className="absolute right-3 bottom-3">
                <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">
                  Retry
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
