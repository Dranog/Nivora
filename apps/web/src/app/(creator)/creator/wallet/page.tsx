/**
 * Wallet Page
 * Manage earnings and request payouts
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { usePayouts, useKycStatus } from '@/hooks/usePayouts';
import { Button } from '@/components/ui/button';
import { KycStatus } from '@/components/creator/wallet/KycStatus';
import { BalanceCard } from '@/components/creator/wallet/BalanceCard';
import { ReleaseTimeline } from '@/components/creator/wallet/ReleaseTimeline';
import { PayoutRequestModal } from '@/components/creator/wallet/PayoutRequestModal';
import { PayoutRequestsTable } from '@/components/creator/wallet/PayoutRequestsTable';
import { Wallet as WalletIcon, Plus } from 'lucide-react';

export default function WalletPage() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Fetch data
  const { balance, isLoading, isError } = useWallet();
  const { payouts, isLoading: isLoadingPayouts, isError: isPayoutsError } = usePayouts({ limit: 20 });
  const { status: kycStatus } = useKycStatus();

  const handleOpenPayoutModal = () => {
    setIsPayoutModalOpen(true);
  };


  return (
    <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <WalletIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your earnings and request payouts
            </p>
          </div>
        </div>
      </header>

      {/* KYC Status Banner */}
      {kycStatus !== 'verified' && (
        <KycStatus />
      )}

      {/* Balance Cards Grid */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <BalanceCard
            title="Available"
            amount={balance?.available}
            isLoading={isLoading}
          />
          <BalanceCard
            title="Pending"
            amount={balance?.pending}
            isLoading={isLoading}
          />
          <BalanceCard
            title="Reserve"
            amount={balance?.reserve}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Actions */}
      <section className="flex items-center gap-4">
        <Button
          onClick={handleOpenPayoutModal}
          disabled={isLoading || isError || (balance?.available || 0) < 10}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Request Payout
        </Button>
        {(balance?.available || 0) < 10 && !isLoading && !isError && (
          <p className="text-sm text-muted-foreground">
            Minimum payout amount is €10.00
          </p>
        )}
      </section>

      {/* Release Timeline */}
      <section>
        <ReleaseTimeline />
      </section>

      {/* Payout History Table */}
      <section>
        <PayoutRequestsTable
          payouts={payouts}
          isLoading={isLoadingPayouts}
          isError={isPayoutsError}
        />
      </section>

      {/* Payout Request Modal */}
      <PayoutRequestModal
        open={isPayoutModalOpen}
        onOpenChange={setIsPayoutModalOpen}
        availableBalance={balance?.available || 0}
      />
    </main>
  );
}
