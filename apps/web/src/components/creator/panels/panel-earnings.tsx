"use client";

const MOCK = true;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Banknote, Wallet, Clock } from "lucide-react";
import { NextPayoutCard } from "@/components/ui/NextPayoutCard";
import { WithdrawDialog } from "@/components/ui/WithdrawDialog";
import { useToast } from "@/hooks/use-toast";

// Mock stub local - ne pas dépendre de @/api/payouts
type PayoutData = {
  wallet: {
    available: number;
    pendingClear: number;
    inReserve: number;
  };
  eligibleModes: string[];
  nextReleases: Array<{ date: string; amount: number }>;
};

const payouts = {
  me: async (): Promise<PayoutData> =>
    Promise.resolve({
      wallet: {
        available: 1245000, // €12,450.00
        pendingClear: 350000, // €3,500.00
        inReserve: 180000, // €1,800.00
      },
      eligibleModes: ["STANDARD", "EXPRESS_FIAT", "EXPRESS_CRYPTO"],
      nextReleases: [
        { date: "Oct 19, 2025", amount: 350000 },
        { date: "Oct 30, 2025", amount: 180000 },
      ],
    }),
};

export function EarningsPanel() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const q = useQuery({
    queryKey: ["wallet"],
    queryFn: () => payouts.me(),
    staleTime: 60_000,
  });
  const w = q.data?.wallet ?? { available: 0, pendingClear: 0, inReserve: 0 };
  const euros = (n = 0) => (n / 100).toFixed(2);

  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true);

    // MOCK delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: "Withdrawal requested",
      description: `€${euros(w.available)} will be transferred to your default payout method.`,
    });

    setIsWithdrawing(false);
    setShowWithdrawModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Next Payout + Available Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Next Payout Card */}
        <NextPayoutCard
          nextDate="Oct 25, 2025"
          estAmount={350000}
        />

        {/* Main Balance Card */}
        <Card className="oliver-card oliver-gradient min-w-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Available Balance</p>
                  <p className="text-4xl font-bold tracking-tight text-white mt-1">
                    €{euros(w.available)}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-white/90">
                  <div className="text-center">
                    <p className="text-xs font-medium">Now</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1">In 2 days</p>
                    <p className="text-sm font-semibold">€{euros(w.pendingClear)} released</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1">In 13 days</p>
                    <p className="text-sm font-semibold">€{euros(w.inReserve)} released</p>
                  </div>
                </div>
                <div className="relative h-2 bg-white/20 rounded-full">
                  <div className="absolute h-2 bg-white rounded-full" style={{ width: '30%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 h-3 w-3 bg-white rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[33%] h-3 w-3 bg-white/60 rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 h-3 w-3 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Releases */}
      <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next payout:</span>
              <span className="font-semibold">€{euros(w.pendingClear)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Oct 17, 2025</p>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-sm font-medium mb-2">KYC Status</p>
            <Progress value={60} className="h-2 mb-2" />
            <Badge className="oliver-badge-success text-xs">Basic</Badge>
            <Button variant="link" className="h-auto p-0 mt-2 text-xs text-primary">
              Upload documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Earnings */}
      <Card className="oliver-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">Withdraw Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Available balance ready for withdrawal
              </p>
              <p className="text-3xl font-bold tracking-tight">€{euros(w.available)}</p>
            </div>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              disabled={isWithdrawing}
              className="oliver-btn-primary h-12 px-8 shadow-md text-base"
            >
              <Banknote className="mr-2 h-5 w-5" />
              {isWithdrawing ? "Processing..." : "Withdraw Earnings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Releases */}
      <Card className="oliver-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Scheduled Releases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(q.data?.nextReleases?.length ?? 0) > 0 ? (
              q.data?.nextReleases?.map((r: any, i: number) => (
                <div
                  key={r.date}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.date}</p>
                      <p className="text-xs text-muted-foreground">Automatic release</p>
                    </div>
                  </div>
                  <p className="font-semibold">€{(r.amount / 100).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No scheduled releases
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Confirmation Modal */}
      <WithdrawDialog
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        amount={w.available}
        onConfirm={handleWithdrawConfirm}
        disabled={isWithdrawing}
      />
    </div>
  );
}
