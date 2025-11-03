'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/category/CategoryBadge';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  isBoosted: boolean;
  category?: any;
  creator?: any;
  viewCount?: number;
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/market/listing/${listing.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        {listing.isBoosted && (
          <Badge className="mb-2" variant="default">
            ⚡ Boosted
          </Badge>
        )}
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {listing.description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold">
              ${(listing.price / 100).toFixed(2)}
            </p>
            {listing.viewCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                {listing.viewCount} views
              </p>
            )}
          </div>
          {listing.category && <CategoryBadge category={listing.category} />}
        </div>
      </Card>
    </Link>
  );
}
