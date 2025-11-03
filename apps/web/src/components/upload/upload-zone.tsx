'use client'

import { useCallback, useState } from 'react'
import { Cloud, Upload } from 'lucide-react'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      onFilesSelected(filesArray.slice(0, 10)) // Max 10 files
    }
  }, [onFilesSelected])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      onFilesSelected(filesArray.slice(0, 10)) // Max 10 files
    }
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
        ${isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
        }
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        onChange={handleFileInput}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Cloud className="w-8 h-8 text-primary" />
        </div>

        <div>
          <p className="text-lg font-medium mb-1">
            Drag & drop you files here
          </p>
          <label
            htmlFor="file-upload"
            className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          >
            (or click to browse)
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WEBP, MP4, WEBM · Max 10 files · 15MB images / av
        </p>
      </div>
    </div>
  )
}
