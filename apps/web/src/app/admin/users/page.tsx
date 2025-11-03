// path: src/app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Ban, Trash2, MoreVertical, Users, TrendingUp, DollarSign, Activity, Filter, ChevronUp, ChevronDown, Eye, Mail, UserX, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmailDialog } from './EmailDialog';
import { Card, CardContent } from '@/components/ui/card';
import { DEMO_USERS, type DemoUser, getStatusLabel, getStatusColor } from '@/lib/demo/users';

// Types manquants
type Role = 'Admin' | 'Creator' | 'User';
type Status = 'Verified' | 'Pending' | 'Rejected' | 'Suspended';

// Use DemoUser type from centralized source
type User = DemoUser;

// Helper functions for revenue and subscribers (seed-based)
function getUserRevenue(userId: string): string {
  const seed = parseInt(userId) * 150;
  const revenue = (seed % 10) * 500 + 1000;
  return `€${revenue.toLocaleString('fr-FR')}`;
}

function getUserSubscribers(userId: string): number {
  const seed = parseInt(userId) * 200;
  return (seed % 50) * 20 + 50;
}

type TabType = 'all' | 'creators' | 'fans' | 'active' | 'suspended' | 'banned' | 'new';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { showToast } = useToast();

  // Filter out Admin users - they are managed in the Administrators page
  const [users, setUsers] = useState<User[]>(DEMO_USERS.filter(u => u.role !== 'Admin'));
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: (() => void) | null;
    title: string;
    description: string;
    details?: string[];
    variant?: 'default' | 'danger';
  }>({
    open: false,
    action: null,
    title: '',
    description: '',
    details: [],
    variant: 'default',
  });

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<string>('all');
  const [subscribersFilter, setSubscribersFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // Quick view modal state
  const [quickViewUser, setQuickViewUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    let tabMatch = true;
    if (activeTab === 'creators') tabMatch = user.role === 'Creator';
    if (activeTab === 'fans') tabMatch = user.role === 'User';
    if (activeTab === 'active') tabMatch = user.status === 'Verified';
    if (activeTab === 'suspended') tabMatch = user.status === 'Suspended';
    if (activeTab === 'banned') tabMatch = user.status === 'Rejected';
    if (activeTab === 'new') {
      const accountAge = user.accountAge.toLowerCase();
      tabMatch = accountAge.includes('day') || accountAge.includes('jour') || accountAge.includes('week') || accountAge.includes('semaine');
    }

    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      q === '' ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);

    // Advanced filters
    let advancedMatch = true;

    // Revenue filter (creators only)
    if (revenueFilter !== 'all' && user.role === 'Creator') {
      const revenue = parseInt(getUserRevenue(user.id).replace(/[^\d]/g, ''));
      if (revenueFilter === 'low' && revenue >= 2000) advancedMatch = false;
      if (revenueFilter === 'medium' && (revenue < 2000 || revenue >= 5000)) advancedMatch = false;
      if (revenueFilter === 'high' && (revenue < 5000 || revenue >= 10000)) advancedMatch = false;
      if (revenueFilter === 'very-high' && revenue < 10000) advancedMatch = false;
    }

    // Subscribers filter (creators only)
    if (subscribersFilter !== 'all' && user.role === 'Creator') {
      const subs = getUserSubscribers(user.id);
      if (subscribersFilter === 'low' && subs >= 100) advancedMatch = false;
      if (subscribersFilter === 'medium' && (subs < 100 || subs >= 500)) advancedMatch = false;
      if (subscribersFilter === 'high' && (subs < 500 || subs >= 1000)) advancedMatch = false;
      if (subscribersFilter === 'very-high' && subs < 1000) advancedMatch = false;
    }

    // KYC filter (placeholder - would use real KYC data in production)
    if (kycFilter !== 'all') {
      if (kycFilter === 'validated' && user.status !== 'Verified') advancedMatch = false;
      if (kycFilter === 'pending' && user.status !== 'Pending') advancedMatch = false;
      if (kycFilter === 'missing') advancedMatch = false;
      if (kycFilter === 'expired') advancedMatch = false;
    }

    // Activity filter
    if (activityFilter !== 'all') {
      const lastLogin = user.lastLogin.toLowerCase();
      if (activityFilter === 'online') {
        const isRecent = lastLogin.includes('hour') || lastLogin.includes('heure') || lastLogin.includes('minute');
        if (!isRecent) advancedMatch = false;
      }
      if (activityFilter === 'inactive-7d') {
        const isInactive = lastLogin.includes('week') || lastLogin.includes('semaine') || lastLogin.includes('month') || lastLogin.includes('mois') || lastLogin.includes('year') || lastLogin.includes('an');
        if (!isInactive) advancedMatch = false;
      }
      if (activityFilter === 'inactive-30d') {
        const isVeryInactive = lastLogin.includes('month') || lastLogin.includes('mois') || lastLogin.includes('year') || lastLogin.includes('an');
        if (!isVeryInactive) advancedMatch = false;
      }
    }

    return tabMatch && searchMatch && advancedMatch;
  });

  function handleSuspendUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      action: async () => {
        setActionInProgress(userId);
        await new Promise((r) => setTimeout(r, 1000));
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'Suspended' } : u)));
        setActionInProgress(null);
        showToast({
          type: 'success',
          title: t('userSuspended'),
          message: `${user.name} ${t('userSuspendedMessage')}`,
        });
      },
      title: t('suspendDialog.title', { name: user.name }),
      description: t('suspendDialog.description'),
      details: [
        t('suspendDialog.detail1'),
        t('suspendDialog.detail2'),
        t('suspendDialog.detail3'),
        t('suspendDialog.detail4'),
      ],
      variant: 'danger',
    });
  }

  function handleViewUser(userId: string) {
    showToast({ type: 'info', title: t('loadingProfile'), message: t('redirecting') });
    setTimeout(() => router.push(`/admin/users/${userId}`), 250);
  }

  function handleSuspend(user: User) {
    if (user.status === 'Suspended') {
      setConfirmDialog({
        open: true,
        action: async () => {
          setActionInProgress(user.id);
          await new Promise((r) => setTimeout(r, 800));
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'Verified' } : u)));
          setActionInProgress(null);
          showToast({
            type: 'success',
            title: t('toasts.unsuspended', { name: user.name }),
            message: '',
          });
        },
        title: t('unsuspendDialog.title', { name: user.name }),
        description: t('unsuspendDialog.description'),
        variant: 'default',
      });
    } else {
      setConfirmDialog({
        open: true,
        action: async () => {
          setActionInProgress(user.id);
          await new Promise((r) => setTimeout(r, 1000));
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'Suspended' } : u)));
          setActionInProgress(null);
          showToast({
            type: 'success',
            title: t('toasts.suspended', { name: user.name }),
            message: '',
          });
        },
        title: t('suspendDialog.title', { name: user.name }),
        description: t('suspendDialog.description'),
        details: [
          t('suspendDialog.detail1'),
          t('suspendDialog.detail2'),
          t('suspendDialog.detail3'),
        ],
        variant: 'danger',
      });
    }
  }

  function handleBan(user: User) {
    setConfirmDialog({
      open: true,
      action: async () => {
        setActionInProgress(user.id);
        await new Promise((r) => setTimeout(r, 1000));
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setActionInProgress(null);
        showToast({
          type: 'success',
          title: t('toasts.banned', { name: user.name }),
          message: '',
        });
      },
      title: t('banDialog.title', { name: user.name }),
      description: t('banDialog.description'),
      details: [
        t('banDialog.detail1'),
        t('banDialog.detail2'),
        t('banDialog.detail3'),
        t('banDialog.detail4'),
      ],
      variant: 'danger',
    });
  }

  function handleDelete(user: User) {
    setConfirmDialog({
      open: true,
      action: async () => {
        setActionInProgress(user.id);
        await new Promise((r) => setTimeout(r, 1000));
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setActionInProgress(null);
        showToast({
          type: 'success',
          title: t('toasts.deleted', { name: user.name }),
          message: '',
        });
      },
      title: t('deleteDialog.title', { name: user.name }),
      description: t('deleteDialog.description'),
      details: [
        t('deleteDialog.detail1'),
        t('deleteDialog.detail2'),
        t('deleteDialog.detail3'),
        t('deleteDialog.detail4'),
      ],
      variant: 'danger',
    });
  }

  function handleDeleteUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      action: async () => {
        setActionInProgress(userId);
        await new Promise((r) => setTimeout(r, 1500));
        setUsers((prev) => prev.filter((u) => u.id === userId));
        setActionInProgress(null);
        showToast({
          type: 'success',
          title: t('userDeleted'),
          message: `${user.name} ${t('userDeletedMessage')}`,
        });
      },
      title: t('deleteDialog.title', { name: user.name }),
      description: t('deleteDialog.description'),
      details: [
        t('deleteDialog.detail1'),
        t('deleteDialog.detail2'),
        t('deleteDialog.detail3'),
        t('deleteDialog.detail4'),
      ],
      variant: 'danger',
    });
  }

  function handleResetFilters() {
    setRevenueFilter('all');
    setSubscribersFilter('all');
    setKycFilter('all');
    setActivityFilter('all');
    showToast({ type: 'info', title: 'Filtres réinitialisés', message: '' });
  }

  function getRoleBadgeVariant(role: Role): 'default' | 'secondary' | 'outline' {
    if (role === 'Admin') return 'default';
    if (role === 'Creator') return 'secondary';
    return 'outline';
  }

  function getStatusBadgeClasses(status: Status) {
    if (status === 'Verified') return 'bg-green-100 text-green-800';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  function translateRole(role: Role): string {
    return t(`roles.${role.toLowerCase()}`);
  }

  function translateStatus(status: Status): string {
    return t(`statuses.${status.toLowerCase()}`);
  }

  function translateTime(timeStr: string): string {
    if (!timeStr || timeStr === 'never') return t('time.never');

    const agoMatch = timeStr.match(/^(\d+)\s+(\w+)\s+ago$/);
    if (agoMatch) {
      const [, num, unit] = agoMatch;
      const unitKey = parseInt(num) === 1 ? unit.replace(/s$/, '') : unit;
      const timeValue = `${num} ${t(`time.${unitKey}`)}`;
      return t('time.agoFormat', { time: timeValue });
    }

    const directMatch = timeStr.match(/^(\d+)\s+(\w+)$/);
    if (directMatch) {
      const [, num, unit] = directMatch;
      const unitKey = parseInt(num) === 1 ? unit.replace(/s$/, '') : unit;
      return `${num} ${t(`time.${unitKey}`)}`;
    }

    return timeStr;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#00B8A9]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nouveaux (7j)</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => {
                    const accountAge = u.accountAge.toLowerCase();
                    return accountAge.includes('day') || accountAge.includes('jour');
                  }).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus/mois</p>
                <p className="text-2xl font-bold">
                  €{users
                    .filter((u) => u.role === 'Creator')
                    .reduce((sum, u) => sum + parseInt(getUserRevenue(u.id).replace(/[^\d]/g, '')), 0)
                    .toLocaleString('fr-FR')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actifs 24h</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => {
                    const lastLogin = u.lastLogin.toLowerCase();
                    return lastLogin.includes('hour') || lastLogin.includes('heure') || lastLogin.includes('minute');
                  }).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label={t('searchPlaceholder')}
        />
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="mb-3"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres Avancés
          {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>

        {showAdvancedFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Revenus/mois</label>
                  <Select value={revenueFilter} onValueChange={setRevenueFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="low">&lt; €2k</SelectItem>
                      <SelectItem value="medium">€2k - €5k</SelectItem>
                      <SelectItem value="high">€5k - €10k</SelectItem>
                      <SelectItem value="very-high">&gt; €10k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Abonnés</label>
                  <Select value={subscribersFilter} onValueChange={setSubscribersFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="low">&lt; 100</SelectItem>
                      <SelectItem value="medium">100 - 500</SelectItem>
                      <SelectItem value="high">500 - 1k</SelectItem>
                      <SelectItem value="very-high">&gt; 1k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Statut KYC</label>
                  <Select value={kycFilter} onValueChange={setKycFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="validated">Validé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="missing">Docs manquants</SelectItem>
                      <SelectItem value="expired">Docs expirés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Activité</label>
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="online">En ligne 24h</SelectItem>
                      <SelectItem value="inactive-7d">Inactif &gt; 7j</SelectItem>
                      <SelectItem value="inactive-30d">Inactif &gt; 30j</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('filters.all'), count: users.length },
          { key: 'creators', label: t('filters.creators'), count: users.filter(u => u.role === 'Creator').length },
          { key: 'fans', label: t('filters.fans'), count: users.filter(u => u.role === 'User').length },
          { key: 'active', label: t('filters.active'), count: users.filter(u => u.status === 'Verified').length },
          { key: 'suspended', label: t('filters.suspended'), count: users.filter(u => u.status === 'Suspended').length },
          { key: 'banned', label: t('filters.banned'), count: users.filter(u => u.status === 'Rejected').length },
          { key: 'new', label: t('filters.new'), count: users.filter(u => {
            const accountAge = u.accountAge.toLowerCase();
            return accountAge.includes('day') || accountAge.includes('jour') ||
                   accountAge.includes('week') || accountAge.includes('semaine');
          }).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-brand-start to-brand-end text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.email')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.role')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenus/mois</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Abonnés</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.accountAge')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.lastLogin')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-start to-brand-end text-white">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.emailVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                          <CheckCircle className="w-4 h-4 text-[#00B8A9]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => setQuickViewUser(user)}
                        className="font-medium text-gray-900 hover:text-[#00B8A9] cursor-pointer block"
                      >
                        {user.name}
                      </button>
                      {user.handle && (
                        <span className="text-xs text-gray-500">@{user.handle}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className={
                      user.role === 'Admin'
                        ? 'bg-cyan-100 text-cyan-800'
                        : user.role === 'Creator'
                        ? 'bg-orange-100 text-orange-800'
                        : ''
                    }
                  >
                    {translateRole(user.role)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {user.role === 'Creator' ? (
                    <div className="flex items-center gap-1 text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {getUserRevenue(user.id)}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.role === 'Creator' ? (
                    <div className="flex items-center gap-1 text-gray-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      {getUserSubscribers(user.id)}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusBadgeClasses(user.status)}>{translateStatus(user.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{translateTime(user.accountAge)}</td>
                <td className="px-4 py-3 text-gray-600">{translateTime(user.lastLogin)}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={actionInProgress === user.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails admin
                      </DropdownMenuItem>

                      {user.handle && (
                        <DropdownMenuItem onClick={() => window.open(`/profile/${user.handle}`, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir profil public
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => {
                        setSelectedUser(user);
                        setEmailDialogOpen(true);
                      }}>
                        <Mail className="w-4 h-4 mr-2" />
                        {t('actions.sendEmail')}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleSuspend(user)}
                        className={user.status === 'Suspended' ? 'text-green-600' : ''}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        {user.status === 'Suspended' ? t('actions.unsuspend') : t('actions.suspend')}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleBan(user)} className="text-red-600">
                        <Ban className="w-4 h-4 mr-2" />
                        {t('actions.ban')}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-sm text-gray-500">
                  {t('noUsers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        userName={selectedUser?.name || ''}
        userEmail={selectedUser?.email || ''}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        details={confirmDialog.details}
        confirmText={tCommon('confirm')}
        cancelText={tCommon('cancel')}
        variant={confirmDialog.variant}
        onConfirm={() => {
          confirmDialog.action?.();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />

      <Dialog open={!!quickViewUser} onOpenChange={(open) => !open && setQuickViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aperçu Utilisateur</DialogTitle>
          </DialogHeader>
          {quickViewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={quickViewUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-brand-start to-brand-end text-white text-xl">
                    {quickViewUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{quickViewUser.name}</h3>
                  <p className="text-sm text-gray-600">{quickViewUser.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge
                  variant={getRoleBadgeVariant(quickViewUser.role)}
                  className={
                    quickViewUser.role === 'Admin'
                      ? 'bg-cyan-100 text-cyan-800'
                      : quickViewUser.role === 'Creator'
                      ? 'bg-orange-100 text-orange-800'
                      : ''
                  }
                >
                  {translateRole(quickViewUser.role)}
                </Badge>
                <Badge className={getStatusBadgeClasses(quickViewUser.status)}>
                  {translateStatus(quickViewUser.status)}
                </Badge>
              </div>

              {quickViewUser.role === 'Creator' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Revenus/mois</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {getUserRevenue(quickViewUser.id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Abonnés</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      {getUserSubscribers(quickViewUser.id)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Compte créé</span>
                  <span className="font-medium">{translateTime(quickViewUser.accountAge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dernière connexion</span>
                  <span className="font-medium">{translateTime(quickViewUser.lastLogin)}</span>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setQuickViewUser(null)}>
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    handleViewUser(quickViewUser.id);
                    setQuickViewUser(null);
                  }}
                  className="bg-gradient-to-r from-brand-start to-brand-end hover:opacity-95 text-white"
                >
                  Voir Détails Complets
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}