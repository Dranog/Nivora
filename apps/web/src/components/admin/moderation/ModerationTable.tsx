'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  formatTimeAgo,
  getUserInitials,
  getContentTypeLabel,
  getContentTypeVariant,
  getModerationPriorityLabel,
  getModerationPriorityColor,
  getModerationStatusLabel,
  getModerationStatusColor,
  formatAIConfidence,
  getAIConfidenceColor,
  type ModerationDecision,
} from '@/types/moderation';

interface ModerationTableProps {
  items: ModerationDecision[];
  isLoading: boolean;
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
  onToggleAll: () => void;
  onViewItem: (item: ModerationDecision) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void;
}

export function ModerationTable({
  items,
  isLoading,
  selectedItems,
  onToggleItem,
  onToggleAll,
  onViewItem,
  onApprove,
  onReject,
}: ModerationTableProps) {
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading moderation queue...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No items in queue</p>
        </div>
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
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Content
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              AI Confidence
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Assigned To
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Created
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t hover:bg-muted/50">
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => onToggleItem(item.id)}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">
                    {item.contentId.slice(0, 8)}...
                  </div>
                  {item.aiFlags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.aiFlags.slice(0, 2).map((flag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-1 py-0"
                        >
                          {flag}
                        </Badge>
                      ))}
                      {item.aiFlags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{item.aiFlags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={getContentTypeVariant(item.contentType)}>
                  {getContentTypeLabel(item.contentType)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getModerationPriorityColor(item.priority)}`}
                >
                  {getModerationPriorityLabel(item.priority)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getModerationStatusColor(item.status)}`}
                >
                  {getModerationStatusLabel(item.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-sm font-medium ${getAIConfidenceColor(item.aiConfidence)}`}
                >
                  {formatAIConfidence(item.aiConfidence)}
                </span>
              </td>
              <td className="px-4 py-3">
                {item.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(item.assignedTo.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{item.assignedTo.username}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Unassigned
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatTimeAgo(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {item.status === 'PENDING' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(item.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
