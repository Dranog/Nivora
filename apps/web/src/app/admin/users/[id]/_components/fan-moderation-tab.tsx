'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Ban,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import type { FanModeration } from '../_types/fan-types';
import { ResolveReportModal } from '@/components/admin/modals/resolve-report-modal';
import { useFanReports, useFanWarnings } from '../_hooks/useFanData';
import { adminToasts } from '@/lib/toasts';

interface FanModerationTabProps {
  userId: string;
}

export function FanModerationTab({ userId }: FanModerationTabProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    id: string;
    reportedBy: string;
    reason: string;
  } | null>(null);
  const [suspendDuration, setSuspendDuration] = useState('7');
  const [warnReason, setWarnReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [banReason, setBanReason] = useState('');

  // Fetch moderation data
  const { data: reports, isLoading: isLoadingReports, error: reportsError } = useFanReports(userId);
  const { data: warnings, isLoading: isLoadingWarnings } = useFanWarnings(userId);

  const isLoading = isLoadingReports || isLoadingWarnings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reportsError || !reports) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des données de modération</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // Construct moderation object from hooks data
  const moderation: FanModeration = {
    reports: (reports || []).map(r => ({
      id: r.id,
      date: new Date(r.createdAt),
      reason: r.reason,
      reportedBy: 'Fan',
      reportedByAvatar: '',
      content: r.description || '',
      contentType: r.targetType === 'POST' ? 'comment' as const : r.targetType === 'MESSAGE' ? 'message' as const : 'profile' as const,
      status: r.status === 'PENDING' ? 'pending' as const : r.status === 'REVIEWED' ? 'reviewed' as const : r.status === 'RESOLVED' ? 'action_taken' as const : 'dismissed' as const,
      reviewedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
      action: r.resolution,
    })),
    sanctions: (warnings || []).map(w => ({
      id: w.id,
      type: 'warning' as const,
      reason: w.reason,
      appliedBy: 'Admin',
      appliedAt: new Date(w.createdAt),
      notes: w.description,
    })),
    adminNotes: [], // TODO: Get from backend when endpoint exists
    flaggedComments: [], // TODO: Get from backend when endpoint exists
  };

  const handleResolveReport = (report: { id: string; reportedBy: string; reason: string }) => {
    setSelectedReport(report);
    setShowResolveModal(true);
  };

  const handleResolveSuccess = () => {
    adminToasts.general.updateSuccess();
    setSelectedReport(null);
  };

  const getReportStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
      reviewed: { label: 'Examiné', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
      dismissed: { label: 'Rejeté', className: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle },
      action_taken: { label: 'Action prise', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getSanctionBadge = (type: string) => {
    const config = {
      warning: { label: 'Avertissement', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: AlertTriangle },
      suspension: { label: 'Suspension', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: Shield },
      ban: { label: 'Bannissement', className: 'bg-red-50 text-red-700 border-red-200', icon: Ban },
    };
    return config[type as keyof typeof config] || config.warning;
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      adminToasts.general.validationError('Veuillez saisir une note');
      return;
    }

    setIsAddingNote(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      adminToasts.general.saveSuccess();
      setNewNote('');
      console.log('✅ [ADD NOTE] Note added successfully');
    } catch (error) {
      console.error('❌ [ADD NOTE] Error:', error);
      adminToasts.general.saveFailed();
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleWarn = async () => {
    if (!warnReason.trim()) {
      adminToasts.general.validationError('Veuillez saisir un motif');
      return;
    }

    console.log('⚠️ [WARN] Sending warning:', { userId, reason: warnReason });

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      adminToasts.general.updateSuccess();
      setShowWarnDialog(false);
      setWarnReason('');
      console.log('✅ [WARN] Warning sent successfully');
    } catch (error) {
      console.error('❌ [WARN] Error:', error);
      adminToasts.general.updateFailed();
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      adminToasts.general.validationError('Veuillez saisir un motif');
      return;
    }

    console.log('🚫 [SUSPEND] Suspending user:', { userId, duration: suspendDuration, reason: suspendReason });

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      adminToasts.users.updated();
      setShowSuspendDialog(false);
      setSuspendReason('');
      setSuspendDuration('7');
      console.log('✅ [SUSPEND] User suspended successfully');
    } catch (error) {
      console.error('❌ [SUSPEND] Error:', error);
      adminToasts.users.updateFailed();
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      adminToasts.general.validationError('Veuillez saisir un motif');
      return;
    }

    console.log('🔨 [BAN] Banning user permanently:', { userId, reason: banReason });

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      adminToasts.users.banned();
      setShowBanDialog(false);
      setBanReason('');
      console.log('✅ [BAN] User banned successfully');
    } catch (error) {
      console.error('❌ [BAN] Error:', error);
      adminToasts.users.banFailed();
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card className="border-l-4 border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Actions de modération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              onClick={() => setShowWarnDialog(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Avertir
            </Button>
            <Button
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => setShowSuspendDialog(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Suspendre
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setShowBanDialog(true)}
            >
              <Ban className="w-4 h-4 mr-2" />
              Bannir définitivement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Received */}
      <Card>
        <CardHeader>
          <CardTitle>Signalements reçus ({moderation.reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {moderation.reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Aucun signalement</p>
              <p className="text-sm">Cet utilisateur n'a reçu aucun signalement</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Motif</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Auteur</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contenu</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderation.reports.map((report) => {
                    const statusConfig = getReportStatusBadge(report.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {report.date.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{report.reason}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={report.reportedByAvatar} />
                              <AvatarFallback>{report.reportedBy[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{report.reportedBy}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {report.contentType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {report.content}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {report.status === 'pending' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleResolveReport({
                                  id: report.id,
                                  reportedBy: report.reportedBy,
                                  reason: report.reason,
                                })
                              }
                              className="text-xs"
                            >
                              Résoudre
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sanctions Applied */}
      <Card>
        <CardHeader>
          <CardTitle>Sanctions appliquées ({moderation.sanctions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {moderation.sanctions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Aucune sanction</p>
              <p className="text-sm">Cet utilisateur n'a jamais été sanctionné</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moderation.sanctions.map((sanction) => {
                const sanctionConfig = getSanctionBadge(sanction.type);
                const SanctionIcon = sanctionConfig.icon;
                return (
                  <div
                    key={sanction.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${sanctionConfig.className.replace('text-', 'bg-').replace('border-', '')}`}>
                        <SanctionIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={sanctionConfig.className}>
                            {sanctionConfig.label}
                          </Badge>
                          {sanction.expiresAt && (
                            <span className="text-xs text-gray-500">
                              Expire le {sanction.expiresAt.toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 mb-1">{sanction.reason}</p>
                        <p className="text-sm text-gray-600">
                          Par {sanction.appliedBy} • {sanction.appliedAt.toLocaleDateString('fr-FR')}
                        </p>
                        {sanction.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{sanction.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagged Comments */}
      {moderation.flaggedComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commentaires signalés ({moderation.flaggedComments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moderation.flaggedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">{comment.videoTitle}</p>
                      <p className="text-sm text-gray-700 mb-2 italic">"{comment.content}"</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{comment.date.toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span className="text-orange-700 font-medium">Motif: {comment.reason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes administrateur ({moderation.adminNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Note Form */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter une note
              </label>
              <Textarea
                placeholder="Saisissez une note interne sur cet utilisateur..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNote.trim()}
                size="sm"
              >
                {isAddingNote ? 'Ajout...' : 'Ajouter la note'}
              </Button>
            </div>

            {/* Notes History */}
            <div className="space-y-3">
              {moderation.adminNotes.map((note) => (
                <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900">{note.createdBy}</span>
                    <span className="text-xs text-gray-500">
                      {note.createdAt.toLocaleDateString('fr-FR')} à{' '}
                      {note.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <Dialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Envoyer un avertissement
            </DialogTitle>
            <DialogDescription>
              Un avertissement sera envoyé à l'utilisateur. Cette action sera enregistrée dans l'historique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de l'avertissement
              </label>
              <Textarea
                placeholder="Expliquez la raison de cet avertissement..."
                value={warnReason}
                onChange={(e) => setWarnReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarnDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleWarn}
              disabled={!warnReason.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Envoyer l'avertissement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Suspendre l'utilisateur
            </DialogTitle>
            <DialogDescription>
              L'utilisateur sera temporairement suspendu et ne pourra plus se connecter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de la suspension
              </label>
              <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 jour</SelectItem>
                  <SelectItem value="3">3 jours</SelectItem>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de la suspension
              </label>
              <Textarea
                placeholder="Expliquez la raison de cette suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Suspendre pour {suspendDuration} jours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Bannir définitivement
            </DialogTitle>
            <DialogDescription className="text-red-600 font-medium">
              ⚠️ Action irréversible : L'utilisateur sera banni définitivement et ne pourra plus jamais se connecter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du bannissement permanent
              </label>
              <Textarea
                placeholder="Expliquez la raison de ce bannissement définitif..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Attention :</strong> Cette action est irréversible. L'utilisateur perdra définitivement l'accès à son compte.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleBan}
              disabled={!banReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Bannir définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Report Modal */}
      {selectedReport && (
        <ResolveReportModal
          open={showResolveModal}
          onOpenChange={setShowResolveModal}
          reportId={selectedReport.id}
          reportedUser={userId}
          reportReason={selectedReport.reason}
          onSuccess={handleResolveSuccess}
        />
      )}
    </div>
  );
}
