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
import { Users, UserPlus, UserCheck, UserX, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  useUserAnalytics,
  type PeriodType,
  type ComparisonType,
} from '@/hooks/useAnalyticsReports';

interface Props {
  period: PeriodType;
  comparison: ComparisonType;
  refreshKey: number;
}

const ROLE_COLORS = {
  creator: '#00B8A9',
  fan: '#F48E5D',
  admin: '#6C63FF',
};

export function UsersTab({ period, comparison, refreshKey }: Props) {
  const { data, isLoading, isError } = useUserAnalytics({ period, comparison });

  const formatNumber = (num: number) => num.toLocaleString('fr-FR');

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
          <p className="text-sm mt-1">Impossible de récupérer les données utilisateurs.</p>
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

  const pieData = data.byRole.map((item) => ({
    name: item.role === 'creator' ? 'Créateurs' :
          item.role === 'fan' ? 'Fans' : 'Admins',
    value: item.count,
    color: ROLE_COLORS[item.role],
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Utilisateurs</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.total)}</div>
          {comparison !== 'none' && (
            <div className="flex items-center gap-1 mt-2">
              {getChangeIcon(data.growth)}
              <span className={`text-xs font-medium ${getChangeColor(data.growth)}`}>
                {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs période précédente</span>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Utilisateurs Actifs</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.active)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {((data.active / data.total) * 100).toFixed(1)}% du total
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Nouveaux Utilisateurs</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatNumber(data.new)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {((data.new / data.total) * 100).toFixed(1)}% du total
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Taux de Churn</div>
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{data.churn.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-2">
            {formatNumber(Math.round((data.churn / 100) * data.total))} utilisateurs
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Croissance des Utilisateurs
            {comparison !== 'none' && (
              <span className="text-sm text-muted-foreground font-normal ml-2">
                (avec comparaison)
              </span>
            )}
          </h3>
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
                dataKey="total"
                stroke="#00B8A9"
                fill="#00B8A9"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={1.5}
                name="Actifs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Users by Role */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par Rôle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${(((entry.value as number) / data.total) * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
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

        {/* New Users Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nouveaux Utilisateurs</h3>
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
              <Bar dataKey="new" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Geography Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition Géographique</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.geography.map((geo, index) => (
              <div
                key={geo.country}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={index < 3 ? 'default' : 'outline'}>
                    {geo.code}
                  </Badge>
                  <span className="font-medium text-sm">{geo.country}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatNumber(geo.users)}</div>
                  <div className="text-xs text-muted-foreground">{geo.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Retention Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analyse de Rétention par Cohorte</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-semibold">Cohorte</th>
                <th className="text-center p-3 font-semibold">Période 0</th>
                <th className="text-center p-3 font-semibold">Période 1</th>
                <th className="text-center p-3 font-semibold">Période 2</th>
                <th className="text-center p-3 font-semibold">Période 3</th>
                <th className="text-center p-3 font-semibold">Période 4</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from(new Set(data.retention.map(r => r.cohort))).map((cohort) => {
                const cohortData = data.retention.filter(r => r.cohort === cohort);
                return (
                  <tr key={cohort} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{cohort}</td>
                    {[0, 1, 2, 3, 4].map((period) => {
                      const periodData = cohortData.find(d => d.period === period);
                      const rate = periodData?.rate || 0;
                      const color = rate >= 70 ? 'bg-green-100 text-green-800' :
                                   rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                   rate >= 30 ? 'bg-orange-100 text-orange-800' :
                                   'bg-red-100 text-red-800';
                      return (
                        <td key={period} className="p-3 text-center">
                          {periodData ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${color}`}>
                              {rate.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
