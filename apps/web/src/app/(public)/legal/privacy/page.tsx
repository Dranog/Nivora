/**
 * Privacy Policy Page (F9)
 * /legal/privacy
 */

import { generateLegalMetadata } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = generateLegalMetadata('privacy');

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  FanSpace ("we," "us," or "our") is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you use our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>We collect several types of information:</p>
                <h4>Personal Information</h4>
                <ul>
                  <li>Name, email address, and profile information</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Communication preferences</li>
                  <li>Identity verification documents (for creators)</li>
                </ul>
                <h4>Usage Information</h4>
                <ul>
                  <li>Pages visited, content viewed, and interactions</li>
                  <li>Device information (browser, operating system, IP address)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Analytics data about platform usage</li>
                </ul>
                <h4>Content Information</h4>
                <ul>
                  <li>Posts, comments, and messages you create</li>
                  <li>Media files you upload</li>
                  <li>Subscription and purchase history</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>We use your information to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Communicate with you about your account and updates</li>
                  <li>Personalize your experience on the platform</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Analyze usage patterns and optimize performance</li>
                  <li>Comply with legal obligations</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>We may share your information with:</p>
                <h4>Creators and Subscribers</h4>
                <p>
                  When you subscribe to a creator, your basic profile information (name, username)
                  may be visible to them.
                </p>
                <h4>Service Providers</h4>
                <p>
                  We work with third-party service providers for payment processing, hosting,
                  analytics, and customer support. These providers only receive information
                  necessary for their services.
                </p>
                <h4>Legal Requirements</h4>
                <p>
                  We may disclose information if required by law, court order, or to protect our
                  rights, property, or safety.
                </p>
                <h4>Business Transfers</h4>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be
                  transferred to the new entity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We implement industry-standard security measures to protect your information,
                  including:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>You have the right to:</p>
                <ul>
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your account and personal data</li>
                  <li>Object to or restrict certain data processing</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                  <li>Manage cookie preferences</li>
                </ul>
                <p>
                  To exercise these rights, contact us at privacy@fanspace.com or use your account
                  settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>We use cookies and similar technologies to:</p>
                <ul>
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Analyze site usage and performance</li>
                  <li>Deliver personalized content</li>
                  <li>Provide social media features</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Some features may not work
                  properly if you disable cookies. See our Cookie Policy for more details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We retain your information for as long as your account is active or as needed to
                  provide services. When you delete your account, we will delete or anonymize your
                  personal information, except as required for legal, security, or business
                  purposes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  Your information may be transferred to and processed in countries other than your
                  own. We ensure appropriate safeguards are in place to protect your information in
                  accordance with this Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  FanSpace is not intended for users under 18 years of age. We do not knowingly
                  collect personal information from children. If we become aware that a child has
                  provided us with personal information, we will take steps to delete such
                  information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of
                  significant changes by email or through the platform. Your continued use of
                  FanSpace after changes indicates your acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  If you have questions about this Privacy Policy or our data practices, contact
                  us at:
                  <br />
                  Email: privacy@fanspace.com
                  <br />
                  Mailing Address: FanSpace Privacy Team, [Address]
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
