/**
 * SEO Configuration and Helpers (F9)
 */

import type { Metadata } from 'next';

// Site Configuration
export const SITE_NAME = 'FanSpace';
export const SITE_DESCRIPTION = 'The platform where creators connect with their biggest fans';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fanspace.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

// Twitter Configuration
export const TWITTER_HANDLE = '@fanspace';
export const TWITTER_SITE = '@fanspace';

/**
 * Generate default site metadata
 */
export function generateSiteMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: ['creator platform', 'fan subscriptions', 'content monetization', 'exclusive content'],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    ...overrides,
  };
}

/**
 * Generate metadata for creator profile
 */
export function generateCreatorMetadata(creator: {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
}): Metadata {
  const title = `${creator.name} (@${creator.handle})`;
  const description = creator.bio || `Follow ${creator.name} on ${SITE_NAME}`;
  const url = `${SITE_URL}/p/${creator.handle}`;
  const ogImage = `${SITE_URL}/api/og?type=creator&handle=${creator.handle}&title=${encodeURIComponent(creator.name)}`;

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate metadata for post
 */
export function generatePostMetadata(post: {
  id: string;
  title: string;
  content?: string;
  isPaid: boolean;
  creatorHandle: string;
  creatorName: string;
}): Metadata {
  const title = post.title;
  const description =
    post.content?.slice(0, 160) ||
    `${post.isPaid ? 'Exclusive' : 'Public'} post by ${post.creatorName}`;
  const url = `${SITE_URL}/p/${post.creatorHandle}/post/${post.id}`;
  const ogImage = `${SITE_URL}/api/og?type=post&handle=${post.creatorHandle}&title=${encodeURIComponent(post.title)}`;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      authors: [post.creatorName],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate metadata for legal pages
 */
export function generateLegalMetadata(
  page: 'tos' | 'privacy' | 'cookies'
): Metadata {
  const titles = {
    tos: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
  };

  const title = titles[page];
  const description = `${title} for ${SITE_NAME}`;
  const url = `${SITE_URL}/legal/${page}`;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title,
      description,
    },
    twitter: {
      card: 'summary',
      site: TWITTER_SITE,
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
