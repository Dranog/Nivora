/**
 * Cart Drawer Component (F11)
 * Sliding drawer showing cart contents and checkout action
 */

'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/useCartStore';
import { formatPrice } from '@/types/market';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  children?: React.ReactNode;
  className?: string;
}

export function CartDrawer({ children, className }: CartDrawerProps) {
  const { items, totalItems, totalPrice, currency, updateQuantity, removeItem, clearCart } =
    useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/cart');
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children || (
          <Button variant="outline" className={cn('relative', className)}>
            <ShoppingCart className="h-5 w-5" aria-hidden={true} />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                aria-label={`${totalItems} items in cart`}
              >
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Open shopping cart</span>
          </Button>
        )}
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Shopping Cart</DrawerTitle>
          <DrawerDescription>
            {totalItems === 0
              ? 'Your cart is empty'
              : `${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart`}
          </DrawerDescription>
        </DrawerHeader>

        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden={true} />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Browse the marketplace to add items
            </p>
            <DrawerClose asChild>
              <Button asChild className="mt-4">
                <Link href="/market">Browse Marketplace</Link>
              </Button>
            </DrawerClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-4 pb-4">
                {items.map((item) => (
                  <div
                    key={item.offerId}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    {/* Offer Image */}
                    {item.offer.imageUrl && (
                      <div className="aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={item.offer.imageUrl}
                          alt={item.offer.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Offer Info */}
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/market/${item.offer.id}`}
                            className="font-medium hover:underline"
                          >
                            {item.offer.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            by {item.offer.creatorName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem({ offerId: item.offerId })}
                          className="h-8 w-8 p-0"
                          aria-label={`Remove ${item.offer.title} from cart`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden={true} />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity({
                                offerId: item.offerId,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="h-7 w-7 p-0"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" aria-hidden={true} />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity({
                                offerId: item.offerId,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="h-7 w-7 p-0"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" aria-hidden={true} />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(
                              item.offer.price * item.quantity,
                              item.offer.currency
                            )}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.offer.price, item.offer.currency)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DrawerFooter className="border-t">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice, currency)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button onClick={handleCheckout} className="flex-1" size="lg">
                    Proceed to Checkout
                  </Button>
                </DrawerClose>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground"
              >
                Clear Cart
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
