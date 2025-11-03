'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useModerationQueue,
  useModerationStats,
  useApproveContent,
  useRejectContent,
  useEscalateContent,
} from '@/hooks/useModeration';
import { useModerationSocket } from '@/hooks/useSocket';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  User,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ModerationItemDto, ModerationQueueQuery } from '@/lib/api/types';

// Risk badge
function getRiskBadge(aiConfidence: number | null) {
  if (aiConfidence === null) return { label: 'N/A', variant: 'outline' as const, color: 'gray' };

  if (aiConfidence < 0.3) {
    return { label: 'Faible', variant: 'default' as const, color: 'green' };
  }
  if (aiConfidence < 0.7) {
    return { label: 'Moyen', variant: 'secondary' as const, color: 'yellow' };
  }
  return { label: 'Élevé', variant: 'destructive' as const, color: 'red' };
}

// Priority badge
function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'LOW':
      return { label: 'Bas', variant: 'outline' as const };
    case 'MEDIUM':
      return { label: 'Moyen', variant: 'secondary' as const };
    case 'HIGH':
      return { label: 'Haut', variant: 'default' as const };
    case 'URGENT':
      return { label: 'Urgent', variant: 'destructive' as const };
    default:
      return { label: priority, variant: 'outline' as const };
  }
}

// Content Preview Dialog
interface ContentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ModerationItemDto | null;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
}

