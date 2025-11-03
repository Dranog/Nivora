/**
 * Checkout Fallback Page
 * SEO-friendly fallback when checkout modal is accessed directly
 */

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Checkout | Secure Payment',
  description:
    'Complete your purchase securely. Support creators with subscriptions, pay-per-view content, and tips.',
  robots: 'index, follow',
};

export default function CheckoutPage() {
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Secure Checkout</CardTitle>
          <CardDescription className="text-base mt-2">
            Complete your purchase and support your favorite creators
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              Our checkout system allows you to securely purchase subscriptions, pay-per-view
              content, and send tips to creators.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Subscriptions</h3>
              <p className="text-sm text-muted-foreground">
                Get exclusive access to creator content
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Pay-Per-View</h3>
              <p className="text-sm text-muted-foreground">
                Unlock individual premium content
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Tips</h3>
              <p className="text-sm text-muted-foreground">
                Support creators directly
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
            <h3 className="font-semibold">Secure & Protected</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>256-bit SSL encryption</li>
              <li>PCI-DSS compliant payment processing</li>
              <li>No card details stored on our servers</li>
              <li>Instant content access after purchase</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/">
                Browse Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/creator/earnings">Creator Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">How It Works</h2>
        <ol className="space-y-2">
          <li>
            <strong>Select Content:</strong> Browse and find content you want to access or
            creators you want to support.
          </li>
          <li>
            <strong>Choose Payment Type:</strong> Select from subscriptions, one-time purchases,
            or tips.
          </li>
          <li>
            <strong>Apply Promo Codes:</strong> Use promotional codes for discounts (if
            available).
          </li>
          <li>
            <strong>Complete Payment:</strong> Securely complete your transaction.
          </li>
          <li>
            <strong>Instant Access:</strong> Enjoy your content immediately after purchase.
          </li>
        </ol>

        <h2 className="text-lg font-semibold text-foreground mt-6">Creator Payouts</h2>
        <p>
          We ensure fair and timely payouts to creators:
        </p>
        <ul className="space-y-2">
          <li>
            <strong>Pay-Per-View & Tips:</strong> Funds available for withdrawal after 48 hours
          </li>
          <li>
            <strong>Subscriptions:</strong> Funds available for withdrawal after 15 days
          </li>
          <li>
            <strong>Reserve:</strong> 10% held in reserve for 30 days to protect against
            chargebacks
          </li>
        </ul>
      </div>
    </div>
  );
}
