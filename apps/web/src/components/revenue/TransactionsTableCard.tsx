'use client';

import { useState } from 'react';
import { CheckCircle, Play, Gift, ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Transaction, TransactionType } from './types';

interface TransactionsTableCardProps {
  transactions: Transaction[];
}

const TRANSACTION_ICONS: Record<TransactionType, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  subscription: CheckCircle,
  ppv: Play,
  tip: Gift,
  marketplace: ShoppingBag,
};

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  subscription: 'Abonnement',
  ppv: 'PPV/Achats',
  tip: 'Tips',
  marketplace: 'Marketplace',
};

export function TransactionsTableCard({ transactions }: TransactionsTableCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Export CSV réussi', {
        description: 'Le fichier a été téléchargé',
      });
    } catch (error) {
      toast.error('Erreur lors de l\'export', {
        description: 'Veuillez réessayer',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetails = (transactionId: string) => {
    toast.info('Détails de la transaction', {
      description: `Transaction ID: ${transactionId}`,
    });
  };

  return (
    <div className="col-span-12 lg:col-span-7 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Date type</h3>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <option>Tous types</option>
            <option>Abonnements</option>
            <option>PPV/Achats</option>
            <option>Tips</option>
            <option>Marketplace</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="font-medium"
          >
            Doof
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="font-medium"
          >
            {isExporting ? 'Export...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                De
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Montant
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Statut
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const Icon = TRANSACTION_ICONS[transaction.type];
              const iconColor = transaction.type === 'subscription' ? 'text-cyan-500' :
                               transaction.type === 'ppv' ? 'text-blue-500' :
                               'text-orange-500';

              return (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden={true} />
                      <span className="text-sm font-medium text-gray-900">
                        {TRANSACTION_LABELS[transaction.type]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: transaction.from.avatarColor }}
                      >
                        {transaction.from.initials}
                      </div>
                      <span className="text-sm text-gray-900">{transaction.from.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {transaction.status === 'complete' && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold">
                        Complete
                      </Badge>
                    )}
                    {transaction.status === 'pending' && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 font-semibold">
                        En attente
                      </Badge>
                    )}
                    {transaction.status === 'cancelled' && (
                      <Badge variant="outline" className="text-gray-500 line-through">
                        Ct Lolthoidk
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleDetails(transaction.id)}
                      className="text-cyan-500 hover:text-cyan-600 font-medium text-sm inline-flex items-center gap-1"
                    >
                      {transaction.status === 'complete' ? 'Details' : transaction.status === 'cancelled' ? 'En attente' : 'Pending'}
                      <ChevronRight className="w-4 h-4" aria-hidden={true} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing 1-20 of 234 transactions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden={true} />
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-cyan-500 text-white font-medium"
            aria-current="page"
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(12, currentPage + 1))}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-4 h-4" aria-hidden={true} />
          </button>
        </div>
      </div>
    </div>
  );
}
