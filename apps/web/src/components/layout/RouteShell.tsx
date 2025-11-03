'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

/**
 * RouteShell : applique AppShell partout SAUF dans /admin
 */
export function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isAdmin = pathname.startsWith('/admin');
  const isCreator = pathname.startsWith('/creator');

  if (isAdmin || isCreator) {
    // L'admin et le creator hub ont leurs propres layouts
    return <>{children}</>;
  }

  // Site/app par défaut : on garde l'AppShell global
  return <AppShell>{children}</AppShell>;
}
