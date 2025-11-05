'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  Image as ImageIcon,
  Video,
  Lock,
  Unlock,
  Play,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ContentItem {
  id: string
  type: 'image' | 'video'
  thumbnail: string
  title: string
  tier: 'free' | 'fan' | 'vip' | 'exclusive'
  locked: boolean
  price?: number
  likes: number
  comments: number
}

interface ContentSectionsProps {
  creator: {
    id: string
    username: string
    content?: ContentItem[]
  }
}

// Carousel scrollable component
function MediaCarousel({
  medias,
  locked = false,
  onItemClick,
}: {
  medias: ContentItem[]
  locked?: boolean
  onItemClick: (item: ContentItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  if (medias.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun contenu disponible
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Navigation buttons */}
      <div className="absolute -top-12 right-0 flex gap-2 z-10">
        <Button variant="outline" size="icon" onClick={() => scroll('left')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => scroll('right')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {medias.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-64 snap-start">
            {locked || item.locked ? (
              <LockedMediaCard item={item} onClick={onItemClick} />
            ) : (
              <UnlockedMediaCard item={item} onClick={onItemClick} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Locked media card with visible unlock button
function LockedMediaCard({
  item,
  onClick,
}: {
  item: ContentItem
  onClick: (item: ContentItem) => void
}) {
  return (
    <button
      onClick={() => onClick(item)}
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer w-full group"
    >
      {/* Blurred image */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover blur-md"
      />

      {/* Overlay ALWAYS VISIBLE (not just on hover) */}
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
        <Lock className="h-10 w-10 text-white" />

        {/* Price */}
        {item.price ? (
          <div className="text-white font-bold text-2xl">€{item.price}</div>
        ) : (
          <div className="text-white text-sm">Abonnement</div>
        )}

        {/* VIP Badge */}
        {item.tier === 'vip' && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">VIP</Badge>
        )}

        {/* UNLOCK BUTTON ALWAYS VISIBLE */}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={(e) => {
            e.stopPropagation()
            onClick(item)
          }}
        >
          <Lock className="mr-2 h-4 w-4" />
          Déverrouiller
        </Button>
      </div>

      {/* Type badge */}
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="bg-black/80 text-white">
          {item.type === 'video' ? (
            <>
              <Video className="h-3 w-3 mr-1" /> Vidéo
            </>
          ) : (
            <>
              <ImageIcon className="h-3 w-3 mr-1" /> Photo
            </>
          )}
        </Badge>
      </div>
    </button>
  )
}

// Unlocked media card
function UnlockedMediaCard({
  item,
  onClick,
}: {
  item: ContentItem
  onClick: (item: ContentItem) => void
}) {
  return (
    <button
      onClick={() => onClick(item)}
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer w-full group"
    >
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-black ml-1" fill="black" />
          </div>
        </div>
      )}
    </button>
  )
}

export function ContentSections({ creator }: ContentSectionsProps) {
  const t = useTranslations('profile')

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    free: true, // Open by default
    exclusive: false,
    videos: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const content = creator.content || []
  const freeContent = content.filter((c) => !c.locked && c.tier === 'free')
  const paidContent = content.filter((c) => c.locked || c.tier !== 'free')
  const videos = content.filter((c) => c.type === 'video')

  const handleContentClick = (item: ContentItem) => {
    if (item.locked) {
      if (item.price) {
        toast.info(`💎 Débloquez ce contenu pour €${item.price}`)
      } else {
        toast.info('🔒 Abonnement requis pour débloquer ce contenu')
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ══════════════════════════════════════ */}
      {/* SECTION 1 : PHOTOS GRATUITES */}
      {/* ══════════════════════════════════════ */}
      <section>
        {/* Header cliquable */}
        <button
          onClick={() => toggleSection('free')}
          className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Unlock className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">📸 {t('content.freePhotos')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('content.freePhotosDescription')} ({freeContent.length})
              </p>
            </div>
          </div>

          {expandedSections.free ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>

        {/* Contenu (collapsible) */}
        {expandedSections.free && (
          <MediaCarousel
            medias={freeContent}
            locked={false}
            onItemClick={handleContentClick}
          />
        )}
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 2 : CONTENU EXCLUSIF */}
      {/* ══════════════════════════════════════ */}
      <section>
        <button
          onClick={() => toggleSection('exclusive')}
          className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Lock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">🔒 {t('content.exclusiveContent')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('content.exclusiveContentDescription')} ({paidContent.length})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              {t('content.subscriptionRequired')}
            </Badge>
            {expandedSections.exclusive ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </div>
        </button>

        {expandedSections.exclusive && (
          <MediaCarousel
            medias={paidContent}
            locked={true}
            onItemClick={handleContentClick}
          />
        )}
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SECTION 3 : VIDÉOS */}
      {/* ══════════════════════════════════════ */}
      <section>
        <button
          onClick={() => toggleSection('videos')}
          className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">🎥 {t('content.videos')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('content.videosDescription')} ({videos.length})
              </p>
            </div>
          </div>

          {expandedSections.videos ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>

        {expandedSections.videos && (
          <MediaCarousel medias={videos} locked={false} onItemClick={handleContentClick} />
        )}
      </section>
    </div>
  )
}
