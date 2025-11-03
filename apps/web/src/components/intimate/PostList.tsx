/**
 * Post List - F4
 * Post list with filters, tabs, loading/empty/error states
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText, AlertCircle } from 'lucide-react';

type PostStatus = 'all' | 'published' | 'draft' | 'scheduled';

export function PostList() {
  const router = useRouter();
  const [status, setStatus] = useState<PostStatus>('all');
  const [search, setSearch] = useState('');

  // Fetch posts
  const { data, isLoading, error, refetch } = usePosts({
    page: 1,
    pageSize: 20,
    status: status === 'all' ? undefined : status,
  });

  // Filter posts by search
  const filteredPosts = data?.data.filter((post) => {
    if (!search) return true;
    return post.title.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateNew = () => {
    router.push('/creator/posts/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage your content</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Tabs */}
        <Tabs value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Posts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message || 'Something went wrong'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPosts?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {search ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? 'Try adjusting your search'
                  : 'Get started by creating your first post'}
              </p>
              {!search && (
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {!isLoading && !error && filteredPosts && filteredPosts.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination info */}
          {data && data.total > data.pageSize && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {data.total} posts
            </div>
          )}
        </>
      )}
    </div>
  );
}
