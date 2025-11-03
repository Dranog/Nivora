'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileText, Clock, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface LegalRequest {
  id: string;
  type: 'DMCA' | 'Copyright' | 'Trademark' | 'Privacy' | 'Legal Hold' | 'Court Order' | 'Subpoena';
  submittedBy: string;
  email: string;
  targetUser?: string;
  targetContent?: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  actionTaken?: string;
}

const DEMO_REQUESTS: LegalRequest[] = [
  {
    id: '1',
    type: 'DMCA',
    submittedBy: 'ABC Studios Inc.',
    email: 'legal@abcstudios.com',
    targetUser: 'Sophie Martin',
    targetContent: 'Post #12345',
    description: 'Copyrighted material used without permission',
    status: 'Pending',
    priority: 'High',
    submittedAt: '2024-01-22 14:30',
  },
  {
    id: '2',
    type: 'Court Order',
    submittedBy: 'Superior Court of California',
    email: 'clerk@superior.ca.gov',
    targetUser: 'Lucas Dubois',
    description: 'Court order to preserve account data',
    status: 'Under Review',
    priority: 'Critical',
    submittedAt: '2024-01-22 10:15',
  },
  {
    id: '3',
    type: 'Privacy',
    submittedBy: 'Jane Doe',
    email: 'jane.doe@example.com',
    targetContent: 'Post #12340',
    description: 'Request to remove personal information',
    status: 'Approved',
    priority: 'Medium',
    submittedAt: '2024-01-21 16:45',
    reviewedAt: '2024-01-22 09:30',
    reviewedBy: 'Legal Team',
    actionTaken: 'Content removed',
  },
  {
    id: '4',
    type: 'Trademark',
    submittedBy: 'XYZ Corporation',
    email: 'trademark@xyzcorp.com',
    targetUser: 'Emma Wilson',
    description: 'Unauthorized use of registered trademark',
    status: 'Rejected',
    priority: 'Low',
    submittedAt: '2024-01-21 14:20',
    reviewedAt: '2024-01-22 08:15',
    reviewedBy: 'Legal Team',
    actionTaken: 'Request does not meet criteria',
  },
  {
    id: '5',
    type: 'Subpoena',
    submittedBy: 'Federal Court NYC',
    email: 'clerk@nysd.uscourts.gov',
    targetUser: 'Alexandre Rousseau',
    description: 'Subpoena for user account information',
    status: 'Pending',
    priority: 'Critical',
    submittedAt: '2024-01-21 12:00',
  },
  {
    id: '6',
    type: 'DMCA',
    submittedBy: 'Music Rights Ltd.',
    email: 'legal@musicrights.com',
    targetUser: 'Julie Laurent',
    targetContent: 'Video #98765',
    description: 'Copyrighted music used in video',
    status: 'Resolved',
    priority: 'Medium',
    submittedAt: '2024-01-20 18:30',
    reviewedAt: '2024-01-21 11:20',
    reviewedBy: 'Content Team',
    actionTaken: 'Audio muted, creator notified',
  },
  {
    id: '7',
    type: 'Legal Hold',
    submittedBy: 'Department of Justice',
    email: 'legal@doj.gov',
    targetUser: 'Thomas Bernard',
    description: 'Preservation order for all account data',
    status: 'Under Review',
    priority: 'Critical',
    submittedAt: '2024-01-20 15:15',
  },
  {
    id: '8',
    type: 'Copyright',
    submittedBy: 'Image Stock Co.',
    email: 'copyright@imagestock.com',
    targetUser: 'Camille Moreau',
    targetContent: 'Post #54321',
    description: 'Stock photos used without license',
    status: 'Approved',
    priority: 'Low',
    submittedAt: '2024-01-20 10:45',
    reviewedAt: '2024-01-20 14:30',
    reviewedBy: 'Legal Team',
    actionTaken: 'Content removed, warning issued',
  },
];

type TabType = 'all' | 'pending' | 'under-review' | 'approved' | 'rejected';

