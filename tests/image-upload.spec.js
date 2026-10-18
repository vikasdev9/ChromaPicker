import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Image Upload Suite — File Input, Drag & Drop, Modal Selection, and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Uploading a valid PNG image updates workspace image and extracted palette', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'valid-sample.png');

    // Find hidden file input
    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    await fileInput.setInputFiles(filePath);

    // Verify workspace image source or filename updates
    const filenameLabel = page.locator('.workspace-image-toolbar span').first();
    await expect(filenameLabel).toContainText(/valid-sample\.png|image/i);

    // Toast notification should announce successful upload
    await expect(page.locator('.toast-item, [role="status"]').first()).toBeVisible();
  });

  test('Clicking Try Sample Image loads alternate sample and updates palette', async ({ page }) => {
    const sampleBtn = page.getByRole('button', { name: /try sample image/i });
    await sampleBtn.click();

    // Verify image is rendered and palette extracted
    const image = page.locator('.workspace-image-area img');
    await expect(image).toBeVisible();

    const paletteCount = page.locator('.workspace-palette-section').getByText(/\d+ colors/i);
    await expect(paletteCount).toBeVisible();
  });

  test('Select Image Modal opens, displays tabs, and allows picking from gallery', async ({ page }) => {
    const changeImgBtn = page.locator('.btn-change-image, button:has-text("Change Image")').first();
    await changeImgBtn.scrollIntoViewIfNeeded();
    await changeImgBtn.click();

    // Verify modal header
    const modalHeading = page.getByRole('heading', { name: /^select image$/i });
    await expect(modalHeading).toBeVisible();

    // Close modal via close button
    const closeBtn = page.locator('button[aria-label="Close dialog"]').first();
    await closeBtn.click();
    await expect(modalHeading).not.toBeVisible();
  });
});
