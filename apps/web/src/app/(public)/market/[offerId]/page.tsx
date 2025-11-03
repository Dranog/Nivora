/**
 * Offer Detail Page (F11)
 * Individual offer page with full details and purchase options
 */

import { Suspense } from 'react';
import { OfferDetail } from '@/components/shop/OfferDetail';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { fetchMarketOfferById } from '@/lib/api/market';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface OfferPageProps {
  params: Promise<{
    offerId: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { offerId } = await params;

  try {
    const offer = await fetchMarketOfferById(offerId);

    return {
      title: `${offer.title} by ${offer.creatorName} | Marketplace`,
      description: offer.description.slice(0, 160),
      openGraph: {
        title: offer.title,
        description: offer.description,
        images: offer.imageUrl ? [offer.imageUrl] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: offer.title,
        description: offer.description,
        images: offer.imageUrl ? [offer.imageUrl] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'Offer Not Found | Marketplace',
      description: 'The requested offer could not be found',
    };
  }
}

async function OfferContent({ offerId }: { offerId: string }) {
  try {
    const offer = await fetchMarketOfferById(offerId);
    return <OfferDetail offer={offer} />;
  } catch (error) {
    notFound();
  }
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { offerId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/market">
            <ChevronLeft className="mr-2 h-4 w-4" aria-hidden={true} />
            Back to Marketplace
          </Link>
        </Button>
        <CartDrawer />
      </div>

      {/* Offer Details */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="aspect-video animate-pulse rounded-lg bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        }
      >
        <OfferContent offerId={offerId} />
      </Suspense>
    </div>
  );
}
