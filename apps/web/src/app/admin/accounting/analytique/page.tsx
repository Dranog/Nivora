'use client';

/**
 * Page: Analyse comptable avec graphiques
 * Route: /admin/accounting/analytique
 */

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import type { TransactionEnriched } from '@/lib/accounting/enrichment';
import { JOURNAL_CODES } from '@/lib/accounting/enrichment';

interface ApiResponse {
  success: boolean;
  data: {
    transactions: TransactionEnriched[];
    stats: any;
  };
}

const COLORS = {
  VE: '#10b981',
  AC: '#3b82f6',
  BQ: '#f59e0b',
  OD: '#6b7280',
  AN: '#8b5cf6',
};

export default function AnalytiquePage() {
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
      console.error('Erreur chargement analytique:', err);
    } finally {
      setLoading(false);
    }
  }

  // Données pour graphique par journal
  const dataJournaux = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach(tx => {
      const journal = tx.accounting.journal;
      grouped[journal] = (grouped[journal] || 0) + tx.accounting.tva.montantTTC;
    });

    return Object.entries(grouped).map(([journal, montant]) => ({
      journal,
      label: JOURNAL_CODES[journal as keyof typeof JOURNAL_CODES],
      montant: montant / 100,
    }));
  }, [transactions]);

  // Données pour graphique TVA mensuelle
  const dataTVAMensuelle = useMemo(() => {
    const grouped: Record<string, { collectee: number; deductible: number }> = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { collectee: 0, deductible: 0 };
      }

      if (tx.accounting.tva.collectee) {
        grouped[key].collectee += tx.accounting.tva.montantTVA;
      }
      if (tx.accounting.tva.deductible) {
        grouped[key].deductible += tx.accounting.tva.montantTVA;
      }
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, values]) => {
        const [year, month] = key.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'short' });
        return {
          mois: monthName,
          collectee: values.collectee / 100,
          deductible: values.deductible / 100,
          net: (values.collectee - values.deductible) / 100,
        };
      });
  }, [transactions]);

  // Données pour pie chart des types de transactions
  const dataTypes = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach(tx => {
      grouped[tx.type] = (grouped[tx.type] || 0) + tx.accounting.tva.montantTTC;
    });

    return Object.entries(grouped).map(([type, montant]) => ({
      name: type,
      value: montant / 100,
    }));
  }, [transactions]);

  // Évolution CA mensuel
  const dataCAMensuel = useMemo(() => {
    const grouped: Record<string, number> = {};

    transactions
      .filter(tx => ['Payment', 'Subscription', 'Tip'].includes(tx.type))
      .forEach(tx => {
        const date = new Date(tx.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        grouped[key] = (grouped[key] || 0) + tx.accounting.tva.baseHT;
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ca]) => {
        const [year, month] = key.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        return {
          mois: monthName,
          ca: ca / 100,
        };
      });
  }, [transactions]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-brand-start" />
            Analyse Comptable
          </h1>
          <p className="text-gray-600 mt-1">Visualisations graphiques des données comptables</p>
        </div>
        <Badge className="bg-gradient-to-r from-brand-start to-brand-end text-white border-0">
          {transactions.length} transactions
        </Badge>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Répartition par journal (Bar Chart) */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-start" />
            <h3 className="text-lg font-semibold text-gray-900">Répartition par Journal</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataJournaux}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} €`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="montant" fill="#00b8a9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 2. Types de transactions (Pie Chart) */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-start" />
            <h3 className="text-lg font-semibold text-gray-900">Types de Transactions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}€`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#00b8a9', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 3. Évolution TVA mensuelle (Line Chart) */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-brand-start" />
            <h3 className="text-lg font-semibold text-gray-900">Évolution TVA Mensuelle</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataTVAMensuelle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} €`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="collectee" stroke="#10b981" strokeWidth={2} name="TVA Collectée" />
              <Line type="monotone" dataKey="deductible" stroke="#3b82f6" strokeWidth={2} name="TVA Déductible" />
              <Line type="monotone" dataKey="net" stroke="#ef4444" strokeWidth={2} name="TVA Nette" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 4. Chiffre d'affaires mensuel (Line Chart) */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-start" />
            <h3 className="text-lg font-semibold text-gray-900">Chiffre d'Affaires Mensuel (HT)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataCAMensuel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} €`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ca" stroke="#00b8a9" strokeWidth={3} name="CA HT" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Ces graphiques sont générés à partir des transactions enrichies avec
          les données comptables (PCG, TVA, journaux). Seules les transactions avec statut "Completed"
          sont incluses dans les analyses.
        </p>
      </Card>
    </div>
  );
}
