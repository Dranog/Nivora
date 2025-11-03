'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Shield,
  Trash2,
  ShieldAlert,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type {
  CreatorReport,
  CreatorSanction,
  CreatorViolation,
  CreatorModerationStats,
} from '../_types/creator-types';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorModerationTabProps {
  reports: CreatorReport[];
  sanctions: CreatorSanction[];
  violations: CreatorViolation[];
  stats: CreatorModerationStats;
}

export function CreatorModerationTab({ reports, sanctions, violations, stats }: CreatorModerationTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // ============================================
  // HANDLERS - REPORTS (DEMO MODE)
  // ============================================

  const handleViewReport = async (reportId: string) => {
    console.log('[DEMO] 👁️ Viewing report:', reportId);
    alert(`MODE DÉMO : Consultation du signalement ${reportId}`);
  };

  const handleResolveReport = async (reportId: string, contentTitle?: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Résoudre le signalement ${reportId}${contentTitle ? ` concernant "${contentTitle}"` : ''} ?\n\n(Les modifications ne seront pas sauvegardées)`
    );
    if (!confirmed) return;

    console.log('[DEMO] ✅ Resolving report:', reportId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`MODE DÉMO : Signalement ${reportId} résolu`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectReport = async (reportId: string, contentTitle?: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Rejeter le signalement ${reportId}${contentTitle ? ` concernant "${contentTitle}"` : ''} ?\n\n(Les modifications ne seront pas sauvegardées)`
    );
    if (!confirmed) return;

    console.log('[DEMO] ✗ Rejecting report:', reportId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`MODE DÉMO : Signalement ${reportId} rejeté`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // HANDLERS - SANCTIONS (DEMO MODE)
  // ============================================

  const handleViewSanction = async (sanctionId: string) => {
    console.log('[DEMO] 👁️ Viewing sanction:', sanctionId);
    alert(`MODE DÉMO : Consultation de la sanction ${sanctionId}`);
  };

  const handleRevokeSanction = async (sanctionId: string, type: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Révoquer la sanction de type "${type}" ?\n\n(Les modifications ne seront pas sauvegardées)`
    );
    if (!confirmed) return;

    console.log('[DEMO] 🔓 Revoking sanction:', sanctionId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      alert(`MODE DÉMO : Sanction ${sanctionId} révoquée`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // HANDLERS - VIOLATIONS (DEMO MODE)
  // ============================================

  const handleReviewViolation = async (violationId: string) => {
    console.log('[DEMO] 🔍 Reviewing violation:', violationId);
    alert(`MODE DÉMO : Examen de la violation ${violationId}`);
  };

  const handleDismissViolation = async (violationId: string, description: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Ignorer la violation "${description}" ?\n\n(Les modifications ne seront pas sauvegardées)`
    );
    if (!confirmed) return;

    console.log('[DEMO] ✓ Dismissing violation:', violationId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert(`MODE DÉMO : Violation ${violationId} ignorée`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getReportReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Contenu inapproprié',
      spam: 'Spam',
      harassment: 'Harcèlement',
      copyright: 'Violation copyright',
      scam: 'Arnaque',
      other: 'Autre',
    };
    return labels[reason] || reason;
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Résolu
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-gray-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSanctionTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Avertissement</Badge>;
      case 'content_suspension':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspension contenu</Badge>;
      case 'account_suspension':
        return <Badge variant="destructive">Suspension compte</Badge>;
      case 'ban':
        return <Badge variant="destructive">Bannissement</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getSanctionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-gray-600">Expirée</Badge>;
      case 'revoked':
        return <Badge variant="outline" className="text-gray-600">Révoquée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getViolationSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Faible</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Moyenne</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Haute</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getViolationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Examinée
          </Badge>
        );
      case 'dismissed':
        return (
          <Badge variant="outline" className="text-gray-600">
            <XCircle className="h-3 w-3 mr-1" />
            Ignorée
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* KPI CARDS */}
      {/* ============================================ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements reçus</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground mt-1">Total depuis inscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingReports > 0 ? 'Nécessite examen' : 'Aucun en attente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenus supprimés</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentsRemoved}</div>
            <p className="text-xs text-muted-foreground mt-1">Par modération admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanctions actives</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSanctions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeSanctions > 0 ? 'Compte restreint' : 'Compte en règle'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* ACCOUNT STATUS BADGE */}
      {/* ============================================ */}
      {stats.activeSanctions === 0 && stats.pendingReports === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">
                Compte en règle - Aucune sanction active ni signalement en attente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.activeSanctions > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              <p className="font-medium">
                ⚠️ ATTENTION : {stats.activeSanctions} sanction(s) active(s) sur ce compte
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* REPORTS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Signalements ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun signalement</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="pb-2 font-medium">ID Signalement</th>
                    <th className="pb-2 font-medium">Contenu</th>
                    <th className="pb-2 font-medium">Signalé par</th>
                    <th className="pb-2 font-medium">Raison</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b">
                      <td className="py-3 text-sm font-mono">{report.id}</td>
                      <td className="py-3 text-sm max-w-xs">
                        {report.contentTitle ? (
                          <span className="truncate">{report.contentTitle}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Comportement général</span>
                        )}
                      </td>
                      <td className="py-3 text-sm">{report.reporterName}</td>
                      <td className="py-3 text-sm">
                        <Badge variant="outline">{getReportReasonLabel(report.reason)}</Badge>
                      </td>
                      <td className="py-3 text-sm max-w-md">
                        <p className="line-clamp-2">{report.description}</p>
                      </td>
                      <td className="py-3 text-sm">{formatDate(report.date)}</td>
                      <td className="py-3">{getReportStatusBadge(report.status)}</td>
                      <td className="py-3">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {report.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => handleResolveReport(report.id, report.contentTitle)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => handleRejectReport(report.id, report.contentTitle)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SANCTIONS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Sanctions ({sanctions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sanctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune sanction appliquée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="pb-2 font-medium">ID Sanction</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Raison</th>
                    <th className="pb-2 font-medium">Appliqué par</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Durée</th>
                    <th className="pb-2 font-medium">Expire le</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctions.map((sanction) => (
                    <tr key={sanction.id} className="border-b">
                      <td className="py-3 text-sm font-mono">{sanction.id}</td>
                      <td className="py-3">{getSanctionTypeBadge(sanction.type)}</td>
                      <td className="py-3 text-sm max-w-md">
                        <p className="line-clamp-2">{sanction.reason}</p>
                      </td>
                      <td className="py-3 text-sm">{sanction.appliedByName}</td>
                      <td className="py-3 text-sm">{formatDate(sanction.date)}</td>
                      <td className="py-3 text-sm">
                        {sanction.duration ? `${sanction.duration} jours` : 'Permanent'}
                      </td>
                      <td className="py-3 text-sm">
                        {sanction.expiresAt ? formatDate(sanction.expiresAt) : 'N/A'}
                      </td>
                      <td className="py-3">{getSanctionStatusBadge(sanction.status)}</td>
                      <td className="py-3">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSanction(sanction.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {sanction.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleRevokeSanction(sanction.id, sanction.type)}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* VIOLATIONS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Violations détectées ({violations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune violation détectée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="pb-2 font-medium">ID Violation</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Catégorie</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Sévérité</th>
                    <th className="pb-2 font-medium">Détectée le</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation) => (
                    <tr key={violation.id} className="border-b">
                      <td className="py-3 text-sm font-mono">{violation.id}</td>
                      <td className="py-3">
                        <Badge variant="outline">
                          {violation.type === 'auto_detected' ? 'Auto IA' : 'Manuel'}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">
                        <Badge variant="outline">{violation.category}</Badge>
                      </td>
                      <td className="py-3 text-sm max-w-md">
                        <p className="line-clamp-2">{violation.description}</p>
                      </td>
                      <td className="py-3">{getViolationSeverityBadge(violation.severity)}</td>
                      <td className="py-3 text-sm">{formatDate(violation.detectedAt)}</td>
                      <td className="py-3">{getViolationStatusBadge(violation.status)}</td>
                      <td className="py-3">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReviewViolation(violation.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {violation.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() =>
                                handleDismissViolation(violation.id, violation.description)
                              }
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* INFO BOX */}
      {/* ============================================ */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            À propos de la modération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>Signalements :</strong> Rapports envoyés par les fans concernant le contenu ou
              le comportement du créateur. Chaque signalement doit être examiné et résolu ou rejeté.
            </p>
            <p>
              <strong>Sanctions :</strong> Mesures prises par les administrateurs suite à des
              violations des règles de la plateforme. Peuvent être temporaires ou permanentes.
            </p>
            <p>
              <strong>Violations :</strong> Détections automatiques par l&apos;IA de comportements
              potentiellement problématiques. Doivent être examinées pour validation.
            </p>
            <p className="mt-3 text-xs">
              🎭 <strong>MODE DÉMO :</strong> Les actions (résoudre, rejeter, révoquer) ne modifient pas réellement les données.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
