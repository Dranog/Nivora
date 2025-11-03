// ===============================
// File: src/app/admin/accounting/page.tsx
// ===============================
'use client';

import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FiscalReportGenerator } from '@/components/admin/accounting/FiscalReportGenerator';
import { ComptabiliteWidgets } from '@/components/admin/accounting/ComptabiliteWidgets';
import { FECExportButton } from '@/components/admin/accounting/FECExportButton';

// Helper
const fmtMoney = (cents: number, cur = 'EUR') => `${(cents / 100).toFixed(2)} ${cur}`;

export default function AccountingPage() {
  const t = useTranslations('admin.accounting');

  // Stats de démonstration (à remplacer par des données réelles)
  const stats = {
    revenue: 197965, // en centimes
    payouts: 90500,
    fees: 1555,
    pendingAmount: 8998
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <FECExportButton />
        </div>
      </div>

      {/* Stats - Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">{t('metrics.totalRevenue')}</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmtMoney(stats.revenue)}</div>
          <div className="text-xs text-green-600 mt-1">{t('metrics.totalRevenueDesc')}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">{t('metrics.totalPayouts')}</div>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmtMoney(stats.payouts)}</div>
          <div className="text-xs text-gray-600 mt-1">{t('metrics.totalPayoutsDesc')}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">{t('metrics.totalFees')}</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmtMoney(stats.fees)}</div>
          <div className="text-xs text-gray-600 mt-1">{t('metrics.totalFeesDesc')}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">{t('metrics.pending')}</div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmtMoney(stats.pendingAmount)}</div>
          <div className="text-xs text-yellow-600 mt-1">{t('metrics.pendingDesc')}</div>
        </Card>
      </div>

      {/* Widgets Comptables Avancés - Journaux, Grand Livre, Bilan, TVA, Analytique, Lettrages, Immobilisations */}
      <ComptabiliteWidgets />

      {/* Fiscal Report Generator */}
      <FiscalReportGenerator />

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-blue-900 mb-1">{t('infoBox.title')}</p>
        <p className="text-sm text-blue-800">{t('infoBox.description')}</p>
      </div>
    </div>
  );
}
