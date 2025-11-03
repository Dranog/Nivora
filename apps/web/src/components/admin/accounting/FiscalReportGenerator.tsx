/**
 * Fiscal Report Generator - Simplified and Refactored
 * @module components/admin/accounting/FiscalReportGenerator
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FiscalReportGeneratorProps {
  className?: string;
}

interface ReportOptions {
  includeBalance: boolean;
  includeResultAccount: boolean;
  includeAnnexes: boolean;
  includeDepreciation: boolean;
  includeTVA: boolean;
  includeCashFlow: boolean;
}

export function FiscalReportGenerator({ className }: FiscalReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Period settings
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [periodType, setPeriodType] = useState<'full' | 'custom'>('full');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState<ReportOptions>({
    includeBalance: true,
    includeResultAccount: true,
    includeAnnexes: true,
    includeDepreciation: false,
    includeTVA: true,
    includeCashFlow: false,
  });

  // Format options
  const [reportFormat, setReportFormat] = useState<'detailed' | 'summary'>('detailed');

  /**
   * Validate inputs before generation
   */
  const validateInputs = (): boolean => {
    if (year < 2020 || year > 2030) {
      toast.error('L\'année doit être entre 2020 et 2030');
      return false;
    }

    if (periodType === 'custom') {
      if (!startDate || !endDate) {
        toast.error('Veuillez sélectionner une période de début et de fin');
        return false;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        toast.error('La date de fin doit être après la date de début');
        return false;
      }
    }

    return true;
  };

  /**
   * Handle report generation
   */
  const handleGenerate = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setProgress(0);
    setCurrentStep('Préparation de la génération...');

    try {
      // Step 1: Prepare request
      setProgress(15);
      setCurrentStep('Récupération des transactions...');

      const requestBody = {
        year,
        periodType,
        startDate: periodType === 'custom' ? startDate : undefined,
        endDate: periodType === 'custom' ? endDate : undefined,
        options: {
          ...options,
          format: reportFormat,
        },
      };

      // Step 2: Call API
      setProgress(30);
      setCurrentStep('Calcul des agrégats financiers...');

      const response = await fetch('/api/accounting/fiscal-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération du rapport');
      }

      // Step 3: Process data
      setProgress(60);
      setCurrentStep('Génération du document PDF...');

      const blob = await response.blob();

      // Step 4: Download
      setProgress(90);
      setCurrentStep('Téléchargement du rapport...');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport-Fiscal-${year}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Success
      setProgress(100);
      setCurrentStep('Rapport téléchargé avec succès !');

      toast.success('Rapport fiscal généré avec succès', {
        description: `Le rapport pour l'année ${year} a été téléchargé.`,
      });

      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 2000);
    } catch (error) {
      console.error('Error generating fiscal report:', error);
      toast.error('Erreur lors de la génération du rapport', {
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      });
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-50">
            <FileText className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <CardTitle>Générateur de Rapport Fiscal</CardTitle>
            <CardDescription>
              Générez un rapport fiscal complet conforme aux normes DGFiP et CGI
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Period Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-gray-700">
              Année fiscale
            </Label>
            <Input
              id="year"
              type="number"
              min={2020}
              max={2030}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
              disabled={isLoading}
              className="max-w-[200px]"
            />
          </div>

          {/* Period Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Type de période</Label>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="period-full"
                name="periodType"
                checked={periodType === 'full'}
                onChange={() => setPeriodType('full')}
                disabled={isLoading}
                className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-600"
              />
              <div className="space-y-1">
                <Label htmlFor="period-full" className="text-sm font-normal cursor-pointer">
                  Année complète
                </Label>
                <p className="text-xs text-gray-500">
                  Du 1er janvier au 31 décembre {year}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="period-custom"
                name="periodType"
                checked={periodType === 'custom'}
                onChange={() => setPeriodType('custom')}
                disabled={isLoading}
                className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-600"
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor="period-custom" className="text-sm font-normal cursor-pointer">
                  Période personnalisée
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Sélectionnez une période spécifique
                </p>

                {periodType === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-xs text-gray-600">
                        Date de début
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
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
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options - Collapsible */}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            disabled={isLoading}
            className="flex items-center justify-between w-full text-left group"
          >
            <Label className="text-sm font-medium text-gray-700 cursor-pointer group-hover:text-gray-900">
              Options avancées
            </Label>
            {showAdvancedOptions ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            )}
          </button>

          {showAdvancedOptions && (
            <div className="mt-4 space-y-6 pl-2">
              {/* Report Sections */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Sections du rapport
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeBalance"
                      checked={options.includeBalance}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeBalance: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeBalance" className="text-sm font-normal cursor-pointer">
                        Inclure le bilan comptable
                      </Label>
                      <p className="text-xs text-gray-500">
                        Actif, passif, équilibre comptable
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeResultAccount"
                      checked={options.includeResultAccount}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeResultAccount: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeResultAccount" className="text-sm font-normal cursor-pointer">
                        Inclure le compte de résultat détaillé
                      </Label>
                      <p className="text-xs text-gray-500">
                        Produits, charges, résultat net
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeAnnexes"
                      checked={options.includeAnnexes}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeAnnexes: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeAnnexes" className="text-sm font-normal cursor-pointer">
                        Inclure les annexes fiscales
                      </Label>
                      <p className="text-xs text-gray-500">
                        Immobilisations, créances et dettes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeDepreciation"
                      checked={options.includeDepreciation}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeDepreciation: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeDepreciation" className="text-sm font-normal cursor-pointer">
                        Inclure le tableau des amortissements
                      </Label>
                      <p className="text-xs text-gray-500">
                        Calcul des amortissements et valeurs nettes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeTVA"
                      checked={options.includeTVA}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeTVA: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeTVA" className="text-sm font-normal cursor-pointer">
                        Inclure les déclarations TVA
                      </Label>
                      <p className="text-xs text-gray-500">
                        TVA collectée, déductible, synthèse trimestrielle
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeCashFlow"
                      checked={options.includeCashFlow}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeCashFlow: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="includeCashFlow" className="text-sm font-normal cursor-pointer">
                        Inclure le tableau de flux de trésorerie
                      </Label>
                      <p className="text-xs text-gray-500">
                        Flux d'exploitation, investissement, financement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Format */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Niveau de détail
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="format-summary"
                      name="reportFormat"
                      checked={reportFormat === 'summary'}
                      onChange={() => setReportFormat('summary')}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="format-summary" className="text-sm font-normal cursor-pointer">
                        Rapport synthétique (5-10 pages)
                      </Label>
                      <p className="text-xs text-gray-500">
                        Résumé des éléments essentiels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="format-detailed"
                      name="reportFormat"
                      checked={reportFormat === 'detailed'}
                      onChange={() => setReportFormat('detailed')}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="format-detailed" className="text-sm font-normal cursor-pointer">
                        Rapport détaillé complet (15-30 pages)
                      </Label>
                      <p className="text-xs text-gray-500">
                        Analyses détaillées et commentaires
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">{currentStep}</span>
              <span className="text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Warning Message */}
        {periodType === 'custom' && (!startDate || !endDate) && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">
                Période personnalisée incomplète
              </p>
              <p className="text-xs text-amber-700">
                Veuillez sélectionner une date de début et une date de fin pour continuer.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isLoading ? 'Génération en cours...' : 'Générer le rapport PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
