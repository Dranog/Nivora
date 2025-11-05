import { useState } from 'react'

interface UseTipModalReturn {
  isOpen: boolean
  recipientId: string | null
  openTipModal: (userId: string) => void
  closeTipModal: () => void
}

export function useTipModal(): UseTipModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [recipientId, setRecipientId] = useState<string | null>(null)

  const openTipModal = (userId: string) => {
    setRecipientId(userId)
    setIsOpen(true)
  }

  const closeTipModal = () => {
    setIsOpen(false)
    setRecipientId(null)
  }

  return {
    isOpen,
    recipientId,
    openTipModal,
    closeTipModal
  }
}
