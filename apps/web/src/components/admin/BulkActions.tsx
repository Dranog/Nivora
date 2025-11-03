/**
 * BulkActions - Bulk Operations Toolbar (F12)
 *
 * Features:
 * - Shows count of selected items
 * - Action buttons for bulk operations
 * - Clear selection button
 * - Accessible with proper ARIA labels
 */

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export function BulkActions({
  selectedCount,
  actions,
  onClearSelection,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted rounded-lg border',
        className
      )}
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 px-2"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action['aria-label'] || action.label}
            className="flex items-center gap-2"
          >
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
