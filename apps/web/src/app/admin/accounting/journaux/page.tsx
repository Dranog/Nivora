'use client';

/**
 * Page: Écritures comptables par journal
 * Route: /admin/accounting/journaux
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, Loader2, Filter } from 'lucide-react';
import type { TransactionEnriched, JournalCode } from '@/lib/accounting/enrichment';
import { JOURNAL_CODES, PCG_ACCOUNTS } from '@/lib/accounting/enrichment';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ApiResponse {
  success: boolean;
  data: {
    transactions: TransactionEnriched[];
    stats: any;
  };
}

export default function JournauxPage() {
  const [transactions, setTransactions] = useState<TransactionEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<JournalCode | 'ALL'>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/transactions-enriched');
      const json: ApiResponse = await res.json();

      if (json.success) {
        setTransactions(json.data.transactions);
      }
    } catch (err) {
      console.error('Erreur chargement écritures:', err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const filtered = selectedJournal === 'ALL'
    ? transactions
    : transactions.filter(t => t.accounting.journal === selectedJournal);

  const completed = filtered.filter(t => t.status === 'Completed');

  function exportToExcel() {
    const data = completed.flatMap(t =>
      t.accounting.ecritures.map(e => ({
        Journal: t.accounting.journal,
        Date: t.date,
        'Transaction ID': t.id,
        Compte: e.compte,
        'Libellé': e.libelle,
        Débit: (e.debit / 100).toFixed(2),
        Crédit: (e.credit / 100).toFixed(2),
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Écritures');
    XLSX.writeFile(wb, `ecritures-comptables-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export réussi');
  }

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-start" />
            Écritures Comptables
          </h1>
          <p className="text-gray-600 mt-1">Visualisation par journal comptable</p>
        </div>
        <Button
          onClick={exportToExcel}
          disabled={completed.length === 0}
          className="bg-gradient-to-r from-brand-start to-brand-end text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Journal :</span>
          <Button
            variant={selectedJournal === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedJournal('ALL')}
          >
            Tous ({transactions.length})
          </Button>
          {(Object.keys(JOURNAL_CODES) as JournalCode[]).map(code => {
            const count = transactions.filter(t => t.accounting.journal === code).length;
            if (count === 0) return null;
            return (
              <Button
                key={code}
                variant={selectedJournal === code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedJournal(code)}
              >
                {code} - {JOURNAL_CODES[code]} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </Card>
      ) : completed.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Aucune écriture comptable</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {completed.map(tx => (
            <Card key={tx.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-gradient-to-r from-brand-start to-brand-end text-white border-0">
                      {tx.accounting.journal}
                    </Badge>
                    <span className="text-sm text-gray-600">{tx.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{tx.accounting.libelle}</p>
                  <p className="text-xs text-gray-500">Transaction ID: {tx.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {fmtEur(tx.accounting.tva.montantTTC)}
                  </p>
                  <p className="text-xs text-gray-500">
                    HT: {fmtEur(tx.accounting.tva.baseHT)} | TVA: {fmtEur(tx.accounting.tva.montantTVA)}
                  </p>
                </div>
              </div>

              {/* Écritures */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Compte</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Libellé</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">Débit</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">Crédit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tx.accounting.ecritures.map((ecriture, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {ecriture.compte}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {ecriture.libelle}
                          <span className="text-xs text-gray-500 ml-2">
                            ({PCG_ACCOUNTS[ecriture.compte as keyof typeof PCG_ACCOUNTS] || 'Inconnu'})
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">
                          {ecriture.debit > 0 ? fmtEur(ecriture.debit) : '-'}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600">
                          {ecriture.credit > 0 ? fmtEur(ecriture.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 font-bold text-gray-900">Total</td>
                      <td className="px-4 py-2 text-right font-bold text-green-600">
                        {fmtEur(tx.accounting.ecritures.reduce((s, e) => s + e.debit, 0))}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-red-600">
                        {fmtEur(tx.accounting.ecritures.reduce((s, e) => s + e.credit, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
