/**
 * OfferGrid Component (F9)
 * Display subscription tiers in responsive grid
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  billingInterval: 'month' | 'year';
  benefits: string[];
  isPopular?: boolean;
}

interface OfferGridProps {
  offers: Offer[];
  onSubscribe?: (offerId: string) => void;
}

export function OfferGrid({ offers, onSubscribe }: OfferGridProps) {
  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-offers">
        <p className="text-muted-foreground">No subscription tiers available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="offer-grid">
      {offers.map((offer) => (
        <Card
          key={offer.id}
          className={offer.isPopular ? 'border-primary shadow-lg' : ''}
          data-testid={`offer-card-${offer.id}`}
        >
          <CardHeader>
            {offer.isPopular && (
              <div className="mb-2 inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Popular
              </div>
            )}
            <CardTitle className="text-2xl" data-testid={`offer-title-${offer.id}`}>
              {offer.title}
            </CardTitle>
            {offer.description && (
              <CardDescription data-testid={`offer-description-${offer.id}`}>
                {offer.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold" data-testid={`offer-price-${offer.id}`}>
                  {offer.currency === 'USD' ? '$' : offer.currency}
                  {offer.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  /{offer.billingInterval === 'month' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            {/* Benefits */}
            <ul className="space-y-3" data-testid={`offer-benefits-${offer.id}`}>
              {offer.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              variant={offer.isPopular ? 'default' : 'outline'}
              onClick={() => onSubscribe?.(offer.id)}
              data-testid={`subscribe-btn-${offer.id}`}
            >
              Subscribe
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
