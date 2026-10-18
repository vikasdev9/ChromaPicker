import { test, expect } from '@playwright/test';

test.describe('Contrast Checker Suite — WCAG 2.1 AA/AAA Compliance & Auto-Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/color-contrast-checker', { waitUntil: 'domcontentloaded' });
  });

  test('Page loads with default contrast calculation and preview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /color contrast checker/i })).toBeVisible();
    await expect(page.locator('.contrast-grid')).toBeVisible();

    // Verify contrast ratio is displayed (e.g. X.XX : 1)
    await expect(page.getByText(/\d+(\.\d+)?\s*:\s*1/).first()).toBeVisible();
  });

  test('High contrast pair (#000000 on #FFFFFF) evaluates to 21.00:1 and passes AAA', async ({ page }) => {
    // Find text color input and background color input
    const inputs = page.locator('.contrast-grid input.input-text');
    await inputs.nth(0).fill('#000000');
    await inputs.nth(1).fill('#FFFFFF');

    // Ratio should display 21:1 or 21.00 : 1
    await expect(page.getByText(/21(\.00)?\s*:\s*1/)).toBeVisible();

    // Should display Pass for AA and AAA
    await expect(page.getByText(/Pass/i).first()).toBeVisible();
  });

  test('Low contrast pair (#FFFFFF on #FFFFFF) evaluates to 1.00:1 and fails', async ({ page }) => {
    const inputs = page.locator('.contrast-grid input.input-text');
    await inputs.nth(0).fill('#FFFFFF');
    await inputs.nth(1).fill('#FFFFFF');

    await expect(page.getByText(/1(\.00)?\s*:\s*1/)).toBeVisible();
    await expect(page.getByText(/Fail/i).first()).toBeVisible();
  });

  test('Swap colors button interchanges foreground and background colors', async ({ page }) => {
    const inputs = page.locator('.contrast-grid input.input-text');
    await inputs.nth(0).fill('#112233');
    await inputs.nth(1).fill('#AABBCC');

    const swapBtn = page.getByRole('button', { name: /swap/i });
    await swapBtn.click();

    await expect(inputs.nth(0)).toHaveValue(/#AABBCC/i);
    await expect(inputs.nth(1)).toHaveValue(/#112233/i);
  });

  test('Auto-fix button adjusts text color to pass WCAG AA (>= 4.5:1)', async ({ page }) => {
    // Set a failing color pair
    const inputs = page.locator('.contrast-grid input.input-text');
    await inputs.nth(0).fill('#888888');
    await inputs.nth(1).fill('#FFFFFF');

    const autoFixBtn = page.getByRole('button', { name: /auto-fix/i });
    if (await autoFixBtn.isVisible()) {
      await autoFixBtn.click();

      // Toast confirms fix
      await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();

      // Check ratio is now >= 4.5:1
      const ratioElem = page.locator('.contrast-grid').getByText(/\d+(\.\d+)?\s*:\s*1/).first();
      await expect(ratioElem).toBeVisible();
      const text = await ratioElem.textContent();
      const match = text.match(/(\d+(\.\d+)?)\s*:\s*1/);
      expect(match).not.toBeNull();
      const ratioVal = parseFloat(match[1]);
      expect(ratioVal).toBeGreaterThanOrEqual(4.5);
    }
  });
});
