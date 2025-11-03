'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user's listings from API
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button>Create New Listing</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 && (
            <Card className="p-6 col-span-full text-center">
              <p className="text-muted-foreground mb-4">
                You haven't created any listings yet.
              </p>
              <Button>Create Your First Listing</Button>
            </Card>
          )}
          {/* Listings will be rendered here */}
        </div>
      )}
    </div>
  );
}
