/**
 * Public Creator Profile Page (F9)
 * /p/[handle] - Public creator profile with offers and posts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreatorHeader } from '@/components/public/CreatorHeader';
import { OfferGrid } from '@/components/public/OfferGrid';
import { PostTeaser } from '@/components/public/PostTeaser';
import { generateCreatorMetadata } from '@/lib/seo';

// Mock data fetching functions (replace with actual API calls)
async function getCreatorByHandle(handle: string) {
  // TODO: Replace with actual database query
  // For now, return mock data
  return {
    id: '1',
    name: 'Jane Doe',
    handle: handle,
    bio: 'Content creator and digital artist. Sharing exclusive tutorials, behind-the-scenes content, and more!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + handle,
    coverImage: undefined,
    stats: {
      followers: 12500,
      posts: 156,
      monthlyRevenue: 8500,
    },
  };
}

async function getCreatorOffers(creatorId: string) {
  // TODO: Replace with actual database query
  return [
    {
      id: '1',
      title: 'Basic Tier',
      description: 'Get access to exclusive posts and updates',
      price: 9.99,
      currency: 'USD',
      billingInterval: 'month' as const,
      benefits: [
        'Access to exclusive posts',
        'Monthly behind-the-scenes content',
        'Community chat access',
      ],
    },
    {
      id: '2',
      title: 'Premium Tier',
      description: 'Full access to all content and perks',
      price: 24.99,
      currency: 'USD',
      billingInterval: 'month' as const,
      benefits: [
        'Everything in Basic Tier',
        'Weekly live streams',
        '1-on-1 monthly Q&A session',
        'Early access to new content',
        'Exclusive Discord role',
      ],
      isPopular: true,
    },
    {
      id: '3',
      title: 'VIP Tier',
      description: 'Ultimate fan experience with all perks',
      price: 49.99,
      currency: 'USD',
      billingInterval: 'month' as const,
      benefits: [
        'Everything in Premium Tier',
        'Private message access',
        'Personalized content requests',
        'Annual video call',
        'Physical merch package',
      ],
    },
  ];
}

async function getCreatorPosts(creatorId: string) {
  // TODO: Replace with actual database query
  return [
    {
      id: '1',
      title: 'My Creative Process: Behind the Scenes',
      content:
        'Hey everyone! Today I want to share my creative process and how I come up with ideas for my content. It all starts with...',
      isPaid: false,
      isUnlocked: true,
      publishedAt: new Date('2024-01-15'),
      creatorHandle: 'janedoe',
      imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800',
    },
    {
      id: '2',
      title: 'Exclusive Tutorial: Advanced Techniques',
      content:
        'In this exclusive tutorial, I\'m going to show you some advanced techniques that I use in my work. This is content that you won\'t find anywhere else...',
      isPaid: true,
      isUnlocked: false,
      price: 9.99,
      currency: 'USD',
      publishedAt: new Date('2024-01-12'),
      creatorHandle: 'janedoe',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    },
    {
      id: '3',
      title: 'Weekly Update: What I\'m Working On',
      content:
        'Welcome to this week\'s update! I\'ve been working on some exciting new projects that I can\'t wait to share with you...',
      isPaid: true,
      isUnlocked: false,
      price: 9.99,
      currency: 'USD',
      publishedAt: new Date('2024-01-10'),
      creatorHandle: 'janedoe',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    },
  ];
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);

  if (!creator) {
    return {
      title: 'Creator Not Found',
    };
  }

  return generateCreatorMetadata({
    name: creator.name,
    handle: creator.handle,
    bio: creator.bio,
    avatar: creator.avatar,
  });
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);

  if (!creator) {
    notFound();
  }

  const [offers, posts] = await Promise.all([
    getCreatorOffers(creator.id),
    getCreatorPosts(creator.id),
  ]);

  const handleSubscribe = (offerId: string) => {
    // TODO: Implement subscription flow with PurchaseModal (F6)
    console.log('Subscribe to offer:', offerId);
  };

  const handleUnlock = (postId: string) => {
    // TODO: Implement unlock flow with PurchaseModal (F6)
    console.log('Unlock post:', postId);
  };

  return (
    <div className="min-h-screen">
      {/* Creator Header */}
      <CreatorHeader
        name={creator.name}
        handle={creator.handle}
        bio={creator.bio}
        avatar={creator.avatar}
        coverImage={creator.coverImage}
        stats={creator.stats}
      />

      {/* Subscription Offers */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Subscription Tiers</h2>
            <p className="text-muted-foreground">
              Choose a tier that works for you and get exclusive access
            </p>
          </div>
          <OfferGrid offers={offers} onSubscribe={handleSubscribe} />
        </div>
      </section>

      {/* Posts */}
      <section className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold">Recent Posts</h2>
            <p className="text-muted-foreground">Check out the latest content</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostTeaser key={post.id} post={post} onUnlock={handleUnlock} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
