/**
 * Pricing Page
 * Platform pricing and fee structure
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          No monthly fees, no hidden charges. We only succeed when you succeed.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="mx-auto max-w-2xl mb-16">
        <Card className="border-2 border-primary">
          <CardHeader className="text-center pb-8">
            <Badge className="mx-auto mb-4 w-fit">For Creators</Badge>
            <CardTitle className="text-3xl">Pay As You Earn</CardTitle>
            <CardDescription className="text-base">
              Free to start, only pay when you make money
            </CardDescription>
            <div className="mt-8">
              <div className="text-5xl font-bold">15%</div>
              <div className="mt-2 text-muted-foreground">Platform fee on earnings</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Keep 85% of all revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>No monthly subscription fees</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>No setup costs or hidden charges</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Weekly payouts to your bank</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>All features included</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited subscribers</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited content uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Priority support</span>
              </div>
            </div>

            <div className="pt-6">
              <Button className="w-full" size="lg" asChild>
                <Link href="/creator/signup">
                  Get Started Free
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <div className="mx-auto max-w-4xl mb-16">
        <h2 className="mb-8 text-3xl font-bold text-center">
          How It Works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>You Earn $100</CardTitle>
              <CardDescription>From subscriptions, content sales, or tips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Revenue:</span>
                  <span className="font-semibold">$85.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (15%):</span>
                  <span>$15.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>$100.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>You Earn $1,000</CardTitle>
              <CardDescription>Growing your community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Revenue:</span>
                  <span className="font-semibold">$850.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (15%):</span>
                  <span>$150.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>$1,000.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>You Earn $10,000</CardTitle>
              <CardDescription>Thriving creator business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Revenue:</span>
                  <span className="font-semibold">$8,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (15%):</span>
                  <span>$1,500.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>$10,000.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-3xl font-bold text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Are there any monthly fees?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No! We don't charge any monthly subscription fees. You only pay our 15% platform
                fee on the money you earn.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When do I get paid?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Payouts are processed weekly, directly to your bank account or chosen payment method.
                There's a 7-day holding period for fraud protection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Are there any hidden fees?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No hidden fees. The 15% platform fee covers all features, hosting, bandwidth,
                security, and support. Payment processing fees may apply depending on your chosen
                payout method.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
