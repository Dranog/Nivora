/**
 * Explore Page
 * Public page to browse and discover creators
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Users, Star } from 'lucide-react';

export default function ExplorePage() {
  // Mock data for demonstration
  const featuredCreators = [
    {
      id: '1',
      name: 'Sarah Johnson',
      handle: 'sarahj',
      category: 'Fitness',
      subscribers: 12500,
      description: 'Professional fitness coach sharing workout plans and nutrition tips',
    },
    {
      id: '2',
      name: 'Mike Chen',
      handle: 'mikecooks',
      category: 'Cooking',
      subscribers: 8900,
      description: 'Chef teaching authentic Asian cuisine and cooking techniques',
    },
    {
      id: '3',
      name: 'Emma Davis',
      handle: 'emmacreates',
      category: 'Art',
      subscribers: 15200,
      description: 'Digital artist sharing tutorials, process videos, and exclusive artwork',
    },
  ];

  const categories = [
    'Art & Design',
    'Music',
    'Fitness',
    'Cooking',
    'Gaming',
    'Education',
    'Photography',
    'Writing',
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Discover Amazing Creators
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find creators you love and support their work
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search creators..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trending Creators</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCreators.map((creator) => (
            <Card key={creator.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge>{creator.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {creator.subscribers.toLocaleString()}
                  </div>
                </div>
                <CardTitle>{creator.name}</CardTitle>
                <CardDescription>@{creator.handle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {creator.description}
                </p>
                <Button className="w-full" asChild>
                  <Link href={`/p/${creator.handle}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">
          Are You a Creator?
        </h2>
        <p className="mb-6 text-muted-foreground">
          Join our platform and start building your community today
        </p>
        <Button size="lg" asChild>
          <Link href="/creator/signup">
            Become a Creator
          </Link>
        </Button>
      </div>
    </div>
  );
}
