import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load landing page', async ({ page }) => {
        await page.goto('/');

        // Page should load
        await expect(page).toHaveTitle(/.+/);
    });

    test('should have navigation links', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for navigation links - they are anchor links with href="#features", etc.
        const navLinks = page.locator('nav a[href^="#"], header a[href^="#"]');
        const linkCount = await navLinks.count();
        
        // Should have at least one navigation link
        expect(linkCount).toBeGreaterThan(0);
        
        // Verify at least one link is visible
        const visibleLinks = await Promise.all(
            Array.from({ length: linkCount }, (_, i) => 
                navLinks.nth(i).isVisible().catch(() => false)
            )
        );
        expect(visibleLinks.some(v => v)).toBeTruthy();
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

    test('should have waitlist form', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for waitlist form elements
        const emailInput = page.locator('input[type="email"]');
        const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Join Waitlist/i });

        await expect(emailInput).toBeVisible({ timeout: 5000 });
        await expect(submitButton).toBeVisible({ timeout: 5000 });
    });
});
