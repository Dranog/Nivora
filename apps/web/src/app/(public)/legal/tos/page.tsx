/**
 * Terms of Service Page (F9)
 * /legal/tos
 */

import { generateLegalMetadata } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = generateLegalMetadata('tos');

export default function TermsOfServicePage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  By accessing or using FanSpace ("Service"), you agree to be bound by these Terms
                  of Service ("Terms"). If you disagree with any part of the terms, you may not
                  access the Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  FanSpace provides a platform that connects content creators with their audience
                  through subscriptions, exclusive content, and direct interactions. The Service
                  includes tools for content management, payment processing, and community
                  engagement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  To use certain features of the Service, you must create an account. You are
                  responsible for:
                </p>
                <ul>
                  <li>Maintaining the security of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Providing accurate and complete information</li>
                </ul>
                <p>
                  You must be at least 18 years old to create an account and use the Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Creator Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>As a creator on FanSpace, you agree to:</p>
                <ul>
                  <li>Provide accurate information about your subscription offerings</li>
                  <li>Deliver promised content and benefits to your subscribers</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not post illegal, harmful, or infringing content</li>
                  <li>Respect intellectual property rights of others</li>
                  <li>Maintain professional conduct with subscribers</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Subscriber Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>As a subscriber, you agree to:</p>
                <ul>
                  <li>Pay all applicable fees for subscriptions</li>
                  <li>Not share or redistribute exclusive content</li>
                  <li>Respect the creator's intellectual property rights</li>
                  <li>Not use the Service for harassment or illegal activities</li>
                  <li>Follow community guidelines and creator rules</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Payment and Fees</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  FanSpace charges platform fees on transactions. All fees are clearly disclosed
                  before processing payments. Subscriptions are billed on a recurring basis unless
                  canceled. Refunds are handled on a case-by-case basis according to our refund
                  policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Content Ownership and License</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  Creators retain ownership of their content. By posting content on FanSpace,
                  creators grant us a limited license to display, distribute, and promote the
                  content on the platform. This license terminates when the content is deleted.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Prohibited Content</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>The following content is strictly prohibited on FanSpace:</p>
                <ul>
                  <li>Illegal content or content promoting illegal activities</li>
                  <li>Content that infringes on intellectual property rights</li>
                  <li>Harassment, threats, or hate speech</li>
                  <li>Spam or misleading content</li>
                  <li>Content depicting minors in inappropriate contexts</li>
                  <li>Malware or phishing attempts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                  Users may also terminate their accounts at any time. Upon termination, access to
                  the Service will be revoked, though certain provisions of these Terms will
                  survive termination.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  FanSpace is provided "as is" without warranties of any kind. We are not liable
                  for any indirect, incidental, special, consequential, or punitive damages
                  resulting from your use of the Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We reserve the right to modify these Terms at any time. Users will be notified
                  of significant changes. Continued use of the Service after changes constitutes
                  acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  For questions about these Terms, please contact us at:
                  <br />
                  Email: legal@fanspace.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
