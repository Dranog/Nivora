// ==========================================
// REPORTS PAGE (Écran 3)
// ==========================================
// apps/web/app/(admin)/reports/page.tsx

'use client';

import { useState } from 'react';
import { useReports, useUpdateReport } from '@/hooks/admin/useReports';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Filter, X } from 'lucide-react';

export default function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data, isLoading } = useReports({
    type: typeFilter,
    severity: severityFilter,
    status: statusFilter,
  });

  const updateMutation = useUpdateReport();

  const handleAction = async (reportId: string, action: string) => {
    await updateMutation.mutateAsync({
      id: reportId,
      status: action,
      notes: 'Processed by admin',
    });
    setSelectedReport(null);
  };

  return (
    <div className="flex h-screen p-6 gap-6">
      {/* Left: Reports List */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-semibold">Reports & Flags</h1>
        <p className="text-gray-600">View and manage all user-submitted reports in one place.</p>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <option value="ALL">All Types</option>
            <option value="USER">User</option>
            <option value="POST">Post</option>
            <option value="MESSAGE">Message</option>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <option value="ALL">All Severity</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </Select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="ghost" onClick={() => {
            setTypeFilter('ALL');
            setSeverityFilter('ALL');
            setStatusFilter('ALL');
          }}>
            Clear
          </Button>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {data?.reports.map((report: any) => (
            <Card
              key={report.id}
              className={`p-4 cursor-pointer hover:shadow-md transition ${
                selectedReport?.id === report.id ? 'border-cyan-500 border-2' : ''
              }`}
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={report.reporter.avatar} />
                    <AvatarFallback>{report.reporter.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">#{report.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">{report.reporter.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getSeverityColor(report.priority)}>
                    {report.priority}
                  </Badge>
                  <p className="text-sm text-gray-500">{formatTime(report.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Report Detail */}
      {selectedReport && (
        <div className="w-96 border-l pl-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Detail</h2>
            <Badge className={getSeverityColor(selectedReport.priority)}>
              {selectedReport.priority}
            </Badge>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="border-b flex gap-4">
              <button className="pb-2 border-b-2 border-cyan-500 text-cyan-600">Content</button>
              <button className="pb-2 text-gray-600">Context</button>
              <button className="pb-2 text-gray-600">History</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Reporter</p>
                <p className="text-sm text-gray-900">{selectedReport.reporter.username}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Reason</p>
                <p className="text-sm text-gray-900">{selectedReport.reason}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-sm text-gray-600">{selectedReport.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Reported Content</p>
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm">Content preview would appear here</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="ghost" onClick={() => handleAction(selectedReport.id, 'DISMISSED')}>
                Dismiss
              </Button>
              <Button variant="outline" onClick={() => handleAction(selectedReport.id, 'RESOLVED')}>
                Warn
              </Button>
              <Button variant="destructive" onClick={() => handleAction(selectedReport.id, 'RESOLVED')}>
                Ban
              </Button>
              <Button className="bg-cyan-600" onClick={() => handleAction(selectedReport.id, 'RESOLVED')}>
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODERATION PAGE (Écran 4)
// ==========================================
// apps/web/app/(admin)/moderation/page.tsx

'use client';

import { useState } from 'react';
import { useModerationQueue, useMakeDecision } from '@/hooks/admin/useModeration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle } from 'lucide-react';

export default function ModerationPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isBlurred, setIsBlurred] = useState(true);

  const { data, isLoading } = useModerationQueue({ status: 'PENDING' });
  const decisionMutation = useMakeDecision();

  const handleDecision = async (decision: string) => {
    if (!selectedItem) return;

    await decisionMutation.mutateAsync({
      contentId: selectedItem.id,
      decision,
      reason: 'Moderation decision',
    });

    setSelectedItem(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left: Queue */}
      <div className="w-80 bg-gray-800 p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-semibold">Moderation Queue</h2>

        {data?.items.map((item: any) => (
          <Card
            key={item.id}
            className={`p-4 cursor-pointer bg-gray-700 hover:bg-gray-600 ${
              selectedItem?.id === item.id ? 'border-cyan-500' : ''
            }`}
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={item.creatorAvatar} />
                <AvatarFallback>{item.creatorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{item.creatorName}</p>
                <p className="text-sm text-gray-400">@{item.creatorName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
              <p className="text-xs text-gray-400">{formatTime(item.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Right: Content Review */}
      {selectedItem && (
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{selectedItem.creatorName}</h1>
            <p className="text-gray-400">October 10, 2025 • {selectedItem.reportCount} reports</p>
          </div>

          {/* Content Preview */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden h-96">
            {isBlurred && (
              <div className="absolute inset-0 backdrop-blur-2xl flex items-center justify-center">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => setIsBlurred(false)}
                >
                  Unblur to Review
                </Button>
              </div>
            )}
            <img
              src={selectedItem.contentUrl || 'https://via.placeholder.com/800x400'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* AI Analysis */}
          <Card className="bg-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
            <div className="space-y-3">
              {['Violence', 'Adult', 'Hate', 'Spam'].map((category, idx) => {
                const score = [12, 2, 56, 8][idx];
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{category}</span>
                      <span className="text-sm font-semibold">{score}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              AI risk analysis generated automatically for review assistance.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleDecision('APPROVE')}
            >
              Approve
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => handleDecision('REJECT')}
            >
              Reject
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => handleDecision('ESCALATE')}
            >
              Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TRANSACTIONS PAGE (Écran 5)
// ==========================================
// apps/web/app/(admin)/transactions/page.tsx

'use client';

import { useState } from 'react';
import { useTransactions, useTransactionTrends } from '@/hooks/admin/useTransactions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendChart } from '@/components/admin/TrendChart';
import { Download } from 'lucide-react';

export default function TransactionsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useTransactions({
    type: typeFilter,
    status: statusFilter,
  });

  const { data: revenueTrend } = useTransactionTrends({ period: '30d', metric: 'revenue' });
  const { data: payoutsTrend } = useTransactionTrends({ period: '30d', metric: 'payouts' });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Transactions Overview</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <p className="text-gray-600">Track all platform transactions and monitor payment flow.</p>

      {/* Filters */}
      <div className="flex gap-4">
        <input type="date" className="border rounded px-3 py-2" placeholder="Date Range" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <option value="ALL">Transaction Type</option>
          <option value="SUBSCRIPTION">Subscription</option>
          <option value="PPV">PPV</option>
          <option value="TIP">Tip</option>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </Select>
        <Button className="bg-cyan-600">Apply Filter</Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <p className="text-2xl font-bold mb-4">€25K</p>
          <TrendChart data={revenueTrend || []} color="#00B8A9" />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payouts Trend</h3>
          <TrendChart data={payoutsTrend || []} color="#00B8A9" type="bar" />
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Date</th>
              <th className="text-left">Type</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.transactions.map((tx: any) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{formatDate(tx.date)}</td>
                <td>
                  <Badge>{tx.type}</Badge>
                </td>
                <td className="font-semibold">€{(tx.amount / 100).toFixed(2)}</td>
                <td>
                  <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// Helper functions
function getSeverityColor(priority: string) {
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-purple-100 text-purple-800',
  };
  return colors[priority] || 'bg-gray-100';
}

function getPriorityColor(priority: string) {
  const colors = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-orange-500',
    HIGH: 'bg-red-500',
  };
  return colors[priority] || 'bg-gray-500';
}

function getStatusColor(status: string) {
  const colors = {
    COMPLETED: 'bg-green-100 text-green-800',
    PENDING: 'bg-orange-100 text-orange-800',
    FAILED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100';
}

function formatTime(date: string) {
  return new Date(date).toLocaleString();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}