export default function LegalPage() {
  const t = useTranslations('admin.legal');  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Helper function to translate request types
  function translateType(type: string): string {
    const key = type.toLowerCase().replace(/\s+/g, '');
    if (key === 'dmca') return t('types.dmca');
    if (key === 'copyright') return t('types.copyright');
    if (key === 'trademark') return t('types.trademark');
    if (key === 'privacy') return t('types.privacy');
    if (key === 'legalhold') return t('types.legalHold');
    if (key === 'courtorder') return t('types.courtOrder');
    if (key === 'subpoena') return t('types.subpoena');
    return type;
  }

  // Helper function to translate statuses
  function translateStatus(status: string): string {
    const key = status.toLowerCase().replace(/\s+/g, '');
    if (key === 'pending') return t('statuses.pending');
    if (key === 'underreview') return t('statuses.underReview');
    if (key === 'approved') return t('statuses.approved');
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
    pending: DEMO_REQUESTS.filter((r) => r.status === 'Pending').length,
    underReview: DEMO_REQUESTS.filter((r) => r.status === 'Under Review').length,
    approved: DEMO_REQUESTS.filter((r) => r.status === 'Approved').length,
    rejected: DEMO_REQUESTS.filter((r) => r.status === 'Rejected').length,
    avgResponseTime: '6.2 hours',
    complianceRate: '94%',
  };

  const filteredRequests = DEMO_REQUESTS.filter((request) => {
    let tabMatch = true;
    if (activeTab === 'pending') tabMatch = request.status === 'Pending';
    if (activeTab === 'under-review') tabMatch = request.status === 'Under Review';
    if (activeTab === 'approved') tabMatch = request.status === 'Approved' || request.status === 'Resolved';
    if (activeTab === 'rejected') tabMatch = request.status === 'Rejected';

    const searchMatch =
      searchQuery === '' ||
      request.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.targetUser?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedRequests(checked ? filteredRequests.map((r) => r.id) : []);
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    setSelectedRequests(checked ? [...selectedRequests, requestId] : selectedRequests.filter((id) => id !== requestId));
  };

  const handleApproveSelected = () => {
    const plural = selectedRequests.length > 1 ? 's' : '';
    if (confirm(t('confirmations.approve', { count: selectedRequests.length, plural }))) {
      toast.success(t('toasts.approved'), {
        description: t('toasts.approvedMessage', { count: selectedRequests.length, plural
      }),
      });
      setSelectedRequests([]);
    }
  };

  const handleRejectSelected = () => {
    const plural = selectedRequests.length > 1 ? 's' : '';
    if (confirm(t('confirmations.reject', { count: selectedRequests.length, plural }))) {
      toast.success(t('toasts.rejected'), {
        description: t('toasts.rejectedMessage', { count: selectedRequests.length, plural
      }),
      });
      setSelectedRequests([]);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      DMCA: 'bg-red-100 text-red-800',
      Copyright: 'bg-orange-100 text-orange-800',
      Trademark: 'bg-yellow-100 text-yellow-800',
      Privacy: 'bg-blue-100 text-blue-800',
      'Legal Hold': 'bg-purple-100 text-purple-800',
      'Court Order': 'bg-indigo-100 text-indigo-800',
      Subpoena: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <Clock className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-gray-600">{t('stats.pending')}</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-gray-600">{t('stats.underReview')}</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-600">{t('stats.approved')}</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-red-600" />
            <div className="text-sm text-gray-600">{t('stats.rejected')}</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.avgResponse')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.compliance')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.complianceRate}</div>
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
          { key: 'under-review', label: t('tabs.underReview') },
          { key: 'approved', label: t('tabs.approved') },
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

      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {t('bulkActions.selected', { count: selectedRequests.length })}
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
                  checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('table.selectAll')}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.type')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.submittedBy')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.target')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.description')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.priority')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.submitted')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedRequests.includes(request.id)}
                    onCheckedChange={(checked) => handleSelectRequest(request.id, checked as boolean)}
                    aria-label={`Select request from ${request.submittedBy}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge className={getTypeColor(request.type)}>{translateType(request.type)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{request.submittedBy}</div>
                    <div className="text-xs text-gray-500">{request.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {request.targetUser && <div>{t('table.user')} {request.targetUser}</div>}
                    {request.targetContent && <div className="text-xs text-gray-500">{request.targetContent}</div>}
                    {!request.targetUser && !request.targetContent && <span className="text-gray-400">{t('table.na')}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm text-gray-900 truncate">{request.description}</div>
                  {request.actionTaken && (
                    <div className="text-xs text-green-600 mt-1">{t('table.action')} {request.actionTaken}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPriorityColor(request.priority)}>{translatePriority(request.priority)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(request.status)}>{translateStatus(request.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm text-gray-600">{request.submittedAt}</div>
                    {request.reviewedAt && (
                      <div className="text-xs text-gray-500">{t('table.reviewed')} {request.reviewedAt}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm">
                    {t('table.reviewButton')}
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
