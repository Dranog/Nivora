'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  UserCheck,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User as UserIcon,
  LifeBuoy,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  icon: any;
  label: string;
  href: string;
  subItems?: SubItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('admin.sidebar');
  const tCommon = useTranslations('common');

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Récupérer user depuis localStorage
  const getUserFromStorage = () => {
    try {
      const userJson = localStorage.getItem('admin_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  };

  const user = getUserFromStorage();

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'AD';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_token=; path=/; max-age=0';
    document.cookie = 'auth-storage=; path=/; max-age=0';
    document.cookie = 'oliver_admin_sid=; path=/; max-age=0';
    window.location.href = '/admin/login';
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isAnySubItemActive = (subItems?: SubItem[]) => {
    if (!subItems) return false;
    return subItems.some(item => pathname === item.href);
  };

  const NAV_ITEMS: NavItem[] = [
    {
      icon: Users,
      label: 'Utilisateurs',
      href: '/admin/users'
    },
    {
      icon: DollarSign,
      label: 'Finance',
      href: '/admin/transactions',
      subItems: [
        { label: 'Transactions', href: '/admin/transactions' },
        { label: 'Comptabilité', href: '/admin/accounting' },
        { label: 'Retraits', href: '/admin/payouts' }
      ]
    },
    {
      icon: Shield,
      label: 'Modération',
      href: '/admin/reports',
      subItems: [
        { label: 'Signalements', href: '/admin/reports' },
        { label: 'Publications', href: '/admin/posts' }
      ]
    },
    {
      icon: LifeBuoy,
      label: 'Support',
      href: '/admin/support',
      subItems: [
        { label: 'Tickets', href: '/admin/support' },
        { label: 'Litiges', href: '/admin/chargebacks' }
      ]
    },
    {
      icon: UserCheck,
      label: 'Vérification KYC',
      href: '/admin/kyc'
    },
    {
      icon: ShieldCheck,
      label: 'Sécurité',
      href: '/admin/security/2fa-setup',
      subItems: [
        { label: 'Authentification 2FA', href: '/admin/security/2fa-setup' },
        { label: 'IP Whitelist', href: '/admin/security/ip-management' },
        { label: 'Sessions & Logs', href: '/admin/security/sessions' }
      ]
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/admin/settings',
      subItems: [
        { label: 'Configuration', href: '/admin/settings' },
        { label: 'Juridique', href: '/admin/legal' },
        { label: 'Santé Système', href: '/admin/health' }
      ]
    },
    {
      icon: ShieldCheck,
      label: 'Administrateurs',
      href: '/admin/administrators'
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <p className="font-semibold text-sm">OLIVER</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Profil Admin Section */}
        <div className="mb-2">
          <div className="px-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mon Profil
            </p>
          </div>

          {/* Dashboard Link */}
          <Link
            href="/admin/dashboard"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1',
              pathname === '/admin/dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Super Admin
                  </p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  profileDropdownOpen && "transform rotate-180"
                )} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 ml-4">
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Éditer mon profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/preferences')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Préférences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-2" />

        {/* Main Nav Items */}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openDropdowns[item.label];
          const isMainActive = pathname === item.href;
          const isSubItemActive = isAnySubItemActive(item.subItems);
          const isActive = isMainActive || isSubItemActive;

          if (hasSubItems) {
            return (
              <div key={item.label}>
                {/* Parent Item with Dropdown */}
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isOpen && "transform rotate-180"
                  )} />
                </button>

                {/* Sub Items */}
                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-3 pl-12 pr-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                            isSubActive
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Simple Link Item
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        Oliver Admin v1.0
      </div>
    </div>
  );
}
