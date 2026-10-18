import { test, expect } from '@playwright/test';

test.describe('SelectImageModal Polish, Theme Architecture, Responsive & Ad Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  const openSelectModal = async (page) => {
    const changeBtn = page.locator('.btn-change-image, button:has-text("Change Image")').first();
    await changeBtn.scrollIntoViewIfNeeded();
    await changeBtn.click();
    const modalDialog = page.locator('.select-image-dialog');
    await expect(modalDialog).toBeVisible();
    return modalDialog;
  };

  test('Modal opens with header, close button, dedicated top ad, and 6 tabs', async ({ page }) => {
    const modalDialog = await openSelectModal(page);

    // Verify header
    const headerTitle = page.getByRole('heading', { name: /^select image$/i });
    await expect(headerTitle).toBeVisible();

    // Verify dedicated Top Advertisement section
    const adTop = modalDialog.locator('.ad-modal-top');
    await expect(adTop).toBeVisible();
    await expect(adTop.getByText(/sponsored/i)).toBeVisible();
    await expect(adTop.getByText(/chromapick pro/i)).toBeVisible();

    // Clicking Go Pro opens ProModal
    const goProBtn = adTop.getByRole('button', { name: /go pro|upgrade/i });
    await expect(goProBtn).toBeVisible();
    await goProBtn.click();
    const proModal = page.locator('#pro-modal-title');
    await expect(proModal).toBeVisible();

    // Close Pro modal
    const closeProBtn = page.locator('button[aria-label="Close dialog"]').last();
    await closeProBtn.click();
    await expect(proModal).not.toBeVisible();

    // Verify all 6 tabs exist
    const tabs = [
      /upload image/i,
      /color on screen/i,
      /website url/i,
      /image url/i,
      /paste clipboard/i,
      /search/i
    ];

    for (const tabName of tabs) {
      const tabBtn = modalDialog.getByRole('tab', { name: tabName });
      await expect(tabBtn).toBeVisible();
    }

    // Close modal via close button
    const closeBtn = modalDialog.locator('button[aria-label="Close dialog"]');
    await closeBtn.click();
    await expect(modalDialog).not.toBeVisible();
  });

  test('Escape key closes Select Image Modal', async ({ page }) => {
    const modalDialog = await openSelectModal(page);
    await page.keyboard.press('Escape');
    await expect(modalDialog).not.toBeVisible();
  });

  test('All six tabs switch active panels cleanly without content overlap', async ({ page }) => {
    const modalDialog = await openSelectModal(page);

    // Tab 1: Upload Image (Default active)
    await expect(modalDialog.getByText(/browse or drop image/i)).toBeVisible();
    await expect(modalDialog.getByText(/no data is sent/i)).toBeVisible();

    // Tab 2: Color on Screen
    await modalDialog.getByRole('tab', { name: /color on screen/i }).click();
    await expect(modalDialog.getByRole('button', { name: /pick color from screen/i })).toBeVisible();
    await expect(modalDialog.getByRole('button', { name: /capture screen to workspace/i })).toBeVisible();

    // Tab 3: Website URL
    await modalDialog.getByRole('tab', { name: /website url/i }).click();
    await expect(modalDialog.getByPlaceholder(/example\.com/i)).toBeVisible();
    await expect(modalDialog.getByRole('button', { name: /capture & pick/i })).toBeVisible();
    await expect(modalDialog.getByText('google.com')).toBeVisible();

    // Tab 4: Image URL
    await modalDialog.getByRole('tab', { name: /image url/i }).click();
    await expect(modalDialog.getByPlaceholder(/unsplash\.com/i)).toBeVisible();
    await expect(modalDialog.getByRole('button', { name: /load image/i })).toBeVisible();

    // Tab 5: Paste Clipboard
    await modalDialog.getByRole('tab', { name: /paste clipboard/i }).click();
    await expect(modalDialog.getByText(/ctrl \+ v/i)).toBeVisible();
    await expect(modalDialog.getByRole('button', { name: /read from clipboard/i })).toBeVisible();

    // Tab 6: Search Stock Library
    await modalDialog.getByRole('tab', { name: /search/i }).click();
    const searchInput = modalDialog.locator('.select-image-input');
    await expect(searchInput).toBeVisible();
    await expect(modalDialog.getByRole('button', { name: 'Cars' })).toBeVisible();
    await expect(modalDialog.getByText(/studio portrait yellow/i)).toBeVisible();
  });

  test('Search tab filters stock images by category, keyword, and shows empty state', async ({ page }) => {
    const modalDialog = await openSelectModal(page);
    await modalDialog.getByRole('tab', { name: /search/i }).click();

    // Click 'Cars' pill
    await modalDialog.getByRole('button', { name: 'Cars' }).click();
    await expect(modalDialog.getByText(/vintage desert highway/i)).toBeVisible();
    await expect(modalDialog.getByText(/studio portrait yellow/i)).not.toBeVisible();

    // Click 'All'
    await modalDialog.getByRole('button', { name: 'All' }).click();
    await expect(modalDialog.getByText(/studio portrait yellow/i)).toBeVisible();

    // Search query filtering
    const searchInput = modalDialog.locator('.select-image-input');
    await searchInput.fill('Cyberpunk');
    await expect(modalDialog.getByText(/cyberpunk neon metropolis/i)).toBeVisible();
    await expect(modalDialog.getByText(/vintage desert highway/i)).not.toBeVisible();

    // Clear search button
    const clearBtn = modalDialog.locator('button[aria-label="Clear search input"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(modalDialog.getByText(/studio portrait yellow/i)).toBeVisible();

    // Search query with 0 results triggers empty state
    await searchInput.fill('NonExistentTerm999');
    await expect(modalDialog.getByText(/no photos found/i)).toBeVisible();

    // Reset filters button restores list
    const resetBtn = modalDialog.getByRole('button', { name: /reset filters/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(modalDialog.getByText(/studio portrait yellow/i)).toBeVisible();
  });

  test('Hovering over stock photo card highlights border with zero clipping', async ({ page }) => {
    const modalDialog = await openSelectModal(page);
    await modalDialog.getByRole('tab', { name: /search/i }).click();

    const firstCard = modalDialog.locator('.select-image-stock-card').first();
    await expect(firstCard).toBeVisible();

    // Hover over the card
    await firstCard.hover();

    // Verify the card's top bounding rect is completely inside the scroll container
    const container = modalDialog.locator('.select-image-stock-grid');
    const containerBox = await container.boundingBox();
    const cardBox = await firstCard.boundingBox();

    expect(cardBox).not.toBeNull();
    expect(containerBox).not.toBeNull();
    // Card's top edge must be >= container's top edge (no negative y clipping)
    expect(cardBox.y).toBeGreaterThanOrEqual(containerBox.y);
  });

  test('Dark and Light theme styling applied correctly to modal surfaces and inputs', async ({ page }) => {
    // Start in Dark Mode
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const modalDialog = await openSelectModal(page);

    // Modal background should be #0F172A (rgb(15, 23, 42))
    await expect(modalDialog).toHaveCSS('background-color', 'rgb(15, 23, 42)');

    // Header background should be #111827 (rgb(17, 24, 39))
    const header = modalDialog.locator('.select-image-header');
    await expect(header).toHaveCSS('background-color', 'rgb(17, 24, 39)');

    // Check input in Search tab is dark #0B1220 (rgb(11, 18, 32)) and NOT bright white rgb(255, 255, 255)
    await modalDialog.getByRole('tab', { name: /search/i }).click();
    const searchInput = modalDialog.locator('.select-image-input');
    await expect(searchInput).toHaveCSS('background-color', 'rgb(11, 18, 32)');
    await expect(searchInput).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Switch to Light Mode while modal is open
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('theme-dark');
      document.documentElement.classList.add('theme-light');
    });

    // In Light mode, modal background should be rgb(255, 255, 255)
    await expect(modalDialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(searchInput).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  const viewports = [
    { width: 320, height: 568, name: '320px Tiny Mobile' },
    { width: 375, height: 667, name: '375px Standard Mobile' },
    { width: 768, height: 1024, name: '768px Tablet' },
    { width: 1024, height: 768, name: '1024px Laptop' },
    { width: 1440, height: 900, name: '1440px Desktop' },
    { width: 1920, height: 1080, name: '1920px Full HD' }
  ];

  for (const vp of viewports) {
    test(`Modal renders cleanly with zero horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const modalDialog = await openSelectModal(page);

      // Verify no horizontal overflow in dialog
      const overflowInfo = await modalDialog.evaluate(el => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        isOverflowing: el.scrollWidth > el.clientWidth + 1
      }));
      expect(overflowInfo.isOverflowing).toBe(false);

      // Verify close button is within viewport
      const closeBtn = modalDialog.locator('button[aria-label="Close dialog"]');
      await expect(closeBtn).toBeVisible();

      // Verify top ad is visible and within bounds
      const adTop = modalDialog.locator('.ad-modal-top');
      if (await adTop.count() > 0) {
        const adBox = await adTop.boundingBox();
        expect(adBox).not.toBeNull();
        expect(adBox.width).toBeLessThanOrEqual(vp.width);
      }
    });
  }
});
