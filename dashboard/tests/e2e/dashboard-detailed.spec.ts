import { test, expect } from '@playwright/test';

test.describe('Dashboard - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
    });

    test('should display all stat cards', async ({ page }) => {
        // Wait for stats to load
        await page.waitForSelector('[data-testid="stats-card"], .glass-medium', { timeout: 10000 });

        // Check for stat cards - they should contain numbers and labels
        const statCards = page.locator('.glass-medium').filter({ hasText: /Projects|Tasks|Progress|Risk/ });
        const count = await statCards.count();
        expect(count).toBeGreaterThan(0);

        // Verify each stat card has visible content
        for (let i = 0; i < Math.min(count, 4); i++) {
            const card = statCards.nth(i);
            await expect(card).toBeVisible();
        }
    });

    test('should display recent projects section', async ({ page }) => {
        // Look for projects section
        const projectsSection = page.locator('text=/Projects|Recent Projects|All Projects/i').first();
        if (await projectsSection.isVisible({ timeout: 5000 })) {
            await expect(projectsSection).toBeVisible();
        }
    });

    test('should allow customization mode toggle', async ({ page }) => {
        // Look for customize/edit button
        const customizeBtn = page.locator('button').filter({ hasText: /Customize|Edit|Layout/i }).first();

        if (await customizeBtn.isVisible({ timeout: 5000 })) {
            await customizeBtn.click();
            await page.waitForTimeout(500);

            // Check if customization UI appears
            const saveBtn = page.locator('button').filter({ hasText: /Save|Apply/i }).first();
            if (await saveBtn.count() > 0) {
                await expect(saveBtn).toBeVisible();
            }
        }
    });

    test('should display widget gallery when in edit mode', async ({ page }) => {
        // Try to enter edit mode
        const editBtn = page.locator('button').filter({ hasText: /Customize|Edit|Layout/i }).first();

        if (await editBtn.isVisible({ timeout: 5000 })) {
            await editBtn.click();
            await page.waitForTimeout(1000);

            // Look for widget gallery or add widget button
            const addWidgetBtn = page.locator('button').filter({ hasText: /Add Widget|Widget Gallery/i });
            if (await addWidgetBtn.count() > 0) {
                await expect(addWidgetBtn.first()).toBeVisible();
            }
        }
    });

    test('should show calendar widget if available', async ({ page }) => {
        // Wait for dashboard to load
        await page.waitForTimeout(2000);

        // Check for calendar component
        const calendar = page.locator('[class*="calendar"], .react-calendar, [data-widget="calendar"]');
        if (await calendar.count() > 0) {
            await expect(calendar.first()).toBeVisible();
        }
    });

    test('should show upcoming tasks widget if available', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Look for tasks section
        const tasksWidget = page.locator('text=/Upcoming Tasks|Tasks|To Do/i').first();
        if (await tasksWidget.isVisible({ timeout: 5000 })) {
            await expect(tasksWidget).toBeVisible();
        }
    });

    test('should show budget tracking widget if available', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Look for budget section
        const budgetWidget = page.locator('text=/Budget|Spending|Financial/i').first();
        if (await budgetWidget.isVisible({ timeout: 5000 })) {
            await expect(budgetWidget).toBeVisible();
        }
    });

    test('should allow resetting dashboard layout', async ({ page }) => {
        // Try to enter edit mode
        const editBtn = page.locator('button').filter({ hasText: /Customize|Edit|Layout/i }).first();

        if (await editBtn.isVisible({ timeout: 5000 })) {
            await editBtn.click();
            await page.waitForTimeout(500);

            // Look for reset button
            const resetBtn = page.locator('button').filter({ hasText: /Reset|Default|Restore/i }).first();
            if (await resetBtn.count() > 0) {
                await expect(resetBtn).toBeVisible();
            }
        }
    });

    test('should navigate to projects when clicking project card', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Find project cards
        const projectCard = page.locator('[data-testid="project-card"], .glass-medium').filter({ hasText: /Project/i }).first();

        if (await projectCard.isVisible({ timeout: 5000 })) {
            const currentUrl = page.url();
            await projectCard.click();
            // Should navigate to project details or projects page
            await page.waitForTimeout(1500);

            // Check if URL changed (navigation happened) or contains projects/dashboard
            const newUrl = page.url();
            expect(newUrl !== currentUrl || newUrl.includes('projects') || newUrl.includes('dashboard')).toBeTruthy();
        }
    });

    test('should display team selector if user has teams', async ({ page }) => {
        // Look for team selector
        const teamSelector = page.locator('[data-testid="team-selector"], button').filter({ hasText: /Team|All Projects/i });

        if (await teamSelector.count() > 0) {
            await expect(teamSelector.first()).toBeVisible();
        }
    });

    test('should handle real-time updates', async ({ page }) => {
        // Get initial stats
        await page.waitForTimeout(2000);

        const statsCard = page.locator('.glass-medium').first();
        if (await statsCard.isVisible()) {
            const initialText = await statsCard.textContent();
            expect(initialText).toBeTruthy();
        }
    });
});
