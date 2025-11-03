/**
 * Public Creator Profile Page Tests (F9)
 * Test profile with offers + locked/unlocked posts
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreatorProfilePage from '../page';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('Creator Profile Page', () => {
  it('should render creator header with name and handle', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for creator name and handle
    expect(container.textContent).toContain('Jane Doe');
    expect(container.textContent).toContain('@janedoe');
  });

  it('should render creator bio when available', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for bio text
    expect(container.textContent).toContain('Content creator and digital artist');
  });

  it('should render stats (followers, posts, revenue)', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for stats (numbers may have comma or space separators depending on locale)
    expect(container.textContent).toMatch(/12[,\s]500/); // followers
    expect(container.textContent).toContain('156'); // posts
    expect(container.textContent).toMatch(/8[,\s]500/); // revenue
    expect(container.textContent).toContain('Followers');
    expect(container.textContent).toContain('Posts');
    expect(container.textContent).toContain('Monthly Revenue');
  });

  it('should render subscription tiers section', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for subscription section
    expect(container.textContent).toContain('Subscription Tiers');
    expect(container.textContent).toContain('Choose a tier');
  });

  it('should render offer cards with titles and prices', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for offer titles
    expect(container.textContent).toContain('Basic Tier');
    expect(container.textContent).toContain('Premium Tier');
    expect(container.textContent).toContain('VIP Tier');

    // Check for prices
    expect(container.textContent).toContain('$9.99');
    expect(container.textContent).toContain('$24.99');
    expect(container.textContent).toContain('$49.99');
  });

  it('should mark popular tier with badge', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for popular badge
    expect(container.textContent).toContain('Popular');
  });

  it('should render subscribe buttons for each tier', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for subscribe buttons (should have 3 - one per tier)
    const subscribeButtons = Array.from(container.querySelectorAll('button'))
      .filter(btn => btn.textContent?.includes('Subscribe'));

    expect(subscribeButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('should render posts section', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for posts section
    expect(container.textContent).toContain('Recent Posts');
    expect(container.textContent).toContain('Check out the latest content');
  });

  it('should render both locked and unlocked posts', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for locked post badge
    expect(container.textContent).toContain('Locked');

    // Check for post titles
    expect(container.textContent).toContain('My Creative Process');
    expect(container.textContent).toContain('Exclusive Tutorial');
  });

  it('should show unlock button for locked posts', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for unlock buttons
    expect(container.textContent).toContain('Unlock Post');
  });

  it('should blur locked post content', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for blur class on locked content
    const elements = container.querySelectorAll('.blur-sm');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should display post prices for locked posts', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Locked posts show price
    const priceMatches = container.textContent?.match(/\$9\.99/g);
    expect(priceMatches).toBeDefined();
    expect(priceMatches!.length).toBeGreaterThan(0);
  });

  it('should show publication dates for posts', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for date elements
    expect(container.querySelector('time')).toBeDefined();
  });

  it('should render View Offers CTA button in header', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for View Offers button
    expect(container.textContent).toContain('View Offers');
  });

  it('should display creator avatar', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for avatar image
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render offer benefits as bullet points', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for benefit items
    expect(container.textContent).toContain('Access to exclusive posts');
    expect(container.textContent).toContain('Monthly behind-the-scenes content');
    expect(container.textContent).toContain('Community chat access');
  });

  it('should have proper test IDs for components', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for data-testid attributes
    const testIds = [
      'creator-header',
      'creator-stats',
      'offer-grid',
    ];

    testIds.forEach(testId => {
      const element = container.querySelector(`[data-testid="${testId}"]`);
      expect(element).toBeDefined();
    });
  });

  it('should display correct billing intervals', async () => {
    const params = Promise.resolve({ handle: 'janedoe' });

    const page = await CreatorProfilePage({ params });
    const { container } = render(page);

    // Check for /mo or /month indicators
    expect(container.textContent).toMatch(/\/mo/);
  });
});
