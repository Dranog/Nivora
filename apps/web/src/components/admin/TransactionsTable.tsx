'use client';

import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function TransactionsTable() {
  const t = useTranslations('admin.dashboard');

  const DEMO_DATA = [
    { id: 1, month: 'january', day: 28, descKey: 'transaction', amount: '+880,00', hasTag: true },
    { id: 2, month: 'february', day: 28, descKey: 'purchaseCode', amount: '+58,00', hasTag: false },
    { id: 3, month: 'march', day: 28, descKey: 'invoiceDetails', amount: '+29,00', hasTag: false },
    { id: 4, month: 'april', day: 28, descKey: 'transactionDoc', amount: '-56,00', hasTag: false },
    { id: 5, month: 'february', day: 14, descKey: 'depositDetails', amount: '+55,00', hasTag: false },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead>{t('table.description')}</TableHead>
            <TableHead>{t('table.amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_DATA.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-gray-600">
                {t(`months.${tx.month}`)} {tx.day}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{t(`demoTransactions.${tx.descKey}`)}</span>
                  {tx.hasTag && <Badge variant="secondary" className="text-xs">{t('table.tag')}</Badge>}
                </div>
              </TableCell>
              <TableCell className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
