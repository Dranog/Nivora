/**
 * Cart Summary Component (F11)
 * Displays cart totals and checkout action
 */

'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/useCartStore';
import { formatPrice } from '@/types/market';

interface CartSummaryProps {
  onCheckout?: () => void;
  className?: string;
}

export function CartSummary({ onCheckout, className }: CartSummaryProps) {
  const { items, totalItems, totalPrice, currency } = useCart();

  // Calculate subtotal and tax (placeholder for now)
  const subtotal = totalPrice;
  const tax = 0; // Tax calculation would go here
  const total = subtotal + tax;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" aria-hidden={true} />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Item Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span className="font-medium">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal, currency)}</span>
        </div>

        {/* Tax */}
        {tax > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatPrice(tax, currency)}</span>
          </div>
        )}

        <div className="border-t" />

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>

        {/* Item Breakdown */}
        {items.length > 0 && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Items in cart:</p>
            <ul className="space-y-1.5" aria-label="Cart items breakdown">
              {items.map((item) => (
                <li
                  key={item.offerId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">
                    {item.quantity}x {item.offer.title}
                  </span>
                  <span className="ml-2 flex-shrink-0 font-medium">
                    {formatPrice(
                      item.offer.price * item.quantity,
                      item.offer.currency
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          onClick={onCheckout}
          disabled={totalItems === 0}
          className="w-full"
          size="lg"
          aria-label={
            totalItems === 0
              ? 'Cart is empty'
              : `Proceed to checkout with ${totalItems} items`
          }
        >
          Proceed to Checkout
        </Button>

        {totalItems === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Your cart is empty
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
