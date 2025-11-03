/**
 * Features Page
 * Detailed overview of platform features
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  Lock,
  Zap,
  Heart,
  TrendingUp,
  Shield,
  MessageSquare,
  BarChart3,
  Wallet,
  Bell,
  Globe,
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: 'Flexible Subscriptions',
      description:
        'Create multiple subscription tiers with different pricing and benefits. Let fans choose the level of support that works for them.',
    },
    {
      icon: Lock,
      title: 'Content Protection',
      description:
        'Advanced DRM and watermarking to protect your exclusive content from unauthorized sharing and downloads.',
    },
    {
      icon: DollarSign,
      title: 'Direct Payments',
      description:
        'Receive payments directly with transparent fees. Keep 85% of your earnings with weekly payouts to your bank account.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Analytics',
      description:
        'Track your performance with detailed analytics on subscribers, revenue, engagement, and content performance.',
    },
    {
      icon: Heart,
      title: 'Fan Relationship Management',
      description:
        'Manage your community with built-in CRM tools. Tag fans, track interactions, and build deeper connections.',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description:
        'Get started in minutes with our easy-to-use creator dashboard. No technical skills required.',
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description:
        'Bank-level encryption and security measures to protect your data and your fans\' information.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description:
        'Connect with your fans through private messages. Build personal relationships at scale.',
    },
    {
      icon: BarChart3,
      title: 'Revenue Dashboard',
      description:
        'Real-time revenue tracking with detailed breakdowns by subscription tier, content sales, and tips.',
    },
    {
      icon: Wallet,
      title: 'Multiple Payout Methods',
      description:
        'Choose from bank transfer, PayPal, or crypto. Flexible payment options that work for you.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'Keep fans engaged with automated notifications for new content, messages, and community updates.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description:
        'Accept payments from fans worldwide with multi-currency support and localized payment methods.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Everything You Need to Succeed
        </h1>
        <p className="text-lg text-muted-foreground">
          Powerful tools designed to help creators grow their audience, engage their community,
          and maximize their earnings
        </p>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-6xl mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border bg-primary p-8 text-primary-foreground text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="mb-6 text-lg opacity-90">
            Join thousands of creators who are already building successful communities
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/creator/signup">
              Create Your Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
