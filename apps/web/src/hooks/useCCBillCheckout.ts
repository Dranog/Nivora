import { toast } from 'sonner';

// Mode simulation (pour développement sans CCBill)
const SIMULATION_MODE = process.env.NEXT_PUBLIC_CCBILL_SIMULATION === 'true';

export const useCCBillCheckout = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const createTipCheckout = async (
    creatorId: string,
    amount: number,
    message?: string
  ) => {
    // Mode simulation
    if (SIMULATION_MODE) {
      toast.info('Mode simulation activé');
      console.log('Simulation: Tip checkout créé', {
        creatorId,
        amount,
        message,
      });

      // Simuler redirection après 1 seconde
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = `/payment/success?subscription_id=sim_${Date.now()}`;
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Vous devez être connecté pour envoyer un tip');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/ccbill/create-tip-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ creatorId, amount, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirection vers CCBill
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating CCBill checkout:', error);
      toast.error('Erreur lors de la création du paiement');
      throw error;
    }
  };

  const createUnlockCheckout = async (postId: string) => {
    // Mode simulation
    if (SIMULATION_MODE) {
      toast.info('Mode simulation activé');
      console.log('Simulation: Unlock checkout créé', { postId });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = `/payment/success?subscription_id=sim_unlock_${Date.now()}`;
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Vous devez être connecté pour déverrouiller du contenu');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/ccbill/create-unlock-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create unlock checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirection vers CCBill
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating unlock checkout:', error);
      toast.error('Erreur lors du déverrouillage');
      throw error;
    }
  };

  return {
    createTipCheckout,
    createUnlockCheckout,
  };
};
