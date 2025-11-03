'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Ban,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { MarketplaceData, Annonce, AnnonceResponse, FanMarketplacePurchase } from '../_types/fan-supervision-types';
import { logAdminAction, AdminActionType, generateMarketplaceReport } from '@/lib/audit-log';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { forceRefundPurchaseSchema, resolveMarketplaceDisputeSchema } from '@/lib/validations/admin-fan-supervision';
import { Clock as ClockIcon, Star, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFanRequests } from '../_hooks/useFanData';
import { adminToasts } from '@/lib/toasts';

interface FanMarketplaceTabProps {
  userId: string;
}

export function FanMarketplaceTab({ userId }: FanMarketplaceTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAnnonce, setSelectedAnnonce] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportHtml, setReportHtml] = useState<string>('');
  const [selectedPurchase, setSelectedPurchase] = useState<FanMarketplacePurchase | null>(null);
  const [showPurchaseDetailsModal, setShowPurchaseDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [disputeResolution, setDisputeResolution] = useState<'refund_fan' | 'force_delivery' | 'mediation'>('mediation');
  const [messageFan, setMessageFan] = useState('');
  const [messageCreator, setMessageCreator] = useState('');

  // Fetch marketplace requests data
  const { data: marketplaceData, isLoading, error } = useFanRequests(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !marketplaceData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des données marketplace</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const data = marketplaceData as any as MarketplaceData; // TODO: Type properly when backend returns MarketplaceData
  const responses: Record<string, AnnonceResponse[]> = {}; // TODO: Get from marketplaceData
  const purchases: FanMarketplacePurchase[] = []; // TODO: Get from marketplaceData

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200', icon: '🟢' },
      in_progress: { label: 'En cours', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
      completed: { label: 'Finalisée', className: 'bg-gray-50 text-gray-700 border-gray-200', icon: '✅' },
      rejected: { label: 'Refusée', className: 'bg-red-50 text-red-700 border-red-200', icon: '🔴' },
      expired: { label: 'Expirée', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: '⏰' },
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'critical'
      ? 'bg-red-100 border-red-300 text-red-900'
      : severity === 'warning'
      ? 'bg-orange-100 border-orange-300 text-orange-900'
      : 'bg-blue-100 border-blue-300 text-blue-900';
  };

  const filteredAnnonces =
    statusFilter === 'all'
      ? data.annonces
      : data.annonces.filter((a) => a.status === statusFilter);

  const handleViewResponses = (annonceId: string) => {
    setSelectedAnnonce(selectedAnnonce === annonceId ? null : annonceId);
    adminToasts.general.info(`Affichage des ${responses[annonceId]?.length || 0} réponses`);
  };

  const handleFlagAction = async (flagId: string, action: 'validate' | 'ignore') => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      adminToasts.general.success(`Flag ${action === 'validate' ? 'validé' : 'ignoré'}`);
    } catch (error) {
      adminToasts.general.error('Erreur lors du traitement du flag');
    }
  };

  const handleWarnCreator = async (creatorId: string, creatorName: string) => {
    const confirmed = window.confirm(`Envoyer un avertissement à ${creatorName} ?`);
    if (!confirmed) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      adminToasts.general.warning(`Avertissement envoyé à ${creatorName}`);
    } catch (error) {
      adminToasts.general.error('Erreur lors de l\'envoi de l\'avertissement');
    }
  };

  const handleBanCreator = async (creatorId: string, creatorName: string) => {
    const confirmed = window.confirm(
      `⚠️ ATTENTION: Bannir définitivement ${creatorName} ?\n\nCette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      adminToasts.general.error(`${creatorName} a été banni définitivement`);
    } catch (error) {
      adminToasts.general.error('Erreur lors du bannissement');
    }
  };

  const handleViewDetailedReport = async () => {
    console.log('📊 [REPORT] Viewing detailed report for user:', userId);
    try {
      // Générer le rapport HTML
      const html = generateMarketplaceReport(data, 'admin@oliver.com'); // TODO: Récupérer email admin réel
      setReportHtml(html);
      setShowReportModal(true);

      // Log l'action en audit
      await logAdminAction({
        adminId: 'ADMIN-TEMP', // TODO: Récupérer ID admin réel
        adminEmail: 'admin@oliver.com',
        actionType: AdminActionType.MARKETPLACE_REPORT_GENERATE,
        targetUserId: userId,
        details: {
          reportType: 'detailed_view',
          totalAnnonces: data.totalAnnonces,
          detectedIncidents: data.detectedIncidents,
        },
      });

      adminToasts.general.success('Rapport détaillé affiché');
    } catch (error) {
      adminToasts.general.error('Erreur lors de la génération du rapport');
    }
  };

  const handleGenerateInternalReport = async () => {
    try {
      // Log l'action en audit (rapport enregistré en système, non téléchargeable)
      await logAdminAction({
        adminId: 'ADMIN-TEMP', // TODO: Récupérer ID admin réel
        adminEmail: 'admin@oliver.com',
        actionType: AdminActionType.MARKETPLACE_REPORT_GENERATE,
        targetUserId: userId,
        details: {
          reportType: 'internal_system',
          totalAnnonces: data.totalAnnonces,
          detectedIncidents: data.detectedIncidents,
          generatedAt: new Date().toISOString(),
        },
        metadata: {
          stored: true,
          downloadable: false,
        },
      });

      adminToasts.general.success('Rapport interne généré et enregistré dans le système');
    } catch (error) {
      adminToasts.general.error('Erreur lors de la génération du rapport interne');
    }
  };

  // ============================================
  // PURCHASE HANDLERS
  // ============================================

  const handleViewPurchaseConversation = async (purchaseId: string) => {
    adminToasts.general.info('Navigation vers la conversation');
    // TODO: Navigate to Messages tab with conversation focused
    await logAdminAction({
      adminId: 'ADMIN-TEMP',
      adminEmail: 'admin@oliver.com',
      actionType: 'VIEW_PURCHASE_CONVERSATION' as AdminActionType,
      targetUserId: userId,
      details: { purchaseId },
    });
  };

  const handleViewPurchaseDetails = (purchase: FanMarketplacePurchase) => {
    setSelectedPurchase(purchase);
    setShowPurchaseDetailsModal(true);
    adminToasts.general.info(`Détails de l'achat ${purchase.id}`);
  };

  const handleForceRefund = async () => {
    if (!selectedPurchase) return;

    try {
      // Validate with Zod
      const validation = forceRefundPurchaseSchema.safeParse({
        purchaseId: selectedPurchase.id,
        amount: selectedPurchase.amount,
        reason: refundReason,
        adminId: 'ADMIN-TEMP',
        notifyBoth: true,
      });

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        adminToasts.general.error(firstError.message);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Log action
      await logAdminAction({
        adminId: 'ADMIN-TEMP',
        adminEmail: 'admin@oliver.com',
        actionType: 'FORCE_REFUND_PURCHASE' as AdminActionType,
        targetUserId: userId,
        details: {
          purchaseId: selectedPurchase.id,
          amount: selectedPurchase.amount,
          reason: refundReason,
          creatorId: selectedPurchase.creatorId,
        },
      });

      adminToasts.transactions.refunded();
      setShowRefundModal(false);
      setRefundReason('');
      setSelectedPurchase(null);
    } catch (error) {
      adminToasts.transactions.refundFailed();
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedPurchase) return;

    try {
      // Validate with Zod
      const validation = resolveMarketplaceDisputeSchema.safeParse({
        purchaseId: selectedPurchase.id,
        resolution: disputeResolution,
        messageToFan: messageFan || undefined,
        messageToCreator: messageCreator || undefined,
        adminId: 'ADMIN-TEMP',
      });

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        adminToasts.general.error(firstError.message);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log action
      await logAdminAction({
        adminId: 'ADMIN-TEMP',
        adminEmail: 'admin@oliver.com',
        actionType: 'RESOLVE_MARKETPLACE_DISPUTE' as AdminActionType,
        targetUserId: userId,
        details: {
          purchaseId: selectedPurchase.id,
          resolution: disputeResolution,
          creatorId: selectedPurchase.creatorId,
        },
      });

      const resolutionLabels = {
        refund_fan: 'Remboursement fan',
        force_delivery: 'Livraison forcée',
        mediation: 'Médiation',
      };

      adminToasts.general.success(`Litige résolu : ${resolutionLabels[disputeResolution]}`);
      setShowDisputeModal(false);
      setMessageFan('');
      setMessageCreator('');
      setSelectedPurchase(null);
    } catch (error) {
      adminToasts.general.error('Erreur lors de la résolution du litige');
    }
  };

  // ============================================
  // PURCHASE STATUS HELPERS
  // ============================================

  const getPurchaseStatusBadge = (status: string) => {
    const config = {
      pending: { label: '⏳ En attente', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      in_progress: { label: '🔄 En production', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      delivered: { label: '✅ Livré', className: 'bg-green-100 text-green-700 border-green-200' },
      completed: { label: '⭐ Terminé avec avis', className: 'bg-green-100 text-green-800 border-green-300' },
      disputed: { label: '⚠️ Litige', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      refunded: { label: '❌ Remboursé', className: 'bg-red-100 text-red-700 border-red-200' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Dépassé', color: 'text-red-600' };
    if (diffDays === 0) return { text: "Aujourd'hui", color: 'text-orange-600' };
    if (diffDays <= 3) return { text: `J-${diffDays}`, color: 'text-orange-600' };
    return { text: `J-${diffDays}`, color: 'text-green-600' };
  };

  // Calculate purchases in progress for stats
  const ongoingPurchases = purchases.filter(p => p.status === 'in_progress' || p.status === 'pending').length;
  const totalOngoing = data.ongoingTransactions + ongoingPurchases;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Annonces publiées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalAnnonces}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Réponses reçues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalResponses}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Transactions en cours</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalOngoing}</p>
                {ongoingPurchases > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    dont {ongoingPurchases} achat{ongoingPurchases > 1 ? 's' : ''} direct{ongoingPurchases > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Incidents détectés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.detectedIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Statut:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Finalisée</SelectItem>
                    <SelectItem value="rejected">Refusée</SelectItem>
                    <SelectItem value="expired">Expirée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline">
                {filteredAnnonces.length} annonce{filteredAnnonces.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleViewDetailedReport}>
                <FileText className="w-4 h-4 mr-2" />
                Voir rapport détaillé
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateInternalReport}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Générer rapport interne
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Annonces Timeline */}
      <div className="space-y-4">
        {filteredAnnonces.map((annonce) => {
          const statusConfig = getStatusBadge(annonce.status);
          const annonceResponses = responses[annonce.id] || [];
          const isExpanded = selectedAnnonce === annonce.id;

          return (
            <Card key={annonce.id} className={annonce.flags.length > 0 ? 'border-2 border-red-300' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={statusConfig.className}>
                        {statusConfig.icon} {statusConfig.label}
                      </Badge>
                      {annonce.flags.length > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {annonce.flags.length} flag{annonce.flags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {annonce.rating && (
                        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          ⭐ {annonce.rating.toFixed(1)}/5
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{annonce.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📂 {annonce.category}</span>
                      <span>💰 {annonce.budget.min}-{annonce.budget.max}€</span>
                      <span>⏱️ {annonce.deadline}</span>
                      <span>💬 {annonce.responsesCount} réponses</span>
                    </div>
                    {annonce.currentCreator && (
                      <p className="text-sm text-gray-600 mt-2">
                        👤 Créateur: @{annonce.currentCreator.handle}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResponses(annonce.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isExpanded ? 'Masquer' : 'Voir réponses'}
                  </Button>
                </div>

                {/* Flags on annonce */}
                {annonce.flags.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-red-200">
                    {annonce.flags.map((flag) => (
                      <div
                        key={flag.id}
                        className={`p-3 border rounded-lg ${getSeverityColor(flag.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {flag.type.replace('_', ' ').toUpperCase()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {flag.confidence}% confiance
                              </Badge>
                            </div>
                            <p className="text-xs">
                              Mots-clés: {flag.keywords.join(', ')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFlagAction(flag.id, 'validate')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFlagAction(flag.id, 'ignore')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Responses */}
                {isExpanded && annonceResponses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <h4 className="font-medium text-gray-900">Réponses des créateurs:</h4>
                    {annonceResponses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 border rounded-lg ${
                          response.flags.length > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={response.creatorAvatar} />
                            <AvatarFallback>{response.creatorName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{response.creatorName}</span>
                              <span className="text-xs text-gray-500">@{response.creatorHandle}</span>
                              <Badge variant="outline" className="text-xs">
                                ⭐ {response.creatorRating.toFixed(1)}
                              </Badge>
                              {response.flags.length > 0 && (
                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                  {response.flags.length} FLAG{response.flags.length > 1 ? 'S' : ''}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{response.message}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>💰 {response.price}€</span>
                              <span>⏱️ {response.deadline}</span>
                            </div>

                            {/* Response flags */}
                            {response.flags.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {response.flags.map((flag) => (
                                  <div
                                    key={flag.id}
                                    className={`p-3 border rounded ${getSeverityColor(flag.severity)}`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <AlertTriangle className="w-4 h-4" />
                                          <span className="font-medium text-sm">
                                            {flag.type.replace('_', ' ').toUpperCase()}
                                          </span>
                                          <Badge className="text-xs">
                                            {flag.confidence}%
                                          </Badge>
                                        </div>
                                        <p className="text-xs">Mots-clés: {flag.keywords.join(', ')}</p>
                                        <p className="text-xs mt-1 font-medium">
                                          Recommandations: {flag.recommendations.join(', ')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleFlagAction(flag.id, 'validate')}
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Valider
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleFlagAction(flag.id, 'ignore')}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Ignorer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-orange-600 hover:bg-orange-50"
                                        onClick={() => handleWarnCreator(response.creatorId, response.creatorName)}
                                      >
                                        <Shield className="w-3 h-3 mr-1" />
                                        Warn
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleBanCreator(response.creatorId, response.creatorName)}
                                      >
                                        <Ban className="w-3 h-3 mr-1" />
                                        Ban
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achats directs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Achats directs
              <Badge variant="outline" className="ml-2">
                {purchases.length}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun achat direct pour le moment</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Annonce achetée</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Créateur vendeur</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Prix payé</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Date achat</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Statut livraison</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Délai restant</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => {
                    const statusConfig = getPurchaseStatusBadge(purchase.status);
                    const timeRemaining = calculateTimeRemaining(purchase.deliveryDeadline);
                    const canRefund = ['pending', 'in_progress', 'delivered', 'disputed'].includes(purchase.status);
                    const canResolveDispute = purchase.status === 'disputed';

                    return (
                      <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="text-sm font-medium text-gray-900">{purchase.annonceTitle}</div>
                          <div className="text-xs text-gray-500">ID: {purchase.id}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={purchase.creatorAvatar} />
                              <AvatarFallback>{purchase.creatorUsername[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{purchase.creatorUsername}</div>
                              <div className="text-xs text-gray-500">ID: {purchase.creatorId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm font-semibold text-gray-900">€{purchase.amount.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm text-gray-700">
                            {new Date(purchase.purchaseDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(purchase.purchaseDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                          {purchase.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-700">{purchase.rating}/5</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {purchase.status === 'completed' || purchase.status === 'refunded' ? (
                            <span className="text-sm text-gray-400">-</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4 text-gray-400" />
                              <span className={`text-sm font-medium ${timeRemaining.color}`}>
                                {timeRemaining.text}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPurchaseConversation(purchase.id)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Voir conversation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewPurchaseDetails(purchase)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Détails commande
                              </DropdownMenuItem>
                              {canRefund && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPurchase(purchase);
                                    setShowRefundModal(true);
                                  }}
                                  className="text-orange-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Forcer remboursement
                                </DropdownMenuItem>
                              )}
                              {canResolveDispute && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPurchase(purchase);
                                    setShowDisputeModal(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Résoudre litige
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse comportement marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Métriques</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux finalisation:</span>
                  <span className="font-medium">{data.analytics.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant moyen:</span>
                  <span className="font-medium">{data.analytics.averageTransactionAmount}€</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Patterns suspects</h4>
              <div className="space-y-1">
                {data.analytics.suspiciousPatterns.map((pattern, i) => (
                  <p key={i} className="text-sm text-orange-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    {pattern}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Rapport Détaillé */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Rapport Détaillé Marketplace - Fan {userId}
            </DialogTitle>
            <DialogDescription>
              Rapport confidentiel admin - Lecture seule, non téléchargeable
            </DialogDescription>
          </DialogHeader>

          <div
            className="border rounded-lg p-4 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Détails Achat */}
      <Dialog open={showPurchaseDetailsModal} onOpenChange={setShowPurchaseDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Détails de l'achat {selectedPurchase?.id}
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la transaction
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Annonce</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPurchase.annonceTitle}</p>
                  <p className="text-xs text-gray-500">ID: {selectedPurchase.annonceId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Créateur</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedPurchase.creatorAvatar} />
                      <AvatarFallback>{selectedPurchase.creatorUsername[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-900">{selectedPurchase.creatorUsername}</p>
                      <p className="text-xs text-gray-500">ID: {selectedPurchase.creatorId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Montant payé</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">€{selectedPurchase.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">
                    <Badge className={getPurchaseStatusBadge(selectedPurchase.status).className}>
                      {getPurchaseStatusBadge(selectedPurchase.status).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date d'achat</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedPurchase.purchaseDate).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Échéance livraison</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedPurchase.deliveryDeadline).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {selectedPurchase.deliveredAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de livraison</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedPurchase.deliveredAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              {selectedPurchase.rating && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Évaluation</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedPurchase.rating!
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPurchase.rating}/5
                    </span>
                  </div>
                </div>
              )}

              {selectedPurchase.flags && selectedPurchase.flags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Flags détectés</label>
                  <div className="mt-1 space-y-1">
                    {selectedPurchase.flags.map((flag, i) => (
                      <Badge key={i} className="bg-red-100 text-red-700 border-red-300">
                        ⚠️ {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPurchaseDetailsModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Forcer Remboursement */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <XCircle className="w-5 h-5" />
              Forcer remboursement
            </DialogTitle>
            <DialogDescription>
              ⚠️ Action administrative - Remboursement immédiat au fan
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 mb-2">
                  <strong>Achat:</strong> {selectedPurchase.annonceTitle}
                </p>
                <p className="text-sm text-gray-900 mb-2">
                  <strong>Créateur:</strong> {selectedPurchase.creatorUsername}
                </p>
                <p className="text-lg font-bold text-orange-700">
                  Montant: €{selectedPurchase.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Raison du remboursement <span className="text-red-600">*</span>
                </label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Expliquez la raison du remboursement forcé (min 10 caractères)..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {refundReason.length}/500 caractères
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  ℹ️ Le fan et le créateur seront notifiés. La transaction sera marquée comme remboursée.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowRefundModal(false);
              setRefundReason('');
              setSelectedPurchase(null);
            }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceRefund}
              disabled={refundReason.length < 10}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirmer remboursement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Résoudre Litige */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Résoudre le litige
            </DialogTitle>
            <DialogDescription>
              Intervention administrative pour résoudre un différend
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 mb-1">
                  <strong>Achat:</strong> {selectedPurchase.annonceTitle}
                </p>
                <p className="text-sm text-gray-900 mb-1">
                  <strong>Montant:</strong> €{selectedPurchase.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-900">
                  <strong>Créateur:</strong> {selectedPurchase.creatorUsername}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type de résolution <span className="text-red-600">*</span>
                </label>
                <Select value={disputeResolution} onValueChange={(value: any) => setDisputeResolution(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refund_fan">💰 Remboursement fan</SelectItem>
                    <SelectItem value="force_delivery">🚀 Forcer livraison créateur</SelectItem>
                    <SelectItem value="mediation">⚖️ Médiation (contacter les 2 parties)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(disputeResolution === 'mediation' || disputeResolution === 'refund_fan') && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Message au fan {disputeResolution === 'mediation' && <span className="text-red-600">*</span>}
                  </label>
                  <Textarea
                    value={messageFan}
                    onChange={(e) => setMessageFan(e.target.value)}
                    placeholder="Message personnalisé au fan..."
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">{messageFan.length}/1000 caractères</p>
                </div>
              )}

              {(disputeResolution === 'mediation' || disputeResolution === 'force_delivery') && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Message au créateur {disputeResolution === 'mediation' && <span className="text-red-600">*</span>}
                  </label>
                  <Textarea
                    value={messageCreator}
                    onChange={(e) => setMessageCreator(e.target.value)}
                    placeholder="Message personnalisé au créateur..."
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">{messageCreator.length}/1000 caractères</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  ℹ️ {disputeResolution === 'refund_fan' && 'Le fan sera remboursé immédiatement.'}
                  {disputeResolution === 'force_delivery' && 'Le créateur devra livrer sous 48h maximum.'}
                  {disputeResolution === 'mediation' && 'Messages personnalisés envoyés aux deux parties pour médiation.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowDisputeModal(false);
              setMessageFan('');
              setMessageCreator('');
              setSelectedPurchase(null);
            }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleResolveDispute}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Résoudre litige
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
