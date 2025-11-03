/**
 * useCheckout Hook
 * Handles purchase flow: intent → promo validation → confirmation
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  createPurchaseIntent,
  confirmPurchase,
  validatePromoCode,
} from '@/lib/api/commerce';
import type {
  PurchaseIntent,
  PurchaseIntentResponse,
  ConfirmPurchaseResponse,
  PromoCodeValidation,
  PurchaseType,
} from '@/types/commerce';
import { useToast } from '@/hooks/use-toast';

type CheckoutStep = 'intent' | 'confirm' | 'complete';

interface UseCheckoutOptions {
  onSuccess?: (response: ConfirmPurchaseResponse) => void;
  onError?: (error: Error) => void;
}

export function useCheckout(options?: UseCheckoutOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CheckoutStep>('intent');
  const [intentData, setIntentData] = useState<PurchaseIntentResponse | null>(null);
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [currentPurchaseData, setCurrentPurchaseData] = useState<PurchaseIntent | null>(null);

  // Step 1: Create purchase intent
  const intentMutation = useMutation({
    mutationFn: createPurchaseIntent,
    onSuccess: (data) => {
      setIntentData(data);
      setStep('confirm');
    },
    onError: (error: Error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to create purchase intent',
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });

  // Step 2: Validate promo code
  const promoMutation = useMutation({
    mutationFn: ({ code, type }: { code: string; type: PurchaseType }) =>
      validatePromoCode(code, type),
    onSuccess: async (data, variables) => {
      setPromoValidation(data);
      if (data.valid && currentPurchaseData) {
        // Recreate intent with promo code to get discounted amount
        const updatedIntent = await createPurchaseIntent({
          ...currentPurchaseData,
          promoCode: variables.code,
        });
        setIntentData(updatedIntent);

        toast({
          title: 'Promo Code Applied',
          description: data.message,
          variant: 'default',
        });
      } else if (!data.valid) {
        toast({
          title: 'Invalid Promo Code',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Promo Validation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Step 3: Confirm purchase (with optimistic update)
  const confirmMutation = useMutation({
    mutationFn: confirmPurchase,
    onMutate: async () => {
      // Optimistic update: mark item as unlocked immediately
      // This is handled by the component that triggers the purchase
      return { previousData: null };
    },
    onSuccess: (data) => {
      setStep('complete');

      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['earnings', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['earnings', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['media'] }); // For unlocking PPV content

      toast({
        title: 'Purchase Successful',
        description: data.message || 'Your purchase was completed successfully',
        variant: 'default',
      });

      options?.onSuccess?.(data);
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        // Restore previous state if needed
      }

      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to complete purchase',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });

  // Helper: Start checkout flow
  const startCheckout = useCallback((data: PurchaseIntent) => {
    setStep('intent');
    setIntentData(null);
    setPromoValidation(null);
    setCurrentPurchaseData(data);
    intentMutation.mutate(data);
  }, [intentMutation]);

  // Helper: Apply promo code
  const applyPromo = useCallback((code: string, type: PurchaseType) => {
    promoMutation.mutate({ code, type });
  }, [promoMutation]);

  // Helper: Confirm purchase
  const confirm = useCallback(() => {
    if (!intentData) {
      toast({
        title: 'Error',
        description: 'No purchase intent found',
        variant: 'destructive',
      });
      return;
    }
    confirmMutation.mutate(intentData.intentId);
  }, [intentData, confirmMutation, toast]);

  // Helper: Reset checkout state
  const reset = useCallback(() => {
    setStep('intent');
    setIntentData(null);
    setPromoValidation(null);
    setCurrentPurchaseData(null);
  }, []);

  return {
    // State
    step,
    intentData,
    promoValidation,

    // Loading states
    isCreatingIntent: intentMutation.isPending,
    isValidatingPromo: promoMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isLoading: intentMutation.isPending || confirmMutation.isPending,

    // Actions
    startCheckout,
    applyPromo,
    confirm,
    reset,

    // Errors
    error: intentMutation.error || confirmMutation.error || promoMutation.error,
  };
}
