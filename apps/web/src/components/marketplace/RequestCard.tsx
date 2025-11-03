'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Request {
  id: string;
  title: string;
  description: string;
  budget?: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface RequestCardProps {
  request: Request;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500',
  ACCEPTED: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  DECLINED: 'bg-red-500',
  CANCELED: 'bg-gray-400',
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Link href={`/market/request/${request.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{request.title}</h3>
          <Badge className={statusColors[request.status] || 'bg-gray-500'}>
            {request.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {request.description}
        </p>
        <div className="flex justify-between items-center text-sm">
          {request.budget && (
            <p className="font-semibold">
              Budget: ${(request.budget / 100).toFixed(2)}
            </p>
          )}
          <p className="text-muted-foreground">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>
    </Link>
  );
}
