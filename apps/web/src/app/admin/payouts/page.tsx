'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, DollarSign, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Payout {
  id: string;
  creator: { name: string; email: string; avatar: string };
  amount: number;
  method: 'Bank Transfer' | 'PayPal' | 'Stripe' | 'Wire';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  transactionId?: string;
}

const DEMO_PAYOUTS: Payout[] = [
  {
    id: '1',
    creator: { name: 'Sophie Martin', email: 'sophie.m@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
    amount: 1250.00,
    method: 'Bank Transfer',
    status: 'Pending',
    requestedAt: '2024-01-22 14:30',
  },
  {
    id: '2',
    creator: { name: 'Lucas Dubois', email: 'lucas.d@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
    amount: 3420.50,
    method: 'PayPal',
    status: 'Processing',
    requestedAt: '2024-01-22 10:15',
  },
  {
    id: '3',
    creator: { name: 'Emma Wilson', email: 'emma.w@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    amount: 890.25,
    method: 'Stripe',
    status: 'Completed',
    requestedAt: '2024-01-21 16:45',
    processedAt: '2024-01-22 09:30',
    transactionId: 'TXN-2024-0012345',
  },
  {
    id: '4',
    creator: { name: 'Alexandre Rousseau', email: 'alex.r@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandre' },
    amount: 520.00,
    method: 'Bank Transfer',
    status: 'Failed',
    requestedAt: '2024-01-21 14:20',
    processedAt: '2024-01-22 08:15',
    failureReason: 'Invalid bank account details',
  },
  {
    id: '5',
    creator: { name: 'Julie Laurent', email: 'julie.l@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julie' },
    amount: 2100.75,
    method: 'Wire',
    status: 'Pending',
    requestedAt: '2024-01-21 12:00',
  },
  {
    id: '6',
    creator: { name: 'Thomas Bernard', email: 'thomas.b@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas' },
    amount: 4560.00,
    method: 'PayPal',
    status: 'Completed',
    requestedAt: '2024-01-20 18:30',
    processedAt: '2024-01-21 11:20',
    transactionId: 'TXN-2024-0012340',
  },
  {
    id: '7',
    creator: { name: 'Camille Moreau', email: 'camille.m@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camille' },
    amount: 760.50,
    method: 'Stripe',
    status: 'Processing',
    requestedAt: '2024-01-20 15:15',
  },
  {
    id: '8',
    creator: { name: 'Marie Petit', email: 'marie.p@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie' },
    amount: 320.00,
    method: 'Bank Transfer',
    status: 'Cancelled',
    requestedAt: '2024-01-20 10:45',
    processedAt: '2024-01-20 14:30',
  },
];

type TabType = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

export default function PayoutsPage() {
  const t = useTranslations('admin.payouts');  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);

  // Helper function to translate payment methods
  function translateMethod(method: string): string {
    const key = method.toLowerCase().replace(/\s+/g, '');
    if (key === 'banktransfer') return t('methods.bankTransfer');
    if (key === 'paypal') return t('methods.paypal');
    if (key === 'stripe') return t('methods.stripe');
    if (key === 'wire') return t('methods.wire');
    return method;
  }

  // Helper function to translate statuses
  function translateStatus(status: string): string {
    const key = status.toLowerCase();
    if (key === 'pending') return t('statuses.pending');
    if (key === 'processing') return t('statuses.processing');
    if (key === 'completed') return t('statuses.completed');
    if (key === 'failed') return t('statuses.failed');
    if (key === 'cancelled') return t('statuses.cancelled');
    return status;
  }

  const stats = {
    pending: DEMO_PAYOUTS.filter((p) => p.status === 'Pending').length,
    processing: DEMO_PAYOUTS.filter((p) => p.status === 'Processing').length,
    completed: DEMO_PAYOUTS.filter((p) => p.status === 'Completed').length,
    failed: DEMO_PAYOUTS.filter((p) => p.status === 'Failed').length,
    totalPending: DEMO_PAYOUTS.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
    totalProcessed: DEMO_PAYOUTS.filter((p) => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0),
  };

  const filteredPayouts = DEMO_PAYOUTS.filter((payout) => {
    let tabMatch = true;
    if (activeTab === 'pending') tabMatch = payout.status === 'Pending';
    if (activeTab === 'processing') tabMatch = payout.status === 'Processing';
    if (activeTab === 'completed') tabMatch = payout.status === 'Completed';
    if (activeTab === 'failed') tabMatch = payout.status === 'Failed' || payout.status === 'Cancelled';

    const searchMatch =
      searchQuery === '' ||
      payout.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.creator.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedPayouts(checked ? filteredPayouts.map((p) => p.id) : []);
  };

  const handleSelectPayout = (payoutId: string, checked: boolean) => {
    setSelectedPayouts(checked ? [...selectedPayouts, payoutId] : selectedPayouts.filter((id) => id !== payoutId));
  };

  const handleApproveSelected = () => {
    const plural = selectedPayouts.length > 1 ? 's' : '';
    if (confirm(t('confirmations.approve', { count: selectedPayouts.length, plural }))) {
      toast.success(t('toasts.approved'), {
        description: t('toasts.approvedMessage', { count: selectedPayouts.length, plural
      }),
      });
      setSelectedPayouts([]);
    }
  };

  const handleRejectSelected = () => {
    const plural = selectedPayouts.length > 1 ? 's' : '';
    if (confirm(t('confirmations.reject', { count: selectedPayouts.length, plural }))) {
      toast.success(t('toasts.rejected'), {
        description: t('toasts.rejectedMessage', { count: selectedPayouts.length, plural
      }),
      });
      setSelectedPayouts([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Failed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      PayPal: 'bg-purple-100 text-purple-800',
      Stripe: 'bg-indigo-100 text-indigo-800',
      Wire: 'bg-gray-100 text-gray-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-gray-600">{t('stats.pending')}</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">${stats.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-gray-600">{t('stats.processing')}</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-600">{t('stats.completed')}</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-500 mt-1">${stats.totalProcessed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <div className="text-sm text-gray-600">{t('stats.failed')}</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </Card>
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <div className="text-sm text-gray-600">{t('stats.totalVolume')}</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${(stats.totalPending + stats.totalProcessed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label={t('search.ariaLabel')}
        />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('tabs.all') },
          { key: 'pending', label: t('tabs.pending') },
          { key: 'processing', label: t('tabs.processing') },
          { key: 'completed', label: t('tabs.completed') },
          { key: 'failed', label: t('tabs.failed') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#00B8A9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedPayouts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedPayouts.length} {t('bulkActions.selected')}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleApproveSelected} className="text-green-600 hover:text-green-700">
              {t('bulkActions.approve')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRejectSelected} className="text-red-600 hover:text-red-700">
              {t('bulkActions.reject')}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedPayouts.length === filteredPayouts.length && filteredPayouts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('table.selectAll')}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.creator')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.amount')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.method')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.requested')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.processed')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.transactionId')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedPayouts.includes(payout.id)}
                    onCheckedChange={(checked) => handleSelectPayout(payout.id, checked as boolean)}
                    aria-label={t('table.selectPayout', { name: payout.creator.name })}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={payout.creator.avatar} />
                      <AvatarFallback>{payout.creator.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payout.creator.name}</div>
                      <div className="text-xs text-gray-500">{payout.creator.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getMethodColor(payout.method)}>{translateMethod(payout.method)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(payout.status)}>{translateStatus(payout.status)}</Badge>
                  {payout.failureReason && (
                    <div className="text-xs text-red-600 mt-1">{payout.failureReason}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{payout.requestedAt}</span>
                </td>
                <td className="px-4 py-3">
                  {payout.processedAt ? (
                    <span className="text-sm text-gray-600">{payout.processedAt}</span>
                  ) : (
                    <span className="text-sm text-gray-400">{t('table.notAvailable')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {payout.transactionId ? (
                    <span className="text-xs font-mono text-gray-600">{payout.transactionId}</span>
                  ) : (
                    <span className="text-sm text-gray-400">{t('table.notAvailable')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm">
                    {t('table.view')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
