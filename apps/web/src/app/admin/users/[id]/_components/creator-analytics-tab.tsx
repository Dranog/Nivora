'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  TrendingUp,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  FileText,
  Loader2,
  AlertTriangle,
  Image,
  Video,
  Globe,
} from 'lucide-react';
import { useCreatorAnalytics } from '../_hooks/useCreatorData';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorAnalyticsTabProps {
  userId: string;
}

export function CreatorAnalyticsTab({ userId }: CreatorAnalyticsTabProps) {
  const { data, isLoading, error } = useCreatorAnalytics(userId);

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des analytics</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // ============================================
  // EXTRACT DATA WITH DEFAULTS
  // ============================================
  const performance = data?.performance || {
    views: { total: 0, thisMonth: 0, trend: [] },
    likes: { total: 0, thisMonth: 0, trend: [] },
    comments: { total: 0, thisMonth: 0, trend: [] },
    shares: { total: 0, thisMonth: 0, trend: [] },
    engagementRate: 0,
  };

  const audience = data?.audience || {
    totalFollowers: 0,
    newFollowersThisMonth: 0,
    demographics: {
      age: [],
      gender: [],
      location: [],
    },
  };

  const content = data?.content || {
    totalPosts: 0,
    postsThisMonth: 0,
    averagePostsPerWeek: 0,
    mostEngagingType: 'VIDEO',
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getEngagementLevel = (rate: number) => {
    if (rate >= 10) return { label: 'Excellent', color: 'text-green-600' };
    if (rate >= 5) return { label: 'Bon', color: 'text-blue-600' };
    return { label: 'Moyen', color: 'text-orange-600' };
  };

  const engagementLevel = getEngagementLevel(performance?.engagementRate || 0);

  // ============================================
  // MOCK DATA - TOP 5 CONTENUS
  // ============================================
  const topContent = [
    {
      id: '1',
      title: 'Session photo exclusive en extérieur',
      type: 'Photo',
      views: 5420,
      likes: 892,
      date: '28/10/2025',
    },
    {
      id: '2',
      title: 'Nouvelle vidéo BTS du shooting',
      type: 'Vidéo',
      views: 4120,
      likes: 743,
      date: '25/10/2025',
    },
    {
      id: '3',
      title: 'Collection Printemps 2025',
      type: 'Galerie',
      views: 3870,
      likes: 654,
      date: '22/10/2025',
    },
    {
      id: '4',
      title: 'Live session Q&A avec les fans',
      type: 'Vidéo',
      views: 3240,
      likes: 587,
      date: '18/10/2025',
    },
    {
      id: '5',
      title: 'Aperçu nouvelle collaboration',
      type: 'Photo',
      views: 2980,
      likes: 512,
      date: '15/10/2025',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 4 CARTES KPI PRINCIPALES */}
      {/* ============================================ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Carte 1: Vues totales */}
        <Card className="border-l-4 border-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(performance?.views?.total || 0)}
            </div>
            <p className="text-xs text-green-600 font-medium mt-2">
              +{formatNumber(performance?.views?.thisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>

        {/* Carte 2: Taux d'engagement */}
        <Card className="border-l-4 border-purple-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;engagement</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {(performance?.engagementRate || 0).toFixed(1)}%
            </div>
            <p className={`text-xs font-medium mt-2 ${engagementLevel.color}`}>
              {engagementLevel.label}
            </p>
          </CardContent>
        </Card>

        {/* Carte 3: Abonnés actifs */}
        <Card className="border-l-4 border-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés actifs</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(audience?.totalFollowers || 0)}
            </div>
            <p className="text-xs text-green-600 font-medium mt-2">
              +{formatNumber(audience?.newFollowersThisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>

        {/* Carte 4: Contenus publiés */}
        <Card className="border-l-4 border-orange-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenus publiés</CardTitle>
            <FileText className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(content?.totalPosts || 0)}
            </div>
            <p className="text-xs text-green-600 font-medium mt-2">
              +{formatNumber(content?.postsThisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* TABLEAU TOP 5 CONTENUS POPULAIRES */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-600" />
            Top 5 contenus populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Titre
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Vues
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Likes
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {topContent.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.type === 'Photo'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.type === 'Vidéo'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }
                      >
                        {item.type === 'Photo' && <Image className="w-3 h-3 mr-1" />}
                        {item.type === 'Vidéo' && <Video className="w-3 h-3 mr-1" />}
                        {item.type === 'Galerie' && <FileText className="w-3 h-3 mr-1" />}
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(item.views)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ThumbsUp className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(item.likes)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">{item.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* STATISTIQUES D'ENGAGEMENT (3 CARTES) */}
      {/* ============================================ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes totaux</CardTitle>
            <ThumbsUp className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(performance?.likes?.total || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{formatNumber(performance?.likes?.thisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(performance?.comments?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{formatNumber(performance?.comments?.thisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partages</CardTitle>
            <Share2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(performance?.shares?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{formatNumber(performance?.shares?.thisMonth || 0)} ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* DÉMOGRAPHIE (3 COLONNES) */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-600" />
            Démographie de l&apos;audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Colonne 1: Par âge */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Par âge
              </h4>
              {(audience?.demographics?.age || []).length > 0 ? (
                <div className="space-y-2">
                  {(audience?.demographics?.age || []).slice(0, 5).map((ageGroup: { range: string; count: number }, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{ageGroup.range}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(ageGroup.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">Aucune donnée</div>
              )}
            </div>

            {/* Colonne 2: Par genre */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Par genre
              </h4>
              {(audience?.demographics?.gender || []).length > 0 ? (
                <div className="space-y-2">
                  {(audience?.demographics?.gender || []).map((gender: { type: string; count: number; percentage?: number }, index: number) => {
                    const total = (audience?.demographics?.gender || []).reduce((sum: number, g: any) => sum + g.count, 0);
                    const percentage = total > 0 ? Math.round((gender.count / total) * 100) : 0;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">{gender.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatNumber(gender.count)}
                          </span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">Aucune donnée</div>
              )}
            </div>

            {/* Colonne 3: Top 5 pays */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Top 5 pays
              </h4>
              {(audience?.demographics?.location || []).length > 0 ? (
                <div className="space-y-2">
                  {(audience?.demographics?.location || []).slice(0, 5).map((location: { country: string; count: number }, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{location.country}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(location.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">Aucune donnée</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* INFO BOX */}
      {/* ============================================ */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <TrendingUp className="h-4 w-4" />
            Mode démonstration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900">
            🎭 <strong>MODE DÉMO :</strong> Les données affichées sont générées automatiquement
            pour la démonstration. Les statistiques de performance, d&apos;engagement et
            d&apos;audience sont simulées.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
