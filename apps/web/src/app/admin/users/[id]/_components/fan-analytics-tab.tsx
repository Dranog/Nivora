'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Heart, MessageCircle, Share2, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFanAnalytics, useFanEngagement } from '../_hooks/useFanData';

interface FanAnalyticsTabProps {
  userId: string;
}

export function FanAnalyticsTab({ userId }: FanAnalyticsTabProps) {
  const { data: analytics, isLoading: isLoadingAnalytics, error: analyticsError } = useFanAnalytics(userId);
  const { data: engagement, isLoading: isLoadingEngagement } = useFanEngagement(userId);

  const isLoading = isLoadingAnalytics || isLoadingEngagement;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (analyticsError || !analytics) {
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
  const watchTime = analytics?.watchTime || { total: 0, byCategory: [], trend: [] };
  const engagementData = analytics?.engagement || {
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageEngagement: 0,
  };
  const engagementStats = engagement || {
    likes: { total: 0, thisMonth: 0, trend: [] },
    comments: { total: 0, thisMonth: 0, trend: [] },
    shares: { total: 0, thisMonth: 0, trend: [] },
    follows: { total: 0, thisMonth: 0 },
    engagementScore: 0,
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Temps total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatTime(watchTime.total || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{Math.floor((watchTime.total || 0) / 60)} heures</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-full">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Engagement</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(engagementData?.averageEngagement || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Taux moyen</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Likes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(engagementStats?.likes?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {engagementStats?.likes?.thisMonth || 0} ce mois
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-pink-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Commentaires</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(engagementStats?.comments?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {engagementStats?.comments?.thisMonth || 0} ce mois
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-full">
                <MessageCircle className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watch Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Temps de visionnage - 30 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          {(watchTime?.trend || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de tendance disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={watchTime.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#00B8A9"
                  strokeWidth={2}
                  name="Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories préférées</CardTitle>
          </CardHeader>
          <CardContent>
            {(watchTime?.byCategory || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
            ) : (
              <div className="space-y-3">
                {(watchTime?.byCategory || []).slice(0, 5).map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{cat.category}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatTime(cat.minutes || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactions Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-full">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Likes donnés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(engagementStats?.likes?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commentaires postés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(engagementStats?.comments?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Share2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Partages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(engagementStats?.shares?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances d'engagement</CardTitle>
        </CardHeader>
        <CardContent>
          {(engagementStats?.likes?.trend || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de tendance disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(engagementStats?.likes?.trend || []).slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#ec4899" name="Likes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <TrendingUp className="h-4 w-4" />
            Mode démonstration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900">
            🎭 <strong>MODE DÉMO :</strong> Les données affichées sont générées automatiquement pour la démonstration. Les statistiques d'engagement, de visionnage et d'interaction sont simulées.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
