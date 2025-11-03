// apps/web/app/(admin)/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { io, Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useModerationStore } from '@/store/admin/moderationStore';
import { formatDistanceToNow } from 'date-fns';

const decisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'ESCALATE', 'REQUEST_CHANGES']),
  reason: z.string().min(5).max(500).optional(),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { addReport } = useModerationStore();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const decisionForm = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
  });

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const newSocket = io(wsUrl, {
      path: '/admin',
      auth: {
        token: localStorage.getItem('admin_token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('report:new', (data: any) => {
      toast({
        title: 'New Report',
        description: `Priority: ${data.priority}`,
        variant: 'default',
      });
      
      addReport({
        id: data.reportId,
        targetId: data.reportId,
        priority: data.priority,
        status: 'PENDING',
      });

      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    });

    newSocket.on('moderation:decision', () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', { status: statusFilter, priority: priorityFilter }],
    queryFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?status=${statusFilter}&priority=${priorityFilter !== 'ALL' ? priorityFilter : ''}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      ).then((r) => r.json()),
    retry: 2,
  });

  const makeDecisionMutation = useMutation({
    mutationFn: (data: { reportId: string; decision: string; reason?: string }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${data.reportId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ decision: data.decision, reason: data.reason }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast({ title: 'Decision submitted successfully' });
      setDecisionDialogOpen(false);
      setSelectedReport(null);
      decisionForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleDecision = decisionForm.handleSubmit((data) => {
    if (!selectedReport) return;
    makeDecisionMutation.mutate({
      reportId: selectedReport.id,
      decision: data.decision,
      reason: data.reason,
    });
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] p-6 gap-6">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Reports & Flags</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage all user-submitted reports
          </p>
        </div>

        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

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
                    <p className="font-medium text-gray-900 dark:text-white">
                      #{report.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.reporter.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      report.priority === 'CRITICAL'
                        ? 'error'
                        : report.priority === 'HIGH'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {report.priority}
                  </Badge>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 pl-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report Detail</h2>
            <Badge
              variant={
                selectedReport.priority === 'CRITICAL'
                  ? 'error'
                  : selectedReport.priority === 'HIGH'
                  ? 'warning'
                  : 'default'
              }
            >
              {selectedReport.priority}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reporter</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {selectedReport.reporter.username}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</p>
              <p className="text-sm text-gray-900 dark:text-white">{selectedReport.reason}</p>
            </div>

            {selectedReport.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedReport.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDecisionDialogOpen(true)}
            >
              Make Decision
            </Button>
          </div>
        </div>
      )}

      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Moderation Decision</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDecision} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Decision *</label>
              <select
                {...decisionForm.register('decision')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="ESCALATE">Escalate</option>
                <option value="REQUEST_CHANGES">Request Changes</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
              <Textarea {...decisionForm.register('reason')} rows={4} />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDecisionDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={makeDecisionMutation.isPending}>
                {makeDecisionMutation.isPending ? 'Submitting...' : 'Submit Decision'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// apps/web/app/(admin)/transactions/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/admin/ErrorState';
import { Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'transactions', { type: typeFilter, status: statusFilter, cursor }],
    queryFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions?` +
          new URLSearchParams({
            ...(typeFilter !== 'ALL' && { type: typeFilter }),
            ...(statusFilter !== 'ALL' && { status: statusFilter }),
            ...(cursor && { cursor }),
          }),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      ).then((r) => r.json()),
    retry: 2,
  });

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState message="Failed to load transactions" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor all platform transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="ALL">All Types</option>
          <option value="SUBSCRIPTION">Subscription</option>
          <option value="PPV">PPV</option>
          <option value="TIP">Tip</option>
          <option value="PURCHASE">Purchase</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                </tr>
              ))
            ) : data?.transactions.length > 0 ? (
              data.transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {tx.user.username}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{tx.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        tx.status === 'SUCCESS'
                          ? 'success'
                          : tx.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {data?.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setCursor(data.nextCursor)}
            disabled={isLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// apps/web/app/(admin)/accounting/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';

const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
});

type ExportFormData = z.infer<typeof exportSchema>;

export default function AccountingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const exportForm = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'csv',
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['admin', 'accounting', 'summary'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/accounting/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }).then((r) => r.json()),
  });

  const { data: exports } = useQuery({
    queryKey: ['admin', 'accounting', 'exports'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/accounting/exports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }).then((r) => r.json()),
    refetchInterval: 5000,
  });

  const createExportMutation = useMutation({
    mutationFn: (data: ExportFormData) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/accounting/exports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          format: data.format,
          filters: {
            dateFrom: new Date(data.dateFrom).toISOString(),
            dateTo: new Date(data.dateTo).toISOString(),
          },
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounting', 'exports'] });
      toast({ title: 'Export started', description: 'Your export is being processed' });
      setExportDialogOpen(false);
      exportForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleExport = exportForm.handleSubmit((data) => {
    createExportMutation.mutate(data);
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Accounting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Financial overview and exports</p>
        </div>
        <Button onClick={() => setExportDialogOpen(true)}>
          <Download className="w-4 h-4 mr-2" />
          New Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary?.revenue?.total || 0)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Commission</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary?.commission || 0)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Net Profit</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary?.netProfit || 0)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Export History</h2>
        <div className="space-y-3">
          {exports?.exports.map((exp: any) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {exp.format.toUpperCase()} Export
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(exp.createdAt)} • {exp.rowCount} rows • {(exp.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    exp.status === 'COMPLETED'
                      ? 'success'
                      : exp.status === 'PROCESSING'
                      ? 'warning'
                      : 'error'
                  }
                >
                  {exp.status}
                </Badge>
                {exp.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(exp.fileUrl, '_blank')}
                  >
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Export</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExport} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format *</label>
              <select
                {...exportForm.register('format')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date From *</label>
              <input
                type="date"
                {...exportForm.register('dateFrom')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              {exportForm.formState.errors.dateFrom && (
                <p className="text-sm text-red-600 mt-1">
                  {exportForm.formState.errors.dateFrom.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To *</label>
              <input
                type="date"
                {...exportForm.register('dateTo')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              {exportForm.formState.errors.dateTo && (
                <p className="text-sm text-red-600 mt-1">
                  {exportForm.formState.errors.dateTo.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createExportMutation.isPending}>
                {createExportMutation.isPending ? 'Creating...' : 'Create Export'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
