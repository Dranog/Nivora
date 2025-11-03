/**
 * FAQ Component (F9)
 * Accordion-based FAQ for support page
 */

'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export function FAQ({ items, className }: FAQProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-faq">
        <p className="text-muted-foreground">No FAQ items available.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className={className} data-testid="faq-accordion">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} data-testid={`faq-item-${item.id}`}>
          <AccordionTrigger className="text-left" data-testid={`faq-question-${item.id}`}>
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${item.id}`}>
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/**
 * Default FAQ items for the platform
 */
export const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-platform',
    question: 'What is FanSpace?',
    answer:
      'FanSpace is a platform that connects creators with their biggest fans. Creators can offer exclusive content, subscriptions, and direct interactions with their audience.',
  },
  {
    id: 'how-to-subscribe',
    question: 'How do I subscribe to a creator?',
    answer:
      'Visit a creator\'s public profile, browse their available subscription tiers, and click "Subscribe" on the tier that best fits your needs. You\'ll be guided through a secure checkout process.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. All payments are processed securely through our payment provider.',
  },
  {
    id: 'cancel-subscription',
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to have access to the creator\'s content until the end of your current billing period.',
  },
  {
    id: 'creator-signup',
    question: 'How do I become a creator on FanSpace?',
    answer:
      'Click "Become a Creator" in the navigation menu and complete the registration process. You\'ll need to verify your identity and set up your payment details to start receiving payments from subscribers.',
  },
  {
    id: 'creator-fees',
    question: 'What fees does FanSpace charge creators?',
    answer:
      'FanSpace charges a platform fee on all transactions. This fee covers payment processing, hosting, and platform maintenance. Detailed fee information is available in your creator dashboard.',
  },
  {
    id: 'refund-policy',
    question: 'What is your refund policy?',
    answer:
      'Refunds are handled on a case-by-case basis. If you believe you\'re entitled to a refund, please contact our support team with your order details, and we\'ll review your request.',
  },
  {
    id: 'content-policy',
    question: 'What content is allowed on FanSpace?',
    answer:
      'FanSpace allows a wide range of creative content, but we have strict policies against illegal content, harassment, and content that violates our Terms of Service. Please review our Content Policy for full details.',
  },
  {
    id: 'privacy',
    question: 'How is my personal information protected?',
    answer:
      'We take privacy seriously and implement industry-standard security measures to protect your data. We never sell your personal information to third parties. See our Privacy Policy for complete details.',
  },
  {
    id: 'support',
    question: 'How do I contact support?',
    answer:
      'You can reach our support team through the contact form on this page, or by emailing support@fanspace.com. We typically respond within 24-48 hours.',
  },
];
