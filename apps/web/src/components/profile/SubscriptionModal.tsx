'use client'

import { X, Star, Crown, MessageCircle, Sparkles, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  icon: 'fan' | 'vip' | 'qna'
  features: string[]
  gradient: string
  iconColor: string
  popular?: boolean
  commitment: string
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  tiers: SubscriptionTier[]
  onSelectTier: (tierId: string) => void
}

export function SubscriptionModal({
  isOpen,
  onClose,
  tiers,
  onSelectTier
}: SubscriptionModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)

  if (!isOpen) return null

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'fan':
        return <Star className="w-6 h-6 text-white" />
      case 'vip':
        return <Crown className="w-6 h-6 text-white" />
      case 'qna':
        return <MessageCircle className="w-6 h-6 text-white" />
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container - PLUS PETIT */}
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ========== Header Compact ========== */}
        <div className="relative bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] px-6 py-5 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Choisissez votre abonnement</h2>
          </div>
          <p className="text-white/90 text-sm">
            Accédez à du contenu exclusif et soutenez votre créateur
          </p>
        </div>

        {/* ========== Tiers Grid COMPACT ========== */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`relative border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col
                ${selectedTierId === tier.id
                  ? 'border-[#00B8A9] bg-[#00B8A9]/5 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={{ minHeight: '560px' }}
            >

              {/* Badge "Plus populaire" */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00B8A9] text-white text-xs font-bold rounded-full">
                  Plus populaire
                </div>
              )}

              {/* Icône */}
              <div className="flex flex-col items-center mb-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-md"
                  style={{ background: tier.gradient }}
                >
                  {getIcon(tier.icon)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-xs text-gray-600">Niveau {index + 1}</p>
              </div>

              {/* Prix */}
              <div className="text-center mb-3">
                <p className="text-4xl font-bold text-gray-900">€{tier.price}</p>
                <p className="text-sm text-gray-600">/mois</p>
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-center gap-1.5 mb-3 px-2 py-1.5 bg-gray-50 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-xs text-gray-600">{tier.commitment}</p>
              </div>

              {/* Features - flex-grow pousse le bouton en bas */}
              <ul className="space-y-2 mb-4 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#00B8A9] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Bouton - TOUJOURS EN BAS grâce à flex-grow */}
              <Button
                onClick={() => setSelectedTierId(tier.id)}
                className={`w-full h-11 text-sm font-semibold rounded-lg transition-all ${
                  selectedTierId === tier.id
                    ? 'bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {selectedTierId === tier.id ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Sélectionné
                  </span>
                ) : (
                  'Choisir'
                )}
              </Button>

            </div>
          ))}

        </div>

        {/* ========== Footer Compact ========== */}
        <div className="px-6 pb-6">
          <Button
            onClick={() => selectedTierId && onSelectTier(selectedTierId)}
            disabled={!selectedTierId}
            className="w-full bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] text-white font-semibold text-base py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {selectedTierId ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Continuer vers le paiement
              </span>
            ) : (
              'Sélectionnez un abonnement'
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
