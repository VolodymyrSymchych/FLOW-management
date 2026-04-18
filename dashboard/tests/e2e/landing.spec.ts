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

        await expect(page.locator('nav')).toContainText('Features');
        await expect(page.locator('nav')).toContainText('Email Tool');
        await expect(page.locator('nav')).toContainText('Pricing');
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

    test('should have waitlist form in the hero flow', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const heroSection = page.locator('section').filter({
            has: page.locator('h1', { hasText: /Scope creep/i }),
        }).first();
        const emailInput = heroSection.locator('input[type="email"]').first();
        const submitButton = heroSection.locator('button[type="submit"]').filter({ hasText: /Join Waitlist/i }).first();

        await expect(emailInput).toBeVisible({ timeout: 5000 });
        await expect(submitButton).toBeVisible({ timeout: 5000 });
    });

    test('should render social proof and faq with aligned pricing/support copy', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const socialProofSection = page.locator('section#social-proof');
        await expect(socialProofSection).toBeVisible();
        await expect(page.locator('footer#social-proof')).toHaveCount(0);

        const faqHeading = page.getByRole('heading', { name: /Questions before you join\?/i });
        await expect(faqHeading).toBeVisible();

        const pricingToggle = page.getByRole('button', { name: /How much does it cost\?/i });
        await pricingToggle.click();
        await expect(page.locator('#faq-panel-pricing')).toContainText('$29/month');
        await expect(page.locator('#faq-panel-pricing')).not.toContainText('per user');

        const supportLink = page.locator('a[href="mailto:support@flow.app"]');
        await expect(supportLink).toBeVisible();
        await expect(supportLink).toHaveAttribute('href', 'mailto:support@flow.app');

        await expect(page.locator('section#pricing')).toContainText('$29');
    });
});
