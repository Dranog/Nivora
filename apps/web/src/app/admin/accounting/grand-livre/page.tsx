'use client';

/**
 * Page: Grand Livre
 * Affiche les mouvements comptables par compte avec soldes progressifs
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

// ===============================
// TYPES
// ===============================

interface MouvementCompte {
  date: string;
  numeroEcriture: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
  lettrage?: string;
}

interface GrandLivreCompte {
  comptePCG: string;
  libelleCompte: string;
  soldeInitial: number;
  mouvements: MouvementCompte[];
  totalDebit: number;
  totalCredit: number;
  soldeFinal: number;
}

interface GrandLivre {
  exercice: number;
  dateDebut: string;
  dateFin: string;
  comptes: GrandLivreCompte[];
}

// ===============================
// COMPOSANT PRINCIPAL
// ===============================

export default function GrandLivrePage() {
  const [loading, setLoading] = useState(false);
  const [grandLivre, setGrandLivre] = useState<GrandLivre | null>(null);
  const [exercice, setExercice] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedComptes, setExpandedComptes] = useState<Set<string>>(new Set());

  // Charger le grand livre
  useEffect(() => {
    chargerGrandLivre();
  }, [exercice]);

  const chargerGrandLivre = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounting/grand-livre?exercice=${exercice}&type=grand-livre`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du grand livre');
      }

      const data = await response.json();
      setGrandLivre(data);
      toast.success('Grand livre chargé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger le grand livre');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger CSV
  const telechargerCSV = async () => {
    try {
      const response = await fetch(
        `/api/accounting/grand-livre?exercice=${exercice}&type=grand-livre&format=csv`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grand-livre-${exercice}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Fichier téléchargé');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de télécharger le fichier');
    }
  };

  // Télécharger Balance CSV
  const telechargerBalanceCSV = async () => {
    try {
      const response = await fetch(
        `/api/accounting/grand-livre?exercice=${exercice}&type=balance&format=csv`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-${exercice}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Balance téléchargée');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de télécharger la balance');
    }
  };

  // Toggle expansion d'un compte
  const toggleCompte = (comptePCG: string) => {
    const newExpanded = new Set(expandedComptes);
    if (newExpanded.has(comptePCG)) {
      newExpanded.delete(comptePCG);
    } else {
      newExpanded.add(comptePCG);
    }
    setExpandedComptes(newExpanded);
  };

  // Filtrer les comptes par recherche
  const comptesFiltres =
    grandLivre?.comptes.filter(
      (compte) =>
        compte.comptePCG.includes(searchTerm) ||
        compte.libelleCompte.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Formatter montant
  const formatMontant = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  // Formatter date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grand Livre</h1>
          <p className="text-gray-600 mt-1">
            Mouvements comptables détaillés par compte
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={exercice}
            onChange={(e) => setExercice(parseInt(e.target.value))}
            className="w-28"
            placeholder="Année"
          />
          <Button onClick={chargerGrandLivre} disabled={loading}>
            <Calendar className="w-4 h-4 mr-2" />
            Charger
          </Button>
          <Button onClick={telechargerCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Grand Livre CSV
          </Button>
          <Button onClick={telechargerBalanceCSV} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Balance CSV
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {grandLivre && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de comptes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {grandLivre.comptes.length}
                </p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Débit</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatMontant(
                    grandLivre.comptes.reduce((sum, c) => sum + c.totalDebit, 0)
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Crédit</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatMontant(
                    grandLivre.comptes.reduce((sum, c) => sum + c.totalCredit, 0)
                  )}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un compte (numéro ou libellé)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des comptes */}
      {loading && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Chargement en cours...</p>
        </Card>
      )}

      {!loading && comptesFiltres.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Aucun compte trouvé</p>
        </Card>
      )}

      {!loading && comptesFiltres.length > 0 && (
        <div className="space-y-4">
          {comptesFiltres.map((compte) => {
            const isExpanded = expandedComptes.has(compte.comptePCG);

            return (
              <Card key={compte.comptePCG} className="overflow-hidden">
                {/* En-tête du compte */}
                <div
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleCompte(compte.comptePCG)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-sm">
                        {compte.comptePCG}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">
                          {compte.libelleCompte}
                        </p>
                        <p className="text-sm text-gray-600">
                          {compte.mouvements.length} mouvement(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Solde final</p>
                        <p
                          className={`text-lg font-bold ${
                            compte.soldeFinal >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatMontant(compte.soldeFinal)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mouvements (si déplié) */}
                {isExpanded && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Date</th>
                            <th className="text-left py-2 px-3">N° Écriture</th>
                            <th className="text-left py-2 px-3">Libellé</th>
                            <th className="text-right py-2 px-3">Débit</th>
                            <th className="text-right py-2 px-3">Crédit</th>
                            <th className="text-right py-2 px-3">Solde</th>
                            <th className="text-center py-2 px-3">Lettrage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compte.mouvements.map((mouvement, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                              <td className="py-2 px-3 whitespace-nowrap">
                                {formatDate(mouvement.date)}
                              </td>
                              <td className="py-2 px-3 font-mono text-xs">
                                {mouvement.numeroEcriture}
                              </td>
                              <td className="py-2 px-3">{mouvement.libelle}</td>
                              <td className="py-2 px-3 text-right text-green-600">
                                {mouvement.debit > 0 ? formatMontant(mouvement.debit) : '—'}
                              </td>
                              <td className="py-2 px-3 text-right text-red-600">
                                {mouvement.credit > 0
                                  ? formatMontant(mouvement.credit)
                                  : '—'}
                              </td>
                              <td
                                className={`py-2 px-3 text-right font-medium ${
                                  mouvement.solde >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {formatMontant(mouvement.solde)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {mouvement.lettrage && (
                                  <Badge variant="secondary" className="text-xs">
                                    {mouvement.lettrage}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold">
                          <tr>
                            <td colSpan={3} className="py-3 px-3">
                              TOTAUX
                            </td>
                            <td className="py-3 px-3 text-right text-green-600">
                              {formatMontant(compte.totalDebit)}
                            </td>
                            <td className="py-3 px-3 text-right text-red-600">
                              {formatMontant(compte.totalCredit)}
                            </td>
                            <td
                              className={`py-3 px-3 text-right ${
                                compte.soldeFinal >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatMontant(compte.soldeFinal)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
