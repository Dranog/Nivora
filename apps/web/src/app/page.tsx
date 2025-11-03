/**
 * Landing Page (F9)
 * SEO-optimized public landing page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Lock, Zap, Heart, TrendingUp } from 'lucide-react';
import { generateSiteMetadata } from '@/lib/seo';

export const metadata = generateSiteMetadata();

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Connect with Your
            <span className="block text-primary">Biggest Fans</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The platform where creators share exclusive content, build communities, and earn from their passion.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/creator/signup">Become a Creator</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/explore">Explore Creators</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful tools to grow your audience and monetize your content
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature: Subscriptions */}
            <Card>
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Flexible Subscriptions</CardTitle>
                <CardDescription>
                  Create multiple subscription tiers with different benefits to suit your audience
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature: Exclusive Content */}
            <Card>
              <CardHeader>
                <Lock className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Exclusive Content</CardTitle>
                <CardDescription>
                  Share premium posts, videos, and updates only with your subscribers
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature: Direct Payments */}
            <Card>
              <CardHeader>
                <DollarSign className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Direct Payments</CardTitle>
                <CardDescription>
                  Receive payments directly with fast payouts and transparent fees
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature: Instant Setup */}
            <Card>
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Instant Setup</CardTitle>
                <CardDescription>
                  Get started in minutes with our easy-to-use creator dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature: Fan Engagement */}
            <Card>
              <CardHeader>
                <Heart className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Fan Engagement</CardTitle>
                <CardDescription>
                  Build deeper connections with your most dedicated supporters
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature: Analytics */}
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Growth Analytics</CardTitle>
                <CardDescription>
                  Track your performance and optimize your content strategy
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">10,000+</div>
              <div className="text-muted-foreground">Active Creators</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">500K+</div>
              <div className="text-muted-foreground">Subscribers</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">$5M+</div>
              <div className="text-muted-foreground">Creator Earnings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of creators who are already building their communities
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/creator/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:underline">
                    Explore
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:underline">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:underline">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/legal/tos" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://twitter.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FanSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
