/**
 * Payments Hooks - F3 React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as paymentsApi from '@/lib/api/payments';
import { paymentsKeys } from '@/lib/api/payments';
import type { CheckoutSessionInput, CheckoutSessionResponse, PaymentHistory } from '@/types/payment';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get payment history
 */
export function usePaymentHistory(
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  },
  options?: Omit<UseQueryOptions<PaymentHistory, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentsKeys.history(),
    queryFn: () => paymentsApi.getPaymentHistory(params),
    ...options,
  });
}

/**
 * Create checkout session mutation
 */
export function useCheckout(options?: UseMutationOptions<CheckoutSessionResponse, Error, CheckoutSessionInput>) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: paymentsApi.createCheckoutSession,
    onSuccess: (session) => {
      // Redirect to checkout URL
      window.location.href = session.checkoutUrl;
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Confirm payment mutation
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: paymentsApi.confirmPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.history() });

      toast({
        title: 'Payment confirmed',
        description: 'Your payment has been processed successfully',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel payment mutation
 */
export function useCancelPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: paymentsApi.cancelPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.history() });

      toast({
        title: 'Payment canceled',
        description: 'Your payment has been canceled',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}
