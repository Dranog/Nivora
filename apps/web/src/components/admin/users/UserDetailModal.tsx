'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Shield,
  Ban,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  getUserInitials,
  getUserRoleLabel,
  getUserRoleVariant,
  getUserStatusLabel,
  getUserStatusVariant,
  type AdminUser,
} from '@/types/users';
import { useUserDetail } from '@/hooks/useAdminUsers';

interface UserDetailModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onBan: (user: AdminUser) => void;
  onSuspend: (user: AdminUser) => void;
  onVerify: (user: AdminUser) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export function UserDetailModal({
  user,
  open,
  onClose,
  onBan,
  onSuspend,
  onVerify,
}: UserDetailModalProps) {
  const { data: userDetail, isLoading } = useUserDetail(user?.id || '', {
    enabled: !!user && open,
  });

  if (!user) return null;

  const isBanned = !!user.bannedAt;
  const isSuspended = user.suspended;

  // Cast to any to handle mock data properties not in strict type
  const detail = userDetail as any;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="h-16 w-16">
                <AvatarImage src={(detail as any).avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                  {getUserInitials(detail.displayName, detail.username)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">
                    {detail.displayName || detail.username}
                  </h3>
                  {detail.verified && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <p className="text-muted-foreground mb-2">@{detail.username}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getUserRoleVariant(detail.role)}>
                    {getUserRoleLabel(detail.role)}
                  </Badge>
                  <Badge variant={getUserStatusVariant(detail.suspended, detail.bannedAt)}>
                    {getUserStatusLabel(detail.suspended, detail.bannedAt)}
                  </Badge>
                  {detail.emailVerified && (
                    <Badge variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Email Verified
                    </Badge>
                  )}
                  {detail.twoFactorEnabled && (
                    <Badge variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      2FA Enabled
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                {!isBanned && (
                  <Button
                    variant={isSuspended ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSuspend(user)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {isSuspended ? 'Unsuspend' : 'Suspend'}
                  </Button>
                )}
                <Button
                  variant={isBanned ? 'default' : 'destructive'}
                  size="sm"
                  onClick={() => onBan(user)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {isBanned ? 'Unban' : 'Ban'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onVerify(user)}>
                  {detail.verified ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  {detail.verified ? 'Unverify' : 'Verify'}
                </Button>
              </div>
            </div>

            {/* Bio */}
            {detail.bio && (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-foreground">{detail.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Posts"
                value={detail.totalPosts.toLocaleString('fr-FR')}
                icon={Activity}
              />
              <StatCard
                label="Followers"
                value={detail.totalFollowers.toLocaleString('fr-FR')}
                icon={Activity}
              />
              <StatCard
                label="Total Earned"
                value={formatCurrency(detail.totalEarned)}
                icon={CreditCard}
              />
              <StatCard
                label="Total Spent"
                value={formatCurrency(detail.totalSpent)}
                icon={CreditCard}
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-0">
                    <InfoRow label="Email" value={detail.email} />
                    <InfoRow label="Phone" value={detail.phoneNumber || 'Not provided'} />
                    <InfoRow
                      label="Date of Birth"
                      value={detail.dateOfBirth ? formatDateTime(detail.dateOfBirth) : 'Not provided'}
                    />
                  </div>
                </div>

                {(detail.address || detail.city || detail.country) && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </h4>
                    <div className="space-y-0">
                      <InfoRow label="Street" value={detail.address || 'Not provided'} />
                      <InfoRow label="City" value={detail.city || 'Not provided'} />
                      <InfoRow label="Postal Code" value={detail.postalCode || 'Not provided'} />
                      <InfoRow label="Country" value={detail.country || 'Not provided'} />
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <div className="space-y-0">
                    <InfoRow
                      label="Member Since"
                      value={formatDateTime(detail.createdAt)}
                    />
                    <InfoRow
                      label="Last Login"
                      value={detail.lastLoginAt ? formatDateTime(detail.lastLoginAt) : 'Never'}
                    />
                    <InfoRow
                      label="Last Activity"
                      value={detail.lastActivityAt ? formatDateTime(detail.lastActivityAt) : 'Never'}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4 mt-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Activity Summary</h4>
                  <div className="space-y-0">
                    <InfoRow label="Total Posts" value={detail.totalPosts} />
                    <InfoRow label="Subscriptions" value={detail.totalSubscriptions} />
                    <InfoRow label="Followers" value={detail.totalFollowers} />
                    <InfoRow label="Following" value={detail.totalFollowing} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Recent Logins</h4>
                  {detail.recentLogins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent logins</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.recentLogins.map((login: any, i: number) => (
                        <div key={i} className="flex items-start justify-between text-sm py-2 border-b border-border last:border-0">
                          <div>
                            <div className="font-medium">{formatDateTime(login.timestamp)}</div>
                            <div className="text-muted-foreground text-xs mt-1">
                              {login.ip} • {login.userAgent}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Financial Summary</h4>
                  <div className="space-y-0">
                    <InfoRow label="Total Earned" value={formatCurrency(detail.totalEarned)} />
                    <InfoRow label="Total Spent" value={formatCurrency(detail.totalSpent)} />
                    {detail.totalRevenue !== undefined && (
                      <InfoRow label="Revenue" value={formatCurrency(detail.totalRevenue)} />
                    )}
                    {detail.pendingPayouts !== undefined && (
                      <InfoRow label="Pending Payouts" value={formatCurrency(detail.pendingPayouts)} />
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3">Payment Methods</h4>
                  <div className="space-y-0">
                    <InfoRow
                      label="Stripe Customer ID"
                      value={detail.stripeCustomerId || 'Not connected'}
                    />
                    <InfoRow
                      label="Stripe Account ID"
                      value={detail.stripeAccountId || 'Not connected'}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Moderation Tab */}
              <TabsContent value="moderation" className="space-y-4 mt-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Moderation History
                  </h4>
                  <div className="space-y-0">
                    <InfoRow label="Warnings" value={detail.warnings} />
                    <InfoRow label="Strikes" value={detail.strikes} />
                    <InfoRow label="Reports" value={detail.reports} />
                  </div>
                </div>

                {(isBanned || isSuspended) && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="font-semibold mb-3">Current Status</h4>
                    <div className="space-y-0">
                      {isBanned && (
                        <>
                          <InfoRow label="Ban Date" value={formatDateTime(detail.bannedAt!)} />
                          <InfoRow
                            label="Ban Reason"
                            value={detail.bannedReason || 'No reason provided'}
                          />
                        </>
                      )}
                      {isSuspended && !isBanned && (
                        <InfoRow label="Status" value="Account is currently suspended" />
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
