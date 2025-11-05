'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

/**
 * RouteShell : applique AppShell partout SAUF dans /admin, /creator, /profile
 */
export function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isAdmin = pathname.startsWith('/admin');
  const isCreator = pathname.startsWith('/creator');
  const isProfile = pathname.startsWith('/profile');

  if (isAdmin || isCreator || isProfile) {
    // L'admin, creator hub et profils publics ont leurs propres layouts (ou aucun layout)
    return <>{children}</>;
  }

  // Site/app par défaut : on garde l'AppShell global
  return <AppShell>{children}</AppShell>;
}
