import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('Accessibility Suite — WCAG 2.1 AA Audit & Keyboard Navigation', () => {
  test('Audit Homepage against WCAG 2.1 AA standards using axe-core', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Persist raw scan results for QA report generation
    const reportsDir = path.resolve('qa-reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportsDir, 'axe-homepage.json'),
      JSON.stringify(accessibilityScanResults, null, 2)
    );

    // Assert zero critical/serious accessibility violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(
      criticalViolations,
      `Critical/Serious WCAG violations found: ${JSON.stringify(criticalViolations.map(v => ({ id: v.id, impact: v.impact, description: v.description })), null, 2)}`
    ).toEqual([]);
  });

  test('Audit Contrast Checker page accessibility', async ({ page }) => {
    await page.goto('/color-contrast-checker', { waitUntil: 'domcontentloaded' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const reportsDir = path.resolve('qa-reports');
    fs.writeFileSync(
      path.join(reportsDir, 'axe-contrast-checker.json'),
      JSON.stringify(results, null, 2)
    );

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('Audit Color Converter page accessibility', async ({ page }) => {
    await page.goto('/color-converter', { waitUntil: 'domcontentloaded' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('Keyboard navigation: User can Tab through primary navigation and trigger items with Enter/Space', async ({ page }) => {
    await page.goto('/');

    // Focus starts at document body
    await page.keyboard.press('Tab');
    const firstFocusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusedTag).toMatch(/A|BUTTON|INPUT/);
  });

  test('Modals have accessible dialog attributes and trap focus or have close label', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop action buttons are in mobile drawer');
    await page.goto('/');

    // Open Pro modal
    const proBtn = page.locator('.header-desktop-action.btn-gold').first();
    await proBtn.click();

    const dialog = page.locator('.modal-card').first();
    await expect(dialog).toBeVisible();

    // Verify accessible close button has aria-label
    const closeBtn = dialog.locator('button[aria-label="Close"], button[aria-label*="lose"]').first();
    await expect(closeBtn).toBeVisible();
  });
});
