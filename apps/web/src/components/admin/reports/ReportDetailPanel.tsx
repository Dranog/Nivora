'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, User, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  formatDateTime,
  getUserInitials,
  getReportTypeLabel,
  getReportSeverityLabel,
  getReportSeverityColor,
  getReportStatusLabel,
  type Report,
  type ReportDetail,
} from '@/types/reports';
import { useReportDetail, useResolveReport, useDismissReport } from '@/hooks/useAdminReports';

interface ReportDetailPanelProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
}

export function ReportDetailPanel({ report, open, onClose }: ReportDetailPanelProps) {
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState<'NO_ACTION' | 'WARNING_SENT' | 'CONTENT_REMOVED' | 'USER_SUSPENDED' | 'USER_BANNED'>('NO_ACTION');

  const { data: detail, isLoading } = useReportDetail(report?.id || '', { enabled: !!report && open });
  const resolveMutation = useResolveReport();
  const dismissMutation = useDismissReport();

  const handleResolve = async () => {
    if (!report || !resolution) return;
    await resolveMutation.mutateAsync({
      reportId: report.id,
      data: { resolution, action, notifyReporter: true },
    });
    onClose();
    setResolution('');
  };

  const handleDismiss = async () => {
    if (!report || !resolution) return;
    await dismissMutation.mutateAsync({
      reportId: report.id,
      data: { reason: resolution, notifyReporter: false },
    });
    onClose();
    setResolution('');
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <Avatar className="h-12 w-12">
                <AvatarImage src={detail.reporter.avatar || undefined} />
                <AvatarFallback>{getUserInitials(detail.reporter.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{detail.reporter.username}</div>
                <div className="text-sm text-muted-foreground">{detail.reporter.email}</div>
                <div className="flex gap-2 mt-2">
                  <Badge>{getReportTypeLabel(detail.targetType)}</Badge>
                  <span className={`px-2 py-1 rounded text-xs ${getReportSeverityColor(detail.severity)}`}>
                    {getReportSeverityLabel(detail.severity)}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(detail.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="font-semibold mb-2">Reason</h3>
              <p className="text-sm">{detail.reason}</p>
              {detail.description && (
                <p className="text-sm text-muted-foreground mt-2">{detail.description}</p>
              )}
            </div>

            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {detail.targetContent && (
                  <div className="p-4 rounded-lg border">
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(detail.targetContent, null, 2)}</pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-2">
                  {detail.moderationHistory.map((h) => (
                    <div key={h.id} className="flex gap-3 p-3 rounded-lg border">
                      <User className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{h.action}</div>
                        <div className="text-xs text-muted-foreground">
                          by {h.performedBy.username} • {formatDateTime(h.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="related">
                <div className="space-y-2">
                  {detail.relatedReports.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border">
                      <div className="text-sm">{r.reason}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getReportStatusLabel(r.status)} • {formatDateTime(r.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            {detail.status === 'PENDING' || detail.status === 'IN_REVIEW' ? (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Action Taken</Label>
                  <Select value={action} onValueChange={(v: any) => setAction(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_ACTION">No Action</SelectItem>
                      <SelectItem value="WARNING_SENT">Warning Sent</SelectItem>
                      <SelectItem value="CONTENT_REMOVED">Content Removed</SelectItem>
                      <SelectItem value="USER_SUSPENDED">User Suspended</SelectItem>
                      <SelectItem value="USER_BANNED">User Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Explain your decision..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleResolve} disabled={!resolution}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve
                  </Button>
                  <Button variant="outline" onClick={handleDismiss} disabled={!resolution}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-semibold">Resolution</span>
                </div>
                <p className="text-sm">{detail.resolution}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
