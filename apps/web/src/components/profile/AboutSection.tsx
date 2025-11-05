'use client'

import { useTranslations } from 'next-intl'
import { User, Gift } from 'lucide-react'

interface AboutSectionProps {
  creator: {
    bio?: string
    offerings?: string[]
    createdAt?: Date | string
    postsCount?: number
  }
}

export function AboutSection({ creator }: AboutSectionProps) {
  const t = useTranslations('profile.about')

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
    <section className="w-full max-w-5xl mx-auto px-4 py-3">

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#00B8A9]/5 via-white/50 to-[#00D4C4]/5 border border-[#00B8A9]/20 p-5 shadow-sm hover:shadow-md transition-shadow">

        {/* Grid 2 colonnes - DIRECTEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Qui je suis */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B8A9] to-[#00D4C4] flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">{t('whoIAm')}</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {creator.bio || 'Fitness coach & nutrition expert 💪 Helping you achieve your goals 🔥'}
            </p>
          </div>

          {/* Ce que j'offre */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFC107] flex items-center justify-center shadow-sm">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">{t('whatIOffer')}</h4>
            </div>
            <ul className="space-y-1.5">
              {offerings.slice(0, 4).map((offer, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-[#00B8A9] font-bold mt-0.5">•</span>
                  <span className="line-clamp-1">{offer}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </section>
  )
}
