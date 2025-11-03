'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Ban,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BulkAction } from '@/types/users';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: BulkAction) => void;
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onAction,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-lg border border-border bg-card shadow-lg px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Selected Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            {/* Suspend/Unsuspend Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Suspend
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAction('suspend')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Suspend Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('unsuspend')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Unsuspend Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ban/Unban Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Ban className="mr-2 h-4 w-4" />
                  Ban
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAction('ban')}>
                  <Ban className="mr-2 h-4 w-4" />
                  Ban Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('unban')}>
                  <Ban className="mr-2 h-4 w-4" />
                  Unban Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Verify/Unverify Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAction('verify')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('unverify')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Unverify Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onAction('delete')}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
