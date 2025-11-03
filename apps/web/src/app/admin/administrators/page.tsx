'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Search,
  MoreVertical,
  ShieldCheck,
  Users,
  Activity,
  Edit,
  Ban,
  Trash2,
  Plus,
  ShieldAlert,
  Crown,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';

// Admin Levels
type AdminLevel = 'SUPER_ADMIN' | 'ADMIN_FULL' | 'ADMIN_FINANCE' | 'ADMIN_MODERATION' | 'ADMIN_SUPPORT' | 'ADMIN_CUSTOM';
type AdminStatus = 'Active' | 'Suspended';

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: AdminLevel;
  modules: string[]; // For ADMIN_CUSTOM, list of enabled modules
  lastLogin: string;
  status: AdminStatus;
  createdAt: string;
}

// Demo data - using the admin users filtered from the main users page
const DEMO_ADMINS: Admin[] = [
  {
    id: '1',
    name: 'Alliso Pan',
    email: 'alliso.pan@ac.acc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alliso',
    level: 'SUPER_ADMIN',
    modules: [],
    lastLogin: '2 hours ago',
    status: 'Active',
    createdAt: '2023-01-15'
  },
  {
    id: '9',
    name: 'Emma Wilson',
    email: 'emma.w@mail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    level: 'ADMIN_FULL',
    modules: [],
    lastLogin: '2 hours ago',
    status: 'Active',
    createdAt: '2022-03-10'
  },
  {
    id: '14',
    name: 'Daniel White',
    email: 'd.white@service.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    level: 'ADMIN_MODERATION',
    modules: [],
    lastLogin: '30 minutes ago',
    status: 'Active',
    createdAt: '2023-06-20'
  },
];

