"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, DollarSign } from "lucide-react";
import * as posts from "@/lib/api/posts";

interface Post {
  id: string;
  caption: string;
  isPaid: boolean;
  price?: number;
  views?: number;
  likes?: number;
  createdAt: string;
}

export function RecentPosts() {
  const { data: postsList, isLoading } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const result = await posts.listMine({ limit: 5 });
      return [
        {
          id: "1",
          caption: "Amazing sunset at the beach 🌅",
          isPaid: true,
          price: 499,
          views: 1234,
          likes: 89,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          caption: "Behind the scenes of today's shoot",
          isPaid: false,
          views: 2341,
          likes: 156,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          caption: "Exclusive content for subscribers",
          isPaid: true,
          price: 999,
          views: 876,
          likes: 45,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ] as Post[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="oliver-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {postsList?.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{post.caption}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {post.isPaid ? (
                      <Badge className="oliver-badge-primary text-xs">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        €{((post.price ?? 0) / 100).toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-2 text-xs">
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
