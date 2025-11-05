'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface WhatIOfferProps {
  creator: {
    offerings?: string[]
  }
}

export function WhatIOffer({ creator }: WhatIOfferProps) {
  const t = useTranslations('profile')
  const [expanded, setExpanded] = useState(false)

  const defaultOfferings = [
    'High-quality, unfiltered nudes & videos',
    'Fresh new content uploaded every single day',
    'First-in-line replies (priority messaging)',
    'Intimate 1-on-1 FaceTime',
    'Exclusive giveaways + VIP surprises',
    'Custom videos & photos made just for you',
    'Unlimited messaging & sexting',
    'Erotic voice notes & moans',
  ]

  const offerings = creator.offerings || defaultOfferings

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-card rounded-xl border p-6">
        {/* Header cliquable */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{t('whatIOffer.title')}</h2>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Contenu pliable */}
        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {offerings.map((offering, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{offering}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA si collapsed */}
        {!expanded && (
          <p className="text-sm text-muted-foreground">
            {t('whatIOffer.preview')}{' '}
            <button
              onClick={() => setExpanded(true)}
              className="ml-1 text-primary hover:underline"
            >
              {t('whatIOffer.showMore')}
            </button>
          </p>
        )}
      </div>
    </section>
  )
}
