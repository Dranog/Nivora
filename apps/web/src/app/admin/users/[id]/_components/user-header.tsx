'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Ban, Clock, Mail, ExternalLink, Settings, UserX, CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserDetailDto, BanUserDto, SuspendUserDto } from '@/lib/api/types';

interface UserHeaderProps {
  user: UserDetailDto;
  onBan: (data: BanUserDto) => void;
  onSuspend: (data: SuspendUserDto) => void;
  isBanning: boolean;
  isSuspending: boolean;
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'destructive' as const;
    case 'CREATOR':
      return 'default' as const;
    case 'MODERATOR':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function getStatusBadge(user: UserDetailDto['user']) {
  if (user.bannedAt) {
    return { label: 'Banni', variant: 'destructive' as const };
  }
  if (user.suspended) {
    return { label: 'Suspendu', variant: 'secondary' as const };
  }
  if (user.verified) {
    return { label: 'Vérifié', variant: 'default' as const };
  }
  return { label: 'Actif', variant: 'outline' as const };
}

function getKycBadge(kycStatus?: string) {
  switch (kycStatus) {
    case 'VERIFIED':
      return {
        label: 'KYC Vérifié',
        variant: 'default' as const,
        className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        icon: CheckCircle,
      };
    case 'PENDING':
    case 'UNDER_REVIEW':
      return {
        label: 'KYC En attente',
        variant: 'secondary' as const,
        className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        icon: Clock,
      };
    case 'REJECTED':
      return {
        label: 'KYC Rejeté',
        variant: 'destructive' as const,
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        icon: XCircle,
      };
    case 'EXPIRED':
      return {
        label: 'KYC Expiré',
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
        icon: AlertCircle,
      };
    case 'NOT_STARTED':
    default:
      return {
        label: 'KYC Non vérifié',
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
        icon: HelpCircle,
      };
  }
}

export function UserHeader({ user, onBan, onSuspend, isBanning, isSuspending }: UserHeaderProps) {
  const router = useRouter();
  const [banDialog, setBanDialog] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');

  const statusBadge = getStatusBadge(user.user);
  const kycBadge = getKycBadge(user.user.kycStatus);
  const KycIcon = kycBadge.icon;

  const handleBan = useCallback(() => {
    onBan({
      reason: 'Banni par l\'administrateur',
      duration: 'PERMANENT',
    });
    setBanDialog(false);
  }, [onBan]);

  const handleSuspend = useCallback(() => {
    if (!suspendReason.trim()) return;

    onSuspend({
      reason: suspendReason,
      until: suspendUntil || undefined,
    });
    setSuspendDialog(false);
    setSuspendReason('');
    setSuspendUntil('');
  }, [onSuspend, suspendReason, suspendUntil]);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/users')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {user.user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.user.displayName || user.user.username}</h1>
                <Badge variant={getRoleBadgeVariant(user.user.role)}>
                  {user.user.role}
                </Badge>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge
                  variant={kycBadge.variant}
                  className={`cursor-pointer ${kycBadge.className}`}
                  onClick={() => router.push('/admin/kyc')}
                >
                  <KycIcon className="w-3 h-3 mr-1" />
                  {kycBadge.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.user.email}
                </span>
                <span>@{user.user.username}</span>
                <span>
                  Inscrit{' '}
                  {formatDistance(new Date(user.user.createdAt), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>

              {/* Quick Stats */}
              {user.user.role === 'CREATOR' && user.user.creatorStats && (
                <div className="flex items-center gap-6 pt-2">
                  <div>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                    <p className="text-lg font-semibold">
                      {(user.user.creatorStats.totalRevenue / 100).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Abonnés</p>
                    <p className="text-lg font-semibold">{user.user.creatorStats.totalSubscribers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Posts</p>
                    <p className="text-lg font-semibold">{user.user.creatorStats.totalPosts}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/profile/${user.user.username}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir profil public
            </Button>
            {!user.user.suspended && !user.user.bannedAt && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuspendDialog(true)}
                  disabled={isSuspending}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBanDialog(true)}
                  disabled={isBanning}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bannir
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Ban Dialog */}
      <ConfirmDialog
        open={banDialog}
        onOpenChange={setBanDialog}
        title="Bannir l'utilisateur"
        description={`Êtes-vous sûr de vouloir bannir définitivement ${user.user.username} ? Cette action est irréversible.`}
        confirmText="Bannir définitivement"
        cancelText="Annuler"
        onConfirm={handleBan}
        variant="danger"
      />

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            <DialogDescription>
              Suspendre temporairement {user.user.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Raison (obligatoire)</label>
              <Input
                placeholder="Ex: Violation des conditions d'utilisation"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                disabled={isSuspending}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jusqu'à (optionnel)</label>
              <Input
                type="datetime-local"
                value={suspendUntil}
                onChange={(e) => setSuspendUntil(e.target.value)}
                disabled={isSuspending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(false)} disabled={isSuspending}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim() || isSuspending}
            >
              {isSuspending ? 'Suspension...' : 'Suspendre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
