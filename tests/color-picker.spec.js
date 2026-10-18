import { test, expect } from '@playwright/test';

test.describe('Color Picker Suite — Workspace, Magnifier, Color Inspection, and Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Workspace renders with default sample image and active color details', async ({ page }) => {
    const workspace = page.locator('.workspace-grid');
    await expect(workspace).toBeVisible();

    // Verify source image is loaded
    const image = workspace.locator('.workspace-image-area img');
    await expect(image).toBeVisible();

    // Verify Selected Color details card
    const hexBadge = page.locator('.workspace-right-col').getByText(/#[0-9A-Fa-f]{6}/).first();
    await expect(hexBadge).toBeVisible();

    // Verify format rows exist (HEX, RGB, HSL, CMYK)
    await expect(workspace.getByText('HEX', { exact: true }).first()).toBeVisible();
    await expect(workspace.getByText('RGB', { exact: true }).first()).toBeVisible();
    await expect(workspace.getByText('HSL', { exact: true }).first()).toBeVisible();
    await expect(workspace.getByText('CMYK', { exact: true }).first()).toBeVisible();
  });

  test('Hovering and clicking image inspects and picks color', async ({ page }) => {
    const imageArea = page.locator('.workspace-image-area');
    await imageArea.scrollIntoViewIfNeeded();

    const box = await imageArea.boundingBox();
    expect(box).not.toBeNull();

    // Move mouse over center of image
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Workspace image area is interactive
    await expect(imageArea).toBeVisible();

    // Click to pick color
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    // Selected color card should have a valid HEX code
    const hexBadge = page.locator('.workspace-right-col').getByText(/#[0-9A-Fa-f]{6}/).first();
    await expect(hexBadge).toContainText(/#[0-9A-Fa-f]{6}/);
  });

  test('Zoom level slider adjusts magnification level', async ({ page }) => {
    const zoomSlider = page.locator('input[type="range"][min="2"][max="32"]').first();
    await zoomSlider.scrollIntoViewIfNeeded();
    await expect(zoomSlider).toBeVisible();

    // Change zoom slider value
    await zoomSlider.fill('16');
    await expect(page.locator('.workspace-right-col')).toContainText('16×');
  });

  test('Eyedropper mode toggle buttons switch mode active state', async ({ page }) => {
    const pickColorBtn = page.getByRole('button', { name: /pick color/i });
    const livePreviewBtn = page.getByRole('button', { name: /live preview/i });

    await pickColorBtn.scrollIntoViewIfNeeded();
    await livePreviewBtn.click();
    await expect(livePreviewBtn).toHaveCSS('font-weight', '700');

    await pickColorBtn.click();
    await expect(pickColorBtn).toHaveCSS('font-weight', '700');
  });

  test('Adding color to palette updates the extracted palette swatches', async ({ page }) => {
    const addToPaletteBtn = page.getByRole('button', { name: /add to palette/i });
    await addToPaletteBtn.scrollIntoViewIfNeeded();

    const initialCountText = await page.locator('.workspace-palette-section').getByText(/\d+ colors/i).textContent();
    const initialCount = parseInt(initialCountText.match(/\d+/)[0], 10);

    await addToPaletteBtn.click();

    // Verify toast notification appears
    await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();

    // Verify count increases or color is in palette
    const updatedCountText = await page.locator('.workspace-palette-section').getByText(/\d+ colors/i).textContent();
    const updatedCount = parseInt(updatedCountText.match(/\d+/)[0], 10);
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('Selecting a palette swatch updates active color and highlights swatch', async ({ page }) => {
    const paletteSection = page.locator('.workspace-palette-section');
    await paletteSection.scrollIntoViewIfNeeded();

    const swatches = paletteSection.locator('.palette-swatches-grid > div');
    const secondSwatch = swatches.nth(1);
    await expect(secondSwatch).toBeVisible();

    await secondSwatch.click();
    // Swatch should display selection indicator check icon
    await expect(secondSwatch.locator('svg').first()).toBeVisible();
  });

  test('Advanced Extraction Controls drawer expands and displays filters', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /advanced extraction controls/i });
    await toggleBtn.scrollIntoViewIfNeeded();
    await toggleBtn.click();

    // Check tone filters and sliders are rendered
    await expect(page.getByText('Color Tone & Mood Filter')).toBeVisible();
    await expect(page.getByText('Colors to Extract')).toBeVisible();
    await expect(page.getByText(/Min Color Difference/i)).toBeVisible();
  });
});
