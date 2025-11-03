"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, Heart } from "lucide-react";
import * as analytics from "@/lib/api/analytics";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, change, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="oliver-card">
        <CardContent className="p-5">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="oliver-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
            change !== undefined
              ? isPositive
                ? 'bg-success/10'
                : 'bg-destructive/10'
              : 'bg-primary/10'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-xs font-medium ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-stats"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const stats = await analytics.getCreatorStats();
      return {
        revenue: { value: "€12,450", change: 8.2 },
        subscribers: { value: 312, change: -2.1 },
        engagement: { value: "8.5%", change: 1.2 },
        fans: { value: "45.1K", change: 5.8 },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={data?.revenue.value ?? "€0"}
        change={data?.revenue.change}
        icon={<DollarSign className="h-4 w-4 text-success" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Subscribers"
        value={data?.subscribers.value ?? 0}
        change={data?.subscribers.change}
        icon={<Users className="h-4 w-4 text-destructive" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Engagement Rate"
        value={data?.engagement.value ?? "0%"}
        change={data?.engagement.change}
        icon={<Heart className="h-4 w-4 text-success" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Fans"
        value={data?.fans.value ?? "0"}
        change={data?.fans.change}
        icon={<Eye className="h-4 w-4 text-primary" />}
        isLoading={isLoading}
      />
    </div>
  );
}
