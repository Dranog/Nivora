/**
 * About Page
 * Information about the platform
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          About FanSpace
        </h1>
        <p className="text-lg text-muted-foreground">
          Empowering creators to build sustainable communities and earn from their passion
        </p>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-4xl mb-16">
        <h2 className="mb-6 text-3xl font-bold text-center">Our Mission</h2>
        <p className="text-lg text-muted-foreground text-center mb-8">
          We believe every creator deserves the tools and support to turn their passion into a
          sustainable career. FanSpace provides a platform where creators can connect directly
          with their biggest fans, share exclusive content, and build thriving communities.
        </p>
      </div>

      {/* Values */}
      <div className="mx-auto max-w-5xl mb-16">
        <h2 className="mb-8 text-3xl font-bold text-center">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Creator First</CardTitle>
              <CardDescription>
                Every decision we make prioritizes creator success and sustainability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Building meaningful connections between creators and their supporters
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Trust & Safety</CardTitle>
              <CardDescription>
                Protecting creators' content and ensuring a safe environment for all
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Innovation</CardTitle>
              <CardDescription>
                Continuously improving our platform with cutting-edge features
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-4xl mb-16">
        <div className="rounded-lg border bg-muted/50 p-8">
          <h2 className="mb-8 text-3xl font-bold text-center">By the Numbers</h2>
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
              <div className="text-muted-foreground">Paid to Creators</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-2xl font-bold">
          Ready to Join Us?
        </h2>
        <p className="mb-6 text-muted-foreground">
          Start building your community and monetizing your content today
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/creator/signup">
              Become a Creator
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">
              Explore Creators
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
