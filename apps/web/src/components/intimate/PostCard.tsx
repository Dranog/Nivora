/**
 * Post Card - F4 + F5
 * Post card with status, stats, actions, and protected content support
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeletePost, usePublishPost } from '@/hooks/usePosts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Send, Eye, Heart, MessageCircle, Calendar, Lock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Post } from '@/types/post';
import { ProtectedImage } from '@/components/media/ProtectedImage';
import { SecurePlayer } from '@/components/media/SecurePlayer';
import { PurchaseModal } from '@/components/media/PurchaseModal';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const deletePost = useDeletePost();
  const publishPost = usePublishPost();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/creator/posts/${post.id}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(post.id);
    }
  };

  const handlePublish = () => {
    publishPost.mutate(post.id);
  };

  const handleUnlock = () => {
    if (post.isPaid) {
      setPurchaseModalOpen(true);
    }
  };

  const handlePurchaseSuccess = () => {
    // In production, this would refetch the post or update local state
    // to mark it as unlocked
    router.refresh();
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  const isScheduled = post.publishedAt && new Date(post.publishedAt) > new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{post.title}</CardTitle>
              {getStatusBadge()}
              {isScheduled && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Scheduled
                </Badge>
              )}
            </div>
            <CardDescription>
              {isScheduled && post.publishedAt ? (
                <>Scheduled for {format(new Date(post.publishedAt), 'PPp')}</>
              ) : post.publishedAt ? (
                <>Published {format(new Date(post.publishedAt), 'PPp')}</>
              ) : (
                <>Created {format(new Date(post.createdAt), 'PPp')}</>
              )}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {post.status === 'draft' && (
                <DropdownMenuItem onClick={handlePublish}>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Now
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Media Content - Protected or Regular */}
      {post.mediaType === 'image' && post.mediaUrl && (
        <div className="px-6">
          <ProtectedImage
            src={post.mediaUrl}
            alt={post.title}
            userId="user123"
            username="viewer"
            locked={post.locked}
            className="aspect-video"
            fill
            watermarkConfig={{
              enabled: true,
              opacity: 30,
              interval: '30',
            }}
          />
          {post.locked && post.isPaid && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Locked Content</span>
                {post.price && (
                  <>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{post.price.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <Button size="sm" onClick={handleUnlock}>
                Unlock
              </Button>
            </div>
          )}
        </div>
      )}

      {post.mediaType === 'video' && post.mediaUrl && (
        <div className="px-6">
          <SecurePlayer
            mediaId={post.id}
            userId="user123"
            username="viewer"
            locked={post.locked}
            className="aspect-video"
            watermarkConfig={{
              enabled: true,
              opacity: 30,
              interval: '30',
            }}
            ttlMinutes={15}
          />
          {post.locked && post.isPaid && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Locked Video</span>
                {post.price && (
                  <>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{post.price.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <Button size="sm" onClick={handleUnlock}>
                Unlock
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Fallback to cover image if no media */}
      {post.mediaType === 'none' && post.coverImage && (
        <div className="px-6">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.excerpt || post.content}
        </p>
      </CardContent>

      <CardFooter>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.viewsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </div>
          <div className="ml-auto text-xs">
            <Badge variant="outline">{post.visibility}</Badge>
          </div>
        </div>
      </CardFooter>

      {/* Purchase Modal */}
      {post.isPaid && post.price && (
        <PurchaseModal
          open={purchaseModalOpen}
          onOpenChange={setPurchaseModalOpen}
          postId={post.id}
          postTitle={post.title}
          price={post.price}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </Card>
  );
}
