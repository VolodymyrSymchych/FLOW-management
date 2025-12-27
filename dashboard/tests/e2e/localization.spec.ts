import { test, expect } from '@playwright/test';

test.describe('Localization (i18n) Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });
    });

    test('should switch language to Ukrainian', async ({ page }) => {
        // Monitor console and network
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // Go to settings with explicit locale
        await page.goto('/en/dashboard/settings');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Find language selector
        const langSelect = page.getByTestId('language-select');

        // Select Ukrainian
        await langSelect.selectOption('uk');
        await page.waitForTimeout(500);

        // Find Save button and wait for it to be enabled
        const saveBtn = page.getByTestId('save-settings-btn');
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });

        // Click save and wait for navigation with longer timeout
        await saveBtn.click();

        // Wait for API call and redirect with increased timeout
        await page.waitForLoadState('load', { timeout: 15000 });
        await page.waitForURL(/\/uk\//, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // Verify Ukrainian translation on current page or navigate to projects
        const currentHeader = await page.locator('h1').first().textContent();
        if (!currentHeader || !currentHeader.match(/Налаштування|Профіль/i)) {
            // Navigate to projects page if not already showing Ukrainian
            await page.goto('/uk/dashboard/projects');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
        }

        // Verify Ukrainian translation
        const header = page.locator('h1').first();
        const headerText = await header.textContent();
        expect(headerText).toMatch(/Усі проекти|Проекти команди|Налаштування/i); // "All Projects", "Team Projects", or "Settings" in Ukrainian
    });

    test('should switch language back to English', async ({ page }) => {
        // Force URL to UK first to test switching back
        await page.goto('/uk/dashboard/settings');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Find language selector
        const langSelect = page.getByTestId('language-select');

        // Select English
        await langSelect.selectOption('en');
        await page.waitForTimeout(500);

        // Wait for save button to be enabled
        const saveBtn = page.getByTestId('save-settings-btn');
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });
        await saveBtn.click();

        // Wait for API call and redirect with increased timeout
        await page.waitForLoadState('load', { timeout: 15000 });
        await page.waitForURL(/\/en\//, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // Verify English translation on current page or navigate to projects
        const currentHeader = await page.locator('h1').first().textContent();
        if (!currentHeader || !currentHeader.match(/Settings|Profile/i)) {
            // Navigate to projects page if not already showing English
            await page.goto('/en/dashboard/projects');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
        }

        // Verify English translation
        const header = page.locator('h1').first();
        const headerText = await header.textContent();
        expect(headerText).toMatch(/All Projects|Team Projects|Settings/i);
    });
});
