import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
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

    test('should verify sidebar navigation links', async ({ page }) => {
        // Wait for sidebar to load
        await page.waitForSelector('aside nav');

        // Check Dashboard link - use generic selector as it might be icon-only (title) or text
        const dashboardLink = page.locator('aside nav a[href*="dashboard"]').first();
        await expect(dashboardLink).toBeVisible();

        // Check Projects link
        const projectsLink = page.locator('aside nav a[href*="projects"]').first();
        await expect(projectsLink).toBeVisible();
        await projectsLink.click();
        await expect(page).toHaveURL(/projects/);

        // Check Tasks link
        const tasksLink = page.locator('aside nav a[href*="tasks"]').first();
        await expect(tasksLink).toBeVisible();
        await tasksLink.click();
        await expect(page).toHaveURL(/tasks/);

        // Check Team link
        const teamLink = page.locator('aside nav a[href*="team"]').first();
        await expect(teamLink).toBeVisible();
        await teamLink.click();
        await expect(page).toHaveURL(/team/);
    });

    test('should verify header elements', async ({ page }) => {
        // Verify User Profile Menu
        const profileButton = page.locator('[data-testid="user-menu"], button:has(img), button:has(div.rounded-full)');
        await expect(profileButton.first()).toBeVisible();

        // Verify Theme Toggle (if visible in header)
        // Adjust selector based on actual implementation
        const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg.lucide-moon), button:has(svg.lucide-sun)');
        if (await themeToggle.count() > 0) {
            await expect(themeToggle.first()).toBeVisible();
        }
    });

    test('should toggle sidebar', async ({ page }) => {
        // Wait for sidebar
        await page.waitForSelector('aside nav');

        // Find toggle button (might be expand or collapse depending on initial state)
        const toggleBtn = page.locator('button[title*="sidebar"], button:has(svg.lucide-chevron-left), button:has(svg.lucide-chevron-right)').first();
        await expect(toggleBtn).toBeVisible();

        // Click to toggle
        await toggleBtn.click();

        // Allow animation
        await page.waitForTimeout(500);

        // Check if state changed (width changed)
        const aside = page.locator('aside');
        const bbox = await aside.boundingBox();

        // Toggle again
        await toggleBtn.click();
        await page.waitForTimeout(500);
        const bbox2 = await aside.boundingBox();

        // Width should be different
        expect(bbox?.width).not.toEqual(bbox2?.width);
    });
});
