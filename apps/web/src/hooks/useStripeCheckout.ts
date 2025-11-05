import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'

// Charger Stripe avec la clé publique
// IMPORTANT: Remplacer par votre vraie clé publique Stripe en production
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_PLACEHOLDER')

export const useStripeCheckout = () => {
  const createTipCheckout = async (creatorId: string, amount: number, message?: string) => {
    try {
      const response = await fetch('/api/payments/stripe/create-tip-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ creatorId, amount, message }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating tip checkout:', error)
      toast.error('Erreur lors de la création du paiement')
      throw error
    }
  }

  const createUnlockCheckout = async (postId: string) => {
    try {
      const response = await fetch('/api/payments/stripe/create-unlock-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create unlock checkout session')
      }

      const { url } = await response.json()

      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating unlock checkout:', error)
      toast.error('Erreur lors de la création du paiement')
      throw error
    }
  }

  return {
    createTipCheckout,
    createUnlockCheckout,
  }
}
