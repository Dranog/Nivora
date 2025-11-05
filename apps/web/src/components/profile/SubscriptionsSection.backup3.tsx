'use client'

import { useTranslations } from 'next-intl'
import { Crown, Star, Zap, Check } from 'lucide-react'
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

      {/* ✅ LISTE VERTICALE (space-y-4 au lieu de grid) */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                tier.highlight
                  ? 'border-primary shadow-md bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              {/* Badge "Plus populaire" (en haut à droite) */}
              {tier.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500">
                  🔥 {tier.badge}
                </Badge>
              )}

              {/* Layout horizontal : Icon + Content + Price + Button */}
              <div className="flex flex-col md:flex-row items-start gap-4">

                {/* Icon à gauche */}
                <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${tier.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  {/* Titre + Description */}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tier.description}
                  </p>

                  {/* Features (horizontal chips) */}
                  <div className="flex flex-wrap gap-2">
                    {tier.features.map((feature, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm"
                      >
                        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prix + Button à droite */}
                <div className="flex-shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
                  {/* Prix */}
                  <div className="text-right">
                    <div className="text-2xl font-bold">€{tier.price}</div>
                    <div className="text-xs text-muted-foreground">/mois</div>
                  </div>

                  {/* Button */}
                  <Button
                    className={`w-full md:w-auto ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                        : ''
                    }`}
                    variant={tier.highlight ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSubscribe(tier.id, tier.name)}
                  >
                    {t('subscriptions.subscribe')}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
