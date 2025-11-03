/**
 * Support Page (F9)
 * /support - FAQ and contact information
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FAQ, DEFAULT_FAQ_ITEMS } from '@/components/public/FAQ';
import { Mail, MessageSquare, Book, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with FanSpace. Find answers to common questions or contact our support team.',
  openGraph: {
    title: 'Support - FanSpace',
    description: 'Get help with FanSpace. Find answers to common questions or contact our support team.',
  },
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">How Can We Help?</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <HelpCircle className="mx-auto mb-2 h-10 w-10 text-primary" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Browse answers to frequently asked questions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Book className="mx-auto mb-2 h-10 w-10 text-primary" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Learn how to use FanSpace features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="mx-auto mb-2 h-10 w-10 text-primary" />
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Connect with other creators and fans
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="mx-auto mb-2 h-10 w-10 text-primary" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Get personalized help from our team
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Quick answers to common questions about FanSpace
              </p>
            </div>
            <FAQ items={DEFAULT_FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Still Need Help?</CardTitle>
                <CardDescription>
                  Our support team is here to assist you with any questions or issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Email Support */}
                  <Card>
                    <CardHeader>
                      <Mail className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Email Support</CardTitle>
                      <CardDescription>
                        Get a response within 24-48 hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">
                        For general inquiries, account issues, or technical problems
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="mailto:support@fanspace.com">
                          support@fanspace.com
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Creator Support */}
                  <Card>
                    <CardHeader>
                      <MessageSquare className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Creator Support</CardTitle>
                      <CardDescription>
                        Dedicated help for content creators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">
                        For help with creator tools, payouts, and platform features
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="mailto:creators@fanspace.com">
                          creators@fanspace.com
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Resources */}
                <div className="border-t pt-6">
                  <h3 className="mb-4 font-semibold">Additional Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/legal/tos" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      - Review our terms and conditions
                    </li>
                    <li>
                      <Link href="/legal/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>{' '}
                      - Learn how we protect your data
                    </li>
                    <li>
                      <Link href="/legal/cookies" className="text-primary hover:underline">
                        Cookie Policy
                      </Link>{' '}
                      - Understand our use of cookies
                    </li>
                  </ul>
                </div>

                {/* Report Issues */}
                <div className="border-t pt-6">
                  <h3 className="mb-2 font-semibold">Report an Issue</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    If you encounter inappropriate content or behavior, please report it
                    immediately. We take all reports seriously and will investigate promptly.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="mailto:abuse@fanspace.com">Report Abuse</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
