/**
 * Earnings History Page
 * Display detailed ledger with filters
 */

import { Metadata } from 'next';
import { LedgerTable } from '@/components/commerce/LedgerTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Earnings History | Creator Dashboard',
  description: 'View detailed transaction history and earnings ledger',
};

export default function EarningsHistoryPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/earnings" aria-label="Back to earnings summary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View all your earnings transactions and their release status
            </p>
          </div>
        </div>

        {/* Ledger Table */}
        <LedgerTable />
      </div>
    </div>
  );
}
