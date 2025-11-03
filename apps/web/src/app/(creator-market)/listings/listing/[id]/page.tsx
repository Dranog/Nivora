'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ListingDetailPage() {
  const params = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch listing from API using params.id
    setLoading(false);
  }, [params.id]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {loading ? (
        <p>Loading...</p>
      ) : listing ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">{listing?.title}</h1>
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">{listing?.description}</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">${listing?.price / 100}</p>
              </div>
              <Button>Contact Creator</Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Listing not found</p>
        </Card>
      )}
    </div>
  );
}
