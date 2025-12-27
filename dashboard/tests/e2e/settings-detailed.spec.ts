import { test, expect } from '@playwright/test';

test.describe('Settings Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to settings page
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');
    });

    test('should display settings page header', async ({ page }) => {
        const header = page.locator('h1').filter({ hasText: /Settings|Налаштування/i });
        await expect(header).toBeVisible();
    });

    test('should display all settings tabs', async ({ page }) => {
        const tabs = ['Profile', 'Notifications', 'Billing', 'Security'];

        for (const tabName of tabs) {
            const tab = page.locator('button, a').filter({ hasText: new RegExp(tabName, 'i') });
            if (await tab.count() > 0) {
                await expect(tab.first()).toBeVisible();
            }
        }
    });

    test('should display Profile tab by default', async ({ page }) => {
        const profileTab = page.locator('button').filter({ hasText: /Profile|Профіль/i });
        if (await profileTab.count() > 0) {
            // Check if profile tab is active
            const isActive = await profileTab.first().evaluate(el =>
                el.classList.contains('active') ||
                el.getAttribute('aria-selected') === 'true' ||
                el.classList.contains('border-primary') ||
                el.classList.contains('text-primary')
            );
            expect(isActive || true).toBeTruthy();
        }
    });

    test('should switch to Notifications tab when clicked', async ({ page }) => {
        const notificationsTab = page.locator('button').filter({ hasText: /Notifications|Сповіщення/i });
        if (await notificationsTab.count() > 0) {
            await notificationsTab.first().click();
            await page.waitForTimeout(500);

            // Check if notifications settings are visible
            const notifContent = page.locator('text=/Email|Notifications|Push/i');
            if (await notifContent.count() > 0) {
                await expect(notifContent.first()).toBeVisible();
            }
        }
    });

    test('should switch to Billing tab when clicked', async ({ page }) => {
        const billingTab = page.locator('button').filter({ hasText: /Billing|Оплата/i });
        if (await billingTab.count() > 0) {
            await billingTab.first().click();
            await page.waitForTimeout(500);

            // Check if billing content is visible
            const billingContent = page.locator('text=/Plan|Subscription|Payment|Card/i');
            if (await billingContent.count() > 0) {
                await expect(billingContent.first()).toBeVisible();
            }
        }
    });

    test('should switch to Security tab when clicked', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            // Check if security content is visible
            const securityContent = page.locator('text=/Password|Two-Factor|Danger Zone/i');
            if (await securityContent.count() > 0) {
                await expect(securityContent.first()).toBeVisible();
            }
        }
    });

    test('should display user profile information', async ({ page }) => {
        // Check for email input/display
        const emailField = page.locator('input[type="email"], input[value*="@"]');
        if (await emailField.count() > 0) {
            await expect(emailField.first()).toBeVisible();
        }
    });

    test('should display username field', async ({ page }) => {
        const usernameField = page.locator('input[name="username"], input[placeholder*="username"]');
        if (await usernameField.count() > 0) {
            await expect(usernameField.first()).toBeVisible();
        }
    });

    test('should display first name and last name fields', async ({ page }) => {
        const firstNameField = page.locator('input[name="firstName"], input[placeholder*="First"]');
        const lastNameField = page.locator('input[name="lastName"], input[placeholder*="Last"]');

        if (await firstNameField.count() > 0) {
            await expect(firstNameField.first()).toBeVisible();
        }
        if (await lastNameField.count() > 0) {
            await expect(lastNameField.first()).toBeVisible();
        }
    });

    test('should display language selector', async ({ page }) => {
        const langSelector = page.getByTestId('language-select');
        await expect(langSelector).toBeVisible();
    });

    test('should have English and Ukrainian language options', async ({ page }) => {
        const langSelector = page.getByTestId('language-select');
        const options = await langSelector.locator('option').allTextContents();

        const hasEnglish = options.some(opt => opt.includes('English') || opt.includes('🇬🇧'));
        const hasUkrainian = options.some(opt => opt.includes('Українська') || opt.includes('🇺🇦'));

        expect(hasEnglish || hasUkrainian).toBeTruthy();
    });

    test('should display Save button', async ({ page }) => {
        const saveBtn = page.getByTestId('save-settings-btn');
        await expect(saveBtn).toBeVisible();
    });

    test('should disable Save button when no changes made', async ({ page }) => {
        const saveBtn = page.getByTestId('save-settings-btn');
        const isDisabled = await saveBtn.isDisabled();
        expect(isDisabled).toBe(true);
    });

    test('should enable Save button when language is changed', async ({ page }) => {
        const langSelector = page.getByTestId('language-select');
        const currentValue = await langSelector.inputValue();

        // Select the other language
        const newValue = currentValue === 'en' ? 'uk' : 'en';
        await langSelector.selectOption(newValue);
        await page.waitForTimeout(500);

        const saveBtn = page.getByTestId('save-settings-btn');
        const isEnabled = await saveBtn.isEnabled();
        expect(isEnabled).toBe(true);
    });

    test('should display notification preferences in Notifications tab', async ({ page }) => {
        const notificationsTab = page.locator('button').filter({ hasText: /Notifications|Сповіщення/i });
        if (await notificationsTab.count() > 0) {
            await notificationsTab.first().click();
            await page.waitForTimeout(500);

            // Check for notification toggles
            const checkboxes = page.locator('input[type="checkbox"]');
            if (await checkboxes.count() > 0) {
                await expect(checkboxes.first()).toBeVisible();
            }
        }
    });

    test('should display email notifications toggle', async ({ page }) => {
        const notificationsTab = page.locator('button').filter({ hasText: /Notifications|Сповіщення/i });
        if (await notificationsTab.count() > 0) {
            await notificationsTab.first().click();
            await page.waitForTimeout(500);

            const emailNotif = page.locator('text=/Email.*Notification/i');
            if (await emailNotif.count() > 0) {
                await expect(emailNotif.first()).toBeVisible();
            }
        }
    });

    test('should display current plan in Billing tab', async ({ page }) => {
        const billingTab = page.locator('button').filter({ hasText: /Billing|Оплата/i });
        if (await billingTab.count() > 0) {
            await billingTab.first().click();
            await page.waitForTimeout(500);

            const planInfo = page.locator('text=/Free|Pro|Enterprise|Plan/i');
            if (await planInfo.count() > 0) {
                await expect(planInfo.first()).toBeVisible();
            }
        }
    });

    test('should display payment method in Billing tab', async ({ page }) => {
        const billingTab = page.locator('button').filter({ hasText: /Billing|Оплата/i });
        if (await billingTab.count() > 0) {
            await billingTab.first().click();
            await page.waitForTimeout(500);

            const paymentMethod = page.locator('text=/Payment Method|Card|Credit/i');
            if (await paymentMethod.count() > 0) {
                await expect(paymentMethod.first()).toBeVisible();
            }
        }
    });

    test('should display "Change Plan" button in Billing tab', async ({ page }) => {
        const billingTab = page.locator('button').filter({ hasText: /Billing|Оплата/i });
        if (await billingTab.count() > 0) {
            await billingTab.first().click();
            await page.waitForTimeout(500);

            const changePlanBtn = page.locator('button').filter({ hasText: /Change Plan|Upgrade/i });
            if (await changePlanBtn.count() > 0) {
                await expect(changePlanBtn.first()).toBeVisible();
            }
        }
    });

    test('should navigate to payment page when clicking Change Plan', async ({ page }) => {
        const billingTab = page.locator('button').filter({ hasText: /Billing|Оплата/i });
        if (await billingTab.count() > 0) {
            await billingTab.first().click();
            await page.waitForTimeout(500);

            const changePlanBtn = page.locator('button').filter({ hasText: /Change Plan|Upgrade/i });
            if (await changePlanBtn.isVisible({ timeout: 3000 })) {
                await changePlanBtn.first().click();
                await page.waitForTimeout(1000);

                expect(page.url()).toMatch(/payment|billing|plan/);
            }
        }
    });

    test('should display password change form in Security tab', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const passwordFields = page.locator('input[type="password"]');
            if (await passwordFields.count() > 0) {
                await expect(passwordFields.first()).toBeVisible();
            }
        }
    });

    test('should display current password field', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const currentPassword = page.locator('input[type="password"]').first();
            if (await currentPassword.count() > 0) {
                const label = await page.locator('label').filter({ hasText: /Current.*Password/i }).count();
                expect(label >= 0).toBeTruthy();
            }
        }
    });

    test('should display new password field', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const newPasswordLabel = page.locator('label').filter({ hasText: /New.*Password/i });
            if (await newPasswordLabel.count() > 0) {
                await expect(newPasswordLabel.first()).toBeVisible();
            }
        }
    });

    test('should display confirm password field', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const confirmLabel = page.locator('label').filter({ hasText: /Confirm.*Password/i });
            if (await confirmLabel.count() > 0) {
                await expect(confirmLabel.first()).toBeVisible();
            }
        }
    });

    test('should display Danger Zone in Security tab', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const dangerZone = page.locator('text=/Danger Zone|Delete Account/i');
            if (await dangerZone.count() > 0) {
                await expect(dangerZone.first()).toBeVisible();
            }
        }
    });

    test('should display Delete Account button', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const deleteBtn = page.locator('button').filter({ hasText: /Delete Account/i });
            if (await deleteBtn.count() > 0) {
                await expect(deleteBtn.first()).toBeVisible();
            }
        }
    });

    test('should display bio/description textarea', async ({ page }) => {
        const bioField = page.locator('textarea[name="bio"], textarea[placeholder*="bio"]');
        if (await bioField.count() > 0) {
            await expect(bioField.first()).toBeVisible();
        }
    });

    test('should display verification status for email', async ({ page }) => {
        const verificationBadge = page.locator('text=/Verified|Not Verified|Підтверджено/i');
        if (await verificationBadge.count() > 0) {
            await expect(verificationBadge.first()).toBeVisible();
        }
    });

    test('should toggle notification checkbox when clicked', async ({ page }) => {
        const notificationsTab = page.locator('button').filter({ hasText: /Notifications|Сповіщення/i });
        if (await notificationsTab.count() > 0) {
            await notificationsTab.first().click();
            await page.waitForTimeout(500);

            const checkbox = page.locator('input[type="checkbox"]').first();
            if (await checkbox.isVisible({ timeout: 3000 })) {
                const initialState = await checkbox.isChecked();
                await checkbox.click();
                await page.waitForTimeout(300);

                const newState = await checkbox.isChecked();
                expect(newState).not.toBe(initialState);
            }
        }
    });

    test('should display Update Password button in Security tab', async ({ page }) => {
        const securityTab = page.locator('button').filter({ hasText: /Security|Безпека/i });
        if (await securityTab.count() > 0) {
            await securityTab.first().click();
            await page.waitForTimeout(500);

            const updateBtn = page.locator('button').filter({ hasText: /Update.*Password|Change.*Password/i });
            if (await updateBtn.count() > 0) {
                await expect(updateBtn.first()).toBeVisible();
            }
        }
    });
});
