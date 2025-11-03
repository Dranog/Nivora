'use client';

/**
 * Layout pour la section Comptabilité
 * Ajoute une navigation par tabs entre les pages
 */

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Home, BookOpen, Receipt, BarChart3, CheckSquare, Building, FileText, Scale } from 'lucide-react';

interface AccountingLayoutProps {
  children: ReactNode;
}

const TABS = [
  {
    label: 'Vue d\'ensemble',
    path: '/admin/accounting',
    icon: Home,
    description: 'Transactions et statistiques',
  },
  {
    label: 'Journaux',
    path: '/admin/accounting/journaux',
    icon: BookOpen,
    description: 'Écritures comptables',
  },
  {
    label: 'Grand Livre',
    path: '/admin/accounting/grand-livre',
    icon: FileText,
    description: 'Mouvements par compte',
  },
  {
    label: 'Bilan',
    path: '/admin/accounting/bilan',
    icon: Scale,
    description: 'Actif et Passif',
  },
  {
    label: 'TVA',
    path: '/admin/accounting/tva',
    icon: Receipt,
    description: 'Déclarations CA3',
  },
  {
    label: 'Analytique',
    path: '/admin/accounting/analytique',
    icon: BarChart3,
    description: 'Graphiques et analyses',
  },
  {
    label: 'Lettrage',
    path: '/admin/accounting/lettrage',
    icon: CheckSquare,
    description: 'Rapprochement comptable',
  },
  {
    label: 'Immobilisations',
    path: '/admin/accounting/immobilisations',
    icon: Building,
    description: 'Gestion et amortissements',
  },
];

export default function AccountingLayout({ children }: AccountingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/admin/accounting') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 pt-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);

              return (
                <button
                  key={tab.path}
                  onClick={() => router.push(tab.path)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap
                    ${
                      active
                        ? 'bg-gradient-to-r from-brand-start to-brand-end text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breadcrumb/Description */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        {TABS.map((tab) => {
          if (!isActive(tab.path)) return null;
          return (
            <p key={tab.path} className="text-sm text-gray-600">
              {tab.description}
            </p>
          );
        })}
      </div>

      {/* Contenu de la page */}
      <div>{children}</div>
    </div>
  );
}
