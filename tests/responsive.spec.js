import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 568, name: 'Small Mobile (iPhone SE 1st)' },
  { width: 360, height: 800, name: 'Standard Android (Galaxy S20)' },
  { width: 375, height: 812, name: 'Standard Mobile (iPhone X/12m)' },
  { width: 390, height: 844, name: 'Large Mobile (iPhone 14)' },
  { width: 430, height: 932, name: 'Max Mobile (iPhone 15 Pro Max)' },
  { width: 768, height: 1024, name: 'Tablet Portrait (iPad)' },
  { width: 1024, height: 768, name: 'Tablet Landscape / Small Laptop' },
  { width: 1280, height: 800, name: 'Medium Laptop' },
  { width: 1440, height: 900, name: 'Large Desktop Monitor' },
  { width: 1920, height: 1080, name: 'Ultra-wide Full HD Monitor' }
];

test.describe('Responsive Suite — Multi-Viewport Audit & Zero Overflow Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`Viewport ${vp.width}x${vp.height} (${vp.name}) has zero horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Check horizontal overflow
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth
      }));

      expect(
        metrics.scrollWidth,
        `Horizontal overflow detected at ${vp.width}px! scrollWidth is ${metrics.scrollWidth}px`
      ).toBeLessThanOrEqual(metrics.innerWidth + 1); // 1px tolerance for subpixel rendering

      // Header should always be visible
      await expect(page.locator('.site-header')).toBeVisible();

      // Navigation adaptation verification:
      if (vp.width <= 1024) {
        // Mobile hamburger button must be visible
        await expect(page.locator('.mobile-only-btn')).toBeVisible();
        // Desktop nav should be hidden
        const desktopNav = page.locator('.header-nav');
        if (await desktopNav.count() > 0) {
          await expect(desktopNav).toBeHidden();
        }
        // Skyscraper ad sidebars must be hidden
        const leftAd = page.locator('.desktop-ad-left');
        if (await leftAd.count() > 0) {
          await expect(leftAd).toBeHidden();
        }
      } else {
        // Desktop nav must be visible
        await expect(page.locator('.header-nav')).toBeVisible();
        // Mobile button must be hidden
        await expect(page.locator('.mobile-only-btn')).toBeHidden();
      }

      // Main image workspace must remain visible
      await expect(page.locator('.workspace-grid')).toBeVisible();
    });
  }

  test('Responsive adaptation on secondary tool pages at 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const secondaryPages = [
      '/color-contrast-checker',
      '/color-converter',
      '/color-gradient-generator',
      '/color-blindness-simulator',
      '/browse-colors',
      '/pricing'
    ];

    for (const url of secondaryPages) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      expect(metrics.scrollWidth, `Overflow on ${url} at 320px`).toBeLessThanOrEqual(metrics.innerWidth + 1);
    }
  });
});
