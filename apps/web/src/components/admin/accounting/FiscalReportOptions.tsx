/**
 * Fiscal Report Options - Advanced Configuration Component
 * @module components/admin/accounting/FiscalReportOptions
 */

'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReportOptions } from '@/lib/schemas/fiscal-report-enhanced';

interface FiscalReportOptionsProps {
  options: ReportOptions;
  onChange: (options: ReportOptions) => void;
  disabled?: boolean;
}

export function FiscalReportOptions({
  options,
  onChange,
  disabled = false,
}: FiscalReportOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOptionChange = (key: keyof ReportOptions, value: boolean | string) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      {/* Header collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="flex items-center justify-between w-full text-left"
      >
        <Label className="text-sm font-medium text-gray-700 cursor-pointer">
          Options avancées
        </Label>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Options détaillées */}
      {isExpanded && (
        <div className="space-y-4 pl-2">
          {/* Options de contenu */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Sections du rapport
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="includeBalance"
                checked={options.includeBalance}
                onCheckedChange={(checked) =>
                  handleOptionChange('includeBalance', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeBalance"
                  className="text-sm font-normal cursor-pointer"
                >
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
                  handleOptionChange('includeResultAccount', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeResultAccount"
                  className="text-sm font-normal cursor-pointer"
                >
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
                  handleOptionChange('includeAnnexes', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeAnnexes"
                  className="text-sm font-normal cursor-pointer"
                >
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
                  handleOptionChange('includeDepreciation', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeDepreciation"
                  className="text-sm font-normal cursor-pointer"
                >
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
                  handleOptionChange('includeTVA', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeTVA"
                  className="text-sm font-normal cursor-pointer"
                >
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
                  handleOptionChange('includeCashFlow', !!checked)
                }
                disabled={disabled}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeCashFlow"
                  className="text-sm font-normal cursor-pointer"
                >
                  Inclure le tableau de flux de trésorerie
                </Label>
                <p className="text-xs text-gray-500">
                  Flux d'exploitation, investissement, financement
                </p>
              </div>
            </div>
          </div>

          {/* Format du rapport */}
          <div className="space-y-3 border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Niveau de détail
            </div>

            <RadioGroup
              value={options.format}
              onValueChange={(value: string) =>
                handleOptionChange('format', value as 'detailed' | 'summary')
              }
              disabled={disabled}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="summary" id="format-summary" />
                <div className="space-y-1">
                  <Label
                    htmlFor="format-summary"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Rapport synthétique (5-10 pages)
                  </Label>
                  <p className="text-xs text-gray-500">
                    Résumé des éléments essentiels
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="detailed" id="format-detailed" />
                <div className="space-y-1">
                  <Label
                    htmlFor="format-detailed"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Rapport détaillé complet (15-30 pages)
                  </Label>
                  <p className="text-xs text-gray-500">
                    Analyses détaillées et commentaires
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Format d'export */}
          <div className="space-y-3 border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Format d'export
            </div>

            <RadioGroup
              value={options.exportFormat}
              onValueChange={(value: string) =>
                handleOptionChange('exportFormat', value as 'pdf' | 'excel')
              }
              disabled={disabled}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="pdf" id="export-pdf" />
                <div className="space-y-1">
                  <Label
                    htmlFor="export-pdf"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Export PDF
                  </Label>
                  <p className="text-xs text-gray-500">
                    Document officiel pour archives et comptable
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="excel" id="export-excel" />
                <div className="space-y-1">
                  <Label
                    htmlFor="export-excel"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Export Excel (XLSX)
                  </Label>
                  <p className="text-xs text-gray-500">
                    Données exploitables pour analyse et modifications
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}
    </div>
  );
}
