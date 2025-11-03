'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RequestDetailPage() {
  const params = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch request from API using params.id
    setLoading(false);
  }, [params.id]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {loading ? (
        <p>Loading...</p>
      ) : request ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">{request?.title}</h1>
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">{request?.description}</p>
            {request?.budget && (
              <p className="text-lg mb-4">
                Budget: <span className="font-bold">${request.budget / 100}</span>
              </p>
            )}
            <div className="flex gap-2">
              <Button>Accept Request</Button>
              <Button variant="outline">Decline</Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Request not found</p>
        </Card>
      )}
    </div>
  );
}
