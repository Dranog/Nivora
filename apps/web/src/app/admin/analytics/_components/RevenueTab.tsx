'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { DollarSign, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  useRevenueAnalytics,
  type PeriodType,
  type ComparisonType,
} from '@/hooks/useAnalyticsReports';
import { formatEuro } from '@/lib/formatters';

interface Props {
  period: PeriodType;
  comparison: ComparisonType;
  refreshKey: number;
}

const CATEGORY_COLORS = {
  subscription: '#00B8A9',
  ppv: '#F48E5D',
  tip: '#6C63FF',
  marketplace: '#FFB74D',
};

export function RevenueTab({ period, comparison, refreshKey }: Props) {
  const { data, isLoading, isError } = useRevenueAnalytics({ period, comparison });

  const formatCurrency = (value: number) => formatEuro(value);

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

  const pieData = useMemo(() => {
    if (!data) return [];
    return data.byType.map((item) => ({
      name: item.type === 'subscription' ? 'Abonnements' :
            item.type === 'ppv' ? 'PPV' :
            item.type === 'tip' ? 'Pourboires' : 'Marketplace',
      value: item.amount,
      color: CATEGORY_COLORS[item.type],
    }));
  }, [data]);

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm mt-1">Impossible de récupérer les données de revenue.</p>
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
            <div className="text-sm text-muted-foreground">Revenue Total</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(data.total)}</div>
          {comparison !== 'none' && (
            <div className="flex items-center gap-1 mt-2">
              {getChangeIcon(data.changePercent)}
              <span className={`text-xs font-medium ${getChangeColor(data.changePercent)}`}>
                {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs période précédente</span>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Abonnements</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(data.byType.find(t => t.type === 'subscription')?.amount || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {formatNumber(data.byType.find(t => t.type === 'subscription')?.count || 0)} transactions
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">PPV</div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(data.byType.find(t => t.type === 'ppv')?.amount || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {formatNumber(data.byType.find(t => t.type === 'ppv')?.count || 0)} transactions
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Pourboires</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(data.byType.find(t => t.type === 'tip')?.amount || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {formatNumber(data.byType.find(t => t.type === 'tip')?.count || 0)} transactions
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Évolution du Revenue
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
                tickFormatter={(value) => `${(value / 100).toFixed(0)}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR');
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#00B8A9"
                fill="#00B8A9"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Période actuelle"
              />
              {comparison !== 'none' && data.timeSeries[0]?.previousAmount !== undefined && (
                <Area
                  type="monotone"
                  dataKey="previousAmount"
                  stroke="#9CA3AF"
                  fill="#9CA3AF"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Période de comparaison"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par Type</h3>
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
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="category"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 100).toFixed(0)}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#00B8A9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Creators */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Créateurs</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.topCreators.map((creator, index) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'}
                  >
                    #{index + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback>
                      {creator.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{creator.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatCurrency(creator.revenue)}</div>
                  {creator.growth !== 0 && (
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(creator.growth)}`}>
                      {getChangeIcon(creator.growth)}
                      {creator.growth > 0 ? '+' : ''}{creator.growth.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue by Category Detail */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Détail par Catégorie</h3>
        <div className="space-y-4">
          {data.byCategory.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.category}</span>
                <div className="flex items-center gap-3">
                  {comparison !== 'none' && (
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(item.change)}`}>
                      {getChangeIcon(item.change)}
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-brand-start to-brand-end h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
