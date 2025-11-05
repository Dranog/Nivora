'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, DollarSign, Lock } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Media {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  isLocked: boolean
  price?: number
  isVip?: boolean
  caption?: string
  likesCount?: number
  commentsCount?: number
}

interface MediaModalProps {
  medias: Media[]
  initialIndex: number
  onClose: () => void
}

export function MediaModal({ medias, initialIndex, onClose }: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const currentMedia = medias[currentIndex]

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : medias.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < medias.length - 1 ? prev + 1 : 0))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">

          {/* ══════════════════════════════════════ */}
          {/* GAUCHE : IMAGE/VIDEO VIEWER */}
          {/* ══════════════════════════════════════ */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation buttons */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {currentIndex < medias.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Media display */}
            {currentMedia.isLocked ? (
              // Média verrouillé
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={currentMedia.thumbnailUrl}
                  alt=""
                  className="max-w-full max-h-full object-contain blur-lg"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Lock className="h-16 w-16 text-white" />
                  <p className="text-white text-3xl font-bold">€{currentMedia.price}</p>
                  {currentMedia.isVip && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-lg px-4 py-2">
                      VIP Exclusif
                    </Badge>
                  )}
                  <Button size="lg" className="mt-4">
                    <Lock className="mr-2" />
                    Déverrouiller
                  </Button>
                </div>
              </div>
            ) : currentMedia.type === 'video' ? (
              // Vidéo
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              // Image
              <img
                src={currentMedia.url}
                alt={currentMedia.caption}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {medias.length}
            </div>
          </div>

          {/* ══════════════════════════════════════ */}
          {/* DROITE : SIDEBAR INFO (style Instagram) */}
          {/* ══════════════════════════════════════ */}
          <div className="w-96 bg-card flex flex-col border-l">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div>
                <p className="font-semibold">Jon Kelly</p>
                <p className="text-xs text-muted-foreground">@jon-kelly</p>
              </div>
            </div>

            {/* Caption */}
            <div className="flex-1 p-4 overflow-y-auto">
              {currentMedia.caption && (
                <div className="mb-4">
                  <p className="text-sm">{currentMedia.caption}</p>
                </div>
              )}

              {/* Stats */}
              {!currentMedia.isLocked && (
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <span>❤️ {currentMedia.likesCount || 0} likes</span>
                  <span>💬 {currentMedia.commentsCount || 0} commentaires</span>
                </div>
              )}

              {/* Comments section (optionnel) */}
              <div className="space-y-3">
                {/* Comments ici si nécessaire */}
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t space-y-2">
              <Button className="w-full" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Envoyer un Tip
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
