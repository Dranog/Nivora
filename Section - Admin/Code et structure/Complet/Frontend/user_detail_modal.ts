// apps/web/components/admin/UserDetailModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/admin/api-client';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  Key,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Activity,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose, onUserUpdated }: UserDetailModalProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await adminApi.users.getUserById(userId);
      setUser(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch user details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!user) return;

    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) return;

    const durationStr = prompt('Duration in days (leave empty for permanent):');
    const duration = durationStr ? parseInt(durationStr) : undefined;

    setActionLoading('suspend');
    try {
      await adminApi.users.suspendUser(user.id, {
        reason,
        duration,
        notifyUser: true,
      });

      toast({
        title: 'User Suspended',
        description: `${user.username} has been suspended`,
      });

      await fetchUserDetails();
      onUserUpdated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async () => {
    if (!user) return;

    setActionLoading('unsuspend');
    try {
      await adminApi.users.unsuspendUser(user.id);

      toast({
        title: 'User Unsuspended',
        description: `${user.username} account has been reactivated`,
      });

      await fetchUserDetails();
      onUserUpdated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unsuspend user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    if (!confirm(`Reset password for ${user.username}? They will receive a temporary password by email.`)) {
      return;
    }

    setActionLoading('reset-password');
    try {
      const result = await adminApi.users.resetPassword(user.id);

      toast({
        title: 'Password Reset',
        description: 'Temporary password sent to user via email',
      });

      await fetchUserDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm(`⚠️ DELETE ${user.username}? This action cannot be undone!`)) {
      return;
    }

    const confirmText = prompt(`Type "${user.username}" to confirm deletion:`);
    if (confirmText !== user.username) {
      toast({
        title: 'Cancelled',
        description: 'Username did not match',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading('delete');
    try {
      await adminApi.users.deleteUser(user.id);

      toast({
        title: 'User Deleted',
        description: `${user.username} has been permanently deleted`,
      });

      onUserUpdated?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
    }
    if (user.kycStatus === 'VERIFIED' && user.emailVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (user.kycStatus === 'PENDING') {
      return <Badge className="bg-orange-100 text-orange-800">KYC Pending</Badge>;
    }
    if (!user.emailVerified) {
      return <Badge className="bg-gray-100 text-gray-800">Email Not Verified</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      MODERATOR: 'bg-blue-100 text-blue-800',
      CREATOR: 'bg-purple-100 text-purple-800',
      FAN: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading || !user ? (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{user.displayName || user.username}</h2>
                    {getStatusBadge(user)}
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnsuspend}
                    disabled={actionLoading === 'unsuspend'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSuspend}
                    disabled={actionLoading === 'suspend' || user.role === 'ADMIN'}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPassword}
                  disabled={actionLoading === 'reset-password'}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete' || user.role === 'ADMIN'}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Suspension Warning */}
            {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">Account Suspended</p>
                    <p className="text-sm text-red-700">
                      Until: {new Date(user.suspendedUntil).toLocaleDateString()}
                    </p>
                    {user.suspensionReason && (
                      <p className="text-sm text-red-700 mt-1">
                        Reason: {user.suspensionReason}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold">
                  €{((user.stats?.totalSpent || 0) / 100).toFixed(2)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 mb-1">Posts</p>
                <p className="text-2xl font-bold">{user.stats?.postsCount || 0}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 mb-1">Followers</p>
                <p className="text-2xl font-bold">{user.stats?.followersCount || 0}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 mb-1">Following</p>
                <p className="text-2xl font-bold">{user.stats?.followingCount || 0}</p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span className="text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Last Login:</span>
                      <span className="text-sm font-medium">
                        {user.lastLogin
                          ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Email Verified:</span>
                      <span className="text-sm font-medium">
                        {user.emailVerified ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">KYC Status:</span>
                      <Badge
                        className={
                          user.kycStatus === 'VERIFIED'
                            ? 'bg-green-100 text-green-800'
                            : user.kycStatus === 'PENDING'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {user.kycStatus}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {user.kycVerification && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">KYC Verification</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Provider:</span>{' '}
                        <span className="font-medium">{user.kycVerification.provider}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Submitted:</span>{' '}
                        <span className="font-medium">
                          {new Date(user.kycVerification.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                      {user.kycVerification.reviewedAt && (
                        <p>
                          <span className="text-gray-600">Reviewed:</span>{' '}
                          <span className="font-medium">
                            {new Date(user.kycVerification.reviewedAt).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                {user.recentActivity?.length > 0 ? (
                  user.recentActivity.map((activity: any) => (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                          {activity.metadata && (
                            <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3">
                {user.transactions?.length > 0 ? (
                  user.transactions.map((tx: any) => (
                    <Card key={tx.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">{tx.type}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{(tx.amount / 100).toFixed(2)}</p>
                          <Badge
                            className={
                              tx.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No transactions</p>
                )}
              </TabsContent>

              <TabsContent value="reports" className="space-y-3">
                {user.reports?.length > 0 ? (
                  user.reports.map((report: any) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{report.reason}</p>
                          <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{report.status}</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No reports</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}