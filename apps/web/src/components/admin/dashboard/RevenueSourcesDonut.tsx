'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RevenueSource {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface RevenueSourcesDonutProps {
  sources: RevenueSource[];
}

export function RevenueSourcesDonut({ sources }: RevenueSourcesDonutProps) {
  const total = sources.reduce((sum, source) => sum + source.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all p-6 h-[280px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources de Revenus</h3>
      <div className="flex items-center justify-between gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={sources as any}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {sources.map((source, index) => (
                <Cell key={`cell-${index}`} fill={source.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(props?.payload?.amount || 0)})`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: source.color }}
                aria-hidden={true}
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-700 block">{source.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900">{source.value}%</span>
                  <span className="text-xs text-gray-500">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(source.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
