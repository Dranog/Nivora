"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign } from "lucide-react";

interface NextPayoutCardProps {
  nextDate: string;
  estAmount: number;
  compact?: boolean;
}

/**
 * NextPayoutCard - Display next payout information
 * Used in Dashboard and Revenue tabs
 */
export function NextPayoutCard({ nextDate, estAmount, compact = false }: NextPayoutCardProps) {
  const formattedAmount = `€${(estAmount / 100).toFixed(2)}`;

  if (compact) {
    return (
      <Card className="oliver-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Payout</p>
                <p className="text-sm font-semibold">{nextDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold text-primary">{formattedAmount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="oliver-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Next Payout</h3>
          <DollarSign className="h-4 w-4 text-primary" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{nextDate}</span>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Estimated Amount</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{formattedAmount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
