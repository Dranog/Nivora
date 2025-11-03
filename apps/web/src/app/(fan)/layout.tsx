/**
 * Fan Layout - F1 Shell SPA
 * Layout for fan area pages
 * Header + Sidebar + Content + Footer
 */

'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store/useAuthStore';

export default function FanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuthStore();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar userRole={role ?? undefined} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
