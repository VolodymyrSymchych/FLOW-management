import { test, expect } from '@playwright/test';
import { loginUser } from './helpers/login';

test.describe('Navigation Flow', () => {
    // Skip all tests if no credentials
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(120000);
        // Login before each test
        await loginUser(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!, 90000);
    });

    test('should verify sidebar navigation links', async ({ page }) => {
        // Wait for sidebar to load
        await page.waitForSelector('[data-testid="app-shell-sidebar"]');

        // Check Dashboard link - use generic selector as it might be icon-only (title) or text
        const dashboardLink = page.locator('[data-testid="app-shell-sidebar"] a[href*="dashboard"]').first();
        await expect(dashboardLink).toBeVisible();

        // Check Projects link
        const projectsLink = page.locator('[data-testid="app-shell-sidebar"] a[href*="projects"]').first();
        await expect(projectsLink).toBeVisible();
        await projectsLink.click();
        await expect(page).toHaveURL(/projects/);

        // Check Tasks link
        const tasksLink = page.locator('[data-testid="app-shell-sidebar"] a[href*="tasks"]').first();
        await expect(tasksLink).toBeVisible();
        await tasksLink.click();
        await expect(page).toHaveURL(/tasks/);

        // Check Team link
        const teamLink = page.locator('[data-testid="app-shell-sidebar"] a[href*="team"]').first();
        await expect(teamLink).toBeVisible();
        await teamLink.click();
        await expect(page).toHaveURL(/team/);
    });

    test('should verify header elements', async ({ page }) => {
        // Verify User Profile Menu
        const profileButton = page.locator('[data-testid="user-menu-trigger"]');
        await expect(profileButton.first()).toBeVisible();

        // Verify Theme Toggle (if visible in header)
        // Adjust selector based on actual implementation
        await expect(page.locator('[data-testid="theme-toggle"]')).toHaveCount(0);
    });

});
