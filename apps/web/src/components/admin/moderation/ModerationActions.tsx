'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, UserPlus, AlertTriangle } from 'lucide-react';

interface ModerationActionsProps {
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkAssign: () => void;
  onBulkEscalate: () => void;
}

export function ModerationActions({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onBulkAssign,
  onBulkEscalate,
}: ModerationActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 border border-border rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
      </span>

      <div className="flex gap-2 ml-auto">
        <Button size="sm" variant="outline" onClick={onBulkApprove}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onBulkReject}
          className="text-red-600"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject All
        </Button>
        <Button size="sm" variant="outline" onClick={onBulkAssign}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign
        </Button>
        <Button size="sm" variant="outline" onClick={onBulkEscalate}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Escalate
        </Button>
      </div>
    </div>
  );
}
