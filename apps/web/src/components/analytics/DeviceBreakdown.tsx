/**
 * Device Breakdown Component (F10)
 * Display device and platform statistics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { DeviceBreakdown as DeviceBreakdownType } from '@/types/analytics';

interface DeviceBreakdownProps {
  data: DeviceBreakdownType;
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DeviceBreakdown({ data, className }: DeviceBreakdownProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Device & Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="device">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="browser">Browser</TabsTrigger>
          </TabsList>

          <TabsContent value="device" className="mt-4">
            <DevicePieChart data={data.byDevice} />
          </TabsContent>

          <TabsContent value="platform" className="mt-4">
            <DevicePieChart data={data.byPlatform} />
          </TabsContent>

          <TabsContent value="browser" className="mt-4">
            <DevicePieChart data={data.byBrowser} />
          </TabsContent>
        </Tabs>

        <p className="mt-4 text-sm text-muted-foreground">
          Total sessions: {data.totalSessions.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function DevicePieChart({ data }: { data: any[] }) {
  const chartData = data.map((item) => ({
    name: item.device || item.platform || item.browser || 'Unknown',
    value: item.percentage,
    users: item.users,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name, props) => [
              `${value.toFixed(1)}% (${props.payload.users.toLocaleString()} users)`,
              props.payload.name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-medium">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
