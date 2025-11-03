/**
 * FanDetail Component
 * Display fan details with tabs
 */

'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StageSelect } from './StageSelect';
import { TagPicker } from './TagPicker';
import { NoteEditor } from './NoteEditor';
import type { Fan, FanTag, FanStage } from '@/types/crm';
import { formatCurrency } from '@/lib/api/wallet';

interface FanDetailProps {
  fan: Fan;
  availableTags: FanTag[];
  isLoading: boolean;
  onStageChange: (stage: FanStage) => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
}

export function FanDetail({
  fan,
  availableTags,
  isLoading,
  onStageChange,
  onAddTag,
  onRemoveTag,
  onCreateTag,
}: FanDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="fan-detail">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/creator/crm')}
          data-testid="back-btn"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-20 w-20">
          <AvatarImage src={fan.avatar} alt={fan.name} />
          <AvatarFallback className="text-2xl">{getInitials(fan.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{fan.name}</h1>
            <p className="text-muted-foreground">{fan.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Stage</p>
              <StageSelect
                currentStage={fan.stage}
                onStageChange={onStageChange}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Tags</p>
            <TagPicker
              currentTags={fan.tags}
              availableTags={availableTags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onCreateTag={onCreateTag}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="fan-tabs">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(fan.totalSpent)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{fan.purchases.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium">{formatDate(fan.joinedAt)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {fan.purchases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No purchases yet</p>
              ) : (
                <div className="space-y-3">
                  {fan.purchases.slice(0, 5).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{purchase.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {purchase.type} • {formatDate(purchase.date)}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{formatCurrency(purchase.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <NoteEditor fanId={fan.id} notes={fan.notes} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {fan.purchases.length === 0 && fan.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Combine purchases and notes, sort by date */}
                  {[
                    ...fan.purchases.map((p) => ({
                      type: 'purchase' as const,
                      date: p.date,
                      content: p,
                    })),
                    ...fan.notes.map((n) => ({
                      type: 'note' as const,
                      date: n.createdAt,
                      content: n,
                    })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-2 w-2 rounded-full ${
                            item.type === 'purchase' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          {i < fan.purchases.length + fan.notes.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          {item.type === 'purchase' ? (
                            <div>
                              <p className="text-sm font-medium">
                                Purchase: {item.content.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.content.amount)} • {formatDate(item.date)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium">Note added</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.content.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.content.createdBy} • {formatDate(item.date)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
