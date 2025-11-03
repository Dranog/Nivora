// ==========================================
// USERS PAGE
// ==========================================
// apps/web/app/(admin)/users/page.tsx

'use client';

import { useState } from 'react';
import { useUsers, useSuspendUser, useBulkSuspend, useResetPassword } from '@/hooks/admin/useUsers';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserFilters } from '@/components/admin/UserFilters';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

type Role = 'ALL' | 'ADMIN' | 'CREATOR' | 'FAN';
type Status = 'ALL' | 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'PENDING_KYC';

export default function UsersPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<Status>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch users
  const { data, isLoading, refetch } = useUsers({
    role: selectedTab,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 50,
  });

  // Mutations
  const suspendMutation = useSuspendUser();
  const bulkSuspendMutation = useBulkSuspend();
  const resetPasswordMutation = useResetPassword();

  const handleSuspendSelected = async () => {
    if (selectedUsers.length === 0) return;

    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    try {
      await bulkSuspendMutation.mutateAsync({
        userIds: selectedUsers,
        reason,
        duration: 7,
      });

      toast({
        title: 'Success',
        description: `${selectedUsers.length} users suspended successfully`,
      });

      setSelectedUsers([]);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend users',
        variant: 'destructive',
      });
    }
  };

  const handleResetSelected = async () => {
    if (selectedUsers.length === 0) return;

    if (!confirm(`Reset password for ${selectedUsers.length} users?`)) return;

    try {
      for (const userId of selectedUsers) {
        await resetPasswordMutation.mutateAsync(userId);
      }

      toast({
        title: 'Success',
        description: 'Passwords reset successfully',
      });

      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset passwords',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(
        `/api/admin/users/export.csv?role=${selectedTab}&status=${statusFilter}&search=${debouncedSearch}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();

      toast({
        title: 'Success',
        description: 'Users exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export users',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
        <Button className="bg-[#00B8A9] hover:bg-[#00A395]">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="search"
          placeholder="Search by name, email, username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['ALL', 'ADMIN', 'CREATOR', 'FAN'] as Role[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === tab
                ? 'text-[#00B8A9] border-b-2 border-[#00B8A9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'ALL' ? 'All Users' : `${tab}s`}
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('PENDING_KYC')}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === 'PENDING_KYC'
              ? 'text-[#00B8A9] border-b-2 border-[#00B8A9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending KYCs
        </button>
        <button
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === 'SUSPENDED'
              ? 'text-[#00B8A9] border-b-2 border-[#00B8A9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suspended
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          count={selectedUsers.length}
          onSuspend={handleSuspendSelected}
          onResetPassword={handleResetSelected}
          onExport={handleExportCSV}
          onClear={() => setSelectedUsers([])}
        />
      )}

      {/* Users Table */}
      <UsersTable
        users={data?.users || []}
        loading={isLoading}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onUserClick={(userId) => setDetailUserId(userId)}
        onSuspend={async (userId, reason) => {
          await suspendMutation.mutateAsync({ userId, reason, duration: 7 });
          refetch();
        }}
        onResetPassword={async (userId) => {
          await resetPasswordMutation.mutateAsync(userId);
          refetch();
        }}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUserId && (
        <UserDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}

// ==========================================
// USERS TABLE COMPONENT
// ==========================================
// apps/web/components/admin/UsersTable.tsx

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Ban, RotateCcw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onUserClick: (userId: string) => void;
  onSuspend: (userId: string, reason: string) => void;
  onResetPassword: (userId: string) => void;
}

export function UsersTable({
  users,
  loading,
  selectedUsers,
  onSelectionChange,
  onUserClick,
  onSuspend,
  onResetPassword,
}: UsersTableProps) {
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
    return (
      <div className="text-center py-12 text-gray-400">
        No users found
      </div>
    );
  }

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
          <TableHead>Account Age</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer hover:bg-gray-50"
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
                  <p className="font-medium text-gray-900">{user.displayName}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {user.lastLogin
                ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                : 'Never'}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUserClick(user.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const reason = prompt('Reason for suspension:');
                      if (reason) onSuspend(user.id, reason);
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Password
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors = {
    ADMIN: 'bg-cyan-100 text-cyan-800',
    CREATOR: 'bg-orange-100 text-orange-800',
    FAN: 'bg-gray-100 text-gray-800',
    MODERATOR: 'bg-purple-100 text-purple-800',
  };

  return (
    <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>
      {role}
    </Badge>
  );
}

// ==========================================
// BULK ACTIONS BAR
// ==========================================
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
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="font-medium text-gray-900">{count} selected</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSuspend}>
            <Ban className="w-4 h-4 mr-2" />
            Suspend Selected
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