'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { AboutSection } from '@/components/profile/AboutSection'
import { MediaTabs } from '@/components/profile/MediaTabs'
import { MessagingPanel } from '@/components/messaging/MessagingPanel'
import { SubscriptionModal } from '@/components/profile/SubscriptionModal'
import { getConversationsForUser } from '@/lib/demo/messages'

export function ProfileClientWrapper({ user, translations, currentUser }: any) {
  const router = useRouter()
  const [showMessages, setShowMessages] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

  // Données des tiers d'abonnement avec vraies offres (compact)
  const subscriptionTiers = [
    {
      id: 'fan',
      name: 'Fan',
      price: 9.99,
      icon: 'fan' as const,
      color: '#FFC107',
      iconColor: '#FFC107',
      gradient: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
      commitment: 'Engagement 1 mois min.',
      features: [
        'Accès posts publics',
        'Posts exclusifs Fan',
        'Likes illimités',
        'Réactions stories',
        'Accès anticipé'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 19.99,
      icon: 'vip' as const,
      color: '#9C27B0',
      iconColor: '#9C27B0',
      gradient: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 100%)',
      popular: true,
      commitment: 'Engagement 1 mois min.',
      features: [
        'Tout de Fan +',
        'Posts exclusifs VIP',
        'Messages privés',
        'Réponses prioritaires',
        'Vidéos HD exclusives',
        'Badge VIP Member'
      ]
    },
    {
      id: 'qna',
      name: 'Q&A Premium',
      price: 49.99,
      icon: 'qna' as const,
      color: '#00B8A9',
      iconColor: '#00B8A9',
      gradient: 'linear-gradient(135deg, #00D4C4 0%, #00B8A9 100%)',
      commitment: 'Engagement 3 mois min.',
      features: [
        'Tout de VIP +',
        'Session vidéo 1-on-1',
        'Vidéos personnalisées',
        'Accès anticipé 48h',
        'Contenu custom premium',
        'Badge Q&A Member',
        'Mention remerciements'
      ]
    }
  ]

  // ✅ ACTION: Suivre/Ne plus suivre
  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? 'Vous ne suivez plus ' + user.name : 'Vous suivez maintenant ' + user.name)
  }

  // ✅ ACTION: S'abonner (ouvre la modal)
  const handleSubscribe = () => {
    setIsSubscriptionModalOpen(true)
  }

  // ✅ ACTION: Sélectionner un tier d'abonnement
  const handleSelectTier = (tierId: string) => {
    console.log('Selected tier:', tierId)

    // Fermer modal
    setIsSubscriptionModalOpen(false)

    // Rediriger vers checkout
    router.push(`/checkout?tier=${tierId}&creator=${user.username}`)

    toast.success('Redirection vers le paiement...')
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
      {/* ✅ 1. Header profil compact avec bouton Suivre et S'abonner */}
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
        isFollowing={isFollowing}
        isSubscribed={isSubscribed}
        onFollow={handleFollow}
        onSubscribe={handleSubscribe}
        onMessage={handleMessage}
        onTip={handleTip}
      />

      {/* ✅ 2. About Section (toujours ouvert, 2 colonnes) */}
      <AboutSection
        creator={{
          bio: user.bio,
          offerings: user.offerings,
          createdAt: user.createdAt,
          postsCount: user.stats?.posts,
        }}
      />

      {/* ✅ 3. Media Tabs (Instagram Style) */}
      <MediaTabs
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

      {/* SUBSCRIPTION MODAL */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        tiers={subscriptionTiers}
        onSelectTier={handleSelectTier}
      />
    </div>
  )
}
