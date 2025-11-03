/**
 * EarningsSummary Component
 * Display earnings breakdown: available, pending, reserve
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { useEarningsSummary, useReleaseTimeline } from '@/hooks/useEarnings';
import Link from 'next/link';

export function EarningsSummary() {
  const { data: summary, isLoading, error } = useEarningsSummary();
  const { timeline, isLoading: timelineLoading } = useReleaseTimeline();

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Earnings</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load earnings data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: 'Available',
      value: summary.available,
      description: 'Ready to withdraw',
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Release',
      value: summary.pending,
      description: 'Awaiting release period',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Reserve',
      value: summary.reserve,
      description: '10% held for 30 days',
      icon: Shield,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`h-10 w-10 rounded-full ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${card.value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Earnings */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Total Earnings
          </CardTitle>
          <CardDescription>Combined earnings across all sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${summary.total.toFixed(2)}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/creator/earnings/history">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled>
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Release Timeline */}
      {!timelineLoading && timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Releases</CardTitle>
            <CardDescription>
              Funds that will become available soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.daysUntilRelease === 1
                        ? 'Tomorrow'
                        : `In ${item.daysUntilRelease} days`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {item.type}
                    </Badge>
                    <span className="font-semibold">${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {timeline.length > 5 && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full mt-3"
              >
                <Link href="/creator/earnings/history">
                  View all {timeline.length} upcoming releases
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
