/**
 * Retention Cohorts Component (F10)
 * Heatmap table showing cohort retention rates
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RetentionData } from '@/types/analytics';

interface RetentionCohortsProps {
  data: RetentionData;
  className?: string;
}

export function RetentionCohorts({ data, className }: RetentionCohortsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Retention Cohorts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Retention cohorts table">
            <thead>
              <tr className="border-b">
                <th className="pb-2 pr-4 text-left font-medium">Cohort</th>
                <th className="pb-2 px-2 text-center font-medium">M0</th>
                <th className="pb-2 px-2 text-center font-medium">M1</th>
                <th className="pb-2 px-2 text-center font-medium">M2</th>
                <th className="pb-2 px-2 text-center font-medium">M3</th>
                <th className="pb-2 px-2 text-center font-medium">M4</th>
                <th className="pb-2 px-2 text-center font-medium">M5</th>
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map((cohort) => (
                <tr key={cohort.cohortDate} className="border-b">
                  <td className="py-2 pr-4 font-medium">{cohort.cohortDate}</td>
                  {cohort.retention.slice(0, 6).map((rate, idx) => (
                    <td key={idx} className="px-2 text-center">
                      <span
                        className={cn(
                          'inline-block px-2 py-1 rounded text-xs font-medium',
                          getHeatmapColor(rate)
                        )}
                      >
                        {rate.toFixed(0)}%
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-muted-foreground">
            <strong>Average Retention:</strong> M1: {data.averageRetention.month1.toFixed(1)}% |
            M3: {data.averageRetention.month3.toFixed(1)}% |
            M6: {data.averageRetention.month6.toFixed(1)}%
          </p>
          <p className="text-muted-foreground">
            <strong>Churn Rate:</strong> {data.churnRate.toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getHeatmapColor(rate: number): string {
  if (rate >= 80) return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100';
  if (rate >= 60) return 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100';
  if (rate >= 40) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100';
  if (rate >= 20) return 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100';
  return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100';
}
