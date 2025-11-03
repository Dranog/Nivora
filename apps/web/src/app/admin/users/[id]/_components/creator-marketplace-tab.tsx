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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Star,
  Clock,
  AlertCircle,
  Eye,
  Ban,
  Flag,
  MoreVertical,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type {
  CreatorMarketplaceData,
  CreatorAnnonce,
  FanDemand,
  CreatorOrder,
} from '../_types/fan-supervision-types';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorMarketplaceTabProps {
  data: CreatorMarketplaceData;
  userId: string;
}

export function CreatorMarketplaceTab({ data, userId }: CreatorMarketplaceTabProps) {
  // Filters
  const [annonceFilter, setAnnonceFilter] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Selected items for actions
  const [selectedAnnonce, setSelectedAnnonce] = useState<CreatorAnnonce | null>(null);
  const [selectedDemand, setSelectedDemand] = useState<FanDemand | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CreatorOrder | null>(null);

  // Modals
  const [showSuspendAnnonceModal, setShowSuspendAnnonceModal] = useState(false);
  const [showBlockResponseModal, setShowBlockResponseModal] = useState(false);
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false);
  const [showResolveDisputeModal, setShowResolveDisputeModal] = useState(false);
  const [showReportAnnonceModal, setShowReportAnnonceModal] = useState(false);

  // Form states
  const [suspendReason, setSuspendReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [warnCreator, setWarnCreator] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [disputeResolution, setDisputeResolution] = useState<'favor_fan' | 'favor_creator' | 'mediation'>('mediation');
  const [messageFan, setMessageFan] = useState('');
  const [messageCreator, setMessageCreator] = useState('');
  const [reportIssueType, setReportIssueType] = useState<'inappropriate_content' | 'misleading_info' | 'pricing_issue' | 'violation_terms'>('misleading_info');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSeverity, setReportSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  console.log('[DEMO] 🛒 Creator Marketplace for user:', userId);

  // ============================================
  // HANDLERS (DEMO MODE)
  // ============================================

  const handleSuspendAnnonce = async () => {
    if (!selectedAnnonce) return;

    if (suspendReason.length < 10) {
      alert('La raison doit contenir au moins 10 caractères');
      return;
    }

    console.log('[DEMO] 🚫 Suspending annonce:', selectedAnnonce.id);
    alert(`MODE DÉMO : Annonce "${selectedAnnonce.title}" suspendue\nRaison: ${suspendReason}`);
    
    setShowSuspendAnnonceModal(false);
    setSuspendReason('');
    setSelectedAnnonce(null);
  };

  const handleBlockResponse = async () => {
    if (!selectedDemand || !selectedDemand.myResponse) return;

    if (blockReason.length < 10) {
      alert('La raison doit contenir au moins 10 caractères');
      return;
    }

    console.log('[DEMO] ⛔ Blocking response:', selectedDemand.myResponse.id);
    alert(`MODE DÉMO : Réponse bloquée\nRaison: ${blockReason}\nAvertissement: ${warnCreator ? 'Oui' : 'Non'}`);
    
    setShowBlockResponseModal(false);
    setBlockReason('');
    setWarnCreator(false);
    setSelectedDemand(null);
  };

  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;

    console.log('[DEMO] ✅ Marking order as delivered:', selectedOrder.id);
    alert(`MODE DÉMO : Commande "${selectedOrder.annonceTitle}" marquée comme livrée\nNotes: ${deliveryNotes || 'Aucune'}`);
    
    setShowMarkDeliveredModal(false);
    setDeliveryNotes('');
    setSelectedOrder(null);
  };

  const handleResolveDispute = async () => {
    if (!selectedOrder) return;

    const resolutionLabels = {
      favor_fan: 'Faveur fan (remboursement)',
      favor_creator: 'Faveur créateur (paiement validé)',
      mediation: 'Médiation',
    };

    console.log('[DEMO] ⚖️ Resolving dispute:', disputeResolution);
    alert(`MODE DÉMO : Litige résolu\nType: ${resolutionLabels[disputeResolution]}\nMessage fan: ${messageFan || 'Aucun'}\nMessage créateur: ${messageCreator || 'Aucun'}`);
    
    setShowResolveDisputeModal(false);
    setMessageFan('');
    setMessageCreator('');
    setSelectedOrder(null);
  };

  const handleReportAnnonce = async () => {
    if (!selectedAnnonce) return;

    if (reportDetails.length < 20) {
      alert('Les détails doivent contenir au moins 20 caractères');
      return;
    }

    console.log('[DEMO] 🚩 Reporting annonce:', reportIssueType);
    alert(`MODE DÉMO : Annonce signalée\nType: ${reportIssueType}\nSévérité: ${reportSeverity}\nDétails: ${reportDetails}`);
    
    setShowReportAnnonceModal(false);
    setReportDetails('');
    setSelectedAnnonce(null);
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getAnnonceStatusBadge = (status: string) => {
    const config = {
      active: { label: '🟢 Active', className: 'bg-green-50 text-green-700 border-green-200' },
      draft: { label: '📝 Brouillon', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      closed: { label: '🔒 Fermée', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getResponseStatusBadge = (status: string) => {
    const config = {
      pending: { label: '⏳ En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      accepted: { label: '✅ Acceptée', className: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { label: '❌ Refusée', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getOrderStatusBadge = (status: string) => {
    const config = {
      pending: { label: '⏳ En attente', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      in_progress: { label: '🔄 En production', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      delivered: { label: '✅ Livré', className: 'bg-green-100 text-green-700 border-green-200' },
      completed: { label: '⭐ Terminé', className: 'bg-green-100 text-green-800 border-green-300' },
      disputed: { label: '⚠️ Litige', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getOrderTypeBadge = (type: string) => {
    return type === 'fan_demand'
      ? { label: '📋 Demande fan', className: 'bg-purple-50 text-purple-700 border-purple-200' }
      : { label: '🛒 Achat direct', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
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

  // Filtered data
  const filteredAnnonces =
    annonceFilter === 'all'
      ? data.annonces
      : data.annonces.filter((a) => a.status === annonceFilter);

  const filteredOrders =
    orderFilter === 'all'
      ? data.orders
      : data.orders.filter((o) => o.status === orderFilter);

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* SECTION 1: STATS OVERVIEW */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Annonces publiées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalAnnonces}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.stats.activeAnnonces} active{data.stats.activeAnnonces > 1 ? 's' : ''}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Demandes reçues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalDemands}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.demands.filter(d => d.myResponse?.status === 'pending').length} en attente
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Commandes actives</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.activeOrders}</p>
                <p className="text-xs text-gray-500 mt-1">à livrer</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Commandes livrées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.completedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">terminées</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.reputation.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.reputation.totalReviews} avis
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SECTION 2: MES ANNONCES PUBLIÉES */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes annonces publiées</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={annonceFilter} onValueChange={setAnnonceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="closed">Fermées</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredAnnonces.length} annonce{filteredAnnonces.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnonces.map((annonce) => {
              const statusConfig = getAnnonceStatusBadge(annonce.status);
              return (
                <Card key={annonce.id} className={annonce.flags && annonce.flags.length > 0 ? 'border-2 border-orange-300' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('[DEMO] Voir détails annonce')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAnnonce(annonce);
                              setShowSuspendAnnonceModal(true);
                            }}
                            className="text-orange-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspendre annonce
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAnnonce(annonce);
                              setShowReportAnnonceModal(true);
                            }}
                            className="text-red-600"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Signaler problème
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{annonce.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{annonce.description}</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>📂 {annonce.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>💰 {annonce.budget.min}-{annonce.budget.max}€</span>
                        <span>⏱️ {annonce.deadline}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>👁️ {annonce.viewsCount} vues</span>
                        <span>💬 {annonce.responsesCount} réponses</span>
                      </div>
                    </div>
                    {annonce.flags && annonce.flags.length > 0 && (
                      <div className="pt-2 border-t border-orange-200">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span className="text-xs text-orange-600 font-medium">
                            {annonce.flags.length} flag{annonce.flags.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 3: DEMANDES FANS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Demandes fans
            <Badge variant="outline">{data.demands.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.demands.map((demand) => (
              <Card key={demand.id} className={demand.flags.length > 0 ? 'border-2 border-red-300' : ''}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Fan info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={demand.fanAvatar} />
                          <AvatarFallback>{demand.fanName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{demand.fanName}</p>
                          <p className="text-xs text-gray-500">
                            Budget: {demand.fanBudget.min}-{demand.fanBudget.max}€
                          </p>
                        </div>
                      </div>
                      {demand.myResponse && (
                        <Badge className={getResponseStatusBadge(demand.myResponse.status).className}>
                          {getResponseStatusBadge(demand.myResponse.status).label}
                        </Badge>
                      )}
                    </div>

                    {/* Request */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Demande:</p>
                      <p className="text-sm text-gray-900">{demand.requestMessage}</p>
                    </div>

                    {/* My response */}
                    {demand.myResponse ? (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-blue-700">Ma réponse:</p>
                          <div className="flex items-center gap-2 text-xs text-blue-700">
                            <span>€{demand.myResponse.price}</span>
                            <span>•</span>
                            <span>{demand.myResponse.deadline}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-900">{demand.myResponse.message}</p>
                        {demand.flags.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-red-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-600 font-medium">
                              {demand.flags.length} FLAG{demand.flags.length > 1 ? 'S' : ''} AI détecté{demand.flags.length > 1 ? 's' : ''}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto text-red-600"
                              onClick={() => {
                                setSelectedDemand(demand);
                                setShowBlockResponseModal(true);
                              }}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Bloquer réponse
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-yellow-700">⏳ Aucune réponse envoyée pour le moment</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('[DEMO] Navigation vers conversation')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Voir conversation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 4: COMMANDES ACTIVES (UNIFIED TABLE) */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commandes actives (unifiées)</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En production</SelectItem>
                  <SelectItem value="delivered">Livrées</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="disputed">Litiges</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Type</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Commande</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Fan acheteur</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Montant</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Date début</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Statut</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Délai</th>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const typeConfig = getOrderTypeBadge(order.type);
                  const statusConfig = getOrderStatusBadge(order.status);
                  const timeRemaining = calculateTimeRemaining(order.deliveryDeadline);

                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Badge className={typeConfig.className} variant="outline">
                          {typeConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-medium text-gray-900">{order.annonceTitle}</div>
                        <div className="text-xs text-gray-500">ID: {order.id}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={order.fanAvatar} />
                            <AvatarFallback>{order.fanName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.fanName}</div>
                            <div className="text-xs text-gray-500">ID: {order.fanId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-semibold text-gray-900">€{order.amount.toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-gray-700">
                          {new Date(order.startDate).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                        {order.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-700">{order.rating}/5</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {order.status === 'completed' ? (
                          <span className="text-sm text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
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
                            <DropdownMenuItem onClick={() => alert('[DEMO] Détails commande')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {(order.status === 'in_progress' || order.status === 'pending') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowMarkDeliveredModal(true);
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marquer livrée
                              </DropdownMenuItem>
                            )}
                            {order.status === 'disputed' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowResolveDisputeModal(true);
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
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 5: RÉPUTATION & ANALYTICS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métriques de performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm text-gray-600">Taux de complétion</p>
                  <p className="text-2xl font-bold text-gray-900">{data.reputation.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm text-gray-600">Délai moyen livraison</p>
                  <p className="text-2xl font-bold text-gray-900">{data.reputation.averageDeliveryTime} jours</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{data.reputation.satisfactionRate}%</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
              </div>
            </CardContent>
          </Card>

          {/* Ratings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Évolution notes (10 dernières)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.reputation.recentRatings.map((rating, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">{rating.orderId}</span>
                    <div className="flex-1 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(rating.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Derniers avis reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.reputation.recentReviews.map((review) => (
                <div key={review.orderId} className="pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={review.fanAvatar} />
                      <AvatarFallback>{review.fanName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{review.fanName}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(review.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 pl-11">{review.review}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {/* Modal Suspend Annonce */}
      <Dialog open={showSuspendAnnonceModal} onOpenChange={setShowSuspendAnnonceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Ban className="w-5 h-5" />
              Suspendre l'annonce
            </DialogTitle>
            <DialogDescription>
              ⚠️ Action administrative - Le créateur sera notifié
            </DialogDescription>
          </DialogHeader>

          {selectedAnnonce && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-gray-900 font-medium">{selectedAnnonce.title}</p>
                <p className="text-xs text-gray-600 mt-1">ID: {selectedAnnonce.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Raison de la suspension <span className="text-red-600">*</span>
                </label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous suspendez cette annonce (min 10 caractères)..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{suspendReason.length}/500</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendAnnonceModal(false);
                setSuspendReason('');
                setSelectedAnnonce(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendAnnonce}
              disabled={suspendReason.length < 10}
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspendre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Block Response */}
      <Dialog open={showBlockResponseModal} onOpenChange={setShowBlockResponseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Bloquer réponse frauduleuse
            </DialogTitle>
            <DialogDescription>
              ⚠️ Cette réponse sera bloquée et retirée
            </DialogDescription>
          </DialogHeader>

          {selectedDemand && selectedDemand.myResponse && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-gray-900 mb-1">
                  <strong>Réponse:</strong> €{selectedDemand.myResponse.price}
                </p>
                <p className="text-xs text-gray-600">{selectedDemand.myResponse.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Raison du blocage <span className="text-red-600">*</span>
                </label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette réponse est frauduleuse (min 10 caractères)..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{blockReason.length}/500</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="warnCreator"
                  checked={warnCreator}
                  onChange={(e) => setWarnCreator(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="warnCreator" className="text-sm text-gray-700">
                  Envoyer un avertissement au créateur
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowBlockResponseModal(false);
                setBlockReason('');
                setWarnCreator(false);
                setSelectedDemand(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockResponse}
              disabled={blockReason.length < 10}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Bloquer réponse
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Mark Delivered */}
      <Dialog open={showMarkDeliveredModal} onOpenChange={setShowMarkDeliveredModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Marquer comme livrée
            </DialogTitle>
            <DialogDescription>
              Action administrative - Le fan sera notifié
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-gray-900 font-medium">{selectedOrder.annonceTitle}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Fan: {selectedOrder.fanName} • €{selectedOrder.amount}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes de livraison (optionnel)
                </label>
                <Textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Notes administratives concernant la livraison..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{deliveryNotes.length}/1000</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowMarkDeliveredModal(false);
                setDeliveryNotes('');
                setSelectedOrder(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="default" onClick={handleMarkDelivered} className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer livrée
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Resolve Dispute */}
      <Dialog open={showResolveDisputeModal} onOpenChange={setShowResolveDisputeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Résoudre le litige
            </DialogTitle>
            <DialogDescription>
              Intervention administrative pour résoudre le différend
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 mb-1">
                  <strong>Commande:</strong> {selectedOrder.annonceTitle}
                </p>
                <p className="text-sm text-gray-900">
                  <strong>Fan:</strong> {selectedOrder.fanName} • <strong>Montant:</strong> €{selectedOrder.amount}
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
                    <SelectItem value="favor_fan">💰 Faveur fan (remboursement)</SelectItem>
                    <SelectItem value="favor_creator">✅ Faveur créateur (paiement validé)</SelectItem>
                    <SelectItem value="mediation">⚖️ Médiation (contacter les 2 parties)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(disputeResolution === 'mediation' || disputeResolution === 'favor_fan') && (
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
                  <p className="text-xs text-gray-500 mt-1">{messageFan.length}/1000</p>
                </div>
              )}

              {(disputeResolution === 'mediation' || disputeResolution === 'favor_creator') && (
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
                  <p className="text-xs text-gray-500 mt-1">{messageCreator.length}/1000</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDisputeModal(false);
                setMessageFan('');
                setMessageCreator('');
                setSelectedOrder(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleResolveDispute}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Résoudre litige
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Report Annonce */}
      <Dialog open={showReportAnnonceModal} onOpenChange={setShowReportAnnonceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Flag className="w-5 h-5" />
              Signaler un problème
            </DialogTitle>
            <DialogDescription>
              Signalement administratif d'un problème sur cette annonce
            </DialogDescription>
          </DialogHeader>

          {selectedAnnonce && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-900 font-medium">{selectedAnnonce.title}</p>
                <p className="text-xs text-gray-600 mt-1">ID: {selectedAnnonce.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type de problème <span className="text-red-600">*</span>
                </label>
                <Select value={reportIssueType} onValueChange={(value: any) => setReportIssueType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inappropriate_content">Contenu inapproprié</SelectItem>
                    <SelectItem value="misleading_info">Informations trompeuses</SelectItem>
                    <SelectItem value="pricing_issue">Problème de tarification</SelectItem>
                    <SelectItem value="violation_terms">Violation des conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sévérité <span className="text-red-600">*</span>
                </label>
                <Select value={reportSeverity} onValueChange={(value: any) => setReportSeverity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Faible</SelectItem>
                    <SelectItem value="medium">🟡 Moyenne</SelectItem>
                    <SelectItem value="high">🟠 Élevée</SelectItem>
                    <SelectItem value="critical">🔴 Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Détails <span className="text-red-600">*</span>
                </label>
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Décrivez le problème en détail (min 20 caractères)..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{reportDetails.length}/1000</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowReportAnnonceModal(false);
                setReportDetails('');
                setSelectedAnnonce(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportAnnonce}
              disabled={reportDetails.length < 20}
            >
              <Flag className="w-4 h-4 mr-2" />
              Signaler
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DEMO Badge */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            🎭 <strong>MODE DÉMO :</strong> Les actions administratives (suspendre, bloquer, résoudre) ne modifient pas réellement les données. Les modals affichent des alertes pour simulation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
