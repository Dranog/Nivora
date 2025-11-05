'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle, DollarSign, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProfileHeaderProps {
  creator: {
    id: string
    name: string
    username: string
    avatar: string
    role: string
    bio?: string
    stats?: {
      followers?: number
      likes?: number
      posts?: number
    }
    isVerified?: boolean
  }
  isSubscribed?: boolean
  onSubscribe?: () => void
  onMessage?: () => void
  onTip?: () => void
}

export function ProfileHeader({ creator, isSubscribed, onSubscribe, onMessage, onTip }: ProfileHeaderProps) {
  const t = useTranslations('profile')

  return (
    <div className="relative">
      {/* Background gradient subtil (optionnel) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-48" />

      {/* Card profil centrée */}
      <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-6">
        <div className="bg-card rounded-2xl shadow-lg p-6 border">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-xl">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="text-3xl">
                {creator.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Badge Gold Creator */}
            {creator.isVerified && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 mb-3">
                ⭐ Gold Creator
              </Badge>
            )}

            {/* Nom + Username */}
            <h1 className="text-3xl font-bold mb-1">{creator.name}</h1>
            <p className="text-muted-foreground mb-4">@{creator.username}</p>

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div>
                <p className="text-2xl font-bold">{creator.stats?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">{t('creator.followers')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{creator.stats?.likes || 0}</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{creator.stats?.posts || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>

            {/* Bio */}
            {creator.bio && (
              <p className="text-center max-w-2xl mb-6 text-muted-foreground">
                {creator.bio}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {!isSubscribed ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={onSubscribe}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  {t('creator.subscribe')}
                </Button>
              ) : (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  ✓ {t('creator.subscribed')}
                </Badge>
              )}

              <Button variant="outline" size="lg" onClick={onMessage}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Message
              </Button>

              <Button variant="outline" size="lg" onClick={onTip}>
                <DollarSign className="mr-2 h-5 w-5" />
                Tip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
