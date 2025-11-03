'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CreatorMarketListingsPage() {
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch creator's listings and requests
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Marketplace Management</h1>
        <Button>Create New Listing</Button>
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {loading ? (
            <p>Loading...</p>
          ) : listings.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't created any listings yet.
              </p>
              <Button>Create Your First Listing</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Listings grid */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No requests yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Requests list */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
