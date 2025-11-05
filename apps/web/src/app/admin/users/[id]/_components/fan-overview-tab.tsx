'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Clock,
  Play,
  Crown,
  Euro,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  MapPin,
  Shield,
  Eye,
  Heart,
  MessageCircle,
  ShoppingCart,
  UserPlus,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useFanOverview, useFanReports, useFanWarnings } from '../_hooks/useFanData';
import { useUserDetail } from '../_hooks/useUserDetail';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FanOverviewTabProps {
  userId: string;
  onTabChange?: (tab: string) => void;
}

export function FanOverviewTab({ userId, onTabChange }: FanOverviewTabProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Fetch data using hooks
  const { user, isLoading: isLoadingUser } = useUserDetail(userId);
  const { data: overview, isLoading: isLoadingOverview, error: overviewError } = useFanOverview(userId);
  const { data: reports, isLoading: isLoadingReports } = useFanReports(userId);
  const { data: warnings, isLoading: isLoadingWarnings } = useFanWarnings(userId);

  const isLoading = isLoadingUser || isLoadingOverview || isLoadingReports || isLoadingWarnings;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (overviewError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des données</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!user || !overview) {
    return null;
  }

  const userDetails = user.user;

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      subscription: Crown,
      purchase: ShoppingCart,
      like: Heart,
      comment: MessageCircle,
      follow: UserPlus,
    };
    return icons[type as keyof typeof icons] || Eye;
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      toast.error('Veuillez saisir une note');
      return;
    }

    setIsSavingNote(true);
    console.log('📝 [SAVE NOTE] Saving note for user:', userId, newNote);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success('Note enregistrée avec succès');
      setNewNote('');
      console.log('✅ [SAVE NOTE] Note saved successfully');
    } catch (error) {
      console.error('❌ [SAVE NOTE] Error:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const navigateToTab = (tab: string) => {
    console.log('🔄 [NAVIGATION] Navigating to tab:', tab);
    if (onTabChange) {
      onTabChange(tab);
      toast.success(`Navigation vers l'onglet ${tab}`);
    } else {
      toast.info(`Navigation vers l'onglet ${tab} (handler non connecté)`);
    }
  };

  // Derived data
  const hasReports = (reports?.length || 0) > 0;
  const reportsCount = reports?.length || 0;
  const hasSanctions = (warnings?.length || 0) > 0 || userDetails.suspended || !!userDetails.bannedAt;

  return (
    <div className="space-y-6">
      {/* Stats clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Temps total</p>
              <Clock className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatWatchTime(overview.totalWatchTime)}</p>
            <p className="text-xs text-gray-500 mt-1">Temps de visionnage</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Vidéos vues</p>
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview.videosWatched}</p>
            <p className="text-xs text-gray-500 mt-1">Contenus visionnés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-pink-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Abonnements</p>
              <Crown className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview.activeSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">Créateurs suivis</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Total dépensé</p>
              <Euro className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">€{overview.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{userDetails.email}</p>
                    {userDetails.emailVerified && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 mt-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Membre depuis</p>
                    <p className="text-sm text-gray-900">
                      {formatDistanceToNow(new Date(userDetails.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Dernière connexion</p>
                    <p className="text-sm text-gray-900">
                      {userDetails.lastLoginAt
                        ? formatDistanceToNow(new Date(userDetails.lastLoginAt), { addSuffix: true, locale: fr })
                        : 'Jamais'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Statut</span>
                    <Badge
                      className={
                        userDetails.verified
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : userDetails.suspended || userDetails.bannedAt
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      {userDetails.bannedAt
                        ? 'Banni'
                        : userDetails.suspended
                        ? 'Suspendu'
                        : userDetails.verified
                        ? 'Vérifié'
                        : 'Actif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut & Alertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Statut & Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!hasSanctions && !hasReports && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Aucune sanction active</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Cet utilisateur a un bon comportement
                      </p>
                    </div>
                  </div>
                )}

                {hasSanctions && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {userDetails.bannedAt
                          ? 'Utilisateur banni'
                          : userDetails.suspended
                          ? 'Utilisateur suspendu'
                          : `${warnings?.length || 0} avertissement(s)`}
                      </p>
                      {userDetails.bannedReason && (
                        <p className="text-xs text-red-700 mt-1">Raison: {userDetails.bannedReason}</p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto text-red-700 hover:text-red-900"
                        onClick={() => navigateToTab('moderation')}
                      >
                        Voir les détails →
                      </Button>
                    </div>
                  </div>
                )}

                {warnings && warnings.length > 0 && !userDetails.bannedAt && !userDetails.suspended && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">{warnings.length} avertissement(s) actif(s)</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto text-yellow-700 hover:text-yellow-900"
                        onClick={() => navigateToTab('moderation')}
                      >
                        Voir les détails →
                      </Button>
                    </div>
                  </div>
                )}

                {hasReports && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">
                        {reportsCount} signalement(s) effectué(s)
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto text-orange-700 hover:text-orange-900"
                        onClick={() => navigateToTab('moderation')}
                      >
                        Consulter →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Abonnements actifs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Abonnements actifs
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => navigateToTab('finances')}
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.subscriptions && overview.subscriptions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 border border-purple-200 bg-purple-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-purple-600">
                        <AvatarImage src={sub.creatorAvatar || undefined} />
                        <AvatarFallback>{sub.creatorName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{sub.creatorName}</p>
                        <p className="text-xs text-gray-600">@{sub.creatorHandle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Depuis {new Date(sub.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-700">€{sub.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">par mois</p>
                    </div>
                  </div>
                ))}

                {(!overview.subscriptions || overview.subscriptions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Aucun abonnement actif</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité récente
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => navigateToTab('activite')}
                >
                  Tout voir
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {overview.recentActivity && overview.recentActivity.slice(0, 5).map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => navigateToTab('activite')}
                    >
                      <ActivityIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.label}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(!overview.recentActivity || overview.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes administratives (full width) - TODO: Backend endpoint needed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Notes internes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add new note */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ajouter une note interne sur cet utilisateur..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button
                onClick={handleSaveNote}
                disabled={isSavingNote || !newNote.trim()}
                className="w-full sm:w-auto"
              >
                {isSavingNote ? 'Enregistrement...' : 'Enregistrer la note'}
              </Button>
              <p className="text-xs text-gray-500">
                Note: La fonctionnalité de notes sera connectée au backend prochainement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
