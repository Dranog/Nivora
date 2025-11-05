'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MediaModal } from './MediaModal'

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

interface MediaGridProps {
  medias: Media[]
}

export function MediaGrid({ medias }: MediaGridProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)

  return (
    <>
      {/* Grid 3 colonnes (comme Instagram) */}
      <div className="grid grid-cols-3 gap-1">
        {medias.map((media, index) => (
          <div
            key={media.id}
            className="relative aspect-square cursor-pointer group overflow-hidden"
            onClick={() => setSelectedMediaIndex(index)}
          >
            {/* Thumbnail */}
            <img
              src={media.thumbnailUrl}
              alt=""
              className={`w-full h-full object-cover ${
                media.isLocked ? 'blur-sm' : ''
              } group-hover:scale-105 transition-transform duration-300`}
            />

            {/* Overlay au hover (stats) */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-4 text-white opacity-0 group-hover:opacity-100">
              {!media.isLocked && (
                <>
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span className="font-semibold">{media.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span className="font-semibold">{media.commentsCount || 0}</span>
                  </div>
                </>
              )}
            </div>

            {/* Si verrouillé : overlay permanent */}
            {media.isLocked && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <Lock className="h-8 w-8 text-[#00B8A9]" />
                <span className="text-white font-bold text-lg">€{media.price}</span>
                {media.isVip && (
                  <Badge className="bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] text-white border-none">
                    VIP
                  </Badge>
                )}
              </div>
            )}

            {/* Badge type (vidéo) */}
            {media.type === 'video' && (
              <div className="absolute top-2 right-2">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  🎥 VIDEO
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal (ouvre quand on clique) */}
      {selectedMediaIndex !== null && (
        <MediaModal
          medias={medias}
          initialIndex={selectedMediaIndex}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </>
  )
}
