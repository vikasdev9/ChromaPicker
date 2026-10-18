import { test, expect } from '@playwright/test';

test.describe('Gradient Generator Suite — Linear/Radial Controls, Stops, and CSS Output', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-gradient-generator', { waitUntil: 'domcontentloaded' });
  });

  test('Page loads with gradient canvas preview and CSS declaration', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /css gradient generator/i })).toBeVisible();
    await expect(page.locator('.gradient-grid')).toBeVisible();

    // Verify CSS output code box contains linear-gradient
    const cssCodeBox = page.locator('code, pre, .code-box, div').filter({ hasText: /linear-gradient/i }).first();
    await expect(cssCodeBox).toBeVisible();
  });

  test('Switching between Linear and Radial types updates the CSS output', async ({ page }) => {
    const radialBtn = page.getByRole('button', { name: /radial/i });
    await radialBtn.click();

    // CSS output should now say radial-gradient
    await expect(page.locator('text=/radial-gradient/i').first()).toBeVisible();

    const linearBtn = page.getByRole('button', { name: /linear/i });
    await linearBtn.click();
    await expect(page.locator('text=/linear-gradient/i').first()).toBeVisible();
  });

  test('Adding a color stop increases stops count and updates gradient', async ({ page }) => {
    const addStopBtn = page.getByRole('button', { name: /add stop/i });
    await addStopBtn.scrollIntoViewIfNeeded();

    const initialStopsCount = await page.locator('text=/%/').count();
    await addStopBtn.click();

    // Verify new stop was added
    const newStopsCount = await page.locator('text=/%/').count();
    expect(newStopsCount).toBeGreaterThan(initialStopsCount);
  });

  test('Clicking a preset gradient applies its stops and colors', async ({ page }) => {
    const presetCard = page.getByText('Sunset Ocean').first();
    await presetCard.scrollIntoViewIfNeeded();
    await presetCard.click();

    // CSS should contain sunset colors (e.g. #F97316 or rgb equivalent)
    await expect(page.getByText(/#F97316|rgb\(249/i).first()).toBeVisible();
  });

  test('Copy CSS button copies gradient declaration and shows toast', async ({ page }) => {
    const copyBtn = page.getByRole('button', { name: /copy css/i });
    await copyBtn.scrollIntoViewIfNeeded();
    await copyBtn.click();

    // Toast alert should confirm copy
    await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();
  });
});
