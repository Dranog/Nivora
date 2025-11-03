'use client';

/**
 * Widgets comptables avancés
 * Affiche : Journaux, TVA, Alertes, Top comptes PCG
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Loader2,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import type { StatsComptables } from '@/lib/accounting/enrichment';

interface ApiResponse {
  success: boolean;
  data: {
    stats: StatsComptables;
    transactions: any[];
  };
}

export function ComptabiliteWidgets() {
  const [stats, setStats] = useState<StatsComptables | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/transactions-enriched');

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: ApiResponse = await res.json();

      if (json.success && json.data.stats) {
        setStats(json.data.stats);
        setError(null);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur chargement stats comptables:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="w-5 h-5" />
          <p className="font-semibold">Erreur de chargement</p>
        </div>
        <p className="text-sm text-red-600 mt-2">{error || 'Données indisponibles'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Titre section */}
      <div className="flex items-center gap-2 pt-4">
        <BookOpen className="w-5 h-5 text-brand-start" />
        <h2 className="text-xl font-bold text-gray-900">Comptabilité Avancée</h2>
        <Badge className="bg-gradient-to-r from-brand-start to-brand-end text-white border-0">
          Nouveau
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget 1 : Répartition par journal */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Répartition par Journal</h3>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.parJournal).map(([journal, montant]) => {
              if (montant === 0) return null;

              const journalLabels: Record<string, { label: string; color: string }> = {
                VE: { label: 'Ventes', color: 'bg-green-500' },
                AC: { label: 'Achats', color: 'bg-blue-500' },
                BQ: { label: 'Banque', color: 'bg-yellow-500' },
                OD: { label: 'Op. Diverses', color: 'bg-gray-500' },
                AN: { label: 'À Nouveaux', color: 'bg-purple-500' },
              };

              const info = journalLabels[journal] || { label: journal, color: 'bg-gray-400' };

              return (
                <div key={journal} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {journal} - {info.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{fmtEur(montant)}</span>
                </div>
              );
            })}
          </div>

          {Object.values(stats.parJournal).every((v) => v === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Aucune écriture comptable</p>
          )}
        </Card>

        {/* Widget 2 : TVA */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">TVA</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">TVA Collectée</span>
              <span className="text-sm font-semibold text-green-600">
                +{fmtEur(stats.tvaCollectee)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">TVA Déductible</span>
              <span className="text-sm font-semibold text-blue-600">
                -{fmtEur(stats.tvaDeductible)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">TVA à Décaisser</span>
                <span
                  className={`text-lg font-bold ${
                    stats.tvaADecaisser > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {fmtEur(stats.tvaADecaisser)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800">
                <strong>Base HT :</strong> {fmtEur(stats.totalHT)} | <strong>Total TVA :</strong>{' '}
                {fmtEur(stats.totalTVA)}
              </p>
            </div>
          </div>
        </Card>

        {/* Widget 3 : Top 5 comptes PCG */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Top 5 Comptes PCG</h3>
            </div>
          </div>

          <div className="space-y-2">
            {stats.topComptes.length > 0 ? (
              stats.topComptes.map((compte, idx) => (
                <div
                  key={compte.compte}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {compte.compte}
                    </Badge>
                    <span className="text-sm text-gray-700">{compte.libelle}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {fmtEur(compte.montant)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun compte utilisé</p>
            )}
          </div>
        </Card>

        {/* Widget 4 : Alertes comptables */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Alertes Comptables</h3>
            </div>
          </div>

          <div className="space-y-2">
            {stats.alertes.length > 0 ? (
              stats.alertes.map((alerte, idx) => {
                const icons = {
                  warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
                  error: <XCircle className="w-4 h-4 text-red-600" />,
                  info: <Info className="w-4 h-4 text-blue-600" />,
                };

                const colors = {
                  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  error: 'bg-red-50 border-red-200 text-red-800',
                  info: 'bg-blue-50 border-blue-200 text-blue-800',
                };

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-3 border rounded-lg ${colors[alerte.type]}`}
                  >
                    {icons[alerte.type]}
                    <p className="text-xs flex-1">{alerte.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800">Aucune alerte comptable</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
