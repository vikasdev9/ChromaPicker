import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dark Mode & Theme Architecture Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear theme storage before each test to start with predictable state
    await page.addInitScript(() => {
      localStorage.setItem('chromapick_theme', 'light');
    });
  });

  test('Toggle theme switches between light and dark modes bidirectionally', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Click theme toggle button
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();

    // Verify dark mode applied
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveClass(/theme-dark/);

    // Click again to switch back to light mode
    const lightBtn = page.getByRole('button', { name: /switch to light mode/i });
    await lightBtn.click();

    // Verify light mode restored
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(html).toHaveClass(/theme-light/);
  });

  test('Image color picker workspace surfaces are dark in dark mode (no bright white cards)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Switch to dark mode
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Check main workspace card surface
    const workspaceCard = page.locator('.chroma-card').first();
    await expect(workspaceCard).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Check toolbar header surface
    const toolbar = page.locator('.workspace-image-toolbar');
    await expect(toolbar).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Check selected color right-column surface
    const selectedCol = page.locator('.workspace-right-col');
    await expect(selectedCol).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Check extracted palette bottom section
    const paletteSection = page.locator('.workspace-palette-section');
    await expect(paletteSection).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Check palette format buttons (CSS, JSON, ASE)
    const cssChip = page.getByRole('button', { name: /export palette as css/i });
    await expect(cssChip).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Ensure none of these major workspace surfaces are white rgb(255, 255, 255)
    await expect(workspaceCard).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(toolbar).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(selectedCol).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(paletteSection).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(cssChip).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('Dark mode passes axe-core accessibility audit on homepage without critical violations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Enable dark mode
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Run accessibility scan under dark mode
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('Major routes render cleanly under dark mode without console or page errors', async ({ page }) => {
    const routesToTest = [
      '/color-contrast-checker',
      '/color-gradient-generator',
      '/color-blindness-simulator',
      '/browse-colors',
      '/pricing',
      '/contact'
    ];

    for (const route of routesToTest) {
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('theme-dark');
      });

      // Verify page container is visible
      await expect(page.locator('.app-container')).toBeVisible();

      // Check card background is dark (excluding color/gradient preview canvases)
      const contentCard = page.locator('.chroma-card:not([style*="gradient"])').first();
      if (await contentCard.count() > 0) {
        await expect(contentCard).toHaveCSS('background-color', 'rgb(17, 24, 39)');
      }

      expect(pageErrors).toEqual([]);
    }
  });

  test('Modals render with dark background in dark mode', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop modals triggered from header action buttons');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Enable dark mode
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();

    // Open Login modal
    const loginBtn = page.getByRole('button', { name: 'Login' }).first();
    await loginBtn.click();

    const modalCard = page.locator('.modal-card').first();
    await expect(modalCard).toBeVisible();

    await expect(modalCard).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  });
});
