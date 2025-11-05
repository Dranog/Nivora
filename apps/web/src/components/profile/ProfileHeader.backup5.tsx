'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle, DollarSign, Heart, Crown, Star, Zap } from 'lucide-react'
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

  // Plans d'abonnements ultra-concis
  const subscriptionPlans = [
    { icon: Star, name: 'Fan', price: 9.99, color: 'from-blue-500 to-cyan-500' },
    { icon: Crown, name: 'VIP', price: 19.99, color: 'from-yellow-400 to-orange-500' },
    { icon: Zap, name: 'Q&A', price: 49.99, color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <div className="relative">
      {/* Background gradient subtil (optionnel) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-48" />

      {/* ✅ Card profil HORIZONTALE */}
      <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="bg-card rounded-2xl shadow-lg p-6 border">

          {/* ✅ LAYOUT HORIZONTAL : flex-row */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

            {/* ──────────────────────────────────────── */}
            {/* COLONNE 1 : AVATAR + BADGE (à gauche) */}
            {/* ──────────────────────────────────────── */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {/* Avatar */}
              <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-xl">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback className="text-3xl">
                  {creator.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Badge Gold Creator */}
              {creator.isVerified && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 whitespace-nowrap">
                  ⭐ Gold Creator
                </Badge>
              )}
            </div>

            {/* ──────────────────────────────────────── */}
            {/* COLONNE 2 : INFO + BIO (au centre) */}
            {/* ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Nom + Username */}
              <h1 className="text-3xl font-bold mb-1">{creator.name}</h1>
              <p className="text-muted-foreground mb-4">@{creator.username}</p>

              {/* Bio */}
              {creator.bio && (
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {creator.bio}
                </p>
              )}

              {/* ✅ CHIPS ABONNEMENTS INLINE (ultra-concis) */}
              <div className="flex flex-wrap gap-2 mb-4">
                {subscriptionPlans.map((plan) => {
                  const Icon = plan.icon
                  return (
                    <Badge
                      key={plan.name}
                      variant="outline"
                      className="px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-medium">{plan.name}</span>
                      <span className="ml-1.5 text-muted-foreground">€{plan.price}</span>
                    </Badge>
                  )
                })}
              </div>

              {/* Actions Buttons */}
              <div className="flex flex-wrap gap-3">
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
                  <Badge variant="secondary" className="text-base px-4 py-2">
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

            {/* ✅ COLONNE 3 SUPPRIMÉE (stats) */}

          </div>
        </div>
      </div>
    </div>
  )
}
