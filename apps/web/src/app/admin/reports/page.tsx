'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Plus,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Category = 'Spam' | 'Harassment' | 'Inappropriate Content' | 'Fake Account' | 'Copyright' | 'Other';
type Status = 'Pending' | 'Reviewing' | 'Resolved' | 'Rejected';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Report {
  id: string;
  reportedBy: { id: string; name: string; avatar: string; email?: string };
  reportedUser: { id: string; name: string; avatar: string; email?: string };
  reason: string;
  category: Category;
  status: Status;
  priority: Priority;
  description: string;
  createdAt: string;
  evidence: number;
  evidenceFiles?: Array<{ id: string; type: 'image' | 'video' | 'document'; name: string; url: string }>;
}

const SEED: Report[] = [
  {
    id: 'R-1001',
    reportedBy: { id: 'u2', name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    reportedUser: { id: 'u1', name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    reason: 'Posting spam content repeatedly',
    category: 'Spam',
    status: 'Pending',
    priority: 'High',
    description: 'This user has been posting promotional links in comments multiple times',
    createdAt: '2 hours ago',
    evidence: 3,
    evidenceFiles: [
      { id: 'e1', type: 'image', name: 'screenshot-1.png', url: 'https://picsum.photos/seed/r1/800/600' },
      { id: 'e2', type: 'video', name: 'clip.mp4', url: 'https://example.com/clip.mp4' },
      { id: 'e3', type: 'document', name: 'chat.pdf', url: 'https://example.com/chat.pdf' },
    ],
  },
  {
    id: 'R-1002',
    reportedBy: { id: 'u4', name: 'Sarah Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    reportedUser: {
      id: 'u3',
      name: 'David Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    reason: 'Harassment and threatening messages',
    category: 'Harassment',
    status: 'Reviewing',
    priority: 'Critical',
    description: 'Received multiple threatening DMs from this account',
    createdAt: '5 hours ago',
    evidence: 7,
  },
];

type TabType = 'all' | 'pending' | 'reviewing' | 'resolved' | 'rejected';

export default function ReportsPage() {
  const t = useTranslations('admin.reports');  const [reports, setReports] = useState<Report[]>(SEED);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [detail, setDetail] = useState<Report | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState<'approve' | 'reject' | 'delete' | null>(null);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'Pending').length,
      reviewing: reports.filter((r) => r.status === 'Reviewing').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      critical: reports.filter((r) => r.priority === 'Critical').length,
    }),
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const tabMatch = activeTab === 'all' ? true : report.status.toLowerCase() === activeTab;
      const q = searchQuery.toLowerCase();
      const searchMatch =
        q === '' ||
        report.reportedUser.name.toLowerCase().includes(q) ||
        report.reportedBy.name.toLowerCase().includes(q) ||
        report.reason.toLowerCase().includes(q) ||
        report.category.toLowerCase().includes(q);
      return tabMatch && searchMatch;
    });
  }, [reports, activeTab, searchQuery]);

  const getPriorityColor = (priority: Priority) => {
    if (priority === 'Critical') return 'bg-red-100 text-red-800';
    if (priority === 'High') return 'bg-orange-100 text-orange-800';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: Status) => {
    if (status === 'Resolved') return 'bg-green-100 text-green-800';
    if (status === 'Reviewing') return 'bg-blue-100 text-blue-800';
    if (status === 'Rejected') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getCategoryColor = (category: Category) => {
    const map: Record<Category, string> = {
      Harassment: 'bg-red-100 text-red-800',
      Spam: 'bg-orange-100 text-orange-800',
      'Inappropriate Content': 'bg-purple-100 text-purple-800',
      'Fake Account': 'bg-blue-100 text-blue-800',
      Copyright: 'bg-indigo-100 text-indigo-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return map[category];
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedReports(checked ? filteredReports.map((r) => r.id) : []);
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    setSelectedReports((prev) => (checked ? [...prev, reportId] : prev.filter((id) => id !== reportId)));
  };

  const bulkApprove = async () => {
    if (selectedReports.length === 0) return;
    const ok = confirm(t('bulkApproveConfirm', { count: selectedReports.length }));
    if (!ok) return;
    setIsBulkLoading('approve');
    await new Promise((r) => setTimeout(r, 500));
    setReports((prev) => prev.map((r) => (selectedReports.includes(r.id) ? { ...r, status: 'Resolved' } : r)));
    setSelectedReports([]);
    setIsBulkLoading(null);
    toast.success(t('reportsApproved'), {
        description: t('reportsResolvedMessage')
      });
  };

  const bulkReject = async () => {
    if (selectedReports.length === 0) return;
    const reason = prompt(t('bulkRejectPrompt'));
    if (!reason || !reason.trim()) {
      toast.error(t('reasonRequired'), {
        description: t('rejectionReasonMandatory')
      });
      return;
    }
    setIsBulkLoading('reject');
    await new Promise((r) => setTimeout(r, 500));
    setReports((prev) => prev.map((r) => (selectedReports.includes(r.id) ? { ...r, status: 'Rejected' } : r)));
    setSelectedReports([]);
    setIsBulkLoading(null);
    toast.info(t('reportsRejected'), {
        description: t('reportsRejectedMessage')
      });
  };

  const bulkDelete = async () => {
    if (selectedReports.length === 0) return;
    const ok = confirm(t('bulkDeleteConfirm', { count: selectedReports.length }));
    if (!ok) return;
    const confirmText = prompt(t('deleteConfirmText'));
    if (confirmText !== 'DELETE') {
      toast.error(t('deletionCancelled'), {
        description: t('confirmTextMismatch')
      });
      return;
    }
    setIsBulkLoading('delete');
    await new Promise((r) => setTimeout(r, 500));
    setReports((prev) => prev.filter((r) => !selectedReports.includes(r.id)));
    setSelectedReports([]);
    setIsBulkLoading(null);
    toast.success(t('deleted'), {
        description: t('reportsDeleted')
      });
  };

  const openReview = (r: Report) => {
    setDetail(r);
    setOpenDetail(true);
  };

  // Create New Report (with avatar URL or upload)
  interface NewReportFormState {
    reportedUserName: string;
    reportedUserAvatar: string;
    reportedByName: string;
    reportedByAvatar: string;
    reason: string;
    category: Category;
    priority: Priority;
    description: string;
    evidenceFiles: File[];
  }
  const [newReport, setNewReport] = useState<NewReportFormState>({
    reportedUserName: '',
    reportedUserAvatar: '',
    reportedByName: '',
    reportedByAvatar: '',
    reason: '',
    category: 'Spam',
    priority: 'Medium',
    description: '',
    evidenceFiles: [],
  });
  const [isSavingNew, setIsSavingNew] = useState(false);

  const onAvatarUpload = async (
    side: 'by' | 'user',
    file: File | null,
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalidFile'), {
        description: t('avatarMustBeImage')
      });
      return;
    }
    // Preview locally (no backend required for demo)
    const url = URL.createObjectURL(file);
    if (side === 'by') {
      setNewReport((p) => ({ ...p, reportedByAvatar: url }));
    } else {
      setNewReport((p) => ({ ...p, reportedUserAvatar: url }));
    }
    toast.success(t('avatarReady'), {
        description: t('avatarImageLoaded')
      });
  };

  const validateNew = (): string | null => {
    if (!newReport.reportedUserName.trim()) return t('reportedUserNameRequired');
    if (!newReport.reportedByName.trim()) return t('reporterNameRequired');
    if (!newReport.reason.trim()) return t('reasonIsRequired');
    if (!newReport.description.trim()) return t('descriptionIsRequired');
    if (!newReport.reportedUserAvatar && !newReport.reportedByAvatar) {
      return t('provideAtLeastOneAvatar');
    }
    return null;
  };

  const saveNewReport = async () => {
    const err = validateNew();
    if (err) {
      toast.error(t('validationError'), {
        description: err
      });
      return;
    }
    setIsSavingNew(true);
    await new Promise((r) => setTimeout(r, 600));
    const id = `R-${Math.floor(1000 + Math.random() * 9000)}`;
    const now: Report = {
      id,
      reportedBy: { id: crypto.randomUUID(), name: newReport.reportedByName, avatar: newReport.reportedByAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newReport.reportedByName)}` },
      reportedUser: { id: crypto.randomUUID(), name: newReport.reportedUserName, avatar: newReport.reportedUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newReport.reportedUserName)}` },
      reason: newReport.reason,
      category: newReport.category,
      status: 'Pending',
      priority: newReport.priority,
      description: newReport.description,
      createdAt: 'just now',
      evidence: newReport.evidenceFiles.length,
      evidenceFiles: newReport.evidenceFiles.map((f, idx) => ({
        id: `f${idx + 1}`,
        type: f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document',
        name: f.name,
        url: URL.createObjectURL(f),
      })),
    };
    setReports((prev) => [now, ...prev]);
    setIsSavingNew(false);
    setCreating(false);
    setNewReport({
      reportedUserName: '',
      reportedUserAvatar: '',
      reportedByName: '',
      reportedByAvatar: '',
      reason: '',
      category: 'Spam',
      priority: 'Medium',
      description: '',
      evidenceFiles: [],
    });
    toast.success(t('reportCreated'), {
        description: t('reportCreatedMessage', { id
      }) });
  };

  const EvidenceIcon = ({ type }: { type: 'image' | 'video' | 'document' }) => {
    if (type === 'image') return <ImageIcon className="w-3.5 h-3.5" />;
    if (type === 'video') return <Video className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setCreating(true)} className="bg-gradient-to-r from-brand-start to-brand-end text-white">
          <Plus className="w-4 h-4 mr-2" />
          {t('newReport')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4"><p className="text-sm text-gray-600">{t('totalReports')}</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">{t('pending')}</p><p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">{t('reviewing')}</p><p className="text-2xl font-bold text-blue-600 mt-1">{stats.reviewing}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">{t('resolved')}</p><p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">{t('critical')}</p><p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-10" />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('allReports') },
          { key: 'pending', label: t('pending') },
          { key: 'reviewing', label: t('reviewing') },
          { key: 'resolved', label: t('resolved') },
          { key: 'rejected', label: t('rejected') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-gradient-to-r from-brand-start to-brand-end text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedReports.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">{selectedReports.length} {t('selected')}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={bulkApprove} disabled={isBulkLoading !== null}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isBulkLoading === 'approve' ? t('approving') : t('approve')}
            </Button>
            <Button variant="outline" size="sm" onClick={bulkReject} disabled={isBulkLoading !== null}>
              <XCircle className="w-4 h-4 mr-2" />
              {isBulkLoading === 'reject' ? t('rejecting') : t('reject')}
            </Button>
            <Button variant="outline" size="sm" onClick={bulkDelete} disabled={isBulkLoading !== null}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isBulkLoading === 'delete' ? t('deleting') : t('delete')}
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
                  checked={selectedReports.length > 0 && selectedReports.length === filteredReports.length}
                  onCheckedChange={(c) => handleSelectAll(Boolean(c))}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('reportedUser')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('reportedBy')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('reason')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('category')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('priority')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('evidence')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('time')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={(c) => handleSelectReport(report.id, Boolean(c))}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarImage src={report.reportedUser.avatar} /><AvatarFallback>{report.reportedUser.name.slice(0, 2)}</AvatarFallback></Avatar>
                    <span className="font-medium text-gray-900">{report.reportedUser.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarImage src={report.reportedBy.avatar} /><AvatarFallback>{report.reportedBy.name.slice(0, 2)}</AvatarFallback></Avatar>
                    <span className="text-sm text-gray-600">{report.reportedBy.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">{report.reason}</div>
                    <div className="text-xs text-gray-500 truncate">{report.description}</div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge className={getCategoryColor(report.category)}>{report.category}</Badge></td>
                <td className="px-4 py-3"><Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge></td>
                <td className="px-4 py-3"><Badge className={getStatusColor(report.status)}>{report.status}</Badge></td>
                <td className="px-4 py-3"><span className="text-sm text-gray-600">{report.evidence} {t('files')}</span></td>
                <td className="px-4 py-3"><span className="text-sm text-gray-600">{report.createdAt}</span></td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" onClick={() => openReview(report)}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('review')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Dialog open={openDetail} onOpenChange={() => setOpenDetail(false)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-brand" />
              {t('reportDetails')} {detail ? `— ${detail.id}` : ''}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">{t('reportedUser')}</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10"><AvatarImage src={detail.reportedUser.avatar} /><AvatarFallback>{detail.reportedUser.name[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold">{detail.reportedUser.name}</p>
                      <p className="text-xs text-gray-600">{detail.reportedUser.email || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">{t('reportedBy')}</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10"><AvatarImage src={detail.reportedBy.avatar} /><AvatarFallback>{detail.reportedBy.name[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold">{detail.reportedBy.name}</p>
                      <p className="text-xs text-gray-600">{detail.reportedBy.email || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div><p className="text-xs text-gray-500 mb-1">{t('category')}</p><Badge className={getCategoryColor(detail.category)}>{detail.category}</Badge></div>
                <div><p className="text-xs text-gray-500 mb-1">{t('priority')}</p><Badge className={getPriorityColor(detail.priority)}>{detail.priority}</Badge></div>
                <div><p className="text-xs text-gray-500 mb-1">{t('status')}</p><Badge className={getStatusColor(detail.status)}>{detail.status}</Badge></div>
                <div><p className="text-xs text-gray-500 mb-1">{t('evidence')}</p><p className="text-sm font-medium">{detail.evidence} {t('files')}</p></div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-semibold mb-1">{detail.reason}</p>
                <p className="text-sm text-gray-700">{detail.description}</p>
              </div>

              {detail.evidenceFiles && detail.evidenceFiles.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">{t('evidence')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {detail.evidenceFiles.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => window.open(f.url, '_blank')}
                        className="p-3 border rounded-lg hover:border-brand text-left"
                      >
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1"><EvidenceIcon type={f.type} /> {f.type}</div>
                        <p className="text-sm truncate">{f.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const ok = confirm(t('approveConfirm'));
                    if (!ok || !detail) return;
                    setReports((prev) => prev.map((r) => (r.id === detail.id ? { ...r, status: 'Resolved' } : r)));
                    toast.success(t('approved'), {
        description: t('reportResolved', { id: detail.id
      }) });
                    setOpenDetail(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-brand-start to-brand-end text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('approve')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const reason = prompt(t('rejectPrompt'));
                    if (!reason || !reason.trim() || !detail) {
                      toast.error(t('reasonRequired'), {
        description: t('rejectionReasonMandatory')
      });
                      return;
                    }
                    setReports((prev) => prev.map((r) => (r.id === detail.id ? { ...r, status: 'Rejected' } : r)));
                    toast.info(t('rejected'), {
        description: t('reportRejected', { id: detail.id
      }) });
                    setOpenDetail(false);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('reject')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (!detail) return;
                    const ok = confirm(t('deleteConfirm', { id: detail.id }));
                    if (!ok) return;
                    const txt = prompt(t('deleteConfirmText'));
                    if (txt !== 'DELETE') {
                      toast.error(t('cancelled'), {
        description: t('confirmTextMismatch')
      });
                      return;
                    }
                    setReports((prev) => prev.filter((r) => r.id !== detail.id));
                    toast.success(t('deleted'), {
        description: t('reportDeleted', { id: detail.id
      }) });
                    setOpenDetail(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Report Modal */}
      <Dialog open={creating} onOpenChange={() => setCreating(false)}>
        <DialogContent className="sm:max-w-[840px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand" />
              {t('newReport')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>{t('reportedUserName')}</Label>
              <Input value={newReport.reportedUserName} onChange={(e) => setNewReport((p) => ({ ...p, reportedUserName: e.target.value }))} placeholder="e.g., Mike Johnson" />
              <Label>{t('reportedUserAvatarUrl')}</Label>
              <Input value={newReport.reportedUserAvatar} onChange={(e) => setNewReport((p) => ({ ...p, reportedUserAvatar: e.target.value }))} placeholder="https://…" />
              <div className="flex items-center gap-2">
                <input id="user-avatar-upload" type="file" accept="image/*" onChange={(e) => onAvatarUpload('user', e.target.files?.[0] || null)} />
                <Label htmlFor="user-avatar-upload" className="text-xs text-gray-600 flex items-center gap-1"><UploadCloud className="w-3 h-3" /> {t('uploadAvatar')}</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>{t('reportedByName')}</Label>
              <Input value={newReport.reportedByName} onChange={(e) => setNewReport((p) => ({ ...p, reportedByName: e.target.value }))} placeholder="e.g., John Smith" />
              <Label>{t('reportedByAvatarUrl')}</Label>
              <Input value={newReport.reportedByAvatar} onChange={(e) => setNewReport((p) => ({ ...p, reportedByAvatar: e.target.value }))} placeholder="https://…" />
              <div className="flex items-center gap-2">
                <input id="by-avatar-upload" type="file" accept="image/*" onChange={(e) => onAvatarUpload('by', e.target.files?.[0] || null)} />
                <Label htmlFor="by-avatar-upload" className="text-xs text-gray-600 flex items-center gap-1"><UploadCloud className="w-3 h-3" /> {t('uploadAvatar')}</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('category')}</Label>
              <select
                value={newReport.category}
                onChange={(e) => setNewReport((p) => ({ ...p, category: e.target.value as Category }))}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {(['Spam', 'Harassment', 'Inappropriate Content', 'Fake Account', 'Copyright', 'Other'] as Category[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t('priority')}</Label>
              <select
                value={newReport.priority}
                onChange={(e) => setNewReport((p) => ({ ...p, priority: e.target.value as Priority }))}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t('evidenceFiles')}</Label>
              <input
                multiple
                type="file"
                onChange={(e) => setNewReport((p) => ({ ...p, evidenceFiles: Array.from(e.target.files || []) }))}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('reason')}</Label>
              <Input value={newReport.reason} onChange={(e) => setNewReport((p) => ({ ...p, reason: e.target.value }))} placeholder={t('shortReason')} />
            </div>
            <div>
              <Label>{t('description')}</Label>
              <textarea
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                value={newReport.description}
                onChange={(e) => setNewReport((p) => ({ ...p, description: e.target.value }))}
                placeholder={t('detailedDescription')}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveNewReport} disabled={isSavingNew} className="flex-1 bg-gradient-to-r from-brand-start to-brand-end text-white">
              {isSavingNew ? t('creating') : t('createReport')}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>
              {t('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
