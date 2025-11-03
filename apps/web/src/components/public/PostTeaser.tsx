/**
 * PostTeaser Component (F9)
 * Display post with blur effect for locked content
 */

'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Post {
  id: string;
  title: string;
  content: string;
  isPaid: boolean;
  isUnlocked?: boolean;
  price?: number;
  currency?: string;
  imageUrl?: string;
  publishedAt: Date;
  creatorHandle: string;
}

interface PostTeaserProps {
  post: Post;
  onUnlock?: (postId: string) => void;
  maxContentLength?: number;
}

export function PostTeaser({ post, onUnlock, maxContentLength = 200 }: PostTeaserProps) {
  const isLocked = post.isPaid && !post.isUnlocked;
  const displayContent = isLocked
    ? post.content.slice(0, maxContentLength)
    : post.content;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(post.publishedAt));

  return (
    <Card className="overflow-hidden" data-testid={`post-teaser-${post.id}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold line-clamp-2" data-testid={`post-title-${post.id}`}>
            {post.title}
          </h3>
          {post.isPaid && (
            <Badge variant={isLocked ? 'secondary' : 'default'} data-testid={`post-badge-${post.id}`}>
              {isLocked ? (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              ) : (
                'Unlocked'
              )}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.publishedAt.toISOString()} data-testid={`post-date-${post.id}`}>
            {formattedDate}
          </time>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Image */}
        {post.imageUrl && (
          <div className={cn('relative aspect-video w-full overflow-hidden rounded-lg', isLocked && 'blur-sm')}>
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="relative">
          <p
            className={cn(
              'text-muted-foreground',
              isLocked && 'blur-sm select-none'
            )}
            data-testid={`post-content-${post.id}`}
          >
            {displayContent}
            {isLocked && post.content.length > maxContentLength && '...'}
          </p>

          {/* Gradient Overlay for Locked Content */}
          {isLocked && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          )}
        </div>
      </CardContent>

      {isLocked && (
        <CardFooter className="flex flex-col items-center gap-3 border-t pt-6">
          <div className="flex items-center gap-2 text-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This is exclusive content. Subscribe to unlock.
            </p>
          </div>

          {post.price && (
            <div className="text-lg font-semibold" data-testid={`post-price-${post.id}`}>
              {post.currency === 'USD' ? '$' : post.currency}
              {post.price.toFixed(2)}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => onUnlock?.(post.id)}
            data-testid={`unlock-btn-${post.id}`}
          >
            <Lock className="mr-2 h-4 w-4" />
            Unlock Post
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
