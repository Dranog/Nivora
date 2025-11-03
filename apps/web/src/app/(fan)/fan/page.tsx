/**
 * Fan Dashboard - F1 Shell SPA
 * Main dashboard for fan users
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Clock, TrendingUp } from 'lucide-react';

export default function FanPage() {

  const stats = [
    { label: 'Favorites', value: '24', icon: Heart, color: 'text-rose-500' },
    { label: 'Following', value: '12', icon: Star, color: 'text-amber-500' },
    { label: 'Watch Time', value: '48h', icon: Clock, color: 'text-blue-500' },
    { label: 'Trending', value: '8', icon: TrendingUp, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fan Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your activity overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-border rounded-md">
              <Heart className="h-5 w-5 text-rose-500" />
              <div className="flex-1">
                <p className="font-medium">Added to Favorites</p>
                <p className="text-sm text-muted-foreground">
                  &quot;Amazing Content&quot; by Creator A
                </p>
              </div>
              <span className="text-sm text-muted-foreground">2h ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border border-border rounded-md">
              <Star className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">Started Following</p>
                <p className="text-sm text-muted-foreground">Creator B</p>
              </div>
              <span className="text-sm text-muted-foreground">5h ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border border-border rounded-md">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Watched Content</p>
                <p className="text-sm text-muted-foreground">
                  &quot;Tutorial Series&quot; - Episode 3
                </p>
              </div>
              <span className="text-sm text-muted-foreground">1d ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">
              <Heart className="mr-2 h-4 w-4" />
              Browse Favorites
            </Button>
            <Button variant="outline">
              <Star className="mr-2 h-4 w-4" />
              Discover Creators
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
