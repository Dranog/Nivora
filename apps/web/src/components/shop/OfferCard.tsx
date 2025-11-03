/**
 * Offer Card Component (F11)
 * Displays a marketplace offer with creator info and add to cart action
 */

'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketOffer } from '@/types/market';
import { formatPrice } from '@/types/market';
import { useCart } from '@/store/useCartStore';
import Link from 'next/link';

interface OfferCardProps {
  offer: MarketOffer;
  className?: string;
  onAddToCart?: (offer: MarketOffer) => void;
}

export function OfferCard({ offer, className, onAddToCart }: OfferCardProps) {
  const { addItem, hasItem } = useCart();
  const isInCart = hasItem(offer.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({ offer, quantity: 1 });
    onAddToCart?.(offer);
  };

  // Get offer type badge color
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

  return (
    <Link href={`/market/${offer.id}`} className="block">
      <Card
        className={cn(
          'group h-full transition-all hover:shadow-lg',
          className
        )}
      >
        {/* Offer Image */}
        {offer.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="space-y-2">
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={typeBadgeVariant}>
              {offer.type === 'one-time' ? 'One-Time' : offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
            </Badge>
            {offer.category && (
              <span className="text-xs text-muted-foreground">{offer.category}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-lg font-semibold">{offer.title}</h3>

          {/* Creator Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={offer.creatorAvatar} alt={offer.creatorName} />
              <AvatarFallback className="text-xs">{creatorInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{offer.creatorName}</span>
              <span className="text-xs text-muted-foreground">@{offer.creatorHandle}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {offer.description}
          </p>

          {/* Features Preview */}
          {offer.features.length > 0 && (
            <ul className="space-y-1" aria-label="Offer features">
              {offer.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden={true} />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {offer.features.length > 3 && (
                <li className="text-sm text-muted-foreground">
                  +{offer.features.length - 3} more features
                </li>
              )}
            </ul>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatPrice(offer.price, offer.currency)}
            </span>
            {offer.type === 'subscription' && (
              <span className="text-xs text-muted-foreground">/month</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isInCart}
            variant={isInCart ? 'secondary' : 'default'}
            size="sm"
            aria-label={isInCart ? 'Already in cart' : `Add ${offer.title} to cart`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" aria-hidden={true} />
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
