/**
 * Purchase Modal - F5 Anti-Leak
 * Modal for purchasing locked content via CCBill
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCCBillCheckout } from '@/hooks/useCCBillCheckout';

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
  price: number;
  onPurchaseSuccess?: () => void;
}

/**
 * Purchase modal component
 * Shows price, confirm purchase, handles payment flow (mocked)
 */
export function PurchaseModal({
  open,
  onOpenChange,
  postId,
  postTitle,
  price,
  onPurchaseSuccess,
}: PurchaseModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();
  const { createUnlockCheckout } = useCCBillCheckout();

  /**
   * Handle purchase via CCBill
   */
  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);

      // Redirect to CCBill payment page
      await createUnlockCheckout(postId);
      // User will be redirected to CCBill and then to /payment/success
    } catch (error) {
      setIsPurchasing(false);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Unable to complete purchase',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          </div>
          <DialogTitle>Unlock Premium Content</DialogTitle>
          <DialogDescription>
            Purchase access to view "{postTitle}" and support the creator.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Price Display */}
          <div className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span>{price.toFixed(2)}</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            One-time payment for lifetime access
          </p>

          {/* Features List */}
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <p>
                <span className="font-medium">Instant Access</span>
                <span className="text-muted-foreground"> - View immediately after purchase</span>
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <p>
                <span className="font-medium">Protected Content</span>
                <span className="text-muted-foreground"> - Watermarked for security</span>
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <p>
                <span className="font-medium">Support Creator</span>
                <span className="text-muted-foreground"> - Directly support content creation</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPurchasing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              <>Purchase for ${price.toFixed(2)}</>
            )}
          </Button>
        </DialogFooter>

        {/* CCBill Badge */}
        <p className="text-xs text-center text-muted-foreground mt-2">
          Secure payment powered by CCBill
        </p>
      </DialogContent>
    </Dialog>
  );
}
