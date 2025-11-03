/**
 * Public Post Page (F9)
 * /p/[handle]/post/[id] - Display individual post with teaser/unlock
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Calendar, ArrowLeft } from 'lucide-react';
import { generatePostMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

// Mock data fetching functions (replace with actual API calls)
async function getPostById(postId: string, creatorHandle: string) {
  // TODO: Replace with actual database query
  return {
    id: postId,
    title: 'Exclusive Tutorial: Advanced Techniques',
    content: `In this exclusive tutorial, I'm going to show you some advanced techniques that I use in my work. This is content that you won't find anywhere else.

I'll cover:
- Advanced composition techniques
- Color theory and application
- Lighting and shadow work
- Post-processing workflows
- Common mistakes to avoid

This tutorial is the result of years of experience and experimentation. I've refined these techniques through countless projects and I'm excited to share them with you.

By the end of this tutorial, you'll have a deeper understanding of the creative process and be able to apply these techniques to your own work.`,
    isPaid: true,
    isUnlocked: false, // Would check user's subscription status
    price: 9.99,
    currency: 'USD',
    publishedAt: new Date('2024-01-12'),
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
    creator: {
      id: '1',
      name: 'Jane Doe',
      handle: creatorHandle,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + creatorHandle,
    },
  };
}

interface PageProps {
  params: Promise<{ handle: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, id } = await params;
  const post = await getPostById(id, handle);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return generatePostMetadata({
    id: post.id,
    title: post.title,
    content: post.content,
    isPaid: post.isPaid,
    creatorHandle: post.creator.handle,
    creatorName: post.creator.name,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { handle, id } = await params;
  const post = await getPostById(id, handle);

  if (!post) {
    notFound();
  }

  const isLocked = post.isPaid && !post.isUnlocked;
  const displayContent = isLocked
    ? post.content.slice(0, 300) + '...'
    : post.content;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(post.publishedAt));

  const handleUnlock = () => {
    // TODO: Implement unlock flow with PurchaseModal (F6)
    console.log('Unlock post:', post.id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/p/${post.creator.handle}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {post.creator.name}'s profile
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader className="space-y-4">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                  <AvatarFallback>{post.creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    href={`/p/${post.creator.handle}`}
                    className="font-semibold hover:underline"
                  >
                    {post.creator.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{post.creator.handle}</p>
                </div>
                {post.isPaid && (
                  <Badge variant={isLocked ? 'secondary' : 'default'}>
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

              {/* Title */}
              <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt.toISOString()}>{formattedDate}</time>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Post Image */}
              {post.imageUrl && (
                <div className={cn('relative aspect-video w-full overflow-hidden rounded-lg', isLocked && 'blur-md')}>
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="relative">
                <div
                  className={cn(
                    'prose prose-slate max-w-none dark:prose-invert',
                    isLocked && 'blur-sm select-none'
                  )}
                >
                  {displayContent.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {/* Gradient Overlay for Locked Content */}
                {isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                )}
              </div>

              {/* Unlock Section */}
              {isLocked && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                    <Lock className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="mb-2 text-xl font-bold">Exclusive Content</h3>
                      <p className="text-muted-foreground">
                        Subscribe to {post.creator.name} to unlock this post and get access to all
                        exclusive content.
                      </p>
                    </div>
                    {post.price && (
                      <div className="text-2xl font-bold">
                        {post.currency === 'USD' ? '$' : post.currency}
                        {post.price.toFixed(2)}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" onClick={handleUnlock}>
                        <Lock className="mr-2 h-4 w-4" />
                        Unlock Post
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href={`/p/${post.creator.handle}`}>View All Tiers</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Related CTA */}
          <div className="mt-8 rounded-lg bg-muted p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">
              Want more content like this?
            </h3>
            <p className="mb-4 text-muted-foreground">
              Subscribe to {post.creator.name} for exclusive updates, tutorials, and more.
            </p>
            <Button asChild>
              <Link href={`/p/${post.creator.handle}`}>
                View Subscription Tiers
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
