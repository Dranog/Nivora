/**
 * Creator Signup Page
 * Public registration page for new creators
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';

export default function CreatorSignupPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Back to Home */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Become a Creator
        </h1>
        <p className="text-lg text-muted-foreground">
          Join thousands of creators who are monetizing their content and building communities
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mx-auto max-w-5xl mb-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Free to Start
              </CardTitle>
              <CardDescription>
                No upfront costs. We only succeed when you do.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Keep 85%
              </CardTitle>
              <CardDescription>
                Industry-leading revenue share for creators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Fast Payouts
              </CardTitle>
              <CardDescription>
                Weekly payments directly to your bank account.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
            <CardDescription>
              Sign up now to create your creator account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" asChild>
              <Link href="/onboarding">
                Create Creator Account
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-3xl mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Everything You Need to Succeed
        </h2>
        <div className="space-y-4">
          {[
            'Flexible subscription tiers',
            'Exclusive content protection',
            'Advanced analytics dashboard',
            'Fan relationship management',
            'Secure payment processing',
            'Marketing tools & insights',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
