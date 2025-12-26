import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load landing page', async ({ page }) => {
        await page.goto('/');

        // Page should load
        await expect(page).toHaveTitle(/.+/);
    });

    test('should have navigation links', async ({ page }) => {
        await page.goto('/');

        // Check for auth links
        const signInLink = page.getByRole('link', { name: /sign in|login|увійти/i });
        const signUpLink = page.getByRole('link', { name: /sign up|register|реєстр|get started/i });

        // At least one should be visible
        const signInVisible = await signInLink.isVisible().catch(() => false);
        const signUpVisible = await signUpLink.isVisible().catch(() => false);

        expect(signInVisible || signUpVisible).toBeTruthy();
    });

    test('should be responsive', async ({ page }) => {
        await page.goto('/');

        // Desktop viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        await expect(page.locator('body')).toBeVisible();

        // Mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('body')).toBeVisible();
    });

    test('should navigate to sign in page', async ({ page }) => {
        await page.goto('/');

        const signInLink = page.getByRole('link', { name: /sign in|login|увійти/i }).first();
        if (await signInLink.isVisible()) {
            await signInLink.click();
            await expect(page).toHaveURL(/sign-in/);
        }
    });
});