function ContentPreviewDialog({
  open,
  onOpenChange,
  item,
  onApprove,
  onReject,
  onFlag,
}: ContentPreviewDialogProps) {
  if (!item) return null;

  const riskBadge = getRiskBadge(item.aiConfidence);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prévisualisation du contenu</span>
            <div className="flex items-center gap-2">
              <Badge variant={riskBadge.variant}>{riskBadge.label}</Badge>
              {item.type === 'POST' && <Badge variant="outline">Post</Badge>}
              {item.type === 'COMMENT' && <Badge variant="outline">Commentaire</Badge>}
              {item.type === 'MESSAGE' && <Badge variant="outline">Message</Badge>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Media Preview */}
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {item.mediaUrls.length > 0 ? (
              item.mediaUrls[0].endsWith('.mp4') || item.mediaUrls[0].endsWith('.mov') ? (
                <video src={item.mediaUrls[0]} controls className="max-w-full max-h-full" />
              ) : (
                <img src={item.mediaUrls[0]} alt="Content" className="max-w-full max-h-full object-contain" />
              )
            ) : (
              <div className="text-gray-400">Aucun média</div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto">
            {/* Creator Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={item.submittedBy.avatar || undefined} />
                    <AvatarFallback>
                      {item.submittedBy.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.submittedBy.username}</p>
                    <p className="text-sm text-gray-500">Créateur</p>
                  </div>
                </div>

                {/* Content */}
                {item.content && (
                  <div className="mb-4">
                    <Label className="text-gray-600">Contenu texte</Label>
                    <p className="text-sm mt-1">{item.content}</p>
                  </div>
                )}

                {/* Date */}
                <div className="mb-4">
                  <Label className="text-gray-600">Soumis</Label>
                  <p className="text-sm mt-1">
                    {formatDistance(new Date(item.createdAt), new Date(), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>

                {/* Priority */}
                <div className="mb-4">
                  <Label className="text-gray-600">Priorité</Label>
                  <p className="mt-1">
                    <Badge variant={getPriorityBadge(item.priority).variant}>
                      {getPriorityBadge(item.priority).label}
                    </Badge>
                  </p>
                </div>

                {/* AI Analysis */}
                {item.aiConfidence !== null && (
                  <div className="mb-4">
                    <Label className="text-gray-600">Score de risque IA</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{(item.aiConfidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.aiConfidence < 0.3
                              ? 'bg-green-500'
                              : item.aiConfidence < 0.7
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${item.aiConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Flags */}
                {item.aiFlags.length > 0 && (
                  <div>
                    <Label className="text-gray-600">Signalements IA</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.aiFlags.map((flag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onFlag}>
            <Flag className="h-4 w-4 mr-2" />
            Signaler
          </Button>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={onReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button variant="default" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reject Dialog
interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ModerationItemDto | null;
  onConfirm: (reason: string, severity: 'LOW' | 'MEDIUM' | 'HIGH', action: 'DELETE' | 'WARN' | 'SUSPEND' | 'BAN') => void;
  isLoading: boolean;
}

function RejectDialog({ open, onOpenChange, item, onConfirm, isLoading }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [action, setAction] = useState<'DELETE' | 'WARN' | 'SUSPEND' | 'BAN'>('DELETE');

  const handleConfirm = useCallback(() => {
    if (reason.trim()) {
      onConfirm(reason, severity, action);
      setReason('');
      setSeverity('MEDIUM');
      setAction('DELETE');
    }
  }, [reason, severity, action, onConfirm]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter le contenu</DialogTitle>
          <DialogDescription>
            Le contenu de <strong>{item.submittedBy.username}</strong> sera rejeté.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Raison *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Contenu explicite non autorisé, violation des règles..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="severity">Sévérité</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)} disabled={isLoading}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Faible</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="HIGH">Élevée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="action">Action sur l'utilisateur</Label>
            <Select value={action} onValueChange={(v) => setAction(v as typeof action)} disabled={isLoading}>
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DELETE">Supprimer uniquement</SelectItem>
                <SelectItem value="WARN">Avertir</SelectItem>
                <SelectItem value="SUSPEND">Suspendre</SelectItem>
                <SelectItem value="BAN">Bannir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Rejet...' : 'Rejeter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Flag Dialog
interface FlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ModerationItemDto | null;
  onConfirm: (reason: string, priority: 'HIGH' | 'URGENT') => void;
  isLoading: boolean;
}

function FlagDialog({ open, onOpenChange, item, onConfirm, isLoading }: FlagDialogProps) {
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'URGENT'>('HIGH');

  const handleConfirm = useCallback(() => {
    if (reason.trim()) {
      onConfirm(reason, priority);
      setReason('');
      setPriority('HIGH');
    }
  }, [reason, priority, onConfirm]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler le contenu</DialogTitle>
          <DialogDescription>
            Escalader ce contenu pour une révision approfondie par un modérateur senior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="flag-reason">Raison *</Label>
            <Textarea
              id="flag-reason"
              placeholder="Ex: Contenu ambigu nécessitant une expertise, cas complexe..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="flag-priority">Priorité</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)} disabled={isLoading}>
              <SelectTrigger id="flag-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Haute</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Signalement...' : 'Signaler'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ModerationPage() {
  // WebSocket connection
  const { connected, newContentCount, resetNewContentCount } = useModerationSocket();

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Selection for bulk actions
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Build query
  const query = useMemo<ModerationQueueQuery>(() => {
    const q: ModerationQueueQuery = {
      page,
      limit,
      status: 'PENDING',
    };

    if (typeFilter !== 'ALL') {
      q.type = typeFilter as ModerationQueueQuery['type'];
    }

    if (priorityFilter !== 'ALL') {
      q.priority = priorityFilter as ModerationQueueQuery['priority'];
    }

    return q;
  }, [page, limit, typeFilter, priorityFilter]);

  // Fetch queue
  const { data, isLoading, isError, error, refetch } = useModerationQueue(query);
  const { data: stats } = useModerationStats();

  // Mutations
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const escalateMutation = useEscalateContent();

  // Dialog states
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; item: ModerationItemDto | null }>({
    open: false,
    item: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; item: ModerationItemDto | null }>({
    open: false,
    item: null,
  });
  const [flagDialog, setFlagDialog] = useState<{ open: boolean; item: ModerationItemDto | null }>({
    open: false,
    item: null,
  });

  // Handlers
  const handlePreview = useCallback((item: ModerationItemDto) => {
    setPreviewDialog({ open: true, item });
  }, []);

  const handleApprove = useCallback((itemId: string) => {
    approveMutation.mutate({ itemId });
    setPreviewDialog({ open: false, item: null });
  }, [approveMutation]);

  const handleReject = useCallback((item: ModerationItemDto) => {
    setPreviewDialog({ open: false, item: null });
    setRejectDialog({ open: true, item });
  }, []);

  const handleFlag = useCallback((item: ModerationItemDto) => {
    setPreviewDialog({ open: false, item: null });
    setFlagDialog({ open: true, item });
  }, []);

  const confirmReject = useCallback((reason: string, severity: 'LOW' | 'MEDIUM' | 'HIGH', action: 'DELETE' | 'WARN' | 'SUSPEND' | 'BAN') => {
    if (!rejectDialog.item) return;

    rejectMutation.mutate({
      itemId: rejectDialog.item.id,
      reason,
      severity,
      action,
    }, {
      onSuccess: () => {
        setRejectDialog({ open: false, item: null });
      },
    });
  }, [rejectDialog.item, rejectMutation]);

  const confirmFlag = useCallback((reason: string, priority: 'HIGH' | 'URGENT') => {
    if (!flagDialog.item) return;

    escalateMutation.mutate({
      itemId: flagDialog.item.id,
      reason,
      priority,
    }, {
      onSuccess: () => {
        setFlagDialog({ open: false, item: null });
      },
    });
  }, [flagDialog.item, escalateMutation]);

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const items = data?.items || [];
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }, [data?.items, selectedItems.size]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement de la file de modération..." />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <div className="p-6 space-y-6">
          <ErrorState
            title="Erreur de chargement"
            message={error?.message || 'Impossible de charger la file de modération'}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Modération
              </h1>
              {newContentCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {newContentCount} nouveau{newContentCount > 1 ? 'x' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-600">
                {total} élément{total > 1 ? 's' : ''} en attente
              </p>
              <div className="flex items-center gap-1 text-sm">
                {connected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Temps réel activé</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Hors ligne</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-600">En attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-600">Approuvés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-600">Rejetés</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les types</SelectItem>
                  <SelectItem value="POST">Posts</SelectItem>
                  <SelectItem value="COMMENT">Commentaires</SelectItem>
                  <SelectItem value="MESSAGE">Messages</SelectItem>
                  <SelectItem value="PROFILE">Profils</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risque IA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les risques</SelectItem>
                  <SelectItem value="LOW">Faible (&lt;30%)</SelectItem>
                  <SelectItem value="MEDIUM">Moyen (30-70%)</SelectItem>
                  <SelectItem value="HIGH">Élevé (&gt;70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes les priorités</SelectItem>
                  <SelectItem value="LOW">Basse</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedItems.size} sélectionné(s)</Badge>
                <Button size="sm" variant="outline" onClick={() => setSelectedItems(new Set())}>
                  Désélectionner
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                File de modération vide
              </h3>
              <p className="text-gray-600">
                Aucun contenu en attente de modération pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const riskBadge = getRiskBadge(item.aiConfidence);
              const priorityBadge = getPriorityBadge(item.priority);
              const isSelected = selectedItems.has(item.id);

              return (
                <Card key={item.id} className={`hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-cyan-500' : ''}`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Checkbox + Type */}
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                      <div className="flex items-center gap-2">
                        {item.type === 'POST' && <ImageIcon className="h-4 w-4 text-blue-600" />}
                        {item.type === 'COMMENT' && <Video className="h-4 w-4 text-purple-600" />}
                        <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                      </div>
                    </div>

                    {/* Media Preview */}
                    <div
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handlePreview(item)}
                    >
                      {item.mediaUrls.length > 0 ? (
                        item.mediaUrls[0].endsWith('.mp4') ? (
                          <video src={item.mediaUrls[0]} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.mediaUrls[0]} alt="Content" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas de média
                        </div>
                      )}
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.submittedBy.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {item.submittedBy.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.submittedBy.username}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistance(new Date(item.createdAt), new Date(), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Risk Score */}
                    {item.aiConfidence !== null && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Risque IA</span>
                          <Badge variant={riskBadge.variant} className="text-xs">
                            {riskBadge.label}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.aiConfidence < 0.3
                                ? 'bg-green-500'
                                : item.aiConfidence < 0.7
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${item.aiConfidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePreview(item)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(item.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(item)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} sur {data?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.totalPages || 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ContentPreviewDialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ open, item: previewDialog.item })}
        item={previewDialog.item}
        onApprove={() => previewDialog.item && handleApprove(previewDialog.item.id)}
        onReject={() => previewDialog.item && handleReject(previewDialog.item)}
        onFlag={() => previewDialog.item && handleFlag(previewDialog.item)}
      />

      <RejectDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ open, item: rejectDialog.item })}
        item={rejectDialog.item}
        onConfirm={confirmReject}
        isLoading={rejectMutation.isPending}
      />

      <FlagDialog
        open={flagDialog.open}
        onOpenChange={(open) => setFlagDialog({ open, item: flagDialog.item })}
        item={flagDialog.item}
        onConfirm={confirmFlag}
        isLoading={escalateMutation.isPending}
      />
    </div>
  );
}
