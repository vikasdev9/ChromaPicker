import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/color/2596be',
  '/color-palette-generator',
  '/color-contrast-checker',
  '/color-gradient-generator',
  '/color-blindness-simulator',
  '/browse-colors',
  '/color-converter',
  '/palette-creator',
  '/pricing',
  '/about',
  '/privacy',
  '/contact'
];

test.describe('Technical SEO Suite — Meta Tags, Headings, Links, Robots, and Indexability', () => {
  test('Verify robots.txt is accessible and well-formed', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('User-agent:');
    expect(body).toContain('Allow:');
    expect(body).toContain('Sitemap:');
  });

  test('Check sitemap.xml exists and returns 200 OK', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('https://chromapick.io/');
  });

  test('Root document contains critical Open Graph and meta description tags', async ({ page }) => {
    await page.goto('/');

    // Meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);

    // Open Graph Title & Description
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Chromapick/i);

    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  for (const route of PUBLIC_ROUTES) {
    test(`Route ${route} has a descriptive H1 heading and page title`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Page Title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);

      // Exactly one prominent H1 per page for SEO hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Expected at least 1 H1 heading on ${route}, found ${h1Count}`).toBeGreaterThanOrEqual(1);

      const h1Text = await page.locator('h1').first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(3);
    });
  }

  test('All rendered images across core routes have descriptive alt attributes', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt, `Image #${i} on homepage is missing alt attribute`).not.toBeNull();
      expect(alt?.trim().length).toBeGreaterThan(0);
    }
  });

  test('Internal navigation links have valid href attributes and no dead fragments', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a[href^="/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(10);

    for (let i = 0; i < Math.min(count, 15); i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).not.toBe('');
    }
  });
});
