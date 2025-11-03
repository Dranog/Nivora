/**
 * Earnings Summary Page
 * Display earnings overview with summary cards
 */

import { Metadata } from 'next';
import { EarningsSummary } from '@/components/commerce/EarningsSummary';

export const metadata: Metadata = {
  title: 'Earnings | Creator Dashboard',
  description: 'View your earnings summary and upcoming releases',
};

export default function EarningsPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground mt-2">
            Track your earnings from subscriptions, pay-per-view content, and tips
          </p>
        </div>

        {/* Summary Component */}
        <EarningsSummary />
      </div>
    </div>
  );
}
