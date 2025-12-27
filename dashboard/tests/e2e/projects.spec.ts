import { test, expect } from '@playwright/test';

test.describe('Projects Feature', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');
        await page.locator('input[type="email"], input#email').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to Projects
        await page.goto('/dashboard/projects');
    });

    test('should display projects list', async ({ page }) => {
        await expect(page.locator('h1')).toContainText(/Projects|Проекти|Team Projects|All Projects/i);
        // Expect at least the "New Analysis" button
        await expect(page.getByRole('button', { name: /New Analysis/i })).toBeVisible();
    });

    test('should open create project modal', async ({ page }) => {
        // "New Analysis" button navigates to /dashboard/projects/new, not a modal?
        // Let's check code: onClick={() => router.push('/dashboard/projects/new')}
        // So it is NOT a modal on the list page.

        const createBtn = page.getByRole('button', { name: /New Analysis/i }).first();
        await createBtn.click();

        await expect(page).toHaveURL(/\/projects\/new/);
        // Expect form on new page
        await expect(page.getByRole('heading', { name: /New/i })).toBeVisible();
    });

    // Note: Creating a project might dirty the DB.
    // Careful with actual creation in E2E unless we have cleanup or use a test-specific DB.
    // For now, we test the UI interaction up to submission.

    test('should validate project creation form', async ({ page }) => {
        const createBtn = page.getByRole('button', { name: /New Analysis/i }).first();
        await createBtn.click();

        // Note: New Analysis page likely has a form.
        // The submit button is disabled if form is invalid/empty (based on code inspection).
        const submitBtn = page.getByRole('button', { name: 'Create Project' });
        await expect(submitBtn).toBeDisabled();

        // Fill form to enable it
        // Fill form to enable it
        await page.getByPlaceholder('e.g., Customer Portal').fill('Test Project');
        await expect(submitBtn).toBeEnabled();
    });
});
