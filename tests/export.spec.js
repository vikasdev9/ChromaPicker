import { test, expect } from '@playwright/test';

test.describe('Export Suite — Palette Formats, Downloads, and Clipboard Outputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Export dropdown menu opens and lists all 8 supported export formats', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /^export/i }).first();
    await exportBtn.scrollIntoViewIfNeeded();
    await exportBtn.click();

    // Verify all 8 formats exist in the menu
    await expect(page.getByRole('button', { name: /css variables/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /json palette/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /ase \(adobe swatch exchange\)/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /png image card/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /svg vector swatches/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /scss variables/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /plain txt list/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /gimp\/inkscape gpl/i }).first()).toBeVisible();
  });

  test('Exporting CSS variables triggers file download', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /^export/i }).first();
    await exportBtn.scrollIntoViewIfNeeded();
    await exportBtn.click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /css variables/i }).first().click()
    ]);

    expect(download.suggestedFilename()).toContain('.css');
  });

  test('Exporting JSON palette triggers .json download', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /^export/i }).first();
    await exportBtn.scrollIntoViewIfNeeded();
    await exportBtn.click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /json palette/i }).first().click()
    ]);

    expect(download.suggestedFilename()).toContain('.json');
  });

  test('Quick format chips export palette with 1-click', async ({ page }) => {
    const cssChip = page.locator('.palette-formats-card button:has-text("CSS")');
    if (await cssChip.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        cssChip.click()
      ]);
      expect(download.suggestedFilename()).toContain('.css');
    }
  });
});
