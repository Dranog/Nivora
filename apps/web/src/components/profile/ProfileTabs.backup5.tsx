'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ContentSections } from './ContentSections'

interface ProfileTabsProps {
  creator: {
    id: string
    username: string
    bio?: string
    content?: any[]
  }
}

export function ProfileTabs({ creator }: ProfileTabsProps) {
  const t = useTranslations('profile')
  const [activeTab, setActiveTab] = useState('posts')

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tabs Header */}
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
          >
            {t('tabs.posts')}
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
          >
            {t('tabs.media')}
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
          >
            {t('tabs.about')}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Posts */}
        <TabsContent value="posts" className="mt-6">
          {/* Timeline des posts (texte + images) */}
          <PostsTimeline creator={creator} />
        </TabsContent>

        {/* Tab: Media */}
        <TabsContent value="media" className="mt-6">
          {/* Grid photos/vidéos uniquement */}
          <MediaGrid creator={creator} />
        </TabsContent>

        {/* Tab: About */}
        <TabsContent value="about" className="mt-6">
          {/* Bio détaillée, réseaux sociaux, etc. */}
          <AboutSection creator={creator} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

// Placeholder components - reuse existing ContentSections for now
function PostsTimeline({ creator }: any) {
  return (
    <div className="space-y-6">
      {/* Reuse existing ContentSections component temporarily */}
      <ContentSections creator={creator} />
    </div>
  )
}

function MediaGrid({ creator }: any) {
  const content = creator.content || []
  const mediaOnly = content.filter((c: any) => c.type === 'image' || c.type === 'video')

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaOnly.map((media: any, index: number) => (
        <div
          key={index}
          className="aspect-square rounded-lg overflow-hidden bg-muted relative group cursor-pointer"
        >
          {media.type === 'image' ? (
            <img
              src={media.url || media.thumbnail}
              alt={media.title || 'Media'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <span className="text-white text-4xl">▶</span>
            </div>
          )}
          {media.locked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl">🔒</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AboutSection({ creator }: any) {
  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">About {creator.username}</h3>
        <p className="text-muted-foreground">
          {creator.bio || 'No bio available yet.'}
        </p>
      </div>

      {/* Social Links placeholder */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Social Links</h4>
        <div className="flex gap-3">
          {/* Add social links here */}
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </div>
      </div>

      {/* Stats placeholder */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Joined</h4>
        <p className="text-sm text-muted-foreground">Member since 2024</p>
      </div>
    </div>
  )
}
