'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  CreditCard,
  DollarSign,
  Download,
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ShoppingBag,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useFanTransactions, useFanPaymentMethods, useFanSpending } from '../_hooks/useFanData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { adminToasts } from '@/lib/toasts';

interface FanFinancesTabProps {
  userId: string;
}

export function FanFinancesTab({ userId }: FanFinancesTabProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'subscriptions' | 'tips' | 'ppv'>('all');
  const [isRefunding, setIsRefunding] = useState(false);

  const { data: transactions, isLoading: isLoadingTransactions, error: transactionsError } = useFanTransactions(userId);
  const { data: paymentMethods, isLoading: isLoadingPayments } = useFanPaymentMethods(userId);
  const { data: spending, isLoading: isLoadingSpending } = useFanSpending(userId);

  const isLoading = isLoadingTransactions || isLoadingPayments || isLoadingSpending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des finances</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const handleDownloadInvoice = (invoiceUrl: string, transactionId: string) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
      console.log('Facture ouverte dans un nouvel onglet');
    } else {
      console.log('Téléchargement de la facture...');
      // TODO: Implement invoice download
    }
  };

  const handleRefundTransaction = async (transactionId: string, amount: number) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir rembourser cette transaction de €${amount.toFixed(2)} ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsRefunding(true);

    try {
      // TODO: Call refund API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      adminToasts.transactions.refunded();
    } catch (error) {
      adminToasts.transactions.refundFailed();
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: 'Complété', className: 'bg-green-50 text-green-700 border-green-200' },
      pending: { label: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      failed: { label: 'Échoué', className: 'bg-red-50 text-red-700 border-red-200' },
      refunded: { label: 'Remboursé', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    return config[status as keyof typeof config] || config.completed;
  };

  const getMarketplaceStatusBadge = (status: string) => {
    const config = {
      completed: { label: 'Terminée', variant: 'default' as const },
      in_progress: { label: 'En cours', variant: 'secondary' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const },
      refunded: { label: 'Remboursée', variant: 'outline' as const },
    };
    return config[status as keyof typeof config] || config.completed;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      subscription: 'Abonnement',
      tip: 'Tip',
      ppv: 'PPV',
      refund: 'Remboursement',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleViewMarketplaceTransaction = (transaction: any) => {
    console.log('Détails de la transaction marketplace');
    // TODO: Open transaction detail modal
  };

  // Compute derived data from transactions
  const subscriptions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter((t) => t.type === 'SUBSCRIPTION')
      .map((t) => ({
        id: t.id,
        creatorName: t.description?.split(' - ')[0] || 'Créateur',
        creatorHandle: t.description?.toLowerCase().replace(/\s/g, '') || 'creator',
        creatorAvatar: '',
        amount: t.amount,
        status: t.status === 'COMPLETED' ? 'active' : 'cancelled',
        startDate: new Date(t.createdAt),
        nextBilling: new Date(new Date(t.createdAt).setMonth(new Date(t.createdAt).getMonth() + 1)),
        plan: 'Mensuel',
      }));
  }, [transactions]);

  const tips = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter((t) => t.type === 'TIP')
      .map((t) => ({
        id: t.id,
        creatorName: t.description?.split(' - ')[0] || 'Créateur',
        creatorAvatar: '',
        amount: t.amount,
        date: new Date(t.createdAt),
      }));
  }, [transactions]);

  const marketplaceTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter((t) => t.type === 'MARKETPLACE')
      .map((t) => ({
        id: t.id,
        annonceId: t.id,
        annonceTitle: t.description || 'Commande marketplace',
        creatorUsername: t.description?.split(' - ')[0] || 'Créateur',
        amount: t.amount,
        status: t.status?.toLowerCase() || 'completed',
        date: new Date(t.createdAt),
        deliveryDate: null,
      }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (selectedTab === 'all') return transactions;
    return transactions.filter((t) =>
      t.type?.toLowerCase() === selectedTab ||
      (selectedTab === 'subscriptions' && (t.type?.toLowerCase() === 'subscription'))
    );
  }, [transactions, selectedTab]);

  const monthlyAverage = useMemo(() => {
    if (!spending?.byMonth || spending.byMonth.length === 0) return 0;
    const total = spending.byMonth.reduce((sum, m) => sum + m.total, 0);
    return total / spending.byMonth.length;
  }, [spending]);

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total dépensé</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  €{(spending?.totalSpent || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Moyenne mensuelle</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  €{monthlyAverage.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Sur 6 mois</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Abonnements actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {subscriptions.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  €
                  {subscriptions
                    .filter((s) => s.status === 'active')
                    .reduce((sum, s) => sum + s.amount, 0)
                    .toFixed(2)}
                  /mois
                </p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements actifs</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.filter((sub) => sub.status === 'active').length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun abonnement actif</p>
          ) : (
            <div className="space-y-4">
              {subscriptions
                .filter((sub) => sub.status === 'active')
                .map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={sub.creatorAvatar} />
                      <AvatarFallback>{sub.creatorName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{sub.creatorName}</p>
                      <p className="text-sm text-gray-500">@{sub.creatorHandle}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Depuis le {sub.startDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">€{sub.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{sub.plan}</p>
                    {sub.nextBilling && (
                      <p className="text-xs text-gray-400 mt-1">
                        Prochain: {sub.nextBilling.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tips envoyés</CardTitle>
        </CardHeader>
        <CardContent>
          {tips.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun tip envoyé</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total tips</p>
                    <p className="text-3xl font-bold text-gray-900">
                      €{tips.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{tips.length} tips envoyés</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {tips.slice(0, 3).map((tip) => (
                <div key={tip.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={tip.creatorAvatar} />
                      <AvatarFallback>{tip.creatorName[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm text-gray-900">{tip.creatorName}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{tip.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tip.date.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Marketplace */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <CardTitle>Transactions Marketplace</CardTitle>
            </div>
            <Badge variant="outline">{marketplaceTransactions.length} transactions</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Commandes passées via le marketplace de créateurs
          </p>
        </CardHeader>
        <CardContent>
          {marketplaceTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune transaction marketplace
            </p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Annonce
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Créateur
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {marketplaceTransactions.map((transaction) => {
                  const statusConfig = getMarketplaceStatusBadge(transaction.status);
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900">
                            {transaction.annonceTitle}
                          </span>
                          <span className="text-xs text-gray-500">ID: {transaction.annonceId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{transaction.creatorUsername}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          €{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </span>
                          {transaction.deliveryDate && (
                            <span className="text-xs text-gray-500">
                              Livraison: {new Date(transaction.deliveryDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMarketplaceTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
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

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des transactions</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('all')}
              >
                Toutes
              </Button>
              <Button
                variant={selectedTab === 'subscriptions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('subscriptions')}
              >
                Abonnements
              </Button>
              <Button
                variant={selectedTab === 'tips' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('tips')}
              >
                Tips
              </Button>
              <Button
                variant={selectedTab === 'ppv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('ppv')}
              >
                PPV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune transaction trouvée
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Créateur</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Montant</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 15).map((tx) => {
                    const statusConfig = getStatusBadge(tx.status || 'completed');
                    const txDate = typeof tx.createdAt === 'string' ? new Date(tx.createdAt) : tx.createdAt;
                    return (
                      <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {txDate instanceof Date && !isNaN(txDate.getTime())
                            ? txDate.toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(tx.type || '')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{tx.description || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {tx.description?.split(' - ')[0] || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          €{(tx.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice('', tx.id)}
                              title="Télécharger la facture"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {tx.status === 'COMPLETED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefundTransaction(tx.id, tx.amount)}
                                disabled={isRefunding}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Rembourser"
                              >
                                <span className="text-xs">💸</span>
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

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {!paymentMethods || paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucun moyen de paiement enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {pm.brand} **** {pm.last4}
                    </p>
                    {pm.expiryMonth && pm.expiryYear && (
                      <p className="text-sm text-gray-500">
                        Expire {pm.expiryMonth}/{pm.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
                {pm.isDefault && (
                  <Badge className="bg-green-50 text-green-700 border-green-200">Par défaut</Badge>
                )}
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
