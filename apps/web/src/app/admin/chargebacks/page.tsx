'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, AlertCircle, Clock, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Chargeback {
  id: string;
  user: { name: string; email: string; avatar: string };
  creator: string;
  amount: number;
  transactionId: string;
  reason: 'Fraudulent' | 'Duplicate' | 'Not Received' | 'Product Not Described' | 'Other';
  status: 'Open' | 'Under Review' | 'Accepted' | 'Rejected' | 'Resolved';
  openedAt: string;
  respondedAt?: string;
  evidence?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

const DEMO_CHARGEBACKS: Chargeback[] = [
  {
    id: '1',
    user: { name: 'John Smith', email: 'john.s@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    creator: 'Sophie Martin',
    amount: 49.99,
    transactionId: 'TXN-2024-0012350',
    reason: 'Fraudulent',
    status: 'Open',
    openedAt: '2024-01-22 14:30',
    priority: 'Critical',
  },
  {
    id: '2',
    user: { name: 'Sarah Williams', email: 'sarah.w@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    creator: 'Lucas Dubois',
    amount: 19.99,
    transactionId: 'TXN-2024-0012349',
    reason: 'Duplicate',
    status: 'Under Review',
    openedAt: '2024-01-22 10:15',
    evidence: 'Creator provided proof of delivery',
    priority: 'Medium',
  },
  {
    id: '3',
    user: { name: 'Mike Johnson', email: 'mike.j@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    creator: 'Emma Wilson',
    amount: 99.99,
    transactionId: 'TXN-2024-0012348',
    reason: 'Not Received',
    status: 'Accepted',
    openedAt: '2024-01-21 16:45',
    respondedAt: '2024-01-22 09:30',
    evidence: 'Content access logs show no delivery',
    priority: 'High',
  },
  {
    id: '4',
    user: { name: 'Emily Davis', email: 'emily.d@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
    creator: 'Alexandre Rousseau',
    amount: 29.99,
    transactionId: 'TXN-2024-0012347',
    reason: 'Product Not Described',
    status: 'Rejected',
    openedAt: '2024-01-21 14:20',
    respondedAt: '2024-01-22 08:15',
    evidence: 'Content matches description',
    priority: 'Low',
  },
  {
    id: '5',
    user: { name: 'David Brown', email: 'david.b@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    creator: 'Julie Laurent',
    amount: 39.99,
    transactionId: 'TXN-2024-0012346',
    reason: 'Other',
    status: 'Open',
    openedAt: '2024-01-21 12:00',
    priority: 'Medium',
  },
  {
    id: '6',
    user: { name: 'Lisa Anderson', email: 'lisa.a@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    creator: 'Thomas Bernard',
    amount: 79.99,
    transactionId: 'TXN-2024-0012345',
    reason: 'Fraudulent',
    status: 'Resolved',
    openedAt: '2024-01-20 18:30',
    respondedAt: '2024-01-21 11:20',
    evidence: 'Confirmed fraudulent card',
    priority: 'Critical',
  },
  {
    id: '7',
    user: { name: 'Chris Lee', email: 'chris.l@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
    creator: 'Camille Moreau',
    amount: 14.99,
    transactionId: 'TXN-2024-0012344',
    reason: 'Duplicate',
    status: 'Under Review',
    openedAt: '2024-01-20 15:15',
    priority: 'Low',
  },
  {
    id: '8',
    user: { name: 'Amanda White', email: 'amanda.w@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' },
    creator: 'Marie Petit',
    amount: 59.99,
    transactionId: 'TXN-2024-0012343',
    reason: 'Not Received',
    status: 'Accepted',
    openedAt: '2024-01-20 10:45',
    respondedAt: '2024-01-20 14:30',
    priority: 'High',
  },
];

type TabType = 'all' | 'open' | 'under-review' | 'accepted' | 'rejected';

export default function ChargebacksPage() {
  const t = useTranslations('admin.chargebacks');  const [activeTab, setActiveTab] = useState<TabType>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChargebacks, setSelectedChargebacks] = useState<string[]>([]);

  // Helper function to translate reasons
  function translateReason(reason: string): string {
    const key = reason.toLowerCase().replace(/\s+/g, '');
    if (key === 'fraudulent') return t('reasons.fraudulent');
    if (key === 'duplicate') return t('reasons.duplicate');
    if (key === 'notreceived') return t('reasons.notReceived');
    if (key === 'productnotdescribed') return t('reasons.productNotDescribed');
    if (key === 'other') return t('reasons.other');
    return reason;
  }

  // Helper function to translate statuses
  function translateStatus(status: string): string {
    const key = status.toLowerCase().replace(/\s+/g, '');
    if (key === 'open') return t('statuses.open');
    if (key === 'underreview') return t('statuses.underReview');
    if (key === 'accepted') return t('statuses.accepted');
    if (key === 'rejected') return t('statuses.rejected');
    if (key === 'resolved') return t('statuses.resolved');
    return status;
  }

  // Helper function to translate priorities
  function translatePriority(priority: string): string {
    const key = priority.toLowerCase();
    if (key === 'low') return t('priorities.low');
    if (key === 'medium') return t('priorities.medium');
    if (key === 'high') return t('priorities.high');
    if (key === 'critical') return t('priorities.critical');
    return priority;
  }

  const stats = {
    open: DEMO_CHARGEBACKS.filter((c) => c.status === 'Open').length,
    underReview: DEMO_CHARGEBACKS.filter((c) => c.status === 'Under Review').length,
    accepted: DEMO_CHARGEBACKS.filter((c) => c.status === 'Accepted').length,
    rejected: DEMO_CHARGEBACKS.filter((c) => c.status === 'Rejected').length,
    totalAmount: DEMO_CHARGEBACKS.filter((c) => c.status !== 'Rejected').reduce((sum, c) => sum + c.amount, 0),
    winRate: '62%',
  };

  const filteredChargebacks = DEMO_CHARGEBACKS.filter((chargeback) => {
    let tabMatch = true;
    if (activeTab === 'open') tabMatch = chargeback.status === 'Open';
    if (activeTab === 'under-review') tabMatch = chargeback.status === 'Under Review';
    if (activeTab === 'accepted') tabMatch = chargeback.status === 'Accepted' || chargeback.status === 'Resolved';
    if (activeTab === 'rejected') tabMatch = chargeback.status === 'Rejected';

    const searchMatch =
      searchQuery === '' ||
      chargeback.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chargeback.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chargeback.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chargeback.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedChargebacks(checked ? filteredChargebacks.map((c) => c.id) : []);
  };

  const handleSelectChargeback = (chargebackId: string, checked: boolean) => {
    setSelectedChargebacks(checked ? [...selectedChargebacks, chargebackId] : selectedChargebacks.filter((id) => id !== chargebackId));
  };

  const handleAcceptSelected = () => {
    const plural = selectedChargebacks.length > 1 ? 's' : '';
    if (confirm(t('confirmations.accept', { count: selectedChargebacks.length, plural }))) {
      toast.success(t('toasts.accepted'), {
        description: t('toasts.acceptedMessage', { count: selectedChargebacks.length, plural
      }),
      });
      setSelectedChargebacks([]);
    }
  };

  const handleRejectSelected = () => {
    const plural = selectedChargebacks.length > 1 ? 's' : '';
    if (confirm(t('confirmations.reject', { count: selectedChargebacks.length, plural }))) {
      toast.success(t('toasts.rejected'), {
        description: t('toasts.rejectedMessage', { count: selectedChargebacks.length, plural
      }),
      });
      setSelectedChargebacks([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
      case 'Resolved':
        return 'bg-red-100 text-red-800';
      case 'Rejected':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      Fraudulent: 'bg-red-100 text-red-800',
      Duplicate: 'bg-orange-100 text-orange-800',
      'Not Received': 'bg-yellow-100 text-yellow-800',
      'Product Not Described': 'bg-blue-100 text-blue-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-gray-600">{t('stats.open')}</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-gray-600">{t('stats.underReview')}</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <div className="text-sm text-gray-600">{t('stats.accepted')}</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.accepted}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-600">{t('stats.rejected')}</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.rejected}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <div className="text-sm text-gray-600">{t('stats.totalAtRisk')}</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.winRate')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.winRate}</div>
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
          { key: 'open', label: t('tabs.open') },
          { key: 'under-review', label: t('tabs.underReview') },
          { key: 'accepted', label: t('tabs.accepted') },
          { key: 'rejected', label: t('tabs.rejected') },
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

      {selectedChargebacks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedChargebacks.length} {t('bulkActions.selected')}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAcceptSelected} className="text-red-600 hover:text-red-700">
              {t('bulkActions.accept')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRejectSelected} className="text-green-600 hover:text-green-700">
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
                  checked={selectedChargebacks.length === filteredChargebacks.length && filteredChargebacks.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('table.selectAll')}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.user')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.creator')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.amount')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.reason')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.priority')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.opened')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredChargebacks.map((chargeback) => (
              <tr key={chargeback.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedChargebacks.includes(chargeback.id)}
                    onCheckedChange={(checked) => handleSelectChargeback(chargeback.id, checked as boolean)}
                    aria-label={t('table.selectChargeback', { name: chargeback.user.name })}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={chargeback.user.avatar} />
                      <AvatarFallback>{chargeback.user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{chargeback.user.name}</div>
                      <div className="text-xs text-gray-500">{chargeback.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{chargeback.creator}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${chargeback.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{chargeback.transactionId}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getReasonColor(chargeback.reason)}>{translateReason(chargeback.reason)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPriorityColor(chargeback.priority)}>{translatePriority(chargeback.priority)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(chargeback.status)}>{translateStatus(chargeback.status)}</Badge>
                  {chargeback.evidence && (
                    <div className="text-xs text-gray-500 mt-1">{chargeback.evidence}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm text-gray-600">{chargeback.openedAt}</div>
                    {chargeback.respondedAt && (
                      <div className="text-xs text-gray-500">{t('table.responded')} {chargeback.respondedAt}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm">
                    {t('table.review')}
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
