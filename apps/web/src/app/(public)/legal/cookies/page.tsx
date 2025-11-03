/**
 * Cookie Policy Page (F9)
 * /legal/cookies
 */

import { generateLegalMetadata } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = generateLegalMetadata('cookies');

export default function CookiePolicyPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. What Are Cookies?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  Cookies are small text files that are placed on your device when you visit a
                  website. They are widely used to make websites work more efficiently and provide
                  information to website owners.
                </p>
                <p>
                  FanSpace uses cookies and similar tracking technologies to enhance your
                  experience, analyze usage, and deliver personalized content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Types of Cookies We Use</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <h4>Essential Cookies</h4>
                <p>
                  These cookies are necessary for the website to function properly. They enable
                  basic functions like page navigation, secure areas access, and authentication.
                </p>
                <ul>
                  <li>Session management and login authentication</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                </ul>

                <h4>Functional Cookies</h4>
                <p>
                  These cookies enable enhanced functionality and personalization, such as
                  remembering your preferences and settings.
                </p>
                <ul>
                  <li>Language and region preferences</li>
                  <li>Display settings (theme, layout)</li>
                  <li>Video player preferences</li>
                </ul>

                <h4>Analytics Cookies</h4>
                <p>
                  These cookies help us understand how visitors interact with our website by
                  collecting and reporting information anonymously.
                </p>
                <ul>
                  <li>Page views and navigation patterns</li>
                  <li>Traffic sources and user demographics</li>
                  <li>Feature usage and performance metrics</li>
                  <li>Error tracking and diagnostics</li>
                </ul>

                <h4>Marketing Cookies</h4>
                <p>
                  These cookies track your activity to help us deliver relevant advertisements and
                  measure campaign effectiveness.
                </p>
                <ul>
                  <li>Ad targeting and personalization</li>
                  <li>Campaign tracking and attribution</li>
                  <li>Retargeting and remarketing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Third-Party Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We use services from trusted third-party providers who may also set cookies on
                  your device:
                </p>

                <h4>Payment Processors</h4>
                <p>
                  Payment service providers use cookies to process transactions securely and
                  prevent fraud.
                </p>

                <h4>Analytics Services</h4>
                <p>
                  We use analytics tools (such as Google Analytics) to understand user behavior and
                  improve our services.
                </p>

                <h4>Social Media Platforms</h4>
                <p>
                  Social media sharing features may set cookies to track shares and enable
                  integration with social networks.
                </p>

                <h4>Content Delivery Networks</h4>
                <p>
                  CDN providers may use cookies to optimize content delivery and performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. How We Use Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>We use cookies for the following purposes:</p>
                <ul>
                  <li>
                    <strong>Authentication:</strong> To verify your identity and maintain your login
                    session
                  </li>
                  <li>
                    <strong>Security:</strong> To detect and prevent fraudulent activity and
                    security threats
                  </li>
                  <li>
                    <strong>Preferences:</strong> To remember your settings and customize your
                    experience
                  </li>
                  <li>
                    <strong>Analytics:</strong> To understand how you use our platform and identify
                    improvements
                  </li>
                  <li>
                    <strong>Performance:</strong> To optimize loading times and ensure smooth
                    operation
                  </li>
                  <li>
                    <strong>Marketing:</strong> To deliver relevant content and measure advertising
                    effectiveness
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Cookie Duration</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <h4>Session Cookies</h4>
                <p>
                  Temporary cookies that are deleted when you close your browser. Used for
                  essential functions like authentication and shopping cart management.
                </p>

                <h4>Persistent Cookies</h4>
                <p>
                  Cookies that remain on your device for a set period or until manually deleted.
                  Used to remember your preferences and provide personalized experiences.
                </p>

                <p>Cookie retention periods vary based on their purpose:</p>
                <ul>
                  <li>Essential cookies: Duration of session or up to 30 days</li>
                  <li>Functional cookies: Up to 1 year</li>
                  <li>Analytics cookies: Up to 2 years</li>
                  <li>Marketing cookies: Up to 1 year</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Managing Your Cookie Preferences</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>You have several options to control cookies:</p>

                <h4>Browser Settings</h4>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul>
                  <li>Block all cookies</li>
                  <li>Accept only first-party cookies</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>Review and delete specific cookies</li>
                </ul>

                <h4>Cookie Consent Tool</h4>
                <p>
                  When you first visit FanSpace, we display a cookie banner that allows you to
                  accept or customize your cookie preferences. You can change these preferences at
                  any time through your account settings.
                </p>

                <h4>Opt-Out Links</h4>
                <p>For third-party cookies, you can opt out through:</p>
                <ul>
                  <li>Google Analytics: Google Analytics Opt-out Browser Add-on</li>
                  <li>Network Advertising Initiative: NAI Opt-out Tool</li>
                  <li>Digital Advertising Alliance: DAA Opt-out Tool</li>
                </ul>

                <p>
                  <strong>Important:</strong> Disabling cookies may affect functionality and
                  prevent access to certain features. Essential cookies cannot be disabled as they
                  are required for the platform to work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Do Not Track Signals</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  Some browsers include a "Do Not Track" (DNT) feature that signals websites you
                  visit that you do not want your online activity tracked. Currently, there is no
                  industry standard for how to respond to DNT signals. We do not currently respond
                  to DNT signals, but we provide you with choices about data collection through our
                  cookie consent tool.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Mobile Devices</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  Mobile devices use identifiers similar to cookies. You can manage these through
                  your device settings:
                </p>
                <ul>
                  <li>
                    <strong>iOS:</strong> Settings → Privacy → Tracking → Limit Ad Tracking
                  </li>
                  <li>
                    <strong>Android:</strong> Settings → Google → Ads → Opt out of Ads
                    Personalization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Updates to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in
                  technology, legislation, or our practices. We will notify you of significant
                  changes through the platform or by email. Please review this policy periodically
                  for updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <p>
                  If you have questions about our use of cookies or this Cookie Policy, please
                  contact us at:
                  <br />
                  Email: privacy@fanspace.com
                  <br />
                  Subject line: "Cookie Policy Inquiry"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
