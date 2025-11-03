'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, FileDown, Filter, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction, TransactionType } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  subscription: 'Abonnement',
  ppv: 'PPV',
  tip: 'Tip',
  marketplace: 'Marketplace',
  refund: 'Remboursement',
};

const ITEMS_PER_PAGE = 20;

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions =
    selectedType === 'all'
      ? transactions
      : transactions.filter((t) => t.type === selectedType);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Export CSV en cours', {
      description: `${filteredTransactions.length} transactions`,
    });
    setIsExporting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
            Complete
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold">
            En attente
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
            Traitement
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-semibold">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="col-span-12 lg:col-span-7 shadow-card border-gray-100/50">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Transactions</h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg font-medium"
              >
                <Filter className="w-4 h-4 mr-2" aria-hidden={true} />
                Tous types
                <ChevronDown className="w-4 h-4 ml-2" aria-hidden={true} />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-lg font-medium"
            >
              Doof
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-lg font-medium"
            >
              <FileDown className="w-4 h-4 mr-2" aria-hidden={true} />
              {isExporting ? 'Export...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  De
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">
                      {TRANSACTION_TYPE_LABELS[transaction.type]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-start to-brand-end flex items-center justify-center text-white text-xs font-bold">
                        {transaction.from.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.from.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" aria-hidden={true} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden={true} />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-9 w-9 p-0 ${
                    currentPage === pageNumber
                      ? 'bg-gradient-to-r from-brand-start to-brand-end text-white hover:brightness-110'
                      : ''
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" aria-hidden={true} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
