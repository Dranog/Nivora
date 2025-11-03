/**
 * UserRow - Admin User Management Row Component (F12)
 *
 * Features:
 * - Display user information
 * - Ban/Unban actions
 * - Status badge
 * - Accessible action buttons
 */

'use client';

import { useState } from 'react';
import { Ban, CheckCircle2, MoreVertical, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from './ConfirmDialog';
import { useBanUserV2, useUnbanUserV2 } from '@/hooks/useAdmin';
import { getUserStatusVariant, type AdminUser } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';

export interface UserRowProps {
  user: AdminUser;
}

export function UserRow({ user }: UserRowProps) {
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  const banMutation = useBanUserV2();
  const unbanMutation = useUnbanUserV2();

  const handleBan = async () => {
    if (!banReason.trim()) return;
    await banMutation.mutateAsync({ userId: user.id, reason: banReason });
    setBanReason('');
  };

  const handleUnban = async () => {
    await unbanMutation.mutateAsync({ userId: user.id });
  };

  const isBanned = user.status === 'banned';
  const statusVariant = getUserStatusVariant(user.status);

  return (
    <>
      <tr className="border-t hover:bg-muted/50">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {user.displayName || 'No name'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role || 'fan'}
          </Badge>
        </td>
        <td className="p-4">
          <Badge variant={statusVariant}>
            {user.status}
          </Badge>
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {user.postsCount}
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {user.reportsCount}
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </td>
        <td className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={`Actions for ${user.email}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isBanned ? (
                <DropdownMenuItem
                  onClick={() => setIsUnbanDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setIsBanDialogOpen(true)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Ban className="h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Ban Dialog */}
      <ConfirmDialog
        open={isBanDialogOpen}
        onOpenChange={(open) => {
          setIsBanDialogOpen(open);
          if (!open) setBanReason('');
        }}
        title="Ban User"
        description={
          <div className="space-y-4">
            <p>
              Are you sure you want to ban <strong>{user.email}</strong>?
              This will prevent them from accessing the platform.
            </p>
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason (required)</Label>
              <Input
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for ban..."
                aria-describedby="ban-reason-description"
              />
              <p id="ban-reason-description" className="text-sm text-muted-foreground">
                This reason will be recorded and visible to other admins.
              </p>
            </div>
          </div>
        }
        confirmText={banMutation.isPending ? "Banning..." : "Ban User"}
        variant="danger"
        onConfirm={handleBan}
      />

      {/* Unban Dialog */}
      <ConfirmDialog
        open={isUnbanDialogOpen}
        onOpenChange={setIsUnbanDialogOpen}
        title="Unban User"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to unban <strong>{user.email}</strong>?
            </p>
            {user.bannedReason && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Ban Reason:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.bannedReason}
                </p>
              </div>
            )}
          </div>
        }
        confirmText={unbanMutation.isPending ? "Unbanning..." : "Unban User"}
        variant="default"
        onConfirm={handleUnban}
      />
    </>
  );
}
