'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle, DollarSign, Heart, UserPlus, UserCheck } from 'lucide-react'
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
  isFollowing?: boolean
  isSubscribed?: boolean
  onFollow?: () => void
  onSubscribe?: () => void
  onMessage?: () => void
  onTip?: () => void
}

export function ProfileHeader({ creator, isFollowing, isSubscribed, onFollow, onSubscribe, onMessage, onTip }: ProfileHeaderProps) {
  const t = useTranslations('profile')

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
                <Badge className="bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] text-white border-none whitespace-nowrap">
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

              {/* Actions Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Bouton Suivre - Turquoise solid/outline */}
                <Button
                  onClick={onFollow}
                  variant={isFollowing ? "outline" : "default"}
                  size="lg"
                  className={
                    isFollowing
                      ? "border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9]/10"
                      : "bg-[#00B8A9] text-white hover:bg-[#009B8E]"
                  }
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Suivi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Suivre
                    </>
                  )}
                </Button>

                {/* Bouton S'abonner - Gradient turquoise (CTA principal) */}
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] hover:from-[#009B8E] hover:to-[#00B8A9] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={onSubscribe}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {t('creator.subscribe')}
                </Button>

                {/* Bouton Message - Turquoise outline */}
                <Button variant="outline" size="lg" onClick={onMessage} className="border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9]/10">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>

                {/* Bouton Tip - Turquoise outline */}
                <Button variant="outline" size="lg" onClick={onTip} className="border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9]/10">
                  <DollarSign className="mr-2 h-4 w-4" />
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
