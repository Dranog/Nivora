"use client";

const MOCK = true;

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as posts from "@/api/posts";

export function ContentPanel() {
  const list = useQuery({
    queryKey: ["creator-posts"],
    queryFn: async () => {
      if (MOCK) {
        return [
          { id: "1", caption: "My first exclusive content!", isPaid: true, price: 999, createdAt: "2025-10-15T14:30:00Z", views: 245, likes: 89 },
          { id: "2", caption: "Free teaser for everyone", isPaid: false, createdAt: "2025-10-14T10:20:00Z", views: 512, likes: 156 },
          { id: "3", caption: "Behind the scenes footage", isPaid: true, price: 1499, createdAt: "2025-10-13T18:45:00Z", views: 189, likes: 67 },
          { id: "4", caption: "Q&A session recap", isPaid: false, createdAt: "2025-10-12T12:00:00Z", views: 423, likes: 134 },
        ];
      }
      const result = await posts.listMine(); return result.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* My Posts */}
      <Card className="oliver-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">My Creations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          )}
          {list.data?.length === 0 && (
            <div className="rounded-xl bg-muted/30 border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">No content published yet</p>
            </div>
          )}
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.data?.map((p: any) => (
              <li
                key={p.id}
                className="flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex-1 space-y-3">
                  <p className="font-semibold text-sm line-clamp-2">
                    {p.caption || "(No caption)"}
                  </p>
                  <div className="flex items-center gap-2">
                    {p.isPaid ? (
                      <Badge className="oliver-badge-primary text-xs">
                        Paid · €{(p.price / 100).toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Views: {p.views?.toLocaleString() || '0'}</p>
                    <p>Likes: {p.likes?.toLocaleString() || '0'}</p>
                    <p>{new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl font-medium mt-4">
                  View Details
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
