// apps/web/components/admin/EmptyState.tsx
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      {action}
    </div>
  );
}

// apps/web/components/admin/ErrorState.tsx
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <p className="text-gray-900 dark:text-white font-medium mb-2">Something went wrong</p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

// apps/web/components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  );
}

// apps/web/components/ui/textarea.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8A9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

// apps/web/components/admin/BulkActionsBar.tsx
import { Button } from '@/components/ui/button';
import { Ban, RotateCcw, Download, X } from 'lucide-react';

interface BulkActionsBarProps {
  count: number;
  onSuspend: () => void;
  onResetPassword: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  count,
  onSuspend,
  onResetPassword,
  onExport,
  onClear,
}: BulkActionsBarProps) {
  return (
    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="font-medium text-gray-900 dark:text-white">{count} selected</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSuspend}>
            <Ban className="w-4 h-4 mr-2" />
            Suspend
          </Button>
          <Button variant="outline" size="sm" onClick={onResetPassword}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClear}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// apps/web/components/admin/UsersTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: boolean;
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onUserClick: (userId: string) => void;
  onRefetch: () => void;
}

export function UsersTable({
  users,
  loading,
  error,
  selectedUsers,
  onSelectionChange,
  onUserClick,
  onRefetch,
}: UsersTableProps) {
  if (error) {
    return <ErrorState message="Failed to load users" onRetry={onRefetch} />;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <EmptyState message="No users found" />;
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map((u) => u.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter((id) => id !== userId));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedUsers.length === users.length}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => onUserClick(user.id)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback>
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-gray-600 dark:text-gray-400">{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>{user.role}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  user.status === 'VERIFIED'
                    ? 'success'
                    : user.status === 'SUSPENDED'
                    ? 'error'
                    : 'warning'
                }
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
              {user.lastLogin
                ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                : 'Never'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// apps/web/components/admin/UserDetailModal.tsx
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function UserDetailModal({ userId, onClose, onRefresh }: UserDetailModalProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }).then((r) => r.json()),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.displayName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <Badge>{user.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="font-medium">€{((user.stats?.totalSpent || 0) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
                <p className="font-medium">{user.stats?.postsCount || 0}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// apps/web/store/admin/moderationStore.ts
import { create } from 'zustand';

interface Report {
  id: string;
  targetId: string;
  priority: string;
  status: string;
}

interface ModerationState {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
}

export const useModerationStore = create<ModerationState>((set) => ({
  reports: [],
  addReport: (report) =>
    set((state) => ({
      reports: [report, ...state.reports],
    })),
  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
}));
