// apps/web/app/(admin)/users/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '@/lib/admin/api-client';
import { UsersTable } from '@/components/admin/UsersTable';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

const suspendSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  duration: z.number().min(1).max(365).optional(),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'ADMIN' | 'CREATOR' | 'FAN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', { role: selectedTab, status: statusFilter, search: debouncedSearch, page }],
    queryFn: () =>
      adminApi.users.getUsers({
        role: selectedTab !== 'ALL' ? selectedTab : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 50,
      }),
    retry: 2,
  });

  const suspendForm = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      reason: '',
      duration: 7,
    },
  });

  const bulkSuspendMutation = useMutation({
    mutationFn: (data: { userIds: string[]; reason: string; duration?: number }) =>
      adminApi.users.bulkSuspend(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Success', description: `${selectedUsers.length} users suspended` });
      setSelectedUsers([]);
      setSuspendDialogOpen(false);
      suspendForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminApi.users.resetPassword(userId),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Password reset email sent' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleBulkSuspend = suspendForm.handleSubmit((data) => {
    if (selectedUsers.length === 0) return;
    bulkSuspendMutation.mutate({
      userIds: selectedUsers,
      reason: data.reason,
      duration: data.duration,
    });
  });

  const handleBulkResetPassword = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Reset password for ${selectedUsers.length} users?`)) return;

    for (const userId of selectedUsers) {
      await resetPasswordMutation.mutateAsync(userId);
    }
    setSelectedUsers([]);
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        role: selectedTab !== 'ALL' ? selectedTab : '',
        status: statusFilter !== 'ALL' ? statusFilter : '',
        search: debouncedSearch || '',
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/export.csv?${params}`,
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
      window.URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'Users exported successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to export users', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all platform users</p>
        </div>
      </div>

      {/* Search */}
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
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['ALL', 'ADMIN', 'CREATOR', 'FAN'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === tab
                ? 'text-[#00B8A9] border-b-2 border-[#00B8A9]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All Users' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          count={selectedUsers.length}
          onSuspend={() => setSuspendDialogOpen(true)}
          onResetPassword={handleBulkResetPassword}
          onExport={handleExportCSV}
          onClear={() => setSelectedUsers([])}
        />
      )}

      {/* Users Table */}
      <UsersTable
        users={data?.users || []}
        loading={isLoading}
        error={isError}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onUserClick={setDetailUserId}
        onRefetch={refetch}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
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

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {selectedUsers.length} Users</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkSuspend} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for suspension *</label>
              <Textarea
                {...suspendForm.register('reason')}
                placeholder="Enter a detailed reason..."
                rows={4}
              />
              {suspendForm.formState.errors.reason && (
                <p className="text-sm text-red-600 mt-1">
                  {suspendForm.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Duration (days)</label>
              <Input
                type="number"
                {...suspendForm.register('duration', { valueAsNumber: true })}
                min={1}
                max={365}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSuspendDialogOpen(false);
                  suspendForm.reset();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={bulkSuspendMutation.isPending}
              >
                {bulkSuspendMutation.isPending ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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

// Extend adminApi with users methods
export const adminApiExtension = {
  users: {
    getUsers: (query: any) => {
      const params = new URLSearchParams();
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined) params.append(key, query[key].toString());
      });
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }).then((r) => r.json());
    },
    bulkSuspend: (data: any) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/bulk-suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    resetPassword: (userId: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }).then((r) => r.json()),
  },
};

// Merge with existing adminApi
Object.assign(adminApi, adminApiExtension);
