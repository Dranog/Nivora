'use client';

/**
 * Page: Déclarations TVA (CA3)
 * Route: /admin/accounting/tva
 */

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import type { TransactionEnriched } from '@/lib/accounting/enrichment';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ApiResponse {
  success: boolean;
  data: {
    transactions: TransactionEnriched[];
  };
}

interface DeclarationMensuelle {
  mois: string;
  annee: number;
  tvaCollectee: number;
  tvaDeductible: number;
  tvaADecaisser: number;
  baseHT: number;
  nbTransactions: number;
}

export default function TVAPage() {
  const [transactions, setTransactions] = useState<TransactionEnriched[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/transactions-enriched');
      const json: ApiResponse = await res.json();

      if (json.success) {
        setTransactions(json.data.transactions.filter(t => t.status === 'Completed'));
      }
    } catch (err) {
      console.error('Erreur chargement TVA:', err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const declarations = useMemo(() => {
    const grouped: Record<string, DeclarationMensuelle> = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const moisNom = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      if (!grouped[key]) {
        grouped[key] = {
          mois: moisNom,
          annee: date.getFullYear(),
          tvaCollectee: 0,
          tvaDeductible: 0,
          tvaADecaisser: 0,
          baseHT: 0,
          nbTransactions: 0,
        };
      }

      grouped[key].nbTransactions++;
      grouped[key].baseHT += tx.accounting.tva.baseHT;

      if (tx.accounting.tva.collectee) {
        grouped[key].tvaCollectee += tx.accounting.tva.montantTVA;
      }
      if (tx.accounting.tva.deductible) {
        grouped[key].tvaDeductible += tx.accounting.tva.montantTVA;
      }
    });

    // Calcul TVA à décaisser
    Object.values(grouped).forEach(decl => {
      decl.tvaADecaisser = decl.tvaCollectee - decl.tvaDeductible;
    });

    return Object.values(grouped).sort((a, b) => b.annee - a.annee || b.mois.localeCompare(a.mois));
  }, [transactions]);

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  function exportToExcel() {
    const data = declarations.map(d => ({
      Période: d.mois,
      'Base HT': (d.baseHT / 100).toFixed(2),
      'TVA Collectée': (d.tvaCollectee / 100).toFixed(2),
      'TVA Déductible': (d.tvaDeductible / 100).toFixed(2),
      'TVA à Décaisser': (d.tvaADecaisser / 100).toFixed(2),
      'Nb Transactions': d.nbTransactions,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Déclarations TVA');
    XLSX.writeFile(wb, `declarations-tva-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export réussi');
  }

  const totaux = useMemo(() => ({
    tvaCollectee: declarations.reduce((s, d) => s + d.tvaCollectee, 0),
    tvaDeductible: declarations.reduce((s, d) => s + d.tvaDeductible, 0),
    tvaADecaisser: declarations.reduce((s, d) => s + d.tvaADecaisser, 0),
    baseHT: declarations.reduce((s, d) => s + d.baseHT, 0),
  }), [declarations]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-8 h-8 text-brand-start" />
            Déclarations TVA (CA3)
          </h1>
          <p className="text-gray-600 mt-1">Suivi mensuel de la TVA collectée et déductible</p>
        </div>
        <Button
          onClick={exportToExcel}
          disabled={declarations.length === 0}
          className="bg-gradient-to-r from-brand-start to-brand-end text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Base HT Totale</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtEur(totaux.baseHT)}</p>
          <p className="text-xs text-gray-500 mt-1">Chiffre d'affaires HT</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">TVA Collectée</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">+{fmtEur(totaux.tvaCollectee)}</p>
          <p className="text-xs text-gray-500 mt-1">Sur ventes</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">TVA Déductible</span>
            <TrendingDown className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">-{fmtEur(totaux.tvaDeductible)}</p>
          <p className="text-xs text-gray-500 mt-1">Sur achats</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">TVA à Décaisser</span>
            <Receipt className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{fmtEur(totaux.tvaADecaisser)}</p>
          <p className="text-xs text-gray-500 mt-1">Montant dû</p>
        </Card>
      </div>

      {/* Liste des déclarations mensuelles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-start" />
          Déclarations Mensuelles
        </h2>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Chargement...</p>
          </Card>
        ) : declarations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Aucune déclaration</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {declarations.map((decl, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{decl.mois}</h3>
                    <p className="text-sm text-gray-600">{decl.nbTransactions} transactions</p>
                  </div>
                  <Badge
                    className={`${
                      decl.tvaADecaisser > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {decl.tvaADecaisser > 0 ? 'À décaisser' : 'Crédit de TVA'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Base HT</p>
                    <p className="text-sm font-semibold text-gray-900">{fmtEur(decl.baseHT)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TVA Collectée</p>
                    <p className="text-sm font-semibold text-green-600">+{fmtEur(decl.tvaCollectee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TVA Déductible</p>
                    <p className="text-sm font-semibold text-blue-600">-{fmtEur(decl.tvaDeductible)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TVA à Décaisser</p>
                    <p className="text-lg font-bold text-red-600">{fmtEur(decl.tvaADecaisser)}</p>
                  </div>
                  <div className="flex items-end">
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-1" />
                      CA3
                    </Button>
                  </div>
                </div>

                {/* Barres de progression */}
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>TVA Collectée</span>
                      <span>{((decl.tvaCollectee / (totaux.tvaCollectee || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(decl.tvaCollectee / (totaux.tvaCollectee || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
