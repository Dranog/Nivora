'use client';

/**
 * Page: Bilan Comptable
 * Affiche le bilan actif/passif avec ratios financiers
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';

// ===============================
// TYPES
// ===============================

interface PosteBilan {
  code: string;
  libelle: string;
  montant: number;
}

interface CategorieBilan {
  titre: string;
  postes: PosteBilan[];
  sousTotal: number;
}

interface Actif {
  immobilisations: CategorieBilan;
  actifCirculant: CategorieBilan;
  tresorerie: CategorieBilan;
  total: number;
}

interface Passif {
  capitaux: CategorieBilan;
  dettes: CategorieBilan;
  tresoreriPassif: CategorieBilan;
  total: number;
}

interface BilanComptable {
  exercice: number;
  dateDebut: string;
  dateFin: string;
  actif: Actif;
  passif: Passif;
  equilibre: boolean;
  ecart: number;
}

interface RatiosBilan {
  fondsDeRoulement: number;
  besoinFondsRoulement: number;
  tresorerieNette: number;
  ratioLiquidite: number;
  ratioSolvabilite: number;
  ratioEndettement: number;
}

// ===============================
// COMPOSANT PRINCIPAL
// ===============================

export default function BilanPage() {
  const [loading, setLoading] = useState(false);
  const [bilan, setBilan] = useState<BilanComptable | null>(null);
  const [ratios, setRatios] = useState<RatiosBilan | null>(null);
  const [exercice, setExercice] = useState(new Date().getFullYear());

  // Charger le bilan
  useEffect(() => {
    chargerBilan();
  }, [exercice]);

  const chargerBilan = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/accounting/bilan?exercice=${exercice}&includeRatios=true`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du bilan');
      }

      const data = await response.json();
      setBilan(data.bilan);
      setRatios(data.ratios);
      toast.success('Bilan chargé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger le bilan');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger CSV
  const telechargerCSV = async () => {
    try {
      const response = await fetch(
        `/api/accounting/bilan?exercice=${exercice}&format=csv&includeRatios=true`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bilan-${exercice}.csv`;
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

  // Formatter montant
  const formatMontant = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  // Formatter pourcentage
  const formatPourcentage = (ratio: number) => {
    return `${(ratio * 100).toFixed(2)}%`;
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bilan Comptable</h1>
          <p className="text-gray-600 mt-1">
            Situation patrimoniale de l'entreprise
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
          <Button onClick={chargerBilan} disabled={loading}>
            <Calendar className="w-4 h-4 mr-2" />
            Charger
          </Button>
          <Button onClick={telechargerCSV} variant="outline" disabled={!bilan}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger CSV
          </Button>
        </div>
      </div>

      {/* Badge équilibre */}
      {bilan && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {bilan.equilibre ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Bilan équilibré</p>
                    <p className="text-sm text-gray-600">
                      Actif = Passif ({formatMontant(bilan.actif.total)})
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Bilan déséquilibré
                    </p>
                    <p className="text-sm text-red-600">
                      Écart : {formatMontant(bilan.ecart)}
                    </p>
                  </div>
                </>
              )}
            </div>
            <Badge
              variant={bilan.equilibre ? 'default' : 'destructive'}
              className="text-sm"
            >
              {bilan.equilibre ? 'ÉQUILIBRÉ' : 'DÉSÉQUILIBRÉ'}
            </Badge>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Chargement en cours...</p>
        </Card>
      )}

      {/* Bilan Actif/Passif */}
      {!loading && bilan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ACTIF */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">ACTIF</h2>
            </div>

            <div className="space-y-4">
              {/* Immobilisations */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.actif.immobilisations.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.actif.immobilisations.sousTotal)}
                  </p>
                </div>
                {bilan.actif.immobilisations.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actif Circulant */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.actif.actifCirculant.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.actif.actifCirculant.sousTotal)}
                  </p>
                </div>
                {bilan.actif.actifCirculant.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trésorerie Active */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.actif.tresorerie.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.actif.tresorerie.sousTotal)}
                  </p>
                </div>
                {bilan.actif.tresorerie.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total Actif */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-green-600">
                <p className="text-lg font-bold text-gray-900">TOTAL ACTIF</p>
                <p className="text-lg font-bold text-green-600">
                  {formatMontant(bilan.actif.total)}
                </p>
              </div>
            </div>
          </Card>

          {/* PASSIF */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">PASSIF</h2>
            </div>

            <div className="space-y-4">
              {/* Capitaux propres */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.passif.capitaux.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.passif.capitaux.sousTotal)}
                  </p>
                </div>
                {bilan.passif.capitaux.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dettes */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.passif.dettes.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.passif.dettes.sousTotal)}
                  </p>
                </div>
                {bilan.passif.dettes.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trésorerie Passive */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2">
                  <p className="font-semibold text-gray-900">
                    {bilan.passif.tresoreriPassif.titre}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(bilan.passif.tresoreriPassif.sousTotal)}
                  </p>
                </div>
                {bilan.passif.tresoreriPassif.postes.map((poste) => (
                  <div
                    key={poste.code}
                    className="flex items-center justify-between py-1 pl-4"
                  >
                    <p className="text-sm text-gray-600">{poste.libelle}</p>
                    <p className="text-sm text-gray-900">
                      {formatMontant(poste.montant)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total Passif */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-red-600">
                <p className="text-lg font-bold text-gray-900">TOTAL PASSIF</p>
                <p className="text-lg font-bold text-red-600">
                  {formatMontant(bilan.passif.total)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Ratios financiers */}
      {!loading && ratios && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Ratios Financiers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Fonds de roulement</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatMontant(ratios.fondsDeRoulement)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Besoin en FR</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatMontant(ratios.besoinFondsRoulement)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Trésorerie nette</p>
              <p className="text-2xl font-bold text-green-600">
                {formatMontant(ratios.tresorerieNette)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ratio de liquidité</p>
              <p className="text-2xl font-bold text-yellow-600">
                {ratios.ratioLiquidite.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ratio de solvabilité</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatPourcentage(ratios.ratioSolvabilite)}
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ratio d'endettement</p>
              <p className="text-2xl font-bold text-pink-600">
                {formatPourcentage(ratios.ratioEndettement)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
