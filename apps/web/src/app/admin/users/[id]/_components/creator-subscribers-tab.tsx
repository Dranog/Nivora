'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserMinus,
  Search,
  Mail,
  Eye,
  UserX,
  Calendar,
  DollarSign,
  Heart,
  MessageCircle,
  ThumbsUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { CreatorSubscriber, CreatorSubscriberStats, SubscriptionPlan, SubscriptionStatus } from '../_types/creator-types';
import { useCreatorSubscribers, useCreatorSubscriberStats } from '../_hooks/useCreatorData';
import { toast } from 'sonner';

interface CreatorSubscribersTabProps {
  userId: string;
}

export function CreatorSubscribersTab({ userId }: CreatorSubscribersTabProps) {
  // ========================================
  // ✅ SECTION 1 : TOUS LES HOOKS EN PREMIER
  // ========================================

  // Local state hooks
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Data hooks
  const { data: subscribers, isLoading: isLoadingSubs, error: subsError } = useCreatorSubscribers(userId);
  const { data: stats, isLoading: isLoadingStats } = useCreatorSubscriberStats(userId);

  // Memoized values
  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];

    let filtered = [...subscribers];

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter((s) => s.plan === planFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.fanName.toLowerCase().includes(query) ||
          s.fanEmail.toLowerCase().includes(query) ||
          s.fanId.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.subscribedSince.getTime() - a.subscribedSince.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.subscribedSince.getTime() - b.subscribedSince.getTime());
        break;
      case 'highest_paid':
        filtered.sort((a, b) => b.totalPaid - a.totalPaid);
        break;
      case 'name':
        filtered.sort((a, b) => a.fanName.localeCompare(b.fanName));
        break;
    }

    return filtered;
  }, [subscribers, planFilter, statusFilter, searchQuery, sortBy]);

  // ========================================
  // ✅ SECTION 2 : VARIABLES DÉRIVÉES
  // ========================================
  const isLoading = isLoadingSubs || isLoadingStats;

  console.log('👥 [CREATOR SUBSCRIBERS] Rendering subscribers tab');

  // ========================================
  // ✅ SECTION 3 : CONDITIONS ET EARLY RETURNS
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (subsError || !subscribers) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des abonnés</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // ========================================
  // ✅ SECTION 4 : FONCTIONS HANDLERS
  // ========================================
  const handleViewSubscriber = (subscriberId: string, fanId: string, fanName: string) => {
    console.log('👤 [SUBSCRIBER] Viewing fan profile:', { subscriberId, fanId });
    toast.info(`Ouverture profil fan : ${fanName}`);
    // TODO: Navigation vers profil fan
  };

  const handleSendMessage = (subscriberId: string, fanId: string, fanName: string) => {
    console.log('✉️ [MESSAGE] Sending message to fan:', { subscriberId, fanId });
    toast.info(`Envoi message à ${fanName}`);
    // TODO: Modal envoi message admin
  };

  const handleCancelSubscription = async (subscriberId: string, fanName: string, plan: string) => {
    const confirmed = window.confirm(
      `⚠️ Annuler l'abonnement ${plan.toUpperCase()} de ${fanName} ?\n\nCette action est irréversible et prendra effet immédiatement.`
    );

    if (!confirmed) {
      console.log('❌ [CANCEL SUB] User cancelled');
      return;
    }

    console.log('🚫 [CANCEL SUB] Cancelling subscription:', subscriberId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Abonnement de ${fanName} annulé avec succès`);
      console.log('✅ [CANCEL SUB] Subscription cancelled');
    } catch (error) {
      console.error('❌ [CANCEL SUB] Error:', error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    const config = {
      basic: { label: 'Basic', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      vip: { label: 'VIP', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      premium: { label: 'Premium', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    };
    return config[plan] || config.basic;
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const config = {
      active: { label: 'Actif', className: 'bg-green-50 text-green-700 border-green-200' },
      pending: { label: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      cancelled: { label: 'Annulé', className: 'bg-red-50 text-red-700 border-red-200' },
      expired: { label: 'Expiré', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    return config[status] || config.active;
  };

  // Mock chart data for last 6 months
  const evolutionData = [
    { month: 'Mai', nouveaux: 18, desabonnes: 12 },
    { month: 'Juin', nouveaux: 22, desabonnes: 8 },
    { month: 'Juil', nouveaux: 25, desabonnes: 15 },
    { month: 'Août', nouveaux: 20, desabonnes: 10 },
    { month: 'Sept', nouveaux: 28, desabonnes: 9 },
    { month: 'Oct', nouveaux: 12, desabonnes: 8 },
  ];

  // Mock top fans (engagement)
  const topFans = [
    {
      id: 'fan-001',
      name: 'Marc Dubois',
      avatar: '/avatars/fan-001.jpg',
      likes: 245,
      comments: 68,
      tips: 180.0,
      plan: 'premium' as SubscriptionPlan,
    },
    {
      id: 'fan-002',
      name: 'Sophie Martin',
      avatar: '/avatars/fan-002.jpg',
      likes: 198,
      comments: 52,
      tips: 125.0,
      plan: 'vip' as SubscriptionPlan,
    },
    {
      id: 'fan-003',
      name: 'Thomas Bernard',
      avatar: '/avatars/fan-003.jpg',
      likes: 176,
      comments: 45,
      tips: 200.0,
      plan: 'premium' as SubscriptionPlan,
    },
    {
      id: 'fan-004',
      name: 'Julie Petit',
      avatar: '/avatars/fan-004.jpg',
      likes: 154,
      comments: 38,
      tips: 95.0,
      plan: 'vip' as SubscriptionPlan,
    },
    {
      id: 'fan-005',
      name: 'Emma Rousseau',
      avatar: '/avatars/fan-005.jpg',
      likes: 142,
      comments: 34,
      tips: 110.0,
      plan: 'basic' as SubscriptionPlan,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abonnés actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscribers}</p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nouveaux ce mois</p>
                <p className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.5%
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Désabonnements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.unsubscribedThisMonth}</p>
                <p className="text-xs text-gray-500 mt-1">Ce mois</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <UserMinus className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux rétention</p>
                <p className="text-3xl font-bold text-gray-900">{stats.retentionRate}%</p>
                <p className="text-xs text-green-600 mt-1">Excellent</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Évolution abonnés (6 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evolutionData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{data.nouveaux}
                      </span>
                      <span className="text-red-600 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        -{data.desabonnes}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{ width: `${(data.nouveaux / 30) * 100}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-red-500"
                      style={{ width: `${(data.desabonnes / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Fans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Top Fans (engagement)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFans.map((fan, index) => {
                const planBadge = getPlanBadge(fan.plan);
                return (
                  <div
                    key={fan.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-transparent rounded-lg border border-pink-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-pink-600 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={fan.avatar} />
                        <AvatarFallback>{fan.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fan.name}</p>
                        <Badge className={`${planBadge.className} text-xs mt-1`}>{planBadge.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1" title="Likes">
                        <Heart className="w-3 h-3 text-pink-600" />
                        {fan.likes}
                      </div>
                      <div className="flex items-center gap-1" title="Commentaires">
                        <MessageCircle className="w-3 h-3 text-blue-600" />
                        {fan.comments}
                      </div>
                      <div className="flex items-center gap-1" title="Tips">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        {fan.tips}€
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <CardTitle>Liste des abonnés ({filteredSubscribers.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un abonné..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Plan Filter */}
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="highest_paid">Plus payé</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun abonné trouvé</p>
              <p className="text-sm text-gray-500 mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Fan</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Prix/mois</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Abonné depuis</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Dernier paiement</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Prochain renouvellement</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => {
                    const planBadge = getPlanBadge(subscriber.plan);
                    const statusBadge = getStatusBadge(subscriber.status);

                    return (
                      <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={subscriber.fanAvatar} />
                              <AvatarFallback>{subscriber.fanName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{subscriber.fanName}</p>
                              <p className="text-xs text-gray-500">{subscriber.fanEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={planBadge.className}>{planBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">€{subscriber.pricePerMonth}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {subscriber.subscribedSince.toLocaleDateString('fr-FR')}
                          </span>
                          <p className="text-xs text-gray-500">
                            Total payé: €{subscriber.totalPaid.toFixed(2)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {subscriber.lastPayment.toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {subscriber.nextRenewal.toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewSubscriber(subscriber.id, subscriber.fanId, subscriber.fanName)}
                              title="Voir profil fan"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendMessage(subscriber.id, subscriber.fanId, subscriber.fanName)}
                              title="Envoyer message"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {subscriber.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleCancelSubscription(subscriber.id, subscriber.fanName, subscriber.plan)
                                }
                                title="Annuler abonnement"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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
    </div>
  );
}
