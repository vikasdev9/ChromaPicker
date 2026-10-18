import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', name: 'Home / Image Color Extractor' },
  { path: '/image-color-extractor', name: 'Image Color Extractor Alias' },
  { path: '/color/2596be', name: 'Color Detail Page' },
  { path: '/color-palette-generator', name: 'Palette Generator' },
  { path: '/color-contrast-checker', name: 'Contrast Checker' },
  { path: '/color-gradient-generator', name: 'Gradient Generator' },
  { path: '/color-blindness-simulator', name: 'Color Blindness Simulator' },
  { path: '/browse-colors', name: 'Browse Colors' },
  { path: '/color-converter', name: 'Color Converter' },
  { path: '/palette-creator', name: 'Palette Creator' },
  { path: '/pricing', name: 'Pricing Page' },
  { path: '/about', name: 'About Page' },
  { path: '/privacy', name: 'Privacy Page' },
  { path: '/contact', name: 'Contact Page' }
];

test.describe('Smoke Suite — All Routes Availability & Zero Uncaught Errors', () => {
  for (const route of ROUTES) {
    test(`Route ${route.path} (${route.name}) loads successfully with no uncaught page errors`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);

      // Verify page title exists and contains branding
      await expect(page).toHaveTitle(/Chromapick/i);

      // Verify main container renders
      await expect(page.locator('.app-container')).toBeVisible();
      await expect(page.locator('.site-header')).toBeVisible();
      await expect(page.locator('.site-footer')).toBeVisible();

      // Check no fatal page errors occurred during load
      expect(pageErrors, `Uncaught errors on ${route.path}: ${pageErrors.join(', ')}`).toEqual([]);
    });
  }

  test('404 Not Found Page renders properly for unknown paths', async ({ page }) => {
    await page.goto('/unknown-nonexistent-route-xyz', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('404');
    await expect(page.getByRole('link', { name: /return to home/i })).toBeVisible();
  });

  test('Legacy redirect /color-picker redirects to /color/2596be', async ({ page }) => {
    await page.goto('/color-picker', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/color\/2596be/);
  });
});