export default function AdministratorsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>(DEMO_ADMINS);
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

  const filteredAdmins = admins.filter((admin) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      q === '' ||
      admin.name.toLowerCase().includes(q) ||
      admin.email.toLowerCase().includes(q)
    );
  });

  function getAdminLevelLabel(level: AdminLevel): string {
    const labels: Record<AdminLevel, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN_FULL: 'Admin Complet',
      ADMIN_FINANCE: 'Admin Finance',
      ADMIN_MODERATION: 'Admin Modération',
      ADMIN_SUPPORT: 'Admin Support',
      ADMIN_CUSTOM: 'Admin Personnalisé',
    };
    return labels[level];
  }

  function getAdminLevelColor(level: AdminLevel): string {
    const colors: Record<AdminLevel, string> = {
      SUPER_ADMIN: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      ADMIN_FULL: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white',
      ADMIN_FINANCE: 'bg-yellow-100 text-yellow-800',
      ADMIN_MODERATION: 'bg-orange-100 text-orange-800',
      ADMIN_SUPPORT: 'bg-blue-100 text-blue-800',
      ADMIN_CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[level];
  }

  function getModulesList(admin: Admin): string {
    if (admin.level === 'SUPER_ADMIN') return 'Tous les modules';
    if (admin.level === 'ADMIN_FULL') return 'Tous (sauf gestion admins)';
    if (admin.level === 'ADMIN_FINANCE') return 'Dashboard, Transactions, Comptabilité, Paiements';
    if (admin.level === 'ADMIN_MODERATION') return 'Dashboard, Utilisateurs, Reports, Modération, Posts';
    if (admin.level === 'ADMIN_SUPPORT') return 'Dashboard, Utilisateurs (lecture), Support, Disputes';
    if (admin.level === 'ADMIN_CUSTOM' && admin.modules.length > 0) return admin.modules.join(', ');
    return 'Aucun module';
  }

  function handleEditAdmin(adminId: string) {
    toast.info('Édition Admin', {
        description: 'Ouverture du modal d\'édition (à implémenter)',
      });
  }

  function handleSuspendAdmin(adminId: string) {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    if (admin.status === 'Suspended') {
      // Unsuspend
      setConfirmDialog({
        open: true,
        action: async () => {
          setActionInProgress(adminId);
          await new Promise((r) => setTimeout(r, 800));
          setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, status: 'Active' as AdminStatus } : a)));
          setActionInProgress(null);
          toast.success('Admin réactivé', {
            description: `${admin.name} a été réactivé`
          });
        },
        title: `Réactiver ${admin.name}`,
        description: 'Cet administrateur pourra de nouveau accéder au panneau admin.',
        variant: 'default',
      });
    } else {
      // Suspend
      setConfirmDialog({
        open: true,
        action: async () => {
          setActionInProgress(adminId);
          await new Promise((r) => setTimeout(r, 1000));
          setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, status: 'Suspended' as AdminStatus } : a)));
          setActionInProgress(null);
          toast.warning('Admin suspendu', {
            description: `${admin.name} a été suspendu`
          });
        },
        title: `Suspendre ${admin.name}`,
        description: 'Cet administrateur ne pourra plus accéder au panneau admin.',
        details: [
          'L\'accès au panneau admin sera révoqué immédiatement',
          'Les sessions actives seront terminées',
          'L\'admin peut être réactivé à tout moment',
        ],
        variant: 'danger',
      });
    }
  }

  function handleDeleteAdmin(adminId: string) {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    setConfirmDialog({
      open: true,
      action: async () => {
        setActionInProgress(adminId);
        await new Promise((r) => setTimeout(r, 1000));
        setAdmins((prev) => prev.filter((a) => a.id !== adminId));
        setActionInProgress(null);
        toast.success('Admin supprimé', {
          description: `${admin.name} a été supprimé`
        });
      },
      title: `Supprimer ${admin.name}`,
      description: 'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet administrateur ?',
      details: [
        'Tous les accès admin seront révoqués',
        'Les logs d\'actions seront préservés',
        'Cette action ne peut pas être annulée',
      ],
      variant: 'danger',
    });
  }

  function handleAddAdmin() {
    toast.info('Ajouter un Admin', {
        description: 'Modal d\'ajout d\'admin (à implémenter)',
      });
  }

  function translateTime(timeStr: string): string {
    if (!timeStr || timeStr === 'never') return 'Jamais';

    // Parse patterns like "2 years ago", "3 days ago", "1 month ago", "5 hours ago"
    const agoMatch = timeStr.match(/^(\d+)\s+(\w+)\s+ago$/);
    if (agoMatch) {
      const [, num, unit] = agoMatch;
      const unitTranslations: Record<string, string> = {
        minute: 'minute',
        minutes: 'minutes',
        hour: 'heure',
        hours: 'heures',
        day: 'jour',
        days: 'jours',
        week: 'semaine',
        weeks: 'semaines',
        month: 'mois',
        months: 'mois',
        year: 'an',
        years: 'ans',
      };
      return `Il y a ${num} ${unitTranslations[unit] || unit}`;
    }

    return timeStr;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les comptes administrateurs et leurs permissions</p>
        </div>
        <Button
          onClick={handleAddAdmin}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Admin
        </Button>
      </div>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Admins */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Admins</p>
                <p className="text-2xl font-bold">{admins.length}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Admins */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actifs</p>
                <p className="text-2xl font-bold">
                  {admins.filter((a) => a.status === 'Active').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Super Admins */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-2xl font-bold">
                  {admins.filter((a) => a.level === 'SUPER_ADMIN').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Rechercher un administrateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="Rechercher un administrateur"
        />
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Administrateur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Niveau</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Modules</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dernière Connexion</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={admin.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
                        {admin.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{admin.name}</p>
                      {admin.level === 'SUPER_ADMIN' && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Crown className="w-3 h-3" />
                          <span>Super Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                <td className="px-4 py-3">
                  <Badge className={getAdminLevelColor(admin.level)}>
                    {getAdminLevelLabel(admin.level)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 max-w-xs truncate" title={getModulesList(admin)}>
                    {getModulesList(admin)}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600">{translateTime(admin.lastLogin)}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      admin.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {admin.status === 'Active' ? 'Actif' : 'Suspendu'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={actionInProgress === admin.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleEditAdmin(admin.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleSuspendAdmin(admin.id)}
                        className={admin.status === 'Suspended' ? 'text-green-600' : 'text-yellow-600'}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        {admin.status === 'Suspended' ? 'Réactiver' : 'Suspendre'}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600"
                        disabled={admin.level === 'SUPER_ADMIN' && admins.filter(a => a.level === 'SUPER_ADMIN').length === 1}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                  Aucun administrateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        details={confirmDialog.details}
        confirmText="Confirmer"
        cancelText="Annuler"
        variant={confirmDialog.variant}
        onConfirm={() => {
          confirmDialog.action?.();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
    </div>
  );
}
