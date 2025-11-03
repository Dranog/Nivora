/**
 * Offer Detail Component (F11)
 * Full offer details with purchase and cart actions
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PurchaseModal } from '@/components/commerce/PurchaseModal';
import { ShoppingCart, Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketOffer } from '@/types/market';
import { formatPrice } from '@/types/market';
import { useCart } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface OfferDetailProps {
  offer: MarketOffer;
  className?: string;
}

export function OfferDetail({ offer, className }: OfferDetailProps) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { addItem, hasItem } = useCart();
  const { toast } = useToast();
  const isInCart = hasItem(offer.id);

  const handleAddToCart = () => {
    addItem({ offer, quantity: 1 });
    toast({
      title: 'Added to cart',
      description: `${offer.title} has been added to your cart`,
    });
  };

  const handleBuyNow = () => {
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    toast({
      title: 'Purchase successful!',
      description: `You now have access to ${offer.title}`,
    });
  };

  // Get offer type badge variant
  const typeBadgeVariant =
    offer.type === 'subscription'
      ? 'default'
      : offer.type === 'bundle'
      ? 'secondary'
      : 'outline';

  // Get creator initials for avatar fallback
  const creatorInitials = offer.creatorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Use main image or first from images array
  const mainImage = offer.imageUrl || offer.images?.[0];
  const galleryImages = offer.images || (offer.imageUrl ? [offer.imageUrl] : []);

  // Map offer type to purchase type
  const purchaseType = offer.type === 'subscription' ? 'subscription' : 'ppv';

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {mainImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <img
                src={mainImage}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-md border"
                >
                  <img
                    src={image}
                    alt={`${offer.title} - Image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offer Info & Actions */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={typeBadgeVariant}>
                {offer.type === 'one-time'
                  ? 'One-Time'
                  : offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
              </Badge>
              {offer.category && (
                <Badge variant="outline">{offer.category}</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold">{offer.title}</h1>

            {/* Creator Info */}
            <Link
              href={`/creator/${offer.creatorHandle}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={offer.creatorAvatar} alt={offer.creatorName} />
                <AvatarFallback>{creatorInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{offer.creatorName}</span>
                <span className="text-sm text-muted-foreground">
                  @{offer.creatorHandle}
                </span>
              </div>
            </Link>
          </div>

          {/* Price & Actions */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {formatPrice(offer.price, offer.currency)}
                </span>
                {offer.type === 'subscription' && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleBuyNow}
                  className="w-full"
                  size="lg"
                  aria-label={`Buy ${offer.title} now`}
                >
                  <CreditCard className="mr-2 h-5 w-5" aria-hidden={true} />
                  Buy Now
                </Button>

                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isInCart}
                  aria-label={
                    isInCart
                      ? 'Already in cart'
                      : `Add ${offer.title} to cart`
                  }
                >
                  <ShoppingCart className="mr-2 h-5 w-5" aria-hidden={true} />
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </Button>
              </div>

              {isInCart && (
                <p className="text-center text-sm text-muted-foreground">
                  This item is already in your cart
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {offer.tags && offer.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {offer.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Description</h2>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">
            {offer.description}
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      {offer.features.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">What's Included</h2>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Offer features">
              {offer.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    aria-hidden={true}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        type={purchaseType}
        itemId={offer.id}
        amount={offer.price}
        title={offer.title}
        description={`Purchase ${offer.title} from ${offer.creatorName}`}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
