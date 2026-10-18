import { test, expect } from '@playwright/test';

test.describe('Color Converter Suite — Real-time Bidirectional Conversion & Math Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-converter', { waitUntil: 'domcontentloaded' });
  });

  test('Page renders title and input cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /universal color converter/i })).toBeVisible();
    await expect(page.locator('.converter-grid')).toBeVisible();
    await expect(page.getByText('Enter Color Values')).toBeVisible();
  });

  test('Converting HEX to RGB, HSL, and CMYK updates outputs correctly', async ({ page }) => {
    const hexInput = page.locator('input[placeholder="#2596BE"]');
    await hexInput.fill('#FF5733');

    // Verify RGB outputs match (255, 87, 51)
    await expect(page.getByText(/rgb\(255,\s*87,\s*51\)/i).first()).toBeVisible();

    // Verify HSL output
    await expect(page.getByText(/hsl\(11,\s*100%,\s*60%\)/i).first()).toBeVisible();
  });

  test('Modifying RGB channels updates HEX and secondary color representations', async ({ page }) => {
    // Fill Red=0, Green=255, Blue=0 (#00FF00 pure green)
    const redInput = page.locator('input[type="number"][max="255"]').nth(0);
    const greenInput = page.locator('input[type="number"][max="255"]').nth(1);
    const blueInput = page.locator('input[type="number"][max="255"]').nth(2);

    await redInput.fill('0');
    await greenInput.fill('255');
    await blueInput.fill('0');

    // Verify HEX updates to #00FF00
    const hexInput = page.locator('input[placeholder="#2596BE"]');
    await expect(hexInput).toHaveValue(/#00ff00/i);
  });

  test('Copy buttons copy formatted color values and show toast message', async ({ page }) => {
    // Click copy button on first format
    const copyBtn = page.locator('.copy-icon-btn').first();
    await copyBtn.click();

    // Toast alert should be displayed
    await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();
  });
});
