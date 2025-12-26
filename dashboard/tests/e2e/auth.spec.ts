import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/sign-in');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check page elements
        await expect(page.locator('input[type="email"], input#email')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        // Fill invalid credentials
        await page.locator('input[type="email"], input#email').fill('invalid@test.com');
        await page.locator('input[type="password"]').fill('wrongpassword');
        await page.getByRole('button', { name: /Sign In/i }).click();

        // Wait for error message (API will return error)
        await expect(page.locator('.text-danger, [class*="danger"], [class*="error"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page with Create Account button', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Check page elements
        await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
        await expect(page.locator('input[type="password"]').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
    });

    test('should navigate between login and signup', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        // Click on sign up link
        await page.getByRole('link', { name: /Sign up/i }).click();
        await expect(page).toHaveURL(/sign-up/);

        // Click on sign in link
        await page.getByRole('link', { name: /Sign in/i }).click();
        await expect(page).toHaveURL(/sign-in/);
    });

    test('should have remember me checkbox', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible();
    });
});

test.describe('OAuth Buttons', () => {
    test('should display Google and Microsoft OAuth buttons on sign-in', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForLoadState('networkidle');

        // Check for Google/Microsoft OAuth buttons
        await expect(page.locator('button:has-text("Google")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Microsoft")').first()).toBeVisible();
    });

    test('should display Google and Microsoft OAuth buttons on sign-up', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('button:has-text("Google")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Microsoft")').first()).toBeVisible();
    });
});
