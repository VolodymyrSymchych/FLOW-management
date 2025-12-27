import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Clear cookies/storage before each test
        await page.context().clearCookies();
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/sign-in');

        await expect(page).toHaveURL(/sign-in/);
        await expect(page.locator('h1')).toContainText(/Welcome back/i);
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should show validation errors on invalid login', async ({ page }) => {
        await page.goto('/sign-in');

        // Fill invalid data to trigger backend error
        await page.getByLabel('Email').fill('invalid@example.com');
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: /Sign In/i }).click();

        // Expect generic error message (adjust based on actual backend response)
        // The UI shows <div className="text-danger">...</div>
        await expect(page.locator('.text-danger, .text-red-500')).toBeVisible();
    });

    test('should navigate to sign up page', async ({ page }) => {
        await page.goto('/sign-in');
        await page.getByRole('link', { name: /Sign up/i }).click();
        await expect(page).toHaveURL(/sign-up/);
    });

    test('should display sign up page', async ({ page }) => {
        await page.goto('/sign-up');
        await expect(page).toHaveURL(/sign-up/);
        // Use more generic selectors if placeholders vary
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /Create Account|Sign Up/i })).toBeVisible();
    });

    test('should show validation errors on invalid sign up', async ({ page }) => {
        await page.goto('/sign-up');

        // Fill short password to trigger client-side or backend error
        await page.locator('input[type="email"]').fill('test@test.com');
        await page.locator('input[name="password"]').fill('123'); // Too short
        await page.locator('input[name="confirmPassword"]').fill('123');

        await page.getByRole('button', { name: /Create Account|Sign Up/i }).click();

        // Expect error
        await expect(page.locator('.text-danger').or(page.getByText(/at least 8 characters/i))).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('/sign-in');
        await page.getByRole('link', { name: /Forgot password/i }).click();
        await expect(page).toHaveURL(/forgot-password/);
    });

    test('should display forgot password page', async ({ page }) => {
        await page.goto('/forgot-password');
        await expect(page.getByLabel('Email Address')).toBeVisible(); // Label has checkFor, wait, let's check code again. actually uses label with text "Email Address"
        await expect(page.getByRole('button', { name: /Send Reset Link/i })).toBeVisible();
    });

});
