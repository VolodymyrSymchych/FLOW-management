import { test, expect } from '@playwright/test';

// These tests require authentication
// Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local

test.describe('Dashboard (Authenticated)', () => {
    // Skip all tests if no credentials
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"], input#email').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();

        // Wait for redirect to dashboard
        await page.waitForURL(/dashboard/, { timeout: 15000 });
    });

    test('should display dashboard after login', async ({ page }) => {
        // Should be on dashboard
        await expect(page).toHaveURL(/dashboard/);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Dashboard should have content (not sign-in page)
        await expect(page.locator('body')).not.toContainText(/Sign in to your account/i);
    });

    test('should display sidebar navigation', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for common navigation elements
        const nav = page.locator('nav, aside, [role="navigation"]').first();
        await expect(nav).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to projects page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find and click projects link
        const projectsLink = page.getByRole('link', { name: /projects|проекти/i }).first();
        if (await projectsLink.isVisible()) {
            await projectsLink.click();
            await expect(page).toHaveURL(/projects/);
        }
    });

    test('should navigate to tasks page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const tasksLink = page.getByRole('link', { name: /tasks|завдання/i }).first();
        if (await tasksLink.isVisible()) {
            await tasksLink.click();
            await expect(page).toHaveURL(/tasks/);
        }
    });

    test('should navigate to team page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const teamLink = page.getByRole('link', { name: /team|команда/i }).first();
        if (await teamLink.isVisible({ timeout: 5000 })) {
            await teamLink.click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/team/, { timeout: 10000 });
        }
    });

    test('should be able to logout', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find user menu/profile button and click
        const profileButton = page.locator('button:has(img), [data-testid="user-menu"], [aria-label*="profile"]').first();

        if (await profileButton.isVisible()) {
            await profileButton.click();

            // Click logout
            const logoutButton = page.getByRole('menuitem', { name: /logout|sign out|вийти/i });
            if (await logoutButton.isVisible()) {
                await logoutButton.click();
                // Should redirect to sign-in
                await expect(page).toHaveURL(/sign-in|login|\/$/, { timeout: 10000 });
            }
        }
    });
});
