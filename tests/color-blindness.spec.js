import { test, expect } from '@playwright/test';

test.describe('Color Blindness Simulator Suite — CVD Perception & Simulation Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-blindness-simulator', { waitUntil: 'domcontentloaded' });
  });

  test('Page loads with Palette Simulation mode by default and CVD type cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /color blindness simulator/i })).toBeVisible();

    // Verify CVD types are listed
    await expect(page.getByText('Protanopia').first()).toBeVisible();
    await expect(page.getByText('Deuteranopia').first()).toBeVisible();
    await expect(page.getByText('Tritanopia').first()).toBeVisible();
    await expect(page.getByText('Achromatopsia').first()).toBeVisible();
  });

  test('Palette Simulation displays comparative simulated color swatches', async ({ page }) => {
    // Swatches comparison row should have simulated swatches with hex title
    const swatch = page.locator('.chroma-card div[title*="->"]').first();
    await expect(swatch).toBeVisible();
  });

  test('Switching to Image Simulation mode processes and displays simulated image cards', async ({ page }) => {
    const imageModeBtn = page.getByRole('button', { name: /image simulation/i });
    await imageModeBtn.click();

    // Wait for simulation images to render or finish processing
    const simulatedImage = page.locator('.chroma-card img').first();
    await expect(simulatedImage).toBeVisible({ timeout: 15000 });
  });
});
