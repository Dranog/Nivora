'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch listings from API
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Link href="/listings/my-listings">
          <Button>My Listings</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 && (
            <Card className="p-6 col-span-full text-center">
              <p className="text-muted-foreground">
                No listings available yet. Check back soon!
              </p>
            </Card>
          )}
          {/* Listings will be rendered here */}
        </div>
      )}
    </div>
  );
}
