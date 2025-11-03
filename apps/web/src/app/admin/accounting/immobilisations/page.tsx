'use client';

/**
 * Page: Immobilisations et amortissements
 * Route: /admin/accounting/immobilisations
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Trash2, Building, TrendingDown, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Immobilisation, LignePlanAmortissement } from '@/lib/accounting/immobilisations';
import { DUREES_AMORTISSEMENT, COMPTES_PCG, genererPlanAmortissement } from '@/lib/accounting/immobilisations';
import * as XLSX from 'xlsx';

interface ApiResponse {
  success: boolean;
  immobilisations: Immobilisation[];
}

export default function ImmobilisationsPage() {
  const [immobilisations, setImmobilisations] = useState<Immobilisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedImmo, setSelectedImmo] = useState<Immobilisation | null>(null);
  const [planAmortissement, setPlanAmortissement] = useState<LignePlanAmortissement[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    nature: 'logiciel' as Immobilisation['nature'],
    libelle: '',
    dateAcquisition: new Date().toISOString().split('T')[0],
    valeurAcquisition: '',
    methode: 'lineaire' as 'lineaire' | 'degressif',
  });

  useEffect(() => {
    fetchImmobilisations();
  }, []);

  async function fetchImmobilisations() {
    setLoading(true);
    try {
      const response = await fetch('/api/accounting/immobilisations');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setImmobilisations(data.immobilisations || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.libelle || !formData.valeurAcquisition) {
      toast.error('Erreur', {
        description: 'Tous les champs sont requis',
      });
      return;
    }

    try {
      const response = await fetch('/api/accounting/immobilisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valeurAcquisition: parseFloat(formData.valeurAcquisition),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Immobilisation créée', {
          description: `${formData.libelle} ajoutée avec succès`,
        });

        setDialogOpen(false);
        setFormData({
          nature: 'logiciel',
          libelle: '',
          dateAcquisition: new Date().toISOString().split('T')[0],
          valeurAcquisition: '',
          methode: 'lineaire',
        });

        await fetchImmobilisations();
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de créer l\'immobilisation',
      });
    }
  }

  function handleVoirPlan(immo: Immobilisation) {
    // Convertir les dates string en Date objects
    const immoWithDates: Immobilisation = {
      ...immo,
      dateAcquisition: new Date(immo.dateAcquisition),
      dateCession: immo.dateCession ? new Date(immo.dateCession) : undefined,
    };

    const plan = genererPlanAmortissement(immoWithDates);
    setPlanAmortissement(plan);
    setSelectedImmo(immo);
    setPlanDialogOpen(true);
  }

  function exportPlanToExcel() {
    if (!selectedImmo || planAmortissement.length === 0) return;

    const data = [
      ['Plan d\'amortissement', ''],
      ['Immobilisation', selectedImmo.libelle],
      ['Valeur d\'acquisition', selectedImmo.valeurAcquisition.toFixed(2) + ' €'],
      ['Méthode', selectedImmo.methode],
      ['Durée', `${selectedImmo.dureeAmortissement} ans`],
      ['', ''],
      ['Année', 'VNC Début', 'Dotation', 'Amort. Cumulés', 'VNC Fin'],
      ...planAmortissement.map((ligne) => [
        ligne.annee,
        (ligne.vncDebut / 100).toFixed(2),
        (ligne.dotation / 100).toFixed(2),
        (ligne.amortCumules / 100).toFixed(2),
        (ligne.vncFin / 100).toFixed(2),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plan Amortissement');
    XLSX.writeFile(
      wb,
      `plan-amortissement-${selectedImmo.libelle.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    toast.success('Export réussi');
  }

  const totalBrut = immobilisations.reduce((sum, i) => sum + i.valeurAcquisition, 0);
  const totalAmort = immobilisations.reduce((sum, i) => sum + i.amortissementsCumules, 0);
  const totalVNC = immobilisations.reduce((sum, i) => sum + i.vnc, 0);

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const natureLabels: Record<Immobilisation['nature'], string> = {
    logiciel: 'Logiciel',
    materiel_info: 'Matériel informatique',
    mobilier: 'Mobilier',
    vehicule: 'Véhicule',
    agencement: 'Agencement',
    construction: 'Construction',
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-8 h-8 text-brand-start" />
            Immobilisations
          </h1>
          <p className="text-gray-600 mt-1">Gestion et amortissements des immobilisations</p>
        </div>

        {/* Dialog Nouvelle immobilisation */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-start to-brand-end text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle immobilisation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une immobilisation</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nature">Nature</Label>
                <Select
                  value={formData.nature}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nature: value as Immobilisation['nature'] })
                  }
                >
                  <SelectTrigger id="nature">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(natureLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Durée: {DUREES_AMORTISSEMENT[formData.nature]} ans | Compte:{' '}
                  {COMPTES_PCG[formData.nature].immo}
                </p>
              </div>

              <div>
                <Label htmlFor="libelle">Libellé</Label>
                <Input
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  placeholder="Ex: MacBook Pro M3"
                  required
                />
              </div>

              <div>
                <Label htmlFor="valeurAcquisition">Valeur d'acquisition (EUR)</Label>
                <Input
                  id="valeurAcquisition"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valeurAcquisition}
                  onChange={(e) => setFormData({ ...formData, valeurAcquisition: e.target.value })}
                  placeholder="2500.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateAcquisition">Date d'acquisition</Label>
                <Input
                  id="dateAcquisition"
                  type="date"
                  value={formData.dateAcquisition}
                  onChange={(e) => setFormData({ ...formData, dateAcquisition: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="methode">Méthode d'amortissement</Label>
                <Select
                  value={formData.methode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, methode: value as 'lineaire' | 'degressif' })
                  }
                >
                  <SelectTrigger id="methode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lineaire">Linéaire (recommandé)</SelectItem>
                    <SelectItem value="degressif">Dégressif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-brand-start to-brand-end text-white"
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Valeur Brute</span>
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtEur(totalBrut * 100)}</p>
          <p className="text-xs text-gray-500 mt-1">{immobilisations.length} immobilisation(s)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Amortissements Cumulés</span>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">-{fmtEur(totalAmort * 100)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBrut > 0 ? `${((totalAmort / totalBrut) * 100).toFixed(1)}%` : '0%'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">VNC Totale</span>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{fmtEur(totalVNC * 100)}</p>
          <p className="text-xs text-gray-500 mt-1">Valeur nette comptable</p>
        </Card>
      </div>

      {/* Tableau */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste des Immobilisations</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : immobilisations.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Aucune immobilisation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Libellé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nature</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Compte</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Val. Brute</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amort.</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">VNC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Méthode</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {immobilisations.map((immo) => (
                  <tr key={immo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{immo.libelle}</span>
                      <p className="text-xs text-gray-500">
                        Acquis le {new Date(immo.dateAcquisition).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{natureLabels[immo.nature]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">{immo.comptePCG}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {fmtEur(immo.valeurAcquisition * 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-orange-600">
                        -{fmtEur(immo.amortissementsCumules * 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-green-600">
                        {fmtEur(immo.vnc * 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{immo.methode}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleVoirPlan(immo)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dialog Plan d'amortissement */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan d'Amortissement</DialogTitle>
          </DialogHeader>

          {selectedImmo && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <strong>Immobilisation :</strong> {selectedImmo.libelle}
                </p>
                <p>
                  <strong>Valeur d'acquisition :</strong> {fmtEur(selectedImmo.valeurAcquisition * 100)}
                </p>
                <p>
                  <strong>Méthode :</strong> {selectedImmo.methode}
                </p>
                <p>
                  <strong>Durée :</strong> {selectedImmo.dureeAmortissement} ans
                </p>
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={exportPlanToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter Excel
                </Button>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Année</th>
                    <th className="px-3 py-2 text-right font-semibold">VNC Début</th>
                    <th className="px-3 py-2 text-right font-semibold">Dotation</th>
                    <th className="px-3 py-2 text-right font-semibold">Amort. Cumulés</th>
                    <th className="px-3 py-2 text-right font-semibold">VNC Fin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {planAmortissement.map((ligne, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{ligne.annee}</td>
                      <td className="px-3 py-2 text-right">{fmtEur(ligne.vncDebut)}</td>
                      <td className="px-3 py-2 text-right text-orange-600">
                        -{fmtEur(ligne.dotation)}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        -{fmtEur(ligne.amortCumules)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-green-600">
                        {fmtEur(ligne.vncFin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
