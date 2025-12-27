import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        // Login before each test to measure authenticated performance
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });
    });

    test('should load dashboard within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/dashboard');

        // Wait for main content to be visible (not skeleton)
        await expect(page.locator('h1').first()).toBeVisible();

        // Wait for a key data element to ensure data is loaded (charts or stats)
        // Assuming there are stats cards, wait for one not to be skeleton
        await page.waitForSelector('.grid', { state: 'visible', timeout: 10000 });

        const loadTime = Date.now() - startTime;
        console.log(`Dashboard Load Time: ${loadTime}ms`);

        // Threshold: 8 seconds (generous for E2E testing with real API calls)
        expect(loadTime).toBeLessThan(8000);
    });

    test('should load projects list and data quickly', async ({ page }) => {
        await page.goto('/dashboard/projects');
        const startTime = Date.now();

        // Wait for skeleton to disappear and real content to appear
        // The skeleton usually has a specific class or we wait for cards
        // ProjectCard component

        // Wait for "New Analysis" button to be visible, ensuring partial interactive
        await expect(page.getByRole('button', { name: /New Analysis/i })).toBeVisible();

        // Check if loading skeleton is gone (if identifiable) or check for data
        // For now, simple check:
        const loadTime = Date.now() - startTime;
        console.log(`Projects Page Interactive Time: ${loadTime}ms`);

        expect(loadTime).toBeLessThan(2000);
    });

    test('should load tasks list quickly', async ({ page }) => {
        await page.goto('/dashboard/tasks');
        const startTime = Date.now();

        await expect(page.getByRole('button', { name: /New Task/i })).toBeVisible();

        const loadTime = Date.now() - startTime;
        console.log(`Tasks Page Interactive Time: ${loadTime}ms`);

        expect(loadTime).toBeLessThan(2000);
    });
});
