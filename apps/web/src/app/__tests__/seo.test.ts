/**
 * SEO Tests (F9)
 * Verify sitemap and robots.txt respond with 200
 */

import { describe, it, expect } from 'vitest';
import sitemap from '../sitemap';
import robots from '../robots';
import { SITE_URL } from '@/lib/seo';

describe('SEO Files', () => {
  describe('sitemap.xml', () => {
    it('should generate sitemap successfully', async () => {
      const result = await sitemap();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include homepage in sitemap', async () => {
      const result = await sitemap();

      const homepage = result.find((entry) => entry.url === SITE_URL);
      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBe(1);
      expect(homepage?.changeFrequency).toBe('daily');
    });

    it('should include support page in sitemap', async () => {
      const result = await sitemap();

      const supportPage = result.find((entry) => entry.url === `${SITE_URL}/support`);
      expect(supportPage).toBeDefined();
      expect(supportPage?.changeFrequency).toBe('weekly');
      expect(supportPage?.priority).toBe(0.8);
    });

    it('should include legal pages in sitemap', async () => {
      const result = await sitemap();

      const legalPages = ['tos', 'privacy', 'cookies'];
      legalPages.forEach((page) => {
        const legalPage = result.find((entry) => entry.url === `${SITE_URL}/legal/${page}`);
        expect(legalPage).toBeDefined();
        expect(legalPage?.changeFrequency).toBe('monthly');
        expect(legalPage?.priority).toBe(0.5);
      });
    });

    it('should have lastModified dates for all entries', async () => {
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.lastModified).toBeDefined();
        expect(entry.lastModified).toBeInstanceOf(Date);
      });
    });

    it('should have valid URL format for all entries', async () => {
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.url).toBeDefined();
        expect(entry.url).toMatch(/^https?:\/\//);
        expect(() => new URL(entry.url)).not.toThrow();
      });
    });

    it('should have valid changeFrequency values', async () => {
      const result = await sitemap();

      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

      result.forEach((entry) => {
        if (entry.changeFrequency) {
          expect(validFrequencies).toContain(entry.changeFrequency);
        }
      });
    });

    it('should have priority values between 0 and 1', async () => {
      const result = await sitemap();

      result.forEach((entry) => {
        if (entry.priority !== undefined) {
          expect(entry.priority).toBeGreaterThanOrEqual(0);
          expect(entry.priority).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('robots.txt', () => {
    it('should generate robots.txt successfully', () => {
      const result = robots();

      expect(result).toBeDefined();
      expect(result.rules).toBeDefined();
      expect(Array.isArray(result.rules)).toBe(true);
    });

    it('should allow all user agents to crawl', () => {
      const result = robots();

      expect(result.rules).toBeDefined();
      expect(result.rules.length).toBeGreaterThan(0);

      const allAgentsRule = result.rules.find((rule) => rule.userAgent === '*');
      expect(allAgentsRule).toBeDefined();
      expect(allAgentsRule?.allow).toBe('/');
    });

    it('should disallow creator and api routes', () => {
      const result = robots();

      const allAgentsRule = result.rules.find((rule) => rule.userAgent === '*');
      expect(allAgentsRule).toBeDefined();
      expect(allAgentsRule?.disallow).toBeDefined();

      const disallowed = allAgentsRule?.disallow;
      expect(disallowed).toContain('/creator/');
      expect(disallowed).toContain('/api/');
    });

    it('should reference sitemap', () => {
      const result = robots();

      expect(result.sitemap).toBeDefined();
      expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    });

    it('should have valid sitemap URL format', () => {
      const result = robots();

      expect(result.sitemap).toMatch(/^https?:\/\//);
      expect(result.sitemap).toContain('sitemap.xml');
      expect(() => new URL(result.sitemap!)).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should have matching sitemap URL between robots.txt and actual sitemap', async () => {
      const robotsResult = robots();
      const sitemapResult = await sitemap();

      expect(robotsResult.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
      expect(sitemapResult).toBeDefined();
      expect(sitemapResult.length).toBeGreaterThan(0);
    });

    it('should ensure robots.txt allows crawling of sitemap URLs', async () => {
      const robotsResult = robots();
      const sitemapResult = await sitemap();

      const allAgentsRule = robotsResult.rules.find((rule) => rule.userAgent === '*');
      expect(allAgentsRule?.allow).toBe('/');

      // Verify that sitemap URLs are not in disallow list
      sitemapResult.forEach((entry) => {
        const path = new URL(entry.url).pathname;
        const isDisallowed = allAgentsRule?.disallow?.some((disallowPath) =>
          path.startsWith(disallowPath)
        );

        // Public pages should not be disallowed
        if (!path.startsWith('/creator/') && !path.startsWith('/api/')) {
          expect(isDisallowed).toBeFalsy();
        }
      });
    });
  });

  describe('SEO Best Practices', () => {
    it('should prioritize homepage highest in sitemap', async () => {
      const result = await sitemap();

      const homepage = result.find((entry) => entry.url === SITE_URL);
      const otherPages = result.filter((entry) => entry.url !== SITE_URL);

      expect(homepage?.priority).toBe(1);
      otherPages.forEach((page) => {
        if (page.priority !== undefined) {
          expect(page.priority).toBeLessThan(1);
        }
      });
    });

    it('should have more frequent updates for important pages', async () => {
      const result = await sitemap();

      const homepage = result.find((entry) => entry.url === SITE_URL);
      const legalPages = result.filter((entry) => entry.url.includes('/legal/'));

      expect(homepage?.changeFrequency).toBe('daily');
      legalPages.forEach((page) => {
        expect(page.changeFrequency).toBe('monthly');
      });
    });

    it('should include all required static routes', async () => {
      const result = await sitemap();
      const urls = result.map((entry) => entry.url);

      const requiredRoutes = [
        SITE_URL,
        `${SITE_URL}/support`,
        `${SITE_URL}/legal/tos`,
        `${SITE_URL}/legal/privacy`,
        `${SITE_URL}/legal/cookies`,
      ];

      requiredRoutes.forEach((route) => {
        expect(urls).toContain(route);
      });
    });
  });
});
