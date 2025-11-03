import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('should display marketplace listings', async ({ page }) => {
    await page.goto('/market');
    await expect(page.locator('h1')).toContainText('Marketplace');
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/market');

    // Wait for categories to load
    await page.waitForSelector('[role="button"]');

    // Click on Fashion category (example)
    await page.click('text=Fashion');

    // Should update URL or filter results
    await page.waitForTimeout(1000);
  });

  test('should navigate to listing detail', async ({ page }) => {
    await page.goto('/market');

    // Wait for listings to load
    await page.waitForSelector('a[href*="/market/listing/"]', { timeout: 10000 });

    // Click on first listing
    await page.click('a[href*="/market/listing/"]');

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/market\/listing\/.+/);
  });

  test('should create new listing (authenticated)', async ({ page }) => {
    // TODO: Login as creator first
    // await page.goto('/auth/login');
    // ... authentication steps

    await page.goto('/market/my-listings');
    await page.click('text=Create New Listing');

    // Fill form
    // await page.fill('[name="title"]', 'Test Listing');
    // await page.fill('[name="description"]', 'Test description');
    // await page.fill('[name="price"]', '100');

    // Submit
    // await page.click('button[type="submit"]');

    // Should redirect or show success
    // await expect(page).toHaveURL(/\/market\/my-listings/);
  });
});
