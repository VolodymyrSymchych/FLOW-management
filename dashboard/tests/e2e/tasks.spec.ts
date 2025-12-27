import { test, expect } from '@playwright/test';

test.describe('Tasks Feature', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');
        await page.locator('input[type="email"], input#email').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to Tasks
        await page.goto('/dashboard/tasks');
    });

    test('should display tasks page elements', async ({ page }) => {
        await expect(page.locator('h1')).toContainText(/Tasks|Завдання/i);

        // Check for View Switcher (List/Board)
        const viewSwitcher = page.locator('button[aria-label="List view"], button[aria-label="Board view"]').first();
        if (await viewSwitcher.isVisible()) {
            await expect(viewSwitcher).toBeVisible();
        }

        // Check "Add Task" button
        await expect(page.getByRole('button', { name: /Add Task|New Task|Create Task/i })).toBeVisible();
    });

    test('should open add task modal', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: /Add Task|New Task|Create Task/i }).first();
        await addBtn.click();

        // It is an inline form, not a modal
        await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();
        await expect(page.getByRole('textbox').first()).toBeVisible();
    });
});
