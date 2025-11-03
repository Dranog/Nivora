'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Shield, Clock, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  useModerationAnalytics,
  type PeriodType,
  type ComparisonType,
} from '@/hooks/useAnalyticsReports';

interface Props {
  period: PeriodType;
  comparison: ComparisonType;
  refreshKey: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Spam': '#F44336',
  'Harassment': '#E91E63',
  'Inappropriate Content': '#9C27B0',
  'Fake Account': '#673AB7',
  'Copyright': '#3F51B5',
  'Other': '#9E9E9E',
};

const STATUS_COLORS = {
  pending: '#FFA726',
  reviewing: '#42A5F5',
  resolved: '#66BB6A',
  dismissed: '#9E9E9E',
};

export function ModerationTab({ period, comparison, refreshKey }: Props) {
  const { data, isLoading, isError } = useModerationAnalytics({ period, comparison });

  const formatNumber = (num: number) => num.toLocaleString('fr-FR');

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}j`;
  };

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
          <p className="text-sm mt-1">Impossible de récupérer les données de modération.</p>
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

  const categoryPieData = data.byCategory.map((item) => ({
    name: item.category,
    value: item.count,
    color: CATEGORY_COLORS[item.category] || '#9E9E9E',
  }));

  const statusPieData = data.byStatus.map((item) => ({
    name: item.status === 'pending' ? 'En attente' :
          item.status === 'reviewing' ? 'En cours' :
          item.status === 'resolved' ? 'Résolu' : 'Rejeté',
    value: item.count,
    color: STATUS_COLORS[item.status],
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Signalements</div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.totalReports)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {((data.resolved / data.totalReports) * 100).toFixed(1)}% résolus
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">En Attente</div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.pending)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {((data.pending / data.totalReports) * 100).toFixed(1)}% du total
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Résolus</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.resolved)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {((data.resolved / data.totalReports) * 100).toFixed(1)}% du total
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Temps de Réponse</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatDuration(data.avgResponseTime)}</div>
          <div className="text-xs text-muted-foreground mt-2">temps moyen</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des Signalements</h3>
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
              <Legend />
              <Bar dataKey="reports" fill="#F48E5D" radius={[4, 4, 0, 0]} name="Signalements" />
              <Bar dataKey="resolved" fill="#66BB6A" radius={[4, 4, 0, 0]} name="Résolus" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Response Time Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Temps de Réponse Moyen</h3>
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
                tickFormatter={(value) => formatDuration(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatDuration(value), 'Temps de réponse']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR');
                }}
              />
              <Line
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#00B8A9"
                strokeWidth={2}
                dot={{ fill: '#00B8A9', r: 4 }}
                name="Temps moyen"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Reports by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${(((entry.value as number) / data.totalReports) * 100).toFixed(1)}%`}
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Reports by Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${(((entry.value as number) / data.totalReports) * 100).toFixed(1)}%`}
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Moderator Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance des Modérateurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-3 font-semibold">Modérateur</th>
                <th className="text-right p-3 font-semibold">Signalements Résolus</th>
                <th className="text-right p-3 font-semibold">Temps Moyen</th>
                <th className="text-right p-3 font-semibold">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.moderatorStats.map((mod, index) => {
                const performance = mod.avgResponseTime < data.avgResponseTime ? 'Excellent' :
                                   mod.avgResponseTime < data.avgResponseTime * 1.5 ? 'Bon' :
                                   'À améliorer';
                const performanceColor = performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                                        performance === 'Bon' ? 'bg-blue-100 text-blue-800' :
                                        'bg-orange-100 text-orange-800';

                return (
                  <tr key={mod.id} className="hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${mod.id}`} />
                          <AvatarFallback>
                            {mod.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{mod.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatNumber(mod.resolved)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatDuration(mod.avgResponseTime)}
                    </td>
                    <td className="p-3 text-right">
                      <Badge className={performanceColor}>
                        {performance}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Détail par Catégorie</h3>
        <div className="space-y-4">
          {data.byCategory.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#9E9E9E' }}
                  ></div>
                  <span className="text-sm font-medium">{cat.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                  <span className="text-sm font-semibold">{formatNumber(cat.count)}</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[cat.category] || '#9E9E9E',
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
