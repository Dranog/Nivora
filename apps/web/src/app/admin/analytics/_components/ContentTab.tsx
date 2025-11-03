'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FileText, Eye, Heart, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  useContentAnalytics,
  type PeriodType,
  type ComparisonType,
} from '@/hooks/useAnalyticsReports';
import { formatEuro } from '@/lib/formatters';

interface Props {
  period: PeriodType;
  comparison: ComparisonType;
  refreshKey: number;
}

export function ContentTab({ period, comparison, refreshKey }: Props) {
  const { data, isLoading, isError } = useContentAnalytics({ period, comparison });

  const formatNumber = (num: number) => num.toLocaleString('fr-FR');
  const formatCurrency = (value: number) => formatEuro(value);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm mt-1">Impossible de récupérer les données de contenu.</p>
        </div>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Publications</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.totalPosts)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            Moy. {data.performance.avgViewsPerPost.toFixed(0)} vues/post
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Vues</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.totalViews)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            Max. {formatNumber(data.performance.mostViewed)} vues
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Engagement Total</div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.totalEngagement)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            Max. {formatNumber(data.performance.mostEngaged)} engagements
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Taux d'Engagement</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{data.avgEngagementRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-2">
            Moy. {data.performance.avgEngagementPerPost.toFixed(0)} eng./post
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Creation Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Création de Contenu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR');
                }}
              />
              <Area
                type="monotone"
                dataKey="posts"
                stroke="#00B8A9"
                fill="#00B8A9"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Publications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Views Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des Vues</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR');
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6C63FF"
                strokeWidth={2}
                dot={{ fill: '#6C63FF', r: 4 }}
                name="Vues"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution de l'Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR');
                }}
              />
              <Bar dataKey="engagement" fill="#F48E5D" radius={[4, 4, 0, 0]} name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Content by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Par Type de Contenu</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.byType.map((type, index) => (
              <div
                key={type.type}
                className="p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'outline'}>
                      {type.type}
                    </Badge>
                    <span className="text-sm font-medium">{formatNumber(type.count)} posts</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(type.views)} vues
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-start to-brand-end h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(type.engagement / data.totalEngagement) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatNumber(type.engagement)} engagements
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Publications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-3 font-semibold">Rang</th>
                <th className="text-left p-3 font-semibold">Titre</th>
                <th className="text-left p-3 font-semibold">Créateur</th>
                <th className="text-right p-3 font-semibold">Vues</th>
                <th className="text-right p-3 font-semibold">Engagement</th>
                <th className="text-right p-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.topPosts.map((post, index) => (
                <tr key={post.id} className="hover:bg-muted/20">
                  <td className="p-3">
                    <Badge
                      variant={
                        index === 0 ? 'default' :
                        index === 1 ? 'secondary' : 'outline'
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="font-medium max-w-xs truncate" title={post.title}>
                      {post.title}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{post.creator}</td>
                  <td className="p-3 text-right font-medium">
                    {formatNumber(post.views)}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatNumber(post.engagement)}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(post.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="text-sm text-muted-foreground mb-1">Vues Max</div>
          <div className="text-2xl font-bold">{formatNumber(data.performance.mostViewed)}</div>
          <div className="text-xs text-muted-foreground mt-1">sur une publication</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-pink-500">
          <div className="text-sm text-muted-foreground mb-1">Engagement Max</div>
          <div className="text-2xl font-bold">{formatNumber(data.performance.mostEngaged)}</div>
          <div className="text-xs text-muted-foreground mt-1">sur une publication</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="text-sm text-muted-foreground mb-1">Moy. Vues/Post</div>
          <div className="text-2xl font-bold">{data.performance.avgViewsPerPost.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">performance moyenne</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="text-sm text-muted-foreground mb-1">Moy. Engagement/Post</div>
          <div className="text-2xl font-bold">{data.performance.avgEngagementPerPost.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">performance moyenne</div>
        </Card>
      </div>
    </div>
  );
}
