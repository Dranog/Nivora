/**
 * Cart Page (F11)
 * Shopping cart with item management and checkout
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CartSummary from '@/components/stubs/CartSummary';
import { PurchaseModal } from '@/components/commerce/PurchaseModal';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/useCartStore';
import { formatPrice } from '@/types/market';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checking out',
        variant: 'destructive',
      });
      return;
    }

    // Open purchase modal for checkout
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    toast({
      title: 'Purchase successful!',
      description: 'Thank you for your purchase',
    });

    // Redirect to a success page or clear cart
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden={true} />
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Browse the marketplace to find offers
          </p>
          <Button asChild size="lg">
            <Link href="/market">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        /* Cart Content */
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Items ({items.length})
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.offerId}
                  className="flex gap-4 rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  {/* Offer Image */}
                  <Link
                    href={`/market/${item.offer.id}`}
                    className="flex-shrink-0"
                  >
                    {item.offer.imageUrl && (
                      <div className="aspect-square w-24 overflow-hidden rounded-md">
                        <img
                          src={item.offer.imageUrl}
                          alt={item.offer.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                  </Link>

                  {/* Offer Details */}
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/market/${item.offer.id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {item.offer.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by{' '}
                          <Link
                            href={`/creator/${item.offer.creatorHandle}`}
                            className="hover:underline"
                          >
                            {item.offer.creatorName}
                          </Link>
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {item.offer.description}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeItem({ offerId: item.offerId });
                          toast({
                            title: 'Item removed',
                            description: `${item.offer.title} has been removed from your cart`,
                          });
                        }}
                        className="h-9 w-9 p-0"
                        aria-label={`Remove ${item.offer.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden={true} />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Quantity:</span>
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
                            className="h-8 w-8 p-0"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" aria-hidden={true} />
                          </Button>
                          <span className="w-12 text-center font-medium">
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
                            className="h-8 w-8 p-0"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" aria-hidden={true} />
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatPrice(
                            item.offer.price * item.quantity,
                            item.offer.currency
                          )}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
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

          {/* Cart Summary */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <CartSummary onCheckout={handleCheckout} />
          </aside>
        </div>
      )}

      {/* Purchase Modal (for checkout) */}
      {items.length > 0 && (
        <PurchaseModal
          open={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
          type="ppv"
          itemId="cart-checkout"
          amount={items.reduce(
            (sum, item) => sum + item.offer.price * item.quantity,
            0
          )}
          title="Cart Checkout"
          description={`Purchase ${items.length} ${
            items.length === 1 ? 'item' : 'items'
          } from your cart`}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
