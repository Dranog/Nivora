/**
 * Fiscal Report History - Display and Manage Generated Reports
 * @module components/admin/accounting/FiscalReportHistory
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  Clock,
  Calendar,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { GeneratedReport } from '@/lib/schemas/fiscal-report-enhanced';
import { formatFileSize } from '@/lib/schemas/fiscal-report-enhanced';

interface FiscalReportHistoryProps {
  reports: GeneratedReport[];
  onDownload: (reportId: string) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
  onView?: (reportId: string) => Promise<void>;
  className?: string;
}

export function FiscalReportHistory({
  reports,
  onDownload,
  onDelete,
  onView,
  className,
}: FiscalReportHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (report: GeneratedReport) => {
    try {
      setDownloadingId(report.id);

      await onDownload(report.id);

      toast.success('Téléchargement démarré', {
        description: `Rapport ${report.exercice} en cours de téléchargement`,
      });
    } catch (error) {
      console.error('Erreur téléchargement rapport:', error);

      toast.error('Erreur de téléchargement', {
        description: error instanceof Error ? error.message : 'Impossible de télécharger le rapport',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (report: GeneratedReport) => {
    const confirmed = window.confirm(
      `Supprimer définitivement le rapport fiscal ${report.exercice} ?\n\n` +
      `Généré le ${format(new Date(report.generatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}\n\n` +
      `Cette action est irréversible.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(report.id);

      await onDelete(report.id);

      toast.success('Rapport supprimé', {
        description: `Le rapport ${report.exercice} a été supprimé`,
      });
    } catch (error) {
      console.error('Erreur suppression rapport:', error);

      toast.error('Erreur de suppression', {
        description: error instanceof Error ? error.message : 'Impossible de supprimer le rapport',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (reportId: string) => {
    if (!onView) return;

    try {
      await onView(reportId);
    } catch (error) {
      console.error('Erreur visualisation rapport:', error);

      toast.error('Erreur de visualisation', {
        description: 'Impossible d\'ouvrir le rapport',
      });
    }
  };

  const getFormatIcon = (format: 'pdf' | 'excel') => {
    return format === 'pdf' ? (
      <FileText className="w-4 h-4 text-red-600" />
    ) : (
      <FileSpreadsheet className="w-4 h-4 text-green-600" />
    );
  };

  const getPeriodLabel = (report: GeneratedReport) => {
    if (report.periodType === 'custom' && report.customPeriod) {
      const start = new Date(report.customPeriod.startDate);
      const end = new Date(report.customPeriod.endDate);

      return `${format(start, 'dd/MM/yyyy', { locale: fr })} - ${format(end, 'dd/MM/yyyy', { locale: fr })}`;
    }

    return `Exercice complet ${report.exercice}`;
  };

  if (reports.length === 0) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Aucun rapport généré</p>
          <p className="text-xs mt-1">
            Les rapports générés apparaîtront ici
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Rapports générés ({reports.length})
          </h3>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(report.format)}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Exercice {report.exercice}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {report.format.toUpperCase()}
                        </Badge>
                        {report.options.format === 'detailed' && (
                          <Badge variant="outline" className="text-xs">
                            Détaillé
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getPeriodLabel(report)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(
                            new Date(report.generatedAt),
                            'dd/MM/yyyy HH:mm',
                            { locale: fr }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sections incluses */}
                  <div className="flex flex-wrap gap-1">
                    {report.options.includeBalance && (
                      <Badge variant="outline" className="text-xs">
                        Bilan
                      </Badge>
                    )}
                    {report.options.includeResultAccount && (
                      <Badge variant="outline" className="text-xs">
                        Résultat
                      </Badge>
                    )}
                    {report.options.includeTVA && (
                      <Badge variant="outline" className="text-xs">
                        TVA
                      </Badge>
                    )}
                    {report.options.includeAnnexes && (
                      <Badge variant="outline" className="text-xs">
                        Annexes
                      </Badge>
                    )}
                    {report.options.includeDepreciation && (
                      <Badge variant="outline" className="text-xs">
                        Amortissements
                      </Badge>
                    )}
                    {report.options.includeCashFlow && (
                      <Badge variant="outline" className="text-xs">
                        Flux
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatFileSize(report.fileSize)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(report.id)}
                      title="Visualiser"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId === report.id}
                    title="Télécharger"
                  >
                    <Download
                      className={`w-4 h-4 ${downloadingId === report.id ? 'animate-bounce' : ''}`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report)}
                    disabled={deletingId === report.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
