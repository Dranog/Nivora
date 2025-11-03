'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreHorizontal,
  Eye,
  Ban,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getUserInitials,
  getUserRoleLabel,
  getUserRoleVariant,
  getUserStatusLabel,
  getUserStatusVariant,
  type AdminUser,
} from '@/types/users';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
  onToggleAll: () => void;
  onViewUser: (user: AdminUser) => void;
  onBanUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onVerifyUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

function UserRow({
  user,
  isSelected,
  onToggle,
  onView,
  onBan,
  onSuspend,
  onVerify,
  onDelete,
}: {
  user: AdminUser;
  isSelected: boolean;
  onToggle: () => void;
  onView: () => void;
  onBan: () => void;
  onSuspend: () => void;
  onVerify: () => void;
  onDelete: () => void;
}) {
  const isBanned = !!user.bannedAt;
  const isSuspended = user.suspended;

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Checkbox */}
      <td className="w-12 px-4">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      </td>

      {/* User Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getUserInitials(user.displayName, user.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">
              {user.displayName || user.username}
            </div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">{user.email}</div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <Badge variant={getUserRoleVariant(user.role)}>
          {getUserRoleLabel(user.role)}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant={getUserStatusVariant(user.suspended, user.bannedAt)}>
            {getUserStatusLabel(user.suspended, user.bannedAt)}
          </Badge>
          {user.verified && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </div>
      </td>

      {/* Stats */}
      <td className="px-4 py-3">
        <div className="space-y-1 text-sm">
          <div className="text-muted-foreground">
            {user._count.posts} posts • {user._count.followers} followers
          </div>
          {user.totalRevenue !== undefined && (
            <div className="font-medium text-foreground">
              {formatCurrency(user.totalRevenue)}
            </div>
          )}
        </div>
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!isBanned && (
              <DropdownMenuItem onClick={isSuspended ? onSuspend : onSuspend}>
                <Shield className="mr-2 h-4 w-4" />
                {isSuspended ? 'Unsuspend' : 'Suspend'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onBan} className="text-destructive">
              <Ban className="mr-2 h-4 w-4" />
              {isBanned ? 'Unban' : 'Ban'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onVerify}>
              {user.verified ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Unverify
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function LoadingRow() {
  return (
    <tr className="border-b border-border">
      <td className="w-12 px-4 py-3">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-8 w-8" />
      </td>
    </tr>
  );
}

export function UsersTable({
  users,
  isLoading,
  selectedUsers,
  onToggleUser,
  onToggleAll,
  onViewUser,
  onBanUser,
  onSuspendUser,
  onVerifyUser,
  onDeleteUser,
}: UsersTableProps) {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Stats
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {[...Array(10)].map((_, i) => (
                  <LoadingRow key={i} />
                ))}
              </>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onToggle={() => onToggleUser(user.id)}
                  onView={() => onViewUser(user)}
                  onBan={() => onBanUser(user)}
                  onSuspend={() => onSuspendUser(user)}
                  onVerify={() => onVerifyUser(user)}
                  onDelete={() => onDeleteUser(user)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
