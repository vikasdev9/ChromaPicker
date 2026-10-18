import { test, expect } from '@playwright/test';

test.describe('Navigation Suite — Header, Dropdowns, Modals, Drawer, and Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Brand logo links back to homepage', async ({ page }) => {
    await page.goto('/pricing');
    const brandLogo = page.locator('.brand-logo').first();
    await brandLogo.click();
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/?$/);
  });

  test('Header Tools dropdown mega-menu opens and contains tool links on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tools dropdown is in desktop navigation bar');

    const toolsBtn = page.getByRole('button', { name: /tools/i }).first();
    await expect(toolsBtn).toBeVisible();
    await toolsBtn.click();

    // Verify mega menu options are visible
    const megaMenu = page.locator('.mega-menu-dropdown');
    await expect(megaMenu).toBeVisible();
    await expect(megaMenu.getByRole('link', { name: /image color extractor|color picker/i }).first()).toBeVisible();
    await expect(megaMenu.getByRole('link', { name: /contrast checker/i })).toBeVisible();
    await expect(megaMenu.getByRole('link', { name: /blindness simulator/i })).toBeVisible();

    // Clicking a link navigates to the page
    await megaMenu.getByRole('link', { name: /contrast checker/i }).click();
    await expect(page).toHaveURL(/\/color-contrast-checker/);
  });

  test('Theme toggle switches between light and dark modes', async ({ page }) => {
    const themeBtn = page.locator('.theme-toggle-btn[title*="mode"]').first();
    await expect(themeBtn).toBeVisible();

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    await themeBtn.click();

    const updatedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    expect(updatedTheme).not.toBe(initialTheme);
  });

  test('Login and Sign Up buttons open AuthModal on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop action buttons are in mobile drawer');

    const loginBtn = page.locator('.header-desktop-action.btn-login');
    await loginBtn.click();

    const authModal = page.locator('.modal-card');
    await expect(authModal).toBeVisible();
    await expect(authModal.getByRole('heading', { name: /welcome/i })).toBeVisible();

    // Close modal
    const closeBtn = authModal.locator('button[aria-label="Close"], button').first();
    await closeBtn.click();
    await expect(authModal).not.toBeVisible();
  });

  test('Remove Ads button opens ProModal', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop action buttons are in mobile drawer');

    const proBtn = page.locator('.header-desktop-action.btn-gold');
    await proBtn.click();

    const proModal = page.locator('.modal-card');
    await expect(proModal).toBeVisible();
    await expect(proModal).toContainText(/Pro/i);

    // Close modal
    const closeBtn = proModal.locator('button[aria-label="Close"], button').first();
    await closeBtn.click();
    await expect(proModal).not.toBeVisible();
  });

  test('Mobile navigation drawer opens and allows tool navigation on mobile view', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only applies to mobile project');

    const hamburgerBtn = page.locator('.mobile-only-btn');
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    const drawer = page.locator('.mobile-drawer-content');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: /color details & harmonies/i })).toBeVisible();

    // Click link inside drawer
    await drawer.getByRole('link', { name: /color details & harmonies/i }).click();
    await expect(page).toHaveURL(/\/color\/2596be/);
  });

  test('Footer links navigate to corresponding application pages', async ({ page }) => {
    const footer = page.locator('.site-footer');
    await footer.scrollIntoViewIfNeeded();

    await expect(footer.getByRole('link', { name: /browse colors/i })).toBeVisible();
    await footer.getByRole('link', { name: /browse colors/i }).click();
    await expect(page).toHaveURL(/\/browse-colors/);
  });
});
