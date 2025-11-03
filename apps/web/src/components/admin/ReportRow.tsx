/**
 * ReportRow - Admin Report Management Row Component (F12)
 *
 * Features:
 * - Display report information
 * - Resolve/Assign actions
 * - Status badge
 * - Accessible action buttons
 */

'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, UserCheck, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from './ConfirmDialog';
import { useResolveReport, useAssignReport } from '@/hooks/useAdmin';
import { getReportStatusVariant, formatReportReason, type AdminReport } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export interface ReportRowProps {
  report: AdminReport;
  currentUserId?: string;
}

export function ReportRow({ report, currentUserId }: ReportRowProps) {
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const resolveMutation = useResolveReport();
  const assignMutation = useAssignReport();

  const handleResolve = async () => {
    await resolveMutation.mutateAsync({
      reportId: report.id,
      note: resolutionNote || undefined,
    });
    setResolutionNote('');
  };

  const handleAssign = async (assignToMe: boolean) => {
    await assignMutation.mutateAsync({ reportId: report.id, assignToMe });
  };

  const isOpen = report.status === 'open';
  const isAssignedToMe = currentUserId && report.assignedTo === currentUserId;
  const statusVariant = getReportStatusVariant(report.status);

  return (
    <>
      <tr className="border-t hover:bg-muted/50">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {report.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {formatReportReason(report.reason)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Reported by {report.reporterEmail}
              </p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <Badge variant={statusVariant}>
            {report.status}
          </Badge>
        </td>
        <td className="p-4">
          {report.type === 'user' && report.reportedUserEmail && (
            <div className="text-sm">
              <p className="font-medium">{report.reportedUserEmail}</p>
            </div>
          )}
          {report.type === 'post' && report.reportedPostTitle && (
            <div className="text-sm">
              <Link
                href={`/posts/${report.reportedPostId}`}
                className="font-medium hover:underline"
              >
                {report.reportedPostTitle}
              </Link>
            </div>
          )}
          {report.type === 'comment' && (
            <div className="text-sm text-muted-foreground">
              Comment ID: {report.reportedPostId?.slice(0, 8)}
            </div>
          )}
        </td>
        <td className="p-4">
          {report.assignedToName ? (
            <div className="flex items-center gap-1 text-sm">
              <UserCheck className="h-3 w-3" />
              <span className={isAssignedToMe ? 'font-medium' : ''}>
                {isAssignedToMe ? 'You' : report.assignedToName}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </td>
        <td className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={`Actions for report ${report.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOpen && (
                <>
                  <DropdownMenuItem
                    onClick={() => setIsResolveDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Resolve Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!isAssignedToMe ? (
                    <DropdownMenuItem
                      onClick={() => handleAssign(true)}
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Assign to Me
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleAssign(false)}
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Unassign
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {report.status === 'resolved' && report.resolutionNote && (
                <DropdownMenuItem disabled>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Resolution Note:</span>
                    <span className="text-sm">{report.resolutionNote}</span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Resolve Dialog */}
      <ConfirmDialog
        open={isResolveDialogOpen}
        onOpenChange={(open) => {
          setIsResolveDialogOpen(open);
          if (!open) setResolutionNote('');
        }}
        title="Resolve Report"
        description={
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.type}</Badge>
                <Badge variant="secondary">{formatReportReason(report.reason)}</Badge>
              </div>
              {report.description && (
                <p className="text-sm text-muted-foreground">
                  &quot;{report.description}&quot;
                </p>
              )}
            </div>
            <p>
              Are you sure you want to mark this report as resolved?
              This action will close the report.
            </p>
            <div className="space-y-2">
              <Label htmlFor="resolution-note">Resolution Note (optional)</Label>
              <Input
                id="resolution-note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Add a note about how this was resolved..."
                aria-describedby="resolution-note-description"
              />
              <p id="resolution-note-description" className="text-sm text-muted-foreground">
                This note will be visible to other admins.
              </p>
            </div>
          </div>
        }
        confirmText={resolveMutation.isPending ? "Resolving..." : "Resolve Report"}
        variant="default"
        onConfirm={handleResolve}
      />
    </>
  );
}
