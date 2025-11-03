/**
 * PurchaseModal Component
 * Unified purchase flow for subscriptions, PPV, and tips
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import type { PurchaseType, ConfirmPurchaseResponse } from '@/types/commerce';

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: PurchaseType;
  itemId: string;
  amount: number;
  title?: string;
  description?: string;
  onSuccess?: (response: ConfirmPurchaseResponse) => void;
}

const TYPE_LABELS: Record<PurchaseType, string> = {
  subscription: 'Subscription',
  ppv: 'Pay-Per-View',
  tip: 'Tip',
};

export function PurchaseModal({
  open,
  onOpenChange,
  type,
  itemId,
  amount,
  title,
  description,
  onSuccess,
}: PurchaseModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    step,
    intentData,
    promoValidation,
    isCreatingIntent,
    isValidatingPromo,
    isConfirming,
    isLoading,
    startCheckout,
    applyPromo,
    confirm,
    reset,
  } = useCheckout({
    onSuccess: (response) => {
      onSuccess?.(response);
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 2000);
    },
  });

  // Initialize checkout when modal opens (only once per open)
  useEffect(() => {
    if (open && !hasInitialized) {
      setHasInitialized(true);
      startCheckout({
        type,
        itemId,
        amount,
        currency: 'USD',
      });
    }
  }, [open, hasInitialized, type, itemId, amount, startCheckout]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPromoCode('');
      setPromoApplied(false);
      setHasInitialized(false);
      reset();
    }
  }, [open, reset]);

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      applyPromo(promoCode.toUpperCase(), type);
      setPromoApplied(true);
    }
  };

  const handleConfirm = () => {
    confirm();
  };

  const finalAmount = intentData?.finalAmount ?? amount;
  const discount = intentData?.discount ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md oliver-fade-in"
        aria-describedby="purchase-description"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            {step === 'complete' ? (
              <>
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <span>Purchase Complete!</span>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>{title || `Unlock ${TYPE_LABELS[type]}`}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription id="purchase-description" className="text-base">
            {step === 'complete'
              ? 'Your purchase was successful!'
              : description || `Complete your ${TYPE_LABELS[type].toLowerCase()} purchase`}
          </DialogDescription>
        </DialogHeader>

        {step === 'intent' && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5 py-2">
            {/* Amount Display */}
            <div className="rounded-2xl bg-muted/30 border border-border/50 p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Original Amount</span>
                <span className="font-semibold text-base">${amount.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Discount ({discount}%)</span>
                    <span className="font-semibold text-base text-success">
                      -${((amount * discount) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-base">Total Amount</span>
                    <span className="font-bold text-2xl tracking-tight">${finalAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              {discount === 0 && (
                <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-base">Total Amount</span>
                  <span className="font-bold text-2xl tracking-tight">${finalAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2.5">
              <Label htmlFor="promo-code" className="text-sm font-medium">Promo Code (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={isValidatingPromo || !!intentData?.promoApplied}
                  className="flex-1 oliver-input h-11"
                  aria-label="Promo code input"
                />
                <Button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={
                    !promoCode.trim() ||
                    isValidatingPromo ||
                    !!intentData?.promoApplied
                  }
                  className="oliver-btn-primary h-11 px-5 shadow-sm"
                  aria-label="Apply promo code"
                >
                  {isValidatingPromo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>

              {/* Promo validation feedback */}
              {promoApplied && promoValidation && (
                <div className="flex items-center gap-2 text-sm px-1">
                  {promoValidation.valid ? (
                    <>
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-success font-medium">{promoValidation.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="text-destructive font-medium">{promoValidation.message}</span>
                    </>
                  )}
                </div>
              )}

              {intentData?.promoApplied && (
                <Badge variant="secondary" className="oliver-badge-success w-fit">
                  <Check className="h-3 w-3 mr-1" />
                  Code {intentData.promoApplied} applied
                </Badge>
              )}
            </div>

            {/* Release Info */}
            <div className="rounded-xl bg-info/5 border border-info/20 p-4 space-y-1.5">
              <p className="font-semibold text-sm text-info flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Release Information
              </p>
              <p className="text-sm text-muted-foreground">
                {type === 'subscription' && 'Funds available to creator in 15 days'}
                {(type === 'ppv' || type === 'tip') && 'Funds available to creator in 48 hours'}
              </p>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-success/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-success" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">Payment Successful!</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                Your purchase has been completed successfully. You now have access to this content.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-3">
          {step === 'confirm' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isConfirming}
                className="rounded-xl font-medium h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="oliver-btn-primary h-11 px-6 shadow-md hover:shadow-lg transition-all"
                aria-label="Confirm purchase"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Complete Payment ${finalAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full oliver-btn-primary h-11 shadow-md"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
