/**
 * Enhanced Fiscal Report Generator Component
 * Version améliorée avec sélecteur de période, options avancées, et génération progressive
 * @module components/admin/accounting/FiscalReportGeneratorEnhanced
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EnhancedFiscalReportRequestSchema,
  ReportOptionsSchema,
  CustomPeriodSchema,
  type ReportOptions,
  type CustomPeriod,
  type GenerationProgress,
  type GeneratedReport,
  getReportSections,
  estimatePageCount,
  calculatePeriodDays,
} from '@/lib/schemas/fiscal-report-enhanced';
import { FiscalReportOptions } from './FiscalReportOptions';
import { FiscalReportHistory } from './FiscalReportHistory';

interface FiscalReportGeneratorEnhancedProps {
  className?: string;
}

/**
 * Génère les années fiscales disponibles
 */
function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = 2020; year <= currentYear + 1; year++) {
    years.push(year);
  }
  return years.reverse();
}

export function FiscalReportGeneratorEnhanced({
  className,
}: FiscalReportGeneratorEnhancedProps) {
  const currentYear = new Date().getFullYear();

  // État de base
  const [exercice, setExercice] = useState<number>(currentYear);
  const [periodType, setPeriodType] = useState<'full' | 'custom'>('full');
  const [customPeriod, setCustomPeriod] = useState<CustomPeriod>({
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
  });

  // Options avancées
  const [options, setOptions] = useState<ReportOptions>({
    includeAnnexes: true,
    includeTVA: true,
    includeBalance: true,
    includeResultAccount: true,
    includeDepreciation: false,
    includeCashFlow: false,
    format: 'detailed',
    exportFormat: 'pdf',
  });

  // État de génération
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [lastGenerationDate, setLastGenerationDate] = useState<Date | null>(null);

  // Historique
  const [reports, setReports] = useState<GeneratedReport[]>([]);

  const availableYears = getAvailableYears();

  /**
   * Charger l'historique au montage (mock pour l'instant)
   */
  useEffect(() => {
    // TODO: Charger depuis localStorage ou API
    const mockReports: GeneratedReport[] = [];
    setReports(mockReports);
  }, []);

  /**
   * Validation pré-génération
   */
  const validateBeforeGenerate = async (): Promise<boolean> => {
    try {
      // Valider la période personnalisée si nécessaire
      if (periodType === 'custom') {
        const validation = CustomPeriodSchema.safeParse(customPeriod);
        if (!validation.success) {
          const errors = validation.error.issues.map((i) => i.message).join(', ');
          toast.error('Période invalide', {
            description: errors,
          });
          return false;
        }
      }

      // Valider les options
      const optionsValidation = ReportOptionsSchema.safeParse(options);
      if (!optionsValidation.success) {
        toast.error('Options invalides', {
          description: 'Veuillez vérifier les options sélectionnées',
        });
        return false;
      }

      // TODO: Appel API pour vérifier les données disponibles
      // Pour l'instant, on simule
      const mockTransactionsCount = Math.floor(Math.random() * 500) + 100;

      if (mockTransactionsCount === 0) {
        toast.warning('Aucune transaction', {
          description: `Aucune transaction trouvée pour l'exercice ${exercice}`,
        });
        return false;
      }

      // Vérifier TVA si demandée
      if (options.includeTVA) {
        const mockTVAValid = Math.random() > 0.1;
        if (!mockTVAValid) {
          const confirmed = window.confirm(
            'Certaines transactions n\'ont pas de données TVA complètes.\n\n' +
            'Le rapport pourra être généré mais les déclarations TVA seront incomplètes.\n\n' +
            'Continuer quand même ?'
          );
          if (!confirmed) return false;
        }
      }

      // Confirmer la génération
      const periodLabel =
        periodType === 'full'
          ? `Exercice complet ${exercice}`
          : `Du ${customPeriod.startDate} au ${customPeriod.endDate}`;

      const sections = getReportSections(options);
      const estimatedPages = estimatePageCount(options);

      const confirmed = window.confirm(
        `Générer le rapport fiscal ?\n\n` +
        `Période : ${periodLabel}\n` +
        `Transactions : ~${mockTransactionsCount}\n` +
        `Sections : ${sections.length}\n` +
        `Pages estimées : ${estimatedPages}\n` +
        `Format : ${options.exportFormat.toUpperCase()}\n\n` +
        `Cette opération peut prendre 30-60 secondes.`
      );

      return confirmed;
    } catch (error) {
      console.error('Erreur validation pré-génération:', error);
      toast.error('Erreur de validation', {
        description: 'Impossible de valider les paramètres',
      });
      return false;
    }
  };

  /**
   * Génère le rapport avec progression
   */
  const handleGenerate = async () => {
    try {
      // Validation pré-génération
      const isValid = await validateBeforeGenerate();
      if (!isValid) return;

      setIsLoading(true);
      setProgress(0);
      setCurrentStep('Initialisation...');

      // Construire la requête
      const requestData = {
        exercice,
        periodType,
        customPeriod: periodType === 'custom' ? customPeriod : undefined,
        options,
      };

      // Validation Zod finale
      const validation = EnhancedFiscalReportRequestSchema.safeParse(requestData);
      if (!validation.success) {
        const errors = validation.error.issues.map((i) => i.message).join(', ');
        toast.error('Validation échouée', {
          description: errors,
        });
        return;
      }

      toast.info('Génération en cours', {
        description: `Rapport fiscal ${exercice} en préparation...`,
      });

      // Simulation de génération progressive
      // Étape 1: Récupération des transactions
      setCurrentStep('Récupération des transactions...');
      setProgress(10);
      await new Promise((r) => setTimeout(r, 500));

      // Étape 2: Calcul des agrégats
      setCurrentStep('Calcul des agrégats...');
      setProgress(25);
      await new Promise((r) => setTimeout(r, 500));

      // Étape 3: Génération du bilan
      if (options.includeBalance) {
        setCurrentStep('Génération du bilan...');
        setProgress(40);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Étape 4: Compte de résultat
      if (options.includeResultAccount) {
        setCurrentStep('Calcul du compte de résultat...');
        setProgress(55);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Étape 5: TVA
      if (options.includeTVA) {
        setCurrentStep('Calcul TVA...');
        setProgress(65);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Étape 6: Création du document
      setCurrentStep(
        options.exportFormat === 'pdf'
          ? 'Création du PDF...'
          : 'Création du fichier Excel...'
      );
      setProgress(80);
      await new Promise((r) => setTimeout(r, 1000));

      // Appel API
      const response = await fetch('/api/accounting/fiscal-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      // Étape 7: Finalisation
      setCurrentStep('Finalisation...');
      setProgress(95);

      // Récupérer le blob
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Le fichier généré est vide');
      }

      // Télécharger
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = options.exportFormat === 'pdf' ? 'pdf' : 'xlsx';
      link.download = `Rapport-Fiscal-${exercice}-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
      setCurrentStep('Terminé');
      setLastGenerationDate(new Date());

      // Ajouter à l'historique (mock)
      const newReport: GeneratedReport = {
        id: crypto.randomUUID(),
        exercice,
        periodType,
        customPeriod: periodType === 'custom' ? customPeriod : undefined,
        options,
        generatedAt: new Date().toISOString(),
        fileSize: blob.size,
        format: options.exportFormat,
      };
      setReports((prev) => [newReport, ...prev]);

      toast.success('Rapport généré avec succès', {
        description: `Rapport fiscal ${exercice} téléchargé`,
        action: {
          label: 'Voir',
          onClick: () => {
            const viewUrl = URL.createObjectURL(blob);
            window.open(viewUrl, '_blank');
          },
        },
      });
    } catch (error) {
      console.error('Erreur génération rapport fiscal:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Une erreur inattendue est survenue';

      toast.error('Erreur de génération', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  /**
   * Handlers pour l'historique
   */
  const handleDownloadReport = async (reportId: string) => {
    // TODO: Implémenter le téléchargement depuis le serveur
    await new Promise((r) => setTimeout(r, 500));
  };

  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleViewReport = async (reportId: string) => {
    // TODO: Implémenter la visualisation
    await new Promise((r) => setTimeout(r, 500));
  };

  // Calculer le nombre de jours pour période personnalisée
  const periodDays =
    periodType === 'custom'
      ? calculatePeriodDays(customPeriod.startDate, customPeriod.endDate)
      : 365;

  const sections = getReportSections(options);
  const estimatedPages = estimatePageCount(options);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Rapport Fiscal Complet
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Export PDF/Excel conforme aux normes françaises (DGFiP/CGI)
              </p>
            </div>
            {lastGenerationDate && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Dernier : {lastGenerationDate.toLocaleTimeString('fr-FR')}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Exercice fiscal */}
            <div className="space-y-2">
              <Label htmlFor="exercice" className="text-sm font-medium text-gray-700">
                Exercice fiscal
              </Label>
              <Select
                value={exercice.toString()}
                onValueChange={(value) => setExercice(parseInt(value, 10))}
                disabled={isLoading}
              >
                <SelectTrigger id="exercice" className="w-full">
                  <SelectValue placeholder="Sélectionner l'exercice" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} {year === currentYear ? '(en cours)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type de période */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Label className="text-sm font-medium text-gray-700">Type de période</Label>
              <RadioGroup
                value={periodType}
                onValueChange={(value: string) => setPeriodType(value as 'full' | 'custom')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="full" id="period-full" />
                  <Label htmlFor="period-full" className="cursor-pointer text-sm">
                    Exercice complet (1er janvier - 31 décembre {exercice})
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="custom" id="period-custom" />
                  <Label htmlFor="period-custom" className="cursor-pointer text-sm">
                    Période personnalisée
                  </Label>
                </div>
              </RadioGroup>

              {/* Période personnalisée */}
              {periodType === 'custom' && (
                <div className="pl-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-xs text-gray-600">
                        Date de début
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={customPeriod.startDate}
                        onChange={(e) =>
                          setCustomPeriod((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-xs text-gray-600">
                        Date de fin
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={customPeriod.endDate}
                        onChange={(e) =>
                          setCustomPeriod((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Période : {periodDays} jours
                  </div>
                </div>
              )}
            </div>

            {/* Options avancées */}
            <FiscalReportOptions options={options} onChange={setOptions} disabled={isLoading} />
          </div>

          {/* Warning légal */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">Document comptable officiel</p>
              <p className="text-xs text-amber-800">
                Ce rapport contient des données sensibles et doit être conservé conformément aux
                obligations légales françaises (minimum 10 ans).
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600 text-center">{currentStep}</p>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00D4C5] to-[#00B8A9] hover:opacity-90 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Générer Rapport Fiscal {exercice}
              </>
            )}
          </Button>

          {/* Preview du contenu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="text-xs font-medium text-blue-900">Contenu du rapport :</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  {sections.map((section, i) => (
                    <li key={i}>• {section}</li>
                  ))}
                </ul>
                <p className="text-xs text-blue-700 font-medium mt-2">
                  Estimation : ~{estimatedPages} pages
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Historique */}
      {reports.length > 0 && (
        <FiscalReportHistory
          reports={reports}
          onDownload={handleDownloadReport}
          onDelete={handleDeleteReport}
          onView={handleViewReport}
        />
      )}
    </div>
  );
}
