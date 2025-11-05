'use client'

import { useTranslations } from 'next-intl'
import { Crown, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SubscriptionsSectionProps {
  creator: {
    id: string
    username: string
  }
  onSubscribe?: (tierId: string) => void
}

export function SubscriptionsSection({ creator, onSubscribe }: SubscriptionsSectionProps) {
  const t = useTranslations('profile')

  const subscriptionTiers = [
    {
      id: 'fan',
      name: 'Fan',
      price: 9.99,
      description: 'Accès de base',
      icon: Star,
      features: [
        'Accès aux posts gratuits',
        'Commentaires',
        'Messages privés',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'vip',
      name: 'VIP Tutorial',
      price: 19.99,
      description: 'Accès premium',
      icon: Crown,
      badge: 'Plus populaire',
      features: [
        'Tout du plan Fan',
        'Contenu exclusif',
        'Vidéos premium',
        'Réponses prioritaires',
      ],
      color: 'from-yellow-400 to-orange-500',
      highlight: true,
    },
    {
      id: 'qna',
      name: 'Q&A Session',
      price: 49.99,
      description: 'Accès complet',
      icon: Zap,
      features: [
        'Tout du plan VIP',
        'Sessions Q&A privées',
        'Coaching 1-on-1',
        'Contenu sur mesure',
      ],
      color: 'from-purple-500 to-pink-500',
    },
  ]

  const handleSubscribe = (tierId: string, tierName: string) => {
    if (onSubscribe) {
      onSubscribe(tierId)
    } else {
      toast.success(`🎉 Abonnement ${tierName} activé !`)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">📦 {t('subscriptions.title')}</h2>
        <p className="text-muted-foreground">
          {t('subscriptions.description')}
        </p>
      </div>

      {/* Grid d'abonnements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                tier.highlight
                  ? 'border-primary shadow-md scale-105'
                  : 'border-border'
              }`}
            >
              {/* Badge "Plus populaire" */}
              {tier.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500">
                  🔥 {tier.badge}
                </Badge>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tier.color} mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Titre + Prix */}
              <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>

              <div className="mb-4">
                <span className="text-3xl font-bold">€{tier.price}</span>
                <span className="text-muted-foreground">/mois</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className={`w-full ${
                  tier.highlight
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    : ''
                }`}
                variant={tier.highlight ? 'default' : 'outline'}
                onClick={() => handleSubscribe(tier.id, tier.name)}
              >
                {t('subscriptions.subscribe')}
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
