import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

/**
 * This setup creates an authenticated state for tests that require login.
 * Run tests that need auth with: test.use({ storageState: authFile })
 */
setup('authenticate', async ({ page }) => {
    // Skip if no test credentials configured
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
        console.log('Skipping auth setup - no test credentials configured');
        return;
    }

    await page.goto('/sign-in');

    // Fill login form
    await page.locator('input[type="email"], input[name="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /sign in|login|увійти/i }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Save storage state
    await page.context().storageState({ path: authFile });
});
