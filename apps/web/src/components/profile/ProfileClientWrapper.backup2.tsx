'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ContentSections } from '@/components/profile/ContentSections'
import { MessagingPanel } from '@/components/messaging/MessagingPanel'
import { getConversationsForUser } from '@/lib/demo/messages'

export function ProfileClientWrapper({ user, translations, currentUser }: any) {
  const [showMessages, setShowMessages] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // ✅ ACTION: S'abonner
  const handleSubscribe = () => {
    if (isSubscribed) {
      toast.success('✅ Vous êtes déjà abonné à ' + user.name)
      return
    }

    // Simuler un abonnement
    setIsSubscribed(true)
    toast.success('🎉 Vous êtes maintenant abonné à ' + user.name + ' !')
  }

  // ✅ ACTION: Envoyer un tip
  const handleTip = () => {
    toast.info('💰 Fenêtre de pourboire (à implémenter)')
    // TODO: Ouvrir modal de tip
  }

  // ✅ ACTION: Ouvrir messagerie
  const handleMessage = () => {
    setShowMessages(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ 1. Header profil (sans bandeau) - directement en haut */}
      <ProfileHeader
        creator={{
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          stats: user.stats,
          isVerified: user.isVerified,
        }}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        onMessage={handleMessage}
        onTip={handleTip}
      />

      {/* ✅ 2. Sections de contenu organisées */}
      <ContentSections
        creator={{
          id: user.id,
          username: user.username,
          content: user.content,
        }}
      />

      {/* MESSAGERIE PANEL (OVERLAY avec backdrop) */}
      {showMessages && (
        <>
          {/* ✅ BACKDROP - Ferme au clic */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowMessages(false)}
            aria-label="Fermer la messagerie"
          />

          {/* ✅ PANEL - Ne se ferme PAS au clic */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <div
              className="w-full max-w-6xl h-[80vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MessagingPanel
                onClose={() => setShowMessages(false)}
                currentUser={currentUser}
                conversations={getConversationsForUser(currentUser.id)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
