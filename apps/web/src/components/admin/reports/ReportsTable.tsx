'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';
import {
  formatTimeAgo,
  getUserInitials,
  getReportTypeLabel,
  getReportTypeVariant,
  getReportSeverityLabel,
  getReportSeverityColor,
  getReportStatusLabel,
  getReportStatusColor,
  type Report,
} from '@/types/reports';

interface ReportsTableProps {
  reports: Report[];
  isLoading: boolean;
  selectedReports: string[];
  onToggleReport: (reportId: string) => void;
  onToggleAll: () => void;
  onViewReport: (report: Report) => void;
}

export function ReportsTable({
  reports,
  isLoading,
  selectedReports,
  onToggleReport,
  onToggleAll,
  onViewReport,
}: ReportsTableProps) {
  const allSelected = reports.length > 0 && selectedReports.length === reports.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No reports found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-12 px-4 py-3">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Reporter</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Target</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Severity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Reported</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-t hover:bg-muted/50">
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedReports.includes(report.id)}
                  onCheckedChange={() => onToggleReport(report.id)}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={report.reporter.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(report.reporter.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{report.reporter.username}</div>
                    <div className="text-xs text-muted-foreground">{report.reporter.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {report.targetUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={report.targetUser.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(report.targetUser.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{report.targetUser.username}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{report.targetId.slice(0, 8)}...</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant={getReportTypeVariant(report.targetType)}>
                  {getReportTypeLabel(report.targetType)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getReportSeverityColor(report.severity)}`}>
                  {getReportSeverityLabel(report.severity)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getReportStatusColor(report.status)}`}>
                  {getReportStatusLabel(report.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatTimeAgo(report.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => onViewReport(report)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
