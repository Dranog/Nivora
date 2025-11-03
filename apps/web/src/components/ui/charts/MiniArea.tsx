"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface MiniAreaProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
}

/**
 * MiniArea - Reusable area chart component
 * Uses Recharts with minimal styling
 */
export function MiniArea({
  data,
  xKey,
  yKey,
  height = 160,
  color = "currentColor"
}: MiniAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill="url(#colorGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
