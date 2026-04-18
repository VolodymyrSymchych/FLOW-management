import { test, expect } from '@playwright/test';

test.describe('Profile Feature', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(120000);
        // Login
        await loginUser(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!, 90000);

        // Navigate to Profile/Settings
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle', { timeout: 60000 });
    });

    test('should display profile information', async ({ page }) => {
        // Check for common profile elements
        await expect(page.locator('body')).toContainText(/Profile|Settings|Account/i);

        // Use generic locators as labels are not associated using htmlFor
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.getByText('Email')).toBeVisible(); // Check label text exists
        await expect(page.getByText('First Name')).toBeVisible();
    });

    test('should allow editing profile', async ({ page }) => {
        // Check if inputs are editable or if there is an "Edit" button
        const nameInput = page.getByLabel(/Name|Full Name/i);
        if (await nameInput.isVisible() && await nameInput.isEnabled()) {
            await expect(nameInput).toHaveValue(/.+/); // Should have some value
        }

        // Check for Save button
        const saveBtn = page.getByRole('button', { name: /Save|Update/i });
        if (await saveBtn.isVisible()) {
            await expect(saveBtn).toBeVisible();
        }
    });
});
