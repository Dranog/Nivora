'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import { useState } from 'react';
import {
  formatDateTime,
  getUserInitials,
  getContentTypeLabel,
  getModerationPriorityLabel,
  getModerationPriorityColor,
  getModerationStatusLabel,
  getModerationStatusColor,
  formatAIConfidence,
  getAIConfidenceColor,
  type ModerationDecision,
} from '@/types/moderation';

interface ModerationPreviewProps {
  item: ModerationDecision | null;
  open: boolean;
  onClose: () => void;
  onApprove: (itemId: string, notes?: string) => void;
  onReject: (
    itemId: string,
    reason: string,
    action: 'DELETE_CONTENT' | 'SUSPEND_USER' | 'BAN_USER' | 'WARNING'
  ) => void;
  onEscalate: (itemId: string, reason: string, escalateTo: string) => void;
}

export function ModerationPreview({
  item,
  open,
  onClose,
  onApprove,
  onReject,
  onEscalate,
}: ModerationPreviewProps) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<
    'DELETE_CONTENT' | 'SUSPEND_USER' | 'BAN_USER' | 'WARNING'
  >('WARNING');
  const [escalateToId, setEscalateToId] = useState('');

  const handleApprove = () => {
    if (!item) return;
    onApprove(item.id, notes);
    setNotes('');
    onClose();
  };

  const handleReject = () => {
    if (!item || !notes) return;
    onReject(item.id, notes, action);
    setNotes('');
    onClose();
  };

  const handleEscalate = () => {
    if (!item || !notes || !escalateToId) return;
    onEscalate(item.id, notes, escalateToId);
    setNotes('');
    setEscalateToId('');
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Moderation Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{getContentTypeLabel(item.contentType)}</Badge>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getModerationPriorityColor(item.priority)}`}
                >
                  {getModerationPriorityLabel(item.priority)}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getModerationStatusColor(item.status)}`}
                >
                  {getModerationStatusLabel(item.status)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Content ID: {item.contentId}
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {formatDateTime(item.createdAt)}
              </div>
            </div>
          </div>

          {/* AI Flags */}
          {item.aiFlags.length > 0 && (
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900">
                  AI Detected Issues
                </span>
                <span
                  className={`ml-auto text-sm font-medium ${getAIConfidenceColor(item.aiConfidence)}`}
                >
                  Confidence: {formatAIConfidence(item.aiConfidence)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.aiFlags.map((flag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-white border-orange-300"
                  >
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div>
            <h3 className="font-semibold mb-2">Content Preview</h3>
            <div className="p-4 rounded-lg border bg-muted/30">
              {item.contentPreview ? (
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(item.contentPreview, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preview available
                </p>
              )}
            </div>
          </div>

          {/* Assignment Info */}
          {item.assignedTo && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assigned to:</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(item.assignedTo.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{item.assignedTo.username}</span>
              </div>
            </div>
          )}

          {/* Review Info */}
          {item.reviewedBy && (
            <div className="p-3 rounded-lg border bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Reviewed by:
                </span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(item.reviewedBy.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-green-900">
                  {item.reviewedBy.username}
                </span>
              </div>
              {item.decision && (
                <p className="text-sm text-green-900 mt-2">{item.decision}</p>
              )}
              {item.notes && (
                <p className="text-sm text-green-900 mt-2">{item.notes}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {item.status === 'PENDING' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={action}
                  onValueChange={(v: any) => setAction(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="DELETE_CONTENT">
                      Delete Content
                    </SelectItem>
                    <SelectItem value="SUSPEND_USER">Suspend User</SelectItem>
                    <SelectItem value="BAN_USER">Ban User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={!notes}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!notes}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEscalate}
                  disabled={!notes || !escalateToId}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Escalate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
