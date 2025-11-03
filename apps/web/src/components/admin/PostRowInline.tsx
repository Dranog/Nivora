/**
 * PostRowInline - Inline Post Row Content (F12)
 * Renders <td> cells only, no <tr> wrapper
 */

'use client';

import { useState } from 'react';
import { Eye, EyeOff, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from './ConfirmDialog';
import { useTakedownPost, useRestorePost } from '@/hooks/useAdmin';
import { getPostStatusVariant, type AdminPost } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export interface PostRowInlineProps {
  post: AdminPost;
}

export function PostRowInline({ post }: PostRowInlineProps) {
  const [isTakedownDialogOpen, setIsTakedownDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [takedownReason, setTakedownReason] = useState('');

  const takedownMutation = useTakedownPost();
  const restoreMutation = useRestorePost();

  const handleTakedown = async () => {
    if (!takedownReason.trim()) return;
    await takedownMutation.mutateAsync({ postId: post.id, reason: takedownReason });
    setTakedownReason('');
  };

  const handleRestore = async () => {
    await restoreMutation.mutateAsync({ postId: post.id });
  };

  const isTakenDown = post.status === 'taken_down';
  const statusVariant = getPostStatusVariant(post.status);

  return (
    <>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/posts/${post.id}`}
              className="font-medium truncate hover:underline block"
            >
              {post.title}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              by {post.authorName} ({post.authorEmail})
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <Badge variant={statusVariant}>
          {post.status.replace('_', ' ')}
        </Badge>
      </td>
      <td className="p-4">
        <Badge variant="outline">
          {post.visibility}
        </Badge>
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.viewsCount}
          </span>
          <span>{post.likesCount} likes</span>
        </div>
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {post.reportsCount}
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {post.publishedAt
          ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
          : 'Not published'}
      </td>
      <td className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={`Actions for post ${post.title}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isTakenDown ? (
              <DropdownMenuItem
                onClick={() => setIsRestoreDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Restore Post
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setIsTakedownDialogOpen(true)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <EyeOff className="h-4 w-4" />
                Takedown Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* Takedown Dialog */}
      <ConfirmDialog
        open={isTakedownDialogOpen}
        onOpenChange={(open) => {
          setIsTakedownDialogOpen(open);
          if (!open) setTakedownReason('');
        }}
        title="Takedown Post"
        description={
          <div className="space-y-4">
            <p>
              Are you sure you want to take down <strong>{post.title}</strong>?
              This will hide the post from public view.
            </p>
            <div className="space-y-2">
              <Label htmlFor="takedown-reason">Reason (required)</Label>
              <Input
                id="takedown-reason"
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="Enter reason for takedown..."
                aria-describedby="takedown-reason-description"
              />
              <p id="takedown-reason-description" className="text-sm text-muted-foreground">
                This reason will be recorded and visible to other admins.
              </p>
            </div>
          </div>
        }
        confirmText={takedownMutation.isPending ? "Taking down..." : "Takedown Post"}
        variant="danger"
        onConfirm={handleTakedown}
      />

      {/* Restore Dialog */}
      <ConfirmDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        title="Restore Post"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to restore <strong>{post.title}</strong>?
              This will make the post visible again.
            </p>
            {post.takenDownReason && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Takedown Reason:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {post.takenDownReason}
                </p>
              </div>
            )}
          </div>
        }
        confirmText={restoreMutation.isPending ? "Restoring..." : "Restore Post"}
        variant="default"
        onConfirm={handleRestore}
      />
    </>
  );
}
