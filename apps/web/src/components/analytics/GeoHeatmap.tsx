/**
 * Geo Heatmap Component (F10)
 * Geographic distribution display
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeoData } from '@/types/analytics';

interface GeoHeatmapProps {
  data: GeoData;
  className?: string;
}

export function GeoHeatmap({ data, className }: GeoHeatmapProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.topCountries.map((country) => (
            <div key={country.countryCode} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{country.country}</span>
                  <span className="text-muted-foreground">({country.countryCode})</span>
                </div>
                <span className="font-medium">{country.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${country.percentage}%` }}
                  aria-label={`${country.country}: ${country.percentage.toFixed(1)}%`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{country.users.toLocaleString()} users</span>
                <span>${country.revenue.toLocaleString()} revenue</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Total countries: {data.totalCountries}
        </p>
      </CardContent>
    </Card>
  );
}
