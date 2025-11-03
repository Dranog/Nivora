'use client';

/**
 * Page: Lettrage comptable
 * Route: /admin/accounting/lettrage
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Zap, Download, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Lettrage, BalanceAgee } from '@/lib/accounting/lettrage';
import * as XLSX from 'xlsx';

interface ApiResponse {
  success: boolean;
  lettrages: Lettrage[];
  transactionsNonLettrees: any[];
  balanceAgee: BalanceAgee;
}

export default function LettragePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lettrages, setLettrages] = useState<Lettrage[]>([]);
  const [balanceAgee, setBalanceAgee] = useState<BalanceAgee | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTransactionsNonLettrees();
  }, []);

  async function fetchTransactionsNonLettrees() {
    setLoading(true);
    try {
      const response = await fetch('/api/accounting/lettrage');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setTransactions(data.transactionsNonLettrees || []);
        setLettrages(data.lettrages || []);
        setBalanceAgee(data.balanceAgee || null);
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les transactions',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoLettrage() {
    setProcessing(true);
    try {
      const response = await fetch('/api/accounting/lettrage/auto', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lettrage automatique réussi', {
          description: `${data.lettrages.length} lettrage(s) créé(s)`,
        });

        await fetchTransactionsNonLettrees();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de lettrer automatiquement',
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleLettrerSelection() {
    if (selectedIds.length < 2) {
      toast.error('Erreur', {
        description: 'Sélectionnez au moins 2 transactions',
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/accounting/lettrage/manuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionIds: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lettrage manuel réussi', {
          description: `Code: ${data.lettrage.code}`,
        });

        setSelectedIds([]);
        await fetchTransactionsNonLettrees();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de lettrer manuellement',
      });
    } finally {
      setProcessing(false);
    }
  }

  function handleExportBalanceAgee() {
    if (!balanceAgee) return;

    const data = [
      ['Tranche', 'Montant'],
      ['Moins de 30 jours', balanceAgee.moins30j],
      ['Entre 30 et 60 jours', balanceAgee.entre30et60j],
      ['Entre 60 et 90 jours', balanceAgee.entre60et90j],
      ['Plus de 90 jours', balanceAgee.plus90j],
      ['', ''],
      ['Total', balanceAgee.total],
      ['Provisions suggérées', balanceAgee.provisions],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Âgée');
    XLSX.writeFile(wb, `balance-agee-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('Export réussi');
  }

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const allChecked = transactions.length > 0 && selectedIds.length === transactions.length;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-brand-start" />
            Lettrage Comptable
          </h1>
          <p className="text-gray-600 mt-1">Rapprochement automatique et manuel des transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAutoLettrage}
            disabled={processing || loading || transactions.length === 0}
            className="bg-gradient-to-r from-brand-start to-brand-end text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-lettrage
          </Button>
          <Button onClick={handleExportBalanceAgee} disabled={!balanceAgee} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Balance âgée
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Transactions lettrées</span>
            <CheckSquare className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lettrages.reduce((sum, l) => sum + l.transactionIds.length, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{lettrages.length} lettrage(s)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">À lettrer</span>
            <XCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Transactions en attente</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Sélectionnées</span>
            <Checkbox checked={false} disabled />
          </div>
          <p className="text-2xl font-bold text-gray-900">{selectedIds.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pour lettrage manuel</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Balance âgée</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {balanceAgee ? fmtEur(balanceAgee.total * 100) : '-'}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {balanceAgee ? `Provisions: ${fmtEur(balanceAgee.provisions * 100)}` : '-'}
          </p>
        </Card>
      </div>

      {/* Actions groupées */}
      {selectedIds.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.length} transaction(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleLettrerSelection} disabled={processing}>
                <CheckSquare className="w-4 h-4 mr-1" />
                Lettrer la sélection
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tableau transactions non lettrées */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions Non Lettrées</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">Toutes les transactions sont lettrées</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(tx.id)}
                        onCheckedChange={(checked) => toggleRow(tx.id, !!checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">{tx.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{tx.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{tx.user?.name || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {fmtEur(tx.amount * 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(tx.date || tx.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Lettrages existants */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lettrages Existants</h3>

        {lettrages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun lettrage effectué</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lettrages.map((lettrage) => (
              <div
                key={lettrage.code}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-gradient-to-r from-brand-start to-brand-end text-white border-0 font-mono">
                    {lettrage.code}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {lettrage.transactionIds.length} transaction(s)
                  </span>
                  <Badge variant={lettrage.type === 'auto' ? 'default' : 'secondary'}>
                    {lettrage.type === 'auto' ? 'Automatique' : 'Manuel'}
                  </Badge>
                  <Badge
                    variant={lettrage.statut === 'lettre' ? 'default' : 'outline'}
                    className={
                      lettrage.statut === 'lettre' ? 'bg-green-100 text-green-800' : 'text-orange-800'
                    }
                  >
                    {lettrage.statut === 'lettre' ? 'Lettré' : 'Partiel'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {fmtEur(lettrage.montantTotal * 100)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(lettrage.dateLettrage).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Balance âgée */}
      {balanceAgee && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Âgée des Créances</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium mb-1">Moins de 30j</p>
              <p className="text-lg font-bold text-green-900">{fmtEur(balanceAgee.moins30j * 100)}</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 font-medium mb-1">30-60 jours</p>
              <p className="text-lg font-bold text-yellow-900">
                {fmtEur(balanceAgee.entre30et60j * 100)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700 font-medium mb-1">60-90 jours</p>
              <p className="text-lg font-bold text-orange-900">
                {fmtEur(balanceAgee.entre60et90j * 100)}
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium mb-1">Plus de 90j</p>
              <p className="text-lg font-bold text-red-900">{fmtEur(balanceAgee.plus90j * 100)}</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-700 font-medium mb-1">Provisions</p>
              <p className="text-lg font-bold text-purple-900">
                {fmtEur(balanceAgee.provisions * 100)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
