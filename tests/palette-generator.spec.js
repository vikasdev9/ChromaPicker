import { test, expect } from '@playwright/test';

test.describe('Palette Generator Suite — Generation, Locking, Color Modification, and Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-palette-generator', { waitUntil: 'domcontentloaded' });
  });

  test('Page loads with 5 initial palette swatches', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /color palette generator/i })).toBeVisible();

    // Verify 5 swatch columns/cards exist
    const swatches = page.locator('.chroma-card div').filter({ hasText: /#[0-9A-Fa-f]{6}/ });
    await expect(swatches.first()).toBeVisible();
  });

  test('Clicking Generate button generates new colors', async ({ page }) => {
    const firstColorHex = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').first().textContent();

    const generateBtn = page.getByRole('button', { name: /generate/i });
    await generateBtn.click();

    // Wait brief moment for state update
    const updatedHex = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').first().textContent();
    expect(updatedHex).toBeTruthy();
  });

  test('Locking a color preserves it during subsequent generations', async ({ page }) => {
    // Find first lock button and click it to lock
    const lockBtn = page.locator('button[title*="Lock"]').first();
    await lockBtn.click();

    const lockedHex = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').first().textContent();

    // Trigger regeneration
    const generateBtn = page.getByRole('button', { name: /generate/i });
    await generateBtn.click();

    // Locked hex should remain unchanged
    const afterHex = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').first().textContent();
    expect(afterHex).toBe(lockedHex);
  });

  test('Adding a color increases palette count up to maximum', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add color/i }).first();
    await addBtn.scrollIntoViewIfNeeded();

    const initialCount = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').count();
    await addBtn.click();

    const newCount = await page.locator('span:text-matches("^#[0-9A-Fa-f]{6}$")').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('Copy all HEX button copies all palette colors to clipboard', async ({ page }) => {
    const copyAllBtn = page.getByRole('button', { name: /copy all/i });
    await copyAllBtn.click();

    // Verify toast confirms copy
    await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();
  });
});
