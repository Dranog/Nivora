'use client'

import { useTranslations } from 'next-intl'
import { Lock, Image as ImageIcon, Video } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LockedMedia } from '@/types/media'

interface PurchaseMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: LockedMedia
  onPurchase: () => Promise<void>
  isPurchasing: boolean
}

export function PurchaseMediaDialog({
  open,
  onOpenChange,
  media,
  onPurchase,
  isPurchasing,
}: PurchaseMediaDialogProps) {
  const t = useTranslations('messages')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('media.unlockTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('media.unlockDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Preview floué */}
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={media.blurredUrl}
            alt="Preview"
            className="w-full h-48 object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {media.type === 'image' ? (
              <ImageIcon className="h-12 w-12 text-white" />
            ) : (
              <Video className="h-12 w-12 text-white" />
            )}
          </div>
        </div>

        {/* Détails */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('media.type')}
            </span>
            <Badge variant="outline">
              {media.type === 'image' ? t('media.photo') : t('media.video')}
            </Badge>
          </div>

          {media.isVip && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('media.access')}
              </span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                VIP
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-semibold">{t('media.price')}</span>
            <span className="text-2xl font-bold">€{media.price}</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPurchasing}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={onPurchase}
            disabled={isPurchasing}
            className="w-full sm:w-auto"
          >
            {isPurchasing ? t('common.processing') : t('media.confirmPurchase')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
