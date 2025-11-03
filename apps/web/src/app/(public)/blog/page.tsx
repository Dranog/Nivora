/**
 * Blog Page
 * Platform blog and creator resources
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  // Mock blog posts
  const posts = [
    {
      id: '1',
      title: '10 Tips for Growing Your Subscriber Base',
      excerpt:
        'Learn proven strategies to attract more subscribers and build a thriving creator community.',
      category: 'Growth',
      date: '2025-01-10',
      readTime: '5 min',
    },
    {
      id: '2',
      title: 'How to Create Content That Keeps Fans Engaged',
      excerpt:
        'Discover the secrets to creating content that resonates with your audience and keeps them coming back.',
      category: 'Content',
      date: '2025-01-08',
      readTime: '7 min',
    },
    {
      id: '3',
      title: 'Maximizing Your Earnings: Pricing Strategy Guide',
      excerpt:
        'A comprehensive guide to pricing your subscription tiers and maximizing your creator revenue.',
      category: 'Monetization',
      date: '2025-01-05',
      readTime: '10 min',
    },
    {
      id: '4',
      title: 'Building Community: Fan Engagement Best Practices',
      excerpt:
        'Learn how to foster a strong community and create meaningful connections with your supporters.',
      category: 'Community',
      date: '2025-01-03',
      readTime: '6 min',
    },
    {
      id: '5',
      title: 'Content Protection: Keeping Your Work Safe',
      excerpt:
        'Understanding digital rights management and how to protect your exclusive content from piracy.',
      category: 'Security',
      date: '2024-12-28',
      readTime: '8 min',
    },
    {
      id: '6',
      title: 'Analytics 101: Understanding Your Creator Dashboard',
      excerpt:
        "A beginner's guide to using analytics to track your growth and optimize your content strategy.",
      category: 'Analytics',
      date: '2024-12-25',
      readTime: '5 min',
    },
  ];

  const categories = ['All', 'Growth', 'Content', 'Monetization', 'Community', 'Security', 'Analytics'];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Creator Resources & Insights
        </h1>
        <p className="text-lg text-muted-foreground">
          Tips, guides, and best practices to help you succeed as a creator
        </p>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-accent"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="mx-auto max-w-6xl mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <Button variant="ghost" className="w-full group">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="mx-auto max-w-2xl">
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Stay Updated</CardTitle>
            <CardDescription>
              Get the latest creator tips, platform updates, and success stories delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" asChild>
              <Link href="/creator/signup">
                Join Our Community
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
