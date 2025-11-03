"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Heart,
  Eye,
  BarChart3,
  Clock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

/**
 * GrowthPanel — Analytics / AI Recommendations / Performance Insights
 * TODO: brancher à tes endpoints analytics/ai si disponibles
 */
export function GrowthPanel() {
  const regen = () => {
    // TODO: appeler API IA côté backend
    // Ici on simule
    alert("Recommandations régénérées (UI)");
  };

  // Mock data for demonstration
  const topContent = [
    { id: 1, title: "Superfish Mix", views: 1574, engagement: "€354", revenue: "€118", thumb: "/api/placeholder/40/40" },
    { id: 2, title: "Underwater", views: 1428, engagement: "€322", revenue: "€96", thumb: "/api/placeholder/40/40" },
    { id: 3, title: "Just Dance", views: 1204, engagement: "€285", revenue: "€84", thumb: "/api/placeholder/40/40" },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPI Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="oliver-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">€12,450</p>
              <div className="flex items-center text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +8.2%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">312</p>
              <div className="flex items-center text-xs font-medium text-destructive">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                -2.1%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-success" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">8.5%</p>
              <div className="flex items-center text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +1.2%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Fans</p>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">45.1K</p>
              <div className="flex items-center text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +5.8%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Breakdown */}
          <Card className="oliver-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  Performance Breakdown
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-8 px-3 rounded-lg">
                    Revenue
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8 px-3 rounded-lg">
                    Subscribers
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8 px-3 rounded-lg">
                    Traffic
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simplified chart placeholder - use recharts/chart.js in production */}
              <div className="h-48 rounded-xl bg-gradient-to-t from-primary/5 to-transparent border border-border/50 flex items-end p-4">
                <div className="w-full flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 60, 75, 55, 85, 70, 90, 75, 95].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all cursor-pointer"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Jan 10</span>
                <span>Mar 15</span>
                <span>May 8</span>
                <span>Jul 20</span>
                <span>Sep 30</span>
                <span>Nov 15</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Content */}
          <Card className="oliver-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Performing Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContent.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.engagement}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{item.revenue}</p>
                      <Badge className="oliver-badge-success text-xs mt-1">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        +12%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Insights & AI Recommendations */}
        <div className="space-y-6">
          {/* Quick Insights */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-md bg-success/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Top trending content</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      "Superfish Mix" +23% views
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Best time to post</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tuesday 19:00 for +12% CTR
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-md bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-3 w-3 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Pricing insight</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PPV €4.99 optimal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="oliver-card border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Publie mardi 19:00 pour <span className="font-semibold text-foreground">+12% CTR</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Prix PPV conseillé : <span className="font-semibold text-foreground">€4.99</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Hashtags: <span className="font-semibold text-foreground">#studio #behindthescenes</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Monthly revenue goal: <span className="font-semibold text-foreground">€6.4K</span>
                  </span>
                </li>
              </ul>
              <Button
                onClick={regen}
                className="w-full oliver-btn-primary h-10 shadow-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate Insights
              </Button>
            </CardContent>
          </Card>

          {/* Creator Stats */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Creator Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly revenue goal</span>
                <span className="font-semibold">€6.4K</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posts this week</span>
                <Badge className="oliver-badge-success">12</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. engagement</span>
                <span className="font-semibold">8%</span>
              </div>
              <Button variant="outline" className="w-full mt-2 rounded-xl font-medium">
                View Full Report
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
