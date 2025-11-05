'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lock, Unlock, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PurchaseMediaDialog } from './PurchaseMediaDialog'
import { LockedMedia as LockedMediaType } from '@/types/media'

interface LockedMediaProps {
  media: LockedMediaType
  onPurchaseComplete: (mediaId: string) => void
}

export function LockedMedia({ media, onPurchaseComplete }: LockedMediaProps) {
  const t = useTranslations('messages')
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true)

      // Appel API pour acheter le média
      const response = await fetch('/api/purchases/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: media.id,
          creatorId: media.creatorId,
        }),
      })

      if (!response.ok) throw new Error('Purchase failed')

      const data = await response.json()

      toast.success(t('media.purchaseSuccess'), {
        description: t('media.purchaseSuccessDescription'),
      })

      setShowPurchaseDialog(false)
      onPurchaseComplete(media.id)
    } catch (error) {
      toast.error(t('media.purchaseError'), {
        description: t('media.purchaseErrorDescription'),
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  // Si déjà acheté, afficher le média complet
  if (media.isPurchased) {
    return (
      <div className="relative rounded-lg overflow-hidden group">
        {media.type === 'image' ? (
          <img
            src={media.fullUrl}
            alt="Purchased media"
            className="w-full h-auto"
          />
        ) : (
          <video
            src={media.fullUrl}
            controls
            className="w-full h-auto"
          />
        )}

        {/* Badge acheté */}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Unlock className="h-3 w-3" />
          {t('media.purchased')}
        </div>

        {/* Date d'achat */}
        {media.purchasedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('media.purchasedOn', {
              date: new Date(media.purchasedAt).toLocaleDateString()
            })}
          </p>
        )}
      </div>
    )
  }

  // Média verrouillé
  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setShowPurchaseDialog(true)}
      >
        {/* Image/Video floué */}
        <div className="relative">
          {media.type === 'image' ? (
            <img
              src={media.blurredUrl}
              alt="Locked media"
              className="w-full h-auto blur-md"
            />
          ) : (
            <div className="relative">
              <img
                src={media.blurredUrl}
                alt="Locked video"
                className="w-full h-auto blur-md"
              />
              <Play className="absolute inset-0 m-auto h-12 w-12 text-white opacity-50" />
            </div>
          )}

          {/* Overlay avec prix */}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Lock className="h-8 w-8 text-white" />
            <div className="text-white font-bold text-2xl">
              €{media.price}
            </div>
            {media.isVip && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                VIP
              </Badge>
            )}
            <Button
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation()
                setShowPurchaseDialog(true)
              }}
            >
              {t('media.unlock')}
            </Button>
          </div>
        </div>

        {/* Type de média */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary">
            {media.type === 'image' ? t('media.photo') : t('media.video')}
          </Badge>
        </div>
      </div>

      {/* Dialog d'achat */}
      <PurchaseMediaDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        media={media}
        onPurchase={handlePurchase}
        isPurchasing={isPurchasing}
      />
    </>
  )
}
