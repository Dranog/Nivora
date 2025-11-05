'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Image as ImageIcon, Video, Lock, Unlock, Play } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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

export function ContentSections({ creator }: ContentSectionsProps) {
  const t = useTranslations('profile')
  const [activeTab, setActiveTab] = useState('all')

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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 1 : PHOTOS GRATUITES */}
      {/* ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Unlock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">📸 {t('content.freePhotos')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('content.freePhotosDescription')} ({freeContent.length})
              </p>
            </div>
          </div>

          {/* Tabs filter */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('content.all')}</TabsTrigger>
              <TabsTrigger value="recent">{t('content.recent')}</TabsTrigger>
              <TabsTrigger value="popular">{t('content.popular')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Grid photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {freeContent.length > 0 ? (
            freeContent.map((item) => (
              <button
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {item.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              Aucun contenu gratuit disponible
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 2 : CONTENU EXCLUSIF (Payant) */}
      {/* ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Lock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">🔒 {t('content.exclusiveContent')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('content.exclusiveContentDescription')} ({paidContent.length})
              </p>
            </div>
          </div>

          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            {t('content.subscriptionRequired')}
          </Badge>
        </div>

        {/* Grid contenu exclusif */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paidContent.length > 0 ? (
            paidContent.map((item) => (
              <button
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              >
                {/* Image floutée */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover blur-md"
                />

                {/* Overlay avec prix */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <Lock className="h-8 w-8 text-white" />
                  {item.price ? (
                    <div className="text-white font-bold text-xl">€{item.price}</div>
                  ) : (
                    <div className="text-white text-sm">Abonnement</div>
                  )}
                  {item.tier === 'vip' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                      VIP
                    </Badge>
                  )}
                </div>

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">
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
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              Aucun contenu exclusif disponible
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 3 : VIDÉOS */}
      {/* ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">🎥 {t('content.videos')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('content.videosDescription')} ({videos.length})
            </p>
          </div>
        </div>

        {/* Grid vidéos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.length > 0 ? (
            videos.map((item) => (
              <button
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className={`w-full h-full object-cover ${item.locked ? 'blur-sm' : ''}`}
                />

                {/* Play button ou Lock */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.locked ? (
                    <div className="flex flex-col items-center gap-2 bg-black/70 px-6 py-4 rounded-lg">
                      <Lock className="h-8 w-8 text-white" />
                      {item.price && (
                        <span className="text-white font-bold">€{item.price}</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-black ml-1" fill="black" />
                    </div>
                  )}
                </div>

                {/* Durée */}
                {!item.locked && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    12:34
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Aucune vidéo disponible
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
