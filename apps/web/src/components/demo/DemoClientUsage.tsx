/**
 * Demo Client Usage - F3
 * Example usage of centralized HTTP + Zod + React Query
 */

'use client';

import { useState } from 'react';
import { usePosts, useCreatePost, useDeletePost } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Trash2, Plus } from 'lucide-react';

/**
 * Demo component showing posts list with create/delete
 */
export function DemoClientUsage() {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Query: Get posts
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts({ page: 1, pageSize: 10 });

  // Mutation: Create post
  const createPost = useCreatePost({
    onSuccess: () => {
      setNewPostTitle('');
      setNewPostContent('');
    },
  });

  // Mutation: Delete post
  const deletePost = useDeletePost();

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      return;
    }

    createPost.mutate({
      title: newPostTitle,
      content: newPostContent,
      visibility: 'public',
      status: 'published',
    });
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(postId);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Posts Demo</h1>
        <p className="text-muted-foreground">
          Example usage of centralized HTTP client + Zod schemas + React Query hooks
        </p>
      </div>

      {/* Create Post Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Uses useCreatePost hook with automatic validation and toast notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                disabled={createPost.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="Enter post content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={createPost.isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={createPost.isPending || !newPostTitle.trim() || !newPostContent.trim()}
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Posts List</h2>

        {postsLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {postsError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading posts: {postsError.message}
              </p>
            </CardContent>
          </Card>
        )}

        {postsData && postsData.data.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No posts yet. Create your first post above!
              </p>
            </CardContent>
          </Card>
        )}

        {postsData && postsData.data.length > 0 && (
          <div className="grid gap-4">
            {postsData.data.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>
                        {post.status === 'published' ? 'Published' : 'Draft'} •{' '}
                        {post.visibility}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletePost.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{post.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <div className="flex gap-4">
                    <span>{post.viewsCount} views</span>
                    <span>{post.likesCount} likes</span>
                    <span>{post.commentsCount} comments</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {postsData && postsData.total > postsData.pageSize && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {postsData.data.length} of {postsData.total} posts
          </div>
        )}
      </div>

      {/* Technical Details */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Query Keys:</strong> <code>[&apos;posts&apos;, &apos;list&apos;, {`{page, pageSize}`}]</code>
          </div>
          <div>
            <strong>Validation:</strong> Zod schemas validate all API responses
          </div>
          <div>
            <strong>Error Handling:</strong> Automatic error mapping to toast messages (401, 422, 500, etc.)
          </div>
          <div>
            <strong>Invalidation:</strong> Creating/deleting posts automatically refreshes the list
          </div>
          <div>
            <strong>HTTP Client:</strong> Centralized axios instance with auth interceptor
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
