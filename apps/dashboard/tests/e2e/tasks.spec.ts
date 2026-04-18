import { test, expect } from '@playwright/test';
import { loginUser } from './helpers/login';

test.describe('Tasks Feature', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(120000);
        // Login
        await loginUser(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!, 90000);

        // Navigate to Tasks
        await page.goto('/dashboard/tasks');
        await page.waitForSelector('[data-testid="tasks-screen"]', { timeout: 60000 });
    });

    test('should display tasks page elements', async ({ page }) => {
        await expect(page.locator('[data-testid="tasks-screen"]')).toContainText(/my tasks/i);

        // Check "Add Task" button
        await expect(page.getByRole('button', { name: /New Task|Create Task/i })).toBeVisible();
    });

    test('should open add task modal', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: /New Task|Create Task/i }).first();
        await addBtn.click();

        await expect(page.locator('[data-testid="tasks-create-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="tasks-create-form"] input').first()).toBeVisible();
    });
});
