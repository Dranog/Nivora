"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Package, TrendingUp, Check } from "lucide-react";

interface PromoCode {
  code: string;
  discount: number;
  uses: number;
  status: "active" | "expired";
}

interface Bundle {
  name: string;
  price: number;
  itemCount: number;
  sold: number;
  status: "active" | "inactive";
}

export function MarketingSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["marketing-summary"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const summary = await market.getSummary();
      return {
        promoCodes: [
          { code: "SUMMER20", discount: 20, uses: 45, status: "active" as const },
          { code: "WELCOME10", discount: 10, uses: 128, status: "active" as const },
        ],
        bundles: [
          { name: "Premium Bundle", price: 1999, itemCount: 8, sold: 23, status: "active" as const },
        ],
        stats: {
          activePromos: 8,
          totalRevenue: 1234,
          conversionRate: 23,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="oliver-card">
        <CardContent className="p-5">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="oliver-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Marketing Summary</CardTitle>
          <Badge className="oliver-badge-primary">
            {data?.stats.activePromos} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <p className="text-2xl font-bold tracking-tight">{data?.stats.activePromos}</p>
            <p className="text-xs text-muted-foreground mt-1">Promos</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <p className="text-2xl font-bold tracking-tight">€{data?.stats.totalRevenue}</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/30">
            <p className="text-2xl font-bold tracking-tight">{data?.stats.conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Conversion</p>
          </div>
        </div>

        {/* Active Promos */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Top Promo Codes</p>
          {data?.promoCodes.map((promo) => (
            <div
              key={promo.code}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{promo.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {promo.discount}% • {promo.uses} uses
                  </p>
                </div>
              </div>
              <Badge className="oliver-badge-success text-xs">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          ))}
        </div>

        {/* Bundles */}
        {data?.bundles && data.bundles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Active Bundles</p>
            {data.bundles.map((bundle) => (
              <div
                key={bundle.name}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{bundle.name}</p>
                    <p className="text-xs text-muted-foreground">
                      €{(bundle.price / 100).toFixed(2)} • {bundle.itemCount} items • {bundle.sold} sold
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full rounded-xl h-9 text-xs mt-2">
          <TrendingUp className="mr-2 h-3 w-3" />
          View Full Marketing Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
