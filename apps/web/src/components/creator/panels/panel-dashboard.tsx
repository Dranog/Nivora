"use client";

const MOCK = true;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, TrendingUp, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MiniArea } from "@/components/ui/charts/MiniArea";
import { NextPayoutCard } from "@/components/ui/NextPayoutCard";

interface DashboardStats {
  totalUsers: number;
  activeCreators: number;
  revenueToday: number;
  revenueChange: number;
  actions: number;
}

interface UserRow {
  id: string;
  name: string;
  role: string;
  type: "Creator" | "Fan";
  revenue: number;
  status: "Active" | "Pending" | "Inactive";
  avatar?: string;
}

export function DashboardPanel() {
  const [chartPeriod, setChartPeriod] = useState<string>('7');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handlePeriodChange = (value: string) => {
    setChartPeriod(value);
    setShowCustomRange(value === 'custom');
  };

  // Generate mock chart data
  const generateChartData = (days: number, baseValue: number, variance: number) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
      const value = baseValue + Math.floor(Math.random() * variance);
      data.push({ date: dateStr, value });
    }
    return data;
  };

  const days = chartPeriod === 'custom' ? 30 : Number(chartPeriod);
  const revenueData = generateChartData(days, 800, 400);
  const subscribersData = generateChartData(days, 50, 20);

  // Fetch dashboard stats
  const statsQuery = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (MOCK) {
        return {
          totalUsers: 45234,
          activeCreators: 1234,
          revenueToday: 1245000, // en centimes
          revenueChange: 8.3,
          actions: 23,
        };
      }
      // TODO(api): Intégrer avec l'endpoint réel
      throw new Error("API not implemented");
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch users table
  const usersQuery = useQuery<UserRow[]>({
    queryKey: ["dashboard-users"],
    queryFn: async () => {
      if (MOCK) {
        return [
          {
            id: "1",
            name: "Jessica Lange",
            role: "Creator",
            type: "Creator",
            revenue: 420000,
            status: "Active",
            avatar: "/avatars/jessica.jpg",
          },
          {
            id: "2",
            name: "Mark Meyer",
            role: "Fan",
            type: "Fan",
            revenue: 390000,
            status: "Active",
          },
          {
            id: "3",
            name: "Adam Perry",
            role: "Creator",
            type: "Creator",
            revenue: 330000,
            status: "Active",
          },
          {
            id: "4",
            name: "Kathy Reeves",
            role: "Fan",
            type: "Fan",
            revenue: 228000,
            status: "Active",
          },
          {
            id: "5",
            name: "Alfredo Watson",
            role: "Creator",
            type: "Creator",
            revenue: 86000,
            status: "Pending",
          },
        ];
      }
      // TODO(api): Intégrer avec l'endpoint réel
      throw new Error("API not implemented");
    },
    staleTime: 2 * 60 * 1000,
  });

  const stats = statsQuery.data || {
    totalUsers: 0,
    activeCreators: 0,
    revenueToday: 0,
    revenueChange: 0,
    actions: 0,
  };

  const formatNumber = (num: number) => num.toLocaleString("fr-FR");
  const formatCurrency = (cents: number) => `€${(cents / 100).toLocaleString("fr-FR")}`;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {formatNumber(stats.totalUsers)}
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Active Creators
            </CardTitle>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {formatNumber(stats.activeCreators)}
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Revenue Today
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {formatCurrency(stats.revenueToday)}
              </div>
              <span className="flex items-center text-sm font-medium text-success">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stats.revenueChange}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Actions
            </CardTitle>
            <Flag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {stats.actions}
            </div>
          </CardContent>
        </Card>

        {/* Next Payout Card */}
        <div className="md:col-span-2 lg:col-span-1">
          <NextPayoutCard
            nextDate="Oct 25, 2025"
            estAmount={350000}
            compact
          />
        </div>
      </div>

      {/* Performance Section */}
      <Card className="oliver-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold tracking-tight">Performance</CardTitle>
            <Select value={chartPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {showCustomRange && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground">
                📅 Custom date range picker coming soon
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Revenue</h4>
                <Badge variant="secondary" className="text-xs">€</Badge>
              </div>
              <MiniArea
                data={revenueData}
                xKey="date"
                yKey="value"
                height={180}
                color="hsl(var(--primary))"
              />
            </div>

            {/* Subscribers Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Subscribers</h4>
                <Badge variant="secondary" className="text-xs">Users</Badge>
              </div>
              <MiniArea
                data={subscribersData}
                xKey="date"
                yKey="value"
                height={180}
                color="hsl(var(--primary))"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="oliver-card hover:shadow-md transition-shadow duration-200 ease-out">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(usersQuery.data || []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.type === "Creator" ? "default" : "secondary"} className="font-medium">
                        {user.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(user.revenue)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "default"
                            : user.status === "Pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="oliver-badge"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
