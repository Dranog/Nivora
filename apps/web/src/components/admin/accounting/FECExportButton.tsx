'use client';

/**
 * Bouton d'export FEC (Fichier des Écritures Comptables)
 * Ajoute un bouton pour télécharger le fichier FEC conforme à la DGFiP
 * Version améliorée avec validation, prévisualisation et options avancées
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Download, Loader2, Copy, CheckCircle2, AlertCircle, Calendar, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function FECExportButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Paramètres d'export
  const [siren, setSiren] = useState('123456789');
  const [sirenCopied, setSirenCopied] = useState(false);
  const [exportMode, setExportMode] = useState<'year' | 'range'>('year');
  const [year, setYear] = useState('2024'); // 2024 pour les données de démo
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [exportFormat, setExportFormat] = useState<'fec' | 'csv' | 'xlsx'>('fec');

  // Prévisualisation
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Validation SIREN
  const [sirenError, setSirenError] = useState<string | null>(null);
  const isSirenValid = /^\d{9}$/.test(siren);

  // Copier le SIREN dans le presse-papiers
  const handleCopySiren = async () => {
    try {
      await navigator.clipboard.writeText(siren);
      setSirenCopied(true);
      toast.success('SIREN copié', { description: 'SIREN copié dans le presse-papiers' });
      setTimeout(() => setSirenCopied(false), 2000);
      console.log('📋 [FEC] SIREN copié:', siren);
    } catch (error) {
      console.error('❌ [FEC] Erreur copie SIREN:', error);
      toast.error('Erreur', { description: 'Impossible de copier le SIREN' });
    }
  };

  // Prévisualiser le nombre de transactions
  const fetchTransactionCount = async () => {
    if (!isSirenValid) return;

    setValidating(true);
    setPreviewError(null);
    console.log('🔍 [FEC] Prévisualisation des transactions...', { exportMode, year, startDate, endDate });

    try {
      const params = new URLSearchParams({
        siren,
        ...(exportMode === 'year' ? { year } : { startDate, endDate }),
        preview: 'true',
      });

      const response = await fetch(`/api/accounting/fec/preview?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setPreviewError(data.error || 'Erreur lors de la prévisualisation');
        setTransactionCount(null);
        console.error('❌ [FEC] Erreur prévisualisation:', data);
        return;
      }

      setTransactionCount(data.count);
      console.log('✅ [FEC] Prévisualisation:', data.count, 'transactions');

      if (data.count === 0) {
        setPreviewError('Aucune transaction trouvée pour cette période');
      }
    } catch (error) {
      console.error('❌ [FEC] Erreur prévisualisation:', error);
      setPreviewError('Impossible de récupérer les transactions');
      setTransactionCount(null);
    } finally {
      setValidating(false);
    }
  };

  // Déclencher la prévisualisation quand les paramètres changent
  useEffect(() => {
    if (dialogOpen && isSirenValid) {
      const debounce = setTimeout(() => {
        fetchTransactionCount();
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [dialogOpen, siren, exportMode, year, startDate, endDate]);

  // Export FEC
  async function handleExport() {
    // Validation SIREN
    if (!isSirenValid) {
      setSirenError('Le SIREN doit contenir exactement 9 chiffres');
      toast.error('SIREN invalide', {
        description: 'Le SIREN doit contenir exactement 9 chiffres',
      });
      return;
    }

    // Vérifier qu'il y a des transactions
    if (transactionCount === 0) {
      toast.error('Aucune transaction', {
        description: 'Aucune transaction trouvée pour cette période',
      });
      return;
    }

    setLoading(true);
    console.log('🔵 [FEC Client] Début export', {
      siren,
      exportMode,
      year,
      startDate,
      endDate,
      format: exportFormat,
      transactionCount
    });

    try {
      const params = new URLSearchParams({
        siren,
        format: exportFormat,
        ...(exportMode === 'year' ? { year } : { startDate, endDate }),
      });

      const url = `/api/accounting/fec?${params}`;
      console.log('📡 [FEC Client] Appel API:', url);

      // Utiliser fetch pour gérer le téléchargement
      const startTime = performance.now();
      const response = await fetch(url);
      const endTime = performance.now();

      console.log('📥 [FEC Client] Réponse reçue:', response.status, response.statusText, `(${Math.round(endTime - startTime)}ms)`);

      if (!response.ok) {
        // Lire l'erreur JSON si c'est une erreur
        const errorData = await response.json();
        console.error('❌ [FEC Client] Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur serveur');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const fileSizeKB = (blob.size / 1024).toFixed(2);
      console.log('📦 [FEC Client] Blob reçu:', blob.size, 'octets', `(${fileSizeKB} KB)`);

      // Extraire le nom du fichier depuis Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${siren}FEC${year}.${exportFormat === 'csv' ? 'csv' : 'txt'}`;
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches?.[1]) {
          filename = matches[1];
        }
      }

      console.log('💾 [FEC Client] Téléchargement:', filename);

      // Créer un lien de téléchargement
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      console.log('✅ [FEC Client] Téléchargement réussi');

      toast.success('Export réussi', {
        description: `${filename} téléchargé (${fileSizeKB} KB - ${transactionCount} transactions)`,
        duration: 5000,
      });

      setDialogOpen(false);
    } catch (error) {
      console.error('❌ [FEC Client] Erreur export FEC:', error);
      toast.error('Erreur d\'export', {
        description: error instanceof Error ? error.message : 'Impossible de générer le fichier',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Export FEC
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export FEC (Fichier des Écritures Comptables)</DialogTitle>
          <DialogDescription>
            Fichier obligatoire depuis 2014 pour les contrôles fiscaux. Conforme à l'article A47 A-1 du LPF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* SIREN */}
          <div>
            <Label htmlFor="siren">SIREN de l'entreprise *</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="siren"
                type="text"
                maxLength={9}
                value={siren}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setSiren(value);
                  setSirenError(null);
                }}
                placeholder="123456789"
                className={cn(
                  'flex-1',
                  sirenError && 'border-red-500 focus-visible:ring-red-500'
                )}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopySiren}
                disabled={!isSirenValid}
                title="Copier le SIREN"
              >
                {sirenCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {sirenError ? (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {sirenError}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">9 chiffres sans espaces</p>
            )}
          </div>

          {/* Mode d'export (Année ou Plage) */}
          <div>
            <Label>Période d'export</Label>
            <RadioGroup value={exportMode} onValueChange={(value: 'year' | 'range') => setExportMode(value)} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year-mode" />
                <Label htmlFor="year-mode" className="font-normal cursor-pointer">
                  Année complète
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="range" id="range-mode" />
                <Label htmlFor="range-mode" className="font-normal cursor-pointer">
                  Plage de dates
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Année ou Plage de dates */}
          {exportMode === 'year' ? (
            <div>
              <Label htmlFor="year">Année de l'exercice</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Format d'export */}
          <div>
            <Label>Format d'export</Label>
            <RadioGroup value={exportFormat} onValueChange={(value: 'fec' | 'csv' | 'xlsx') => setExportFormat(value)} className="flex flex-col gap-3 mt-2">
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="fec" id="fec-format" className="mt-1" />
                <Label htmlFor="fec-format" className="font-normal cursor-pointer flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">FEC (texte tabulé)</span>
                  </div>
                  <p className="text-xs text-gray-500">Format officiel DGFiP - 18 colonnes - Séparateur TAB - Extension .txt</p>
                </Label>
              </div>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="csv" id="csv-format" className="mt-1" />
                <Label htmlFor="csv-format" className="font-normal cursor-pointer flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">CSV (simple)</span>
                  </div>
                  <p className="text-xs text-gray-500">Format CSV basique - Séparateur point-virgule - Compatible Excel - Extension .csv</p>
                </Label>
              </div>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <RadioGroupItem value="xlsx" id="xlsx-format" className="mt-1" />
                <Label htmlFor="xlsx-format" className="font-normal cursor-pointer flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold flex items-center gap-2">
                      Excel Professionnel (.xlsx)
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Recommandé</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    ✨ Multi-feuilles (Résumé, Détail, Analyse) • Formatage professionnel<br/>
                    📊 Graphiques et statistiques • Filtres automatiques • Totaux dynamiques<br/>
                    🎨 En-têtes colorés, lignes alternées, mise en forme conditionnelle
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Prévisualisation */}
          <div className={cn(
            'rounded-lg border p-4',
            previewError ? 'bg-red-50 border-red-200' : transactionCount !== null && transactionCount > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          )}>
            {validating ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Vérification des transactions...
              </div>
            ) : previewError ? (
              <div className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Aucune donnée disponible</p>
                  <p className="text-xs mt-0.5">{previewError}</p>
                </div>
              </div>
            ) : transactionCount !== null ? (
              <div className="flex items-start gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {transactionCount} transaction{transactionCount > 1 ? 's' : ''} trouvée{transactionCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs mt-0.5 text-green-600">
                    Prêt pour l'export {exportFormat.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Informations sur le format */}
          <div className={cn(
            'border rounded-lg p-3',
            exportFormat === 'xlsx' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
          )}>
            <p className={cn(
              'text-xs font-medium mb-1.5',
              exportFormat === 'xlsx' ? 'text-emerald-900' : 'text-blue-900'
            )}>
              {exportFormat === 'fec' && 'Format FEC (texte tabulé)'}
              {exportFormat === 'csv' && 'Format CSV (simple)'}
              {exportFormat === 'xlsx' && 'Format Excel Professionnel (.xlsx)'}
            </p>
            <ul className={cn(
              'text-xs space-y-0.5',
              exportFormat === 'xlsx' ? 'text-emerald-800' : 'text-blue-800'
            )}>
              {exportFormat === 'fec' && (
                <>
                  <li>• 18 colonnes obligatoires</li>
                  <li>• Séparateur : TAB</li>
                  <li>• Encodage : UTF-8 avec BOM</li>
                  <li>• Extension : .txt</li>
                </>
              )}
              {exportFormat === 'csv' && (
                <>
                  <li>• Format CSV standard</li>
                  <li>• Séparateur : point-virgule (;)</li>
                  <li>• Compatible Excel</li>
                  <li>• Extension : .csv</li>
                </>
              )}
              {exportFormat === 'xlsx' && (
                <>
                  <li>• <strong>3 feuilles :</strong> Résumé, Détail des transactions, Analyse par type</li>
                  <li>• <strong>Formatage :</strong> En-têtes colorés, lignes alternées, bordures</li>
                  <li>• <strong>Fonctionnalités :</strong> Filtres automatiques, tri, lignes figées</li>
                  <li>• <strong>Calculs :</strong> Totaux dynamiques (formules SOMME), pourcentages</li>
                  <li>• <strong>Mise en forme conditionnelle :</strong> Montants négatifs en rouge</li>
                  <li>• <strong>Métadonnées :</strong> Logo, SIREN, période, pied de page confidentiel</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || !isSirenValid || transactionCount === 0 || validating}
            className="bg-gradient-to-r from-brand-start to-brand-end text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Générer l'export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
