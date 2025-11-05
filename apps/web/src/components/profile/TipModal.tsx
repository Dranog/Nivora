'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { DollarSign, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout'

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
  onTipSuccess?: (tipComment: any) => void // Callback pour mode simulation
}

const QUICK_AMOUNTS = [5, 10, 20, 50]

export function TipModal({ isOpen, onClose, recipientId, recipientName, onTipSuccess }: TipModalProps) {
  const t = useTranslations('profile.tipModal')
  const [amount, setAmount] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createTipCheckout } = useCCBillCheckout()

  const handleClose = () => {
    setAmount('')
    setMessage('')
    onClose()
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    // 🧪 MODE SIMULATION - Si onTipSuccess fourni, on utilise le mode test
    if (onTipSuccess) {
      setIsSubmitting(true)

      // Simuler délai API (1 seconde)
      setTimeout(() => {
        // User connecté (simulation)
        const currentUser = {
          id: 'current-user-id',
          name: 'Vous',
          username: 'votre-pseudo',
          avatar: '/default-avatar.jpg',
        }

        // Créer un commentaire de type "tip"
        const tipComment = {
          id: `tip-${Date.now()}`,
          type: 'tip',
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          content: `A envoyé un tip de ${parsedAmount}€`,
          createdAt: new Date(),
          tipAmount: parsedAmount,
          tipMessage: message.trim() || null,
          isCreator: false,
        }

        // Envoyer au parent (MediaModal)
        onTipSuccess(tipComment)

        // Success toast
        toast.success(`🎉 Tip de ${parsedAmount}€ envoyé à ${recipientName} !`)

        // Reset form et fermer
        setIsSubmitting(false)
        handleClose()
      }, 1000)
    } else {
      // Mode CCBill - Redirection vers CCBill
      setIsSubmitting(true)
      try {
        await createTipCheckout(recipientId, parsedAmount, message.trim() || undefined)
        // La redirection vers CCBill se fait automatiquement dans le hook
        // L'utilisateur reviendra sur /payment/success après paiement
      } catch (error) {
        setIsSubmitting(false)
        console.error(error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00B8A9]" />
            {t('title', { name: recipientName })}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amountLabel')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant={amount === quickAmount.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickAmount(quickAmount)}
                className={amount === quickAmount.toString() ? 'bg-[#00B8A9] hover:bg-[#00B8A9]/90' : ''}
              >
                {quickAmount}€
              </Button>
            ))}
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('messageLabel')} {t('optional')}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/200
            </p>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="bg-[#00B8A9] hover:bg-[#00B8A9]/90"
            >
              {isSubmitting ? t('sending') : t('send')}
            </Button>
          </DialogFooter>

          {/* CCBill Badge */}
          <p className="text-xs text-center text-gray-500 mt-2">
            Paiement sécurisé via CCBill
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
