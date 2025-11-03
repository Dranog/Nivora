/**
 * Metadata Tests (F9)
 * Verify og:title, og:description, twitter:card in metadata
 */

import { describe, it, expect } from 'vitest';
import {
  generateSiteMetadata,
  generateCreatorMetadata,
  generatePostMetadata,
  generateLegalMetadata,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

describe('SEO Metadata', () => {
  describe('generateSiteMetadata', () => {
    it('should generate default site metadata with og and twitter tags', () => {
      const metadata = generateSiteMetadata();

      // Check basic metadata
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();

      // Check OpenGraph metadata
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.siteName).toBe(SITE_NAME);
      expect(metadata.openGraph?.title).toBe(SITE_NAME);
      expect(metadata.openGraph?.description).toBeDefined();
      expect(metadata.openGraph?.url).toBe(SITE_URL);
      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);

      // Check Twitter metadata
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.site).toBeDefined();
      expect(metadata.twitter?.creator).toBeDefined();
      expect(metadata.twitter?.title).toBe(SITE_NAME);
      expect(metadata.twitter?.description).toBeDefined();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('should allow overriding metadata fields', () => {
      const customTitle = 'Custom Page Title';
      const metadata = generateSiteMetadata({
        title: customTitle,
      });

      expect(metadata.title).toBe(customTitle);
    });
  });

  describe('generateCreatorMetadata', () => {
    it('should generate creator profile metadata with og and twitter tags', () => {
      const creator = {
        name: 'Jane Doe',
        handle: 'janedoe',
        bio: 'Content creator and digital artist',
        avatar: 'https://example.com/avatar.jpg',
      };

      const metadata = generateCreatorMetadata(creator);

      // Check title
      expect(metadata.title).toBe(`${creator.name} (@${creator.handle})`);

      // Check description
      expect(metadata.description).toBe(creator.bio);

      // Check OpenGraph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe('profile');
      expect(metadata.openGraph?.title).toContain(creator.name);
      expect(metadata.openGraph?.title).toContain(creator.handle);
      expect(metadata.openGraph?.description).toBe(creator.bio);
      expect(metadata.openGraph?.url).toContain(creator.handle);
      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);

      // Check Twitter
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toContain(creator.name);
      expect(metadata.twitter?.description).toBe(creator.bio);
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('should use fallback description if bio is not provided', () => {
      const creator = {
        name: 'Jane Doe',
        handle: 'janedoe',
      };

      const metadata = generateCreatorMetadata(creator);

      expect(metadata.description).toContain(creator.name);
      expect(metadata.description).toContain(SITE_NAME);
    });

    it('should generate correct OG image URL with encoded parameters', () => {
      const creator = {
        name: 'Jane Doe',
        handle: 'janedoe',
      };

      const metadata = generateCreatorMetadata(creator);
      const ogImage = metadata.openGraph?.images?.[0];

      expect(ogImage).toBeDefined();
      if (typeof ogImage === 'object' && ogImage !== null && 'url' in ogImage) {
        expect(ogImage.url).toContain('/api/og');
        expect(ogImage.url).toContain('handle=janedoe');
        expect(ogImage.url).toContain(encodeURIComponent('Jane Doe'));
      }
    });
  });

  describe('generatePostMetadata', () => {
    it('should generate post metadata with og and twitter tags', () => {
      const post = {
        id: '123',
        title: 'My Awesome Post',
        content: 'This is the content of my post with some interesting information.',
        isPaid: true,
        creatorHandle: 'janedoe',
        creatorName: 'Jane Doe',
      };

      const metadata = generatePostMetadata(post);

      // Check title
      expect(metadata.title).toBe(post.title);

      // Check description (should use content slice)
      expect(metadata.description).toBeDefined();
      expect(metadata.description).toContain('This is the content');

      // Check OpenGraph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.title).toBe(post.title);
      expect(metadata.openGraph?.description).toBeDefined();
      expect(metadata.openGraph?.url).toContain(post.creatorHandle);
      expect(metadata.openGraph?.url).toContain(post.id);
      expect(metadata.openGraph?.authors).toContain(post.creatorName);
      expect(metadata.openGraph?.images).toBeDefined();

      // Check Twitter
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe(post.title);
      expect(metadata.twitter?.description).toBeDefined();
    });

    it('should use fallback description for paid posts without content', () => {
      const post = {
        id: '123',
        title: 'Exclusive Content',
        isPaid: true,
        creatorHandle: 'janedoe',
        creatorName: 'Jane Doe',
      };

      const metadata = generatePostMetadata(post);

      expect(metadata.description).toContain('Exclusive');
      expect(metadata.description).toContain(post.creatorName);
    });

    it('should indicate free posts in description', () => {
      const post = {
        id: '123',
        title: 'Free Post',
        isPaid: false,
        creatorHandle: 'janedoe',
        creatorName: 'Jane Doe',
      };

      const metadata = generatePostMetadata(post);

      expect(metadata.description).toContain('Public');
      expect(metadata.description).toContain(post.creatorName);
    });

    it('should truncate long content in description', () => {
      const longContent = 'a'.repeat(200);
      const post = {
        id: '123',
        title: 'Post with Long Content',
        content: longContent,
        isPaid: false,
        creatorHandle: 'janedoe',
        creatorName: 'Jane Doe',
      };

      const metadata = generatePostMetadata(post);

      expect(metadata.description?.length).toBeLessThanOrEqual(160);
    });
  });

  describe('generateLegalMetadata', () => {
    it('should generate Terms of Service metadata', () => {
      const metadata = generateLegalMetadata('tos');

      expect(metadata.title).toBe('Terms of Service');
      expect(metadata.description).toContain('Terms of Service');
      expect(metadata.description).toContain(SITE_NAME);
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.url).toContain('/legal/tos');
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary');
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
    });

    it('should generate Privacy Policy metadata', () => {
      const metadata = generateLegalMetadata('privacy');

      expect(metadata.title).toBe('Privacy Policy');
      expect(metadata.description).toContain('Privacy Policy');
      expect(metadata.openGraph?.url).toContain('/legal/privacy');
    });

    it('should generate Cookie Policy metadata', () => {
      const metadata = generateLegalMetadata('cookies');

      expect(metadata.title).toBe('Cookie Policy');
      expect(metadata.description).toContain('Cookie Policy');
      expect(metadata.openGraph?.url).toContain('/legal/cookies');
    });
  });

  describe('Metadata Structure Validation', () => {
    it('should ensure all metadata helpers return proper OpenGraph structure', () => {
      const siteMetadata = generateSiteMetadata();
      const creatorMetadata = generateCreatorMetadata({
        name: 'Test',
        handle: 'test',
      });
      const postMetadata = generatePostMetadata({
        id: '1',
        title: 'Test',
        isPaid: false,
        creatorHandle: 'test',
        creatorName: 'Test',
      });
      const legalMetadata = generateLegalMetadata('tos');

      const allMetadata = [siteMetadata, creatorMetadata, postMetadata, legalMetadata];

      allMetadata.forEach((metadata) => {
        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph?.title).toBeDefined();
        expect(metadata.openGraph?.description).toBeDefined();
        expect(metadata.openGraph?.url).toBeDefined();
      });
    });

    it('should ensure all metadata helpers return proper Twitter card structure', () => {
      const siteMetadata = generateSiteMetadata();
      const creatorMetadata = generateCreatorMetadata({
        name: 'Test',
        handle: 'test',
      });
      const postMetadata = generatePostMetadata({
        id: '1',
        title: 'Test',
        isPaid: false,
        creatorHandle: 'test',
        creatorName: 'Test',
      });
      const legalMetadata = generateLegalMetadata('tos');

      const allMetadata = [siteMetadata, creatorMetadata, postMetadata, legalMetadata];

      allMetadata.forEach((metadata) => {
        expect(metadata.twitter).toBeDefined();
        expect(metadata.twitter?.card).toBeDefined();
        expect(metadata.twitter?.title).toBeDefined();
        expect(metadata.twitter?.description).toBeDefined();
      });
    });
  });
});
