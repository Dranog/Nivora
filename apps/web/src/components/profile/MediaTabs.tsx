'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Image as ImageIcon, Video, Grid3x3 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MediaGrid } from './MediaGrid'

interface MediaTabsProps {
  creator: {
    id: string
    username: string
    content?: any[]
  }
}

export function MediaTabs({ creator }: MediaTabsProps) {
  const t = useTranslations('profile')
  const [activeTab, setActiveTab] = useState('all')

  // Transform content to Media format
  const content = creator.content || []

  // Fusionner photos gratuites + exclusives
  const allPhotos = content
    .filter((c: any) => c.type === 'image')
    .map((c: any) => ({
      id: c.id,
      type: 'image' as const,
      url: c.url || c.thumbnail,
      thumbnailUrl: c.thumbnail || c.url,
      isLocked: c.locked || false,
      price: c.price,
      isVip: c.tier === 'vip',
      caption: c.title,
      likesCount: c.likes || 0,
      commentsCount: c.comments || 0,
    }))

  const allVideos = content
    .filter((c: any) => c.type === 'video')
    .map((c: any) => ({
      id: c.id,
      type: 'video' as const,
      url: c.url || c.thumbnail,
      thumbnailUrl: c.thumbnail || c.url,
      isLocked: c.locked || false,
      price: c.price,
      isVip: c.tier === 'vip',
      caption: c.title,
      likesCount: c.likes || 0,
      commentsCount: c.comments || 0,
    }))

  const allMedia = [...allPhotos, ...allVideos]

  return (
    <section className="max-w-6xl mx-auto px-4">
      {/* Tabs (style Instagram) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-center border-t">
          <TabsTrigger
            value="all"
            className="flex-1 max-w-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B8A9] data-[state=active]:to-[#00D4C4] data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            {t('mediaTabs.all')}
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="flex-1 max-w-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B8A9] data-[state=active]:to-[#00D4C4] data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {t('mediaTabs.photos')}
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="flex-1 max-w-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B8A9] data-[state=active]:to-[#00D4C4] data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Video className="h-4 w-4 mr-2" />
            {t('mediaTabs.videos')}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tout */}
        <TabsContent value="all" className="mt-0 pt-4">
          <MediaGrid medias={allMedia} />
        </TabsContent>

        {/* Tab: Photos */}
        <TabsContent value="photos" className="mt-0 pt-4">
          <MediaGrid medias={allPhotos} />
        </TabsContent>

        {/* Tab: Vidéos */}
        <TabsContent value="videos" className="mt-0 pt-4">
          <MediaGrid medias={allVideos} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
