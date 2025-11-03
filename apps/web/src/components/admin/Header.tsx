'use client';

import { useTranslations } from 'next-intl';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const t = useTranslations('common');

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

  const handleLogout = () => {
    // 1. Supprimer localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin_user');

    // 2. Supprimer cookies
    document.cookie = 'admin_token=; path=/; max-age=0';
    document.cookie = 'auth-storage=; path=/; max-age=0';
    document.cookie = 'oliver_admin_sid=; path=/; max-age=0';

    // 3. Redirect avec force reload
    window.location.href = '/admin/login';
  };

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'AD';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-end">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-[#00B8A9] to-[#00A395] text-white font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'Admin'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
