/**
 * Release Timeline - F7 Wallet
 * Shows timeline of pending funds with release dates
 */

'use client';

import { useMemo } from 'react';
import { useReleaseTimeline } from '@/hooks/useEarnings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/api/wallet';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReleaseTimelineProps {
  className?: string;
}

export function ReleaseTimeline({ className }: ReleaseTimelineProps) {
  const { timeline, isLoading, error } = useReleaseTimeline();

  const sortedTimeline = useMemo(() => {
    if (!timeline) return [];

    return [...timeline].sort((a, b) => {
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });
  }, [timeline]);

  const totalPending = useMemo(() => {
    return sortedTimeline.reduce((sum, item) => sum + item.amount, 0);
  }, [sortedTimeline]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Unable to load release timeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedTimeline.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Release Timeline
          </CardTitle>
          <CardDescription>Track when your pending funds will be available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">No pending funds</p>
            <p className="text-sm text-muted-foreground mt-1">
              All your earnings are available for payout
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Release Timeline
            </CardTitle>
            <CardDescription>Pending funds scheduled for release</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Pending</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(totalPending)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />

          {sortedTimeline.map((item, index) => {
            const releaseDate = new Date(item.releaseDate);
            const isFirstItem = index === 0;
            const relativeTime = formatDistanceToNow(releaseDate, { addSuffix: true });

            return (
              <div key={item.id} className="relative flex items-start gap-4 pl-0">
                {/* Timeline dot */}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2',
                    isFirstItem
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  )}
                >
                  <Clock
                    className={cn(
                      'h-5 w-5',
                      isFirstItem ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isFirstItem ? 'default' : 'secondary'} className="capitalize">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          in {item.daysUntilRelease} {item.daysUntilRelease === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{item.description || 'Earnings'}</p>
                      <p className="text-xs text-muted-foreground">
                        Releases {format(releaseDate, 'MMM d, yyyy')} ({relativeTime})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold text-lg">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(item.amount).replace('€', '')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Funds are held for 7-30 days depending on transaction type and risk assessment</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
