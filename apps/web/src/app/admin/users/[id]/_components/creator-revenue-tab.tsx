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
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Eye,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  CreatorRevenue,
  CreatorSubscriber,
} from '../_types/creator-types';
import { useCreatorRevenue } from '../_hooks/useCreatorData';
import { toast } from 'sonner';

interface CreatorRevenueTabProps {
  userId: string;
}

export function CreatorRevenueTab({ userId }: CreatorRevenueTabProps) {
  // ========================================
  // 1️⃣ TOUS LES HOOKS EN PREMIER
  // ========================================

  // États pour la recherche, les filtres, le tri et la pagination (ABONNEMENTS)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // États pour la recherche, les filtres, le tri et la pagination (PAIEMENTS)
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [paymentSortBy, setPaymentSortBy] = useState('date-desc');
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);

  // Fetch revenue data
  const { data: revenueData, isLoading, error } = useCreatorRevenue(userId);

  // Logique de filtrage, tri et pagination avec useMemo
  const filteredAndSortedSubscribers = useMemo(() => {
    const activeSubscribers = revenueData?.activeSubscribers || [];
    let result = [...activeSubscribers];

    // 1. Filtrer par recherche (nom OU email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (sub) =>
          sub.fanName.toLowerCase().includes(query) ||
          sub.fanEmail.toLowerCase().includes(query)
      );
    }

    // 2. Filtrer par plan
    if (selectedPlan !== 'all') {
      result = result.filter((sub) => sub.plan === selectedPlan);
    }

    // 3. Trier selon le critère choisi
    switch (sortBy) {
      case 'date-desc':
        result.sort(
          (a, b) => b.subscribedSince.getTime() - a.subscribedSince.getTime()
        );
        break;
      case 'date-asc':
        result.sort(
          (a, b) => a.subscribedSince.getTime() - b.subscribedSince.getTime()
        );
        break;
      case 'price-desc':
        result.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
        break;
      case 'price-asc':
        result.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
        break;
      case 'name-asc':
        result.sort((a, b) => a.fanName.localeCompare(b.fanName));
        break;
      default:
        break;
    }

    return result;
  }, [revenueData?.activeSubscribers, searchQuery, selectedPlan, sortBy]);

  // Mock payment history data
  const paymentHistory = [
    {
      id: '1',
      date: new Date('2025-10-28'),
      type: 'subscription',
      amount: 19.99,
      status: 'paid',
      description: 'Abonnement VIP - Sophie Martin',
    },
    {
      id: '2',
      date: new Date('2025-10-27'),
      type: 'tip',
      amount: 5.0,
      status: 'paid',
      description: 'Tip de Thomas Dupont',
    },
    {
      id: '3',
      date: new Date('2025-10-25'),
      type: 'ppv',
      amount: 14.99,
      status: 'paid',
      description: 'Contenu PPV - Laura Bernard',
    },
    {
      id: '4',
      date: new Date('2025-10-23'),
      type: 'marketplace',
      amount: 25.0,
      status: 'pending',
      description: 'Commission marketplace - Marc Petit',
    },
    {
      id: '5',
      date: new Date('2025-10-22'),
      type: 'subscription',
      amount: 49.99,
      status: 'paid',
      description: 'Abonnement Premium - Julie Rousseau',
    },
    {
      id: '6',
      date: new Date('2025-10-20'),
      type: 'tip',
      amount: 10.0,
      status: 'paid',
      description: 'Tip de Emma Garcia',
    },
    {
      id: '7',
      date: new Date('2025-10-18'),
      type: 'ppv',
      amount: 9.99,
      status: 'paid',
      description: 'Contenu PPV - Alex Martin',
    },
    {
      id: '8',
      date: new Date('2025-10-15'),
      type: 'subscription',
      amount: 9.99,
      status: 'paid',
      description: 'Abonnement Basic - Claire Dubois',
    },
    {
      id: '9',
      date: new Date('2025-10-12'),
      type: 'marketplace',
      amount: 35.0,
      status: 'paid',
      description: 'Commission marketplace - Paul Moreau',
    },
    {
      id: '10',
      date: new Date('2025-10-10'),
      type: 'tip',
      amount: 15.0,
      status: 'failed',
      description: 'Tip de Sarah Laurent',
    },
  ];

  // Logique de filtrage, tri et pagination pour les paiements
  const filteredAndSortedPayments = useMemo(() => {
    let result = [...paymentHistory];

    // 1. Filtrer par recherche (montant OU type)
    if (paymentSearchQuery.trim()) {
      const query = paymentSearchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.amount.toString().includes(query) ||
          payment.type.toLowerCase().includes(query) ||
          payment.description.toLowerCase().includes(query)
      );
    }

    // 2. Filtrer par type
    if (selectedPaymentType !== 'all') {
      result = result.filter((payment) => payment.type === selectedPaymentType);
    }

    // 3. Filtrer par statut
    if (selectedPaymentStatus !== 'all') {
      result = result.filter((payment) => payment.status === selectedPaymentStatus);
    }

    // 4. Trier selon le critère choisi
    switch (paymentSortBy) {
      case 'date-desc':
        result.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'amount-desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
      default:
        break;
    }

    return result;
  }, [paymentSearchQuery, selectedPaymentType, selectedPaymentStatus, paymentSortBy]);

  // ========================================
  // 2️⃣ VARIABLES ET CONSTANTES
  // ========================================
  const ITEMS_PER_PAGE = 10;
  const PAYMENTS_PER_PAGE = 10;

  // Extract data with safe defaults
  const revenue = revenueData?.revenue || {
    totalEarnings: 0,
    currentMonthEarnings: 0,
    monthlyRecurring: 0,
    breakdown: {
      subscriptions: 0,
      tips: 0,
      ppv: 0,
      marketplace: 0,
      total: 0,
    },
    subscriptionPlans: {
      basic: { price: 0, count: 0 },
      vip: { price: 0, count: 0 },
      premium: { price: 0, count: 0 },
    },
  };

  const activeSubscribers = revenueData?.activeSubscribers || [];

  // Calcul de la pagination
  const totalFilteredSubscribers = filteredAndSortedSubscribers.length;
  const totalPages = Math.ceil(totalFilteredSubscribers / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubscribers = filteredAndSortedSubscribers.slice(
    startIndex,
    endIndex
  );

  // Réinitialiser la page si elle est hors limite
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  // Calcul de la pagination pour les paiements
  const totalFilteredPayments = filteredAndSortedPayments.length;
  const totalPaymentPages = Math.ceil(totalFilteredPayments / PAYMENTS_PER_PAGE);
  const paymentStartIndex = (paymentCurrentPage - 1) * PAYMENTS_PER_PAGE;
  const paymentEndIndex = paymentStartIndex + PAYMENTS_PER_PAGE;
  const paginatedPayments = filteredAndSortedPayments.slice(
    paymentStartIndex,
    paymentEndIndex
  );

  // Réinitialiser la page des paiements si elle est hors limite
  if (paymentCurrentPage > totalPaymentPages && totalPaymentPages > 0) {
    setPaymentCurrentPage(1);
  }

  // ========================================
  // 3️⃣ CONDITIONS ET EARLY RETURNS
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des revenus</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // Helper function to safely calculate percentage
  const safePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const handleViewSubscriber = (subscriberId: string, fanId: string) => {
    console.log('👤 [SUBSCRIBER] Viewing subscriber:', { subscriberId, fanId });
    toast.info(`Ouverture profil fan ${fanId}`);
    // TODO: Navigation vers profil fan
  };

  const handleCancelSubscription = async (subscriberId: string, fanName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir annuler l'abonnement de ${fanName} ?\n\nCette action est irréversible.`
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

  const getSubscriptionPlanBadge = (plan: string) => {
    const config = {
      basic: { label: 'Basic', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      vip: { label: 'VIP', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      premium: { label: 'Premium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    };
    return config[plan as keyof typeof config] || config.basic;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      paid: { label: 'Payé', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      pending: { label: 'En attente', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: Clock },
      failed: { label: 'Échoué', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getPaymentTypeBadge = (type: string) => {
    const config = {
      subscription: { label: 'Abonnement', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      tip: { label: 'Tip', className: 'bg-pink-50 text-pink-700 border-pink-200' },
      ppv: { label: 'PPV', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      marketplace: { label: 'Marketplace', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    };
    return config[type as keyof typeof config] || config.subscription;
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 3 CARTES KPI PRINCIPALES */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-3xl font-bold text-gray-900">€{(revenue?.totalEarnings || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Depuis création</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus mois en cours</p>
                <p className="text-3xl font-bold text-gray-900">€{(revenue?.currentMonthEarnings || 0).toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% vs mois dernier
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Recurring */}
        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus récurrents (MRR)</p>
                <p className="text-3xl font-bold text-gray-900">€{(revenue?.monthlyRecurring || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(revenue?.subscriptionPlans?.basic?.count || 0) + (revenue?.subscriptionPlans?.vip?.count || 0) + (revenue?.subscriptionPlans?.premium?.count || 0)} abonnés
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* RÉPARTITION DES REVENUS (4 CARTES) */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des revenus (mois en cours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Abonnements</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">€{(revenue?.breakdown?.subscriptions || 0).toFixed(2)}</p>
              <p className="text-xs text-blue-700 mt-1">
                {safePercentage(revenue?.breakdown?.subscriptions || 0, revenue?.breakdown?.total || 0)}% du total
              </p>
            </div>

            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-pink-900">Tips</span>
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-pink-900">€{(revenue?.breakdown?.tips || 0).toFixed(2)}</p>
              <p className="text-xs text-pink-700 mt-1">
                {safePercentage(revenue?.breakdown?.tips || 0, revenue?.breakdown?.total || 0)}% du total
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">PPV</span>
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">€{(revenue?.breakdown?.ppv || 0).toFixed(2)}</p>
              <p className="text-xs text-purple-700 mt-1">
                {safePercentage(revenue?.breakdown?.ppv || 0, revenue?.breakdown?.total || 0)}% du total
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">Marketplace</span>
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900">€{(revenue?.breakdown?.marketplace || 0).toFixed(2)}</p>
              <p className="text-xs text-orange-700 mt-1">
                {safePercentage(revenue?.breakdown?.marketplace || 0, revenue?.breakdown?.total || 0)}% du total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* TABLEAU ABONNEMENTS ACTIFS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Abonnements actifs</CardTitle>
            <Badge variant="outline">
              {searchQuery || selectedPlan !== 'all'
                ? `${totalFilteredSubscribers} résultat${totalFilteredSubscribers > 1 ? 's' : ''}`
                : `${activeSubscribers.length} abonné${activeSubscribers.length > 1 ? 's' : ''}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de filtres */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un abonné (nom ou email)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Filtre par plan */}
              <Select
                value={selectedPlan}
                onValueChange={(value) => {
                  setSelectedPlan(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (récent)</SelectItem>
                  <SelectItem value="date-asc">Date (ancien)</SelectItem>
                  <SelectItem value="price-desc">Prix (élevé)</SelectItem>
                  <SelectItem value="price-asc">Prix (faible)</SelectItem>
                  <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Fan</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Prix/mois</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Depuis</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Prochain paiement</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscribers.map((subscriber: CreatorSubscriber) => {
                  const planBadge = getSubscriptionPlanBadge(subscriber.plan || 'basic');
                  return (
                    <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
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
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {subscriber.nextRenewal.toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSubscriber(subscriber.id, subscriber.fanId)}
                          >
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelSubscription(subscriber.id, subscriber.fanName)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {paginatedSubscribers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery || selectedPlan !== 'all'
                  ? 'Aucun abonné trouvé avec ces critères'
                  : 'Aucun abonné actif'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalFilteredSubscribers > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Affichage de {startIndex + 1}-{Math.min(endIndex, totalFilteredSubscribers)} sur {totalFilteredSubscribers} abonné{totalFilteredSubscribers > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400 px-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* TABLEAU HISTORIQUE DES PAIEMENTS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des paiements</CardTitle>
            <Badge variant="outline">
              {paymentSearchQuery || selectedPaymentType !== 'all' || selectedPaymentStatus !== 'all'
                ? `${totalFilteredPayments} résultat${totalFilteredPayments > 1 ? 's' : ''}`
                : `${paymentHistory.length} paiement${paymentHistory.length > 1 ? 's' : ''}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de filtres */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={paymentSearchQuery}
                  onChange={(e) => {
                    setPaymentSearchQuery(e.target.value);
                    setPaymentCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Filtre par type */}
              <Select
                value={selectedPaymentType}
                onValueChange={(value) => {
                  setSelectedPaymentType(value);
                  setPaymentCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="subscription">Abonnement</SelectItem>
                  <SelectItem value="tip">Tip</SelectItem>
                  <SelectItem value="ppv">PPV</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre par statut */}
              <Select
                value={selectedPaymentStatus}
                onValueChange={(value) => {
                  setSelectedPaymentStatus(value);
                  setPaymentCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select
                value={paymentSortBy}
                onValueChange={(value) => {
                  setPaymentSortBy(value);
                  setPaymentCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (récent)</SelectItem>
                  <SelectItem value="date-asc">Date (ancien)</SelectItem>
                  <SelectItem value="amount-desc">Montant (élevé)</SelectItem>
                  <SelectItem value="amount-asc">Montant (faible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => {
                  const typeBadge = getPaymentTypeBadge(payment.type);
                  const statusBadge = getPaymentStatusBadge(payment.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {payment.date.toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={typeBadge.className}>
                          {typeBadge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">€{payment.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={statusBadge.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {paginatedPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {paymentSearchQuery || selectedPaymentType !== 'all' || selectedPaymentStatus !== 'all'
                  ? 'Aucun paiement trouvé avec ces critères'
                  : 'Aucun paiement enregistré'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalFilteredPayments > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Affichage de {paymentStartIndex + 1}-{Math.min(paymentEndIndex, totalFilteredPayments)} sur {totalFilteredPayments} paiement{totalFilteredPayments > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={paymentCurrentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPaymentPages) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPaymentPages <= 5) {
                      pageNumber = i + 1;
                    } else if (paymentCurrentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (paymentCurrentPage >= totalPaymentPages - 2) {
                      pageNumber = totalPaymentPages - 4 + i;
                    } else {
                      pageNumber = paymentCurrentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={paymentCurrentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentCurrentPage(pageNumber)}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  {totalPaymentPages > 5 && paymentCurrentPage < totalPaymentPages - 2 && (
                    <>
                      <span className="text-gray-400 px-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentCurrentPage(totalPaymentPages)}
                        className="w-10"
                      >
                        {totalPaymentPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentCurrentPage((p) => Math.min(totalPaymentPages, p + 1))}
                  disabled={paymentCurrentPage === totalPaymentPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
