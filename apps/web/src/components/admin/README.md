# Admin Components (F12) - Usage Guide

## Overview

This directory contains reusable admin console components for user management, post moderation, and report handling.

## Components

### 1. DataTable

Generic table component with sorting, pagination, selection, and responsive design.

**Features:**
- Client-side sorting & pagination
- Row selection with checkboxes
- Responsive (desktop table, mobile cards)
- Loading, error, empty states
- Accessible (aria-sort, aria-labels)

**Example:**

```tsx
import { DataTable } from '@/components/admin/DataTable';
import type { AdminUser } from '@/types/admin';

const columns = [
  {
    id: 'email',
    header: 'Email',
    accessor: (user: AdminUser) => user.email,
    sortable: true,
    mobileLabel: 'Email',
  },
  {
    id: 'role',
    header: 'Role',
    accessor: (user: AdminUser) => <Badge>{user.role}</Badge>,
    sortable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (user: AdminUser) => <Badge variant={getUserStatusVariant(user.status)}>{user.status}</Badge>,
    sortable: true,
  },
];

function UsersTable({ users }: { users: AdminUser[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <DataTable
      columns={columns}
      data={users}
      keyExtractor={(user) => user.id}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      pageSize={20}
      aria-label="Users table"
    />
  );
}
```

### 2. ConfirmDialog

Confirmation dialog for destructive actions.

**Features:**
- Built on AlertDialog
- Loading state
- Customizable variants (default, destructive)
- Accessible

**Example:**

```tsx
import { ConfirmDialog, useConfirmDialog } from '@/components/admin/ConfirmDialog';

function UserActions({ userId }: { userId: string }) {
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const banMutation = useBanUserV2();

  const handleBan = async () => {
    await banMutation.mutateAsync({ userId, reason: 'Violation of terms' });
  };

  return (
    <>
      <Button onClick={() => setIsBanDialogOpen(true)}>Ban User</Button>

      <ConfirmDialog
        open={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
        title="Ban User"
        description="Are you sure you want to ban this user?"
        actionLabel="Ban User"
        variant="destructive"
        onConfirm={handleBan}
        loading={banMutation.isPending}
      />
    </>
  );
}

// Or use the hook for simpler usage:
function UserActionsSimple({ userId }: { userId: string }) {
  const { confirm, Dialog } = useConfirmDialog();
  const banMutation = useBanUserV2();

  const handleBan = () => {
    confirm({
      title: 'Ban User',
      description: 'Are you sure?',
      onConfirm: async () => {
        await banMutation.mutateAsync({ userId, reason: 'Violation' });
      },
      variant: 'destructive',
    });
  };

  return (
    <>
      <Button onClick={handleBan}>Ban User</Button>
      <Dialog />
    </>
  );
}
```

### 3. BulkActions

Toolbar for bulk operations with selected items.

**Features:**
- Selected count display
- Custom action buttons
- Clear selection
- Responsive

**Example:**

```tsx
import { BulkActions } from '@/components/admin/BulkActions';
import { Ban, Trash } from 'lucide-react';

function UsersManagement() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const bulkBanMutation = useBulkBanUsers();

  const bulkActions = [
    {
      label: 'Ban Selected',
      icon: <Ban className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: () => bulkBanMutation.mutate({ ids: selectedIds, reason: 'Bulk ban' }),
      'aria-label': 'Ban selected users',
    },
    {
      label: 'Delete',
      icon: <Trash className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Delete', selectedIds),
    },
  ];

  return (
    <div>
      <BulkActions
        selectedCount={selectedIds.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedIds([])}
      />
      {/* DataTable here */}
    </div>
  );
}
```

### 4. UserRow

Table row component for user management.

**Features:**
- User info display
- Ban/Unban actions
- Status badges
- Action dropdown menu
- Integrated ConfirmDialog

**Example:**

```tsx
import { UserRow } from '@/components/admin/UserRow';

function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Status</th>
          <th>Posts</th>
          <th>Reports</th>
          <th>Joined</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <UserRow key={user.id} user={user} />
        ))}
      </tbody>
    </table>
  );
}
```

### 5. PostRow

Table row component for post moderation.

**Features:**
- Post info with author details
- Takedown/Restore actions
- Status and visibility badges
- View/like counts
- Integrated ConfirmDialog

**Example:**

```tsx
import { PostRow } from '@/components/admin/PostRow';

function PostsTable({ posts }: { posts: AdminPost[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Post</th>
          <th>Status</th>
          <th>Visibility</th>
          <th>Engagement</th>
          <th>Reports</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <PostRow key={post.id} post={post} />
        ))}
      </tbody>
    </table>
  );
}
```

### 6. ReportRow

Table row component for report management.

**Features:**
- Report info with reason badges
- Resolve/Assign actions
- Status badges
- Reported content links
- Assignment display
- Integrated ConfirmDialog

**Example:**

```tsx
import { ReportRow } from '@/components/admin/ReportRow';

function ReportsTable({ reports, currentUserId }: { reports: AdminReport[]; currentUserId: string }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Report</th>
          <th>Status</th>
          <th>Reported Content</th>
          <th>Assigned To</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          <ReportRow key={report.id} report={report} currentUserId={currentUserId} />
        ))}
      </tbody>
    </table>
  );
}
```

## Complete Usage Example

Here's a full example combining all components:

```tsx
'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { BulkActions } from '@/components/admin/BulkActions';
import { UserRow } from '@/components/admin/UserRow';
import { useAdminUsersV2, useBulkBanUsers } from '@/hooks/useAdmin';
import { defaultAdminUserFilters, type AdminUser } from '@/types/admin';
import { Ban } from 'lucide-react';

export default function AdminUsersPage() {
  const [filters, setFilters] = useState(defaultAdminUserFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, error } = useAdminUsersV2(filters);
  const bulkBanMutation = useBulkBanUsers();

  // Define columns for DataTable
  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      accessor: (user) => <UserRowContent user={user} />,
      sortable: true,
    },
    // ... more columns
  ];

  // Define bulk actions
  const bulkActions = [
    {
      label: 'Ban Selected',
      icon: <Ban className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: () => bulkBanMutation.mutate({ ids: selectedIds, reason: 'Bulk moderation' }),
    },
  ];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <BulkActions
        selectedCount={selectedIds.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedIds([])}
      />

      <DataTable
        columns={columns}
        data={data?.users || []}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        error={error}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={20}
        aria-label="Users administration table"
      />
    </div>
  );
}
```

## Accessibility

All components follow accessibility best practices:

- **DataTable**: Uses `aria-sort`, `aria-label`, `aria-describedby`, `aria-busy`, `aria-live`
- **ConfirmDialog**: Uses `aria-describedby` for dialog description
- **BulkActions**: Uses `role="toolbar"`, `aria-label` on buttons
- **Row Components**: Action buttons have descriptive `aria-label` attributes

## Responsive Design

- **DataTable**: Switches to card layout on mobile (<768px)
- **BulkActions**: Stacks vertically on mobile
- **Row Components**: Dropdown menus for actions work well on all screen sizes

## Testing

Components are designed to be testable:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '@/components/admin/DataTable';

it('should sort data when column header is clicked', async () => {
  const user = userEvent.setup();
  const data = [{ id: '1', name: 'Bob' }, { id: '2', name: 'Alice' }];
  const columns = [{ id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true }];

  render(<DataTable columns={columns} data={data} keyExtractor={(row) => row.id} />);

  await user.click(screen.getByRole('button', { name: 'Sort by Name' }));

  const cells = screen.getAllByRole('cell');
  expect(cells[0]).toHaveTextContent('Alice');
});
```
