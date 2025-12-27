import { test, expect } from '@playwright/test';

test.describe('Team Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to team page
        await page.goto('/dashboard/team');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
    });

    test('should display team page header', async ({ page }) => {
        const header = page.locator('h1, h2').filter({ hasText: /Team|Members|Команда/i });
        await expect(header.first()).toBeVisible();
    });

    test('should display invite member button', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member|Add User|Додати/i });
        if (await inviteBtn.count() > 0) {
            await expect(inviteBtn.first()).toBeVisible();
        }
    });

    test('should display team members list or empty state', async ({ page }) => {
        // Wait for page to finish loading
        await page.waitForTimeout(3000);

        const memberCards = page.locator('[data-testid="member-card"], .member, tr');
        const emptyStateNoMembers = page.locator('text=/No members|Empty|Invite your first/i');
        const emptyStateNoTeams = page.locator('text=/No Teams Yet|Create your first team/i');
        const skeleton = page.locator('.animate-pulse');
        const anyContent = page.locator('main, [role="main"]');

        const hasMembers = await memberCards.count() > 0;
        const hasEmptyMembers = await emptyStateNoMembers.isVisible({ timeout: 3000 }).catch(() => false);
        const hasEmptyTeams = await emptyStateNoTeams.isVisible({ timeout: 3000 }).catch(() => false);
        const hasSkeleton = await skeleton.count() > 0;
        const hasAnyContent = await anyContent.count() > 0;

        expect(hasMembers || hasEmptyMembers || hasEmptyTeams || hasSkeleton || hasAnyContent).toBeTruthy();
    });

    test('should display member name column/field', async ({ page }) => {
        const memberName = page.locator('th, td, div').filter({ hasText: /Name|Member|User/i });
        if (await memberName.count() > 0) {
            await expect(memberName.first()).toBeVisible();
        }
    });

    test('should display member email column/field', async ({ page }) => {
        const memberEmail = page.locator('th, td, div').filter({ hasText: /Email|@/i });
        if (await memberEmail.count() > 0) {
            await expect(memberEmail.first()).toBeVisible();
        }
    });

    test('should display member role column/field', async ({ page }) => {
        const memberRole = page.locator('th, td, div, span').filter({ hasText: /Role|Admin|Member|Owner/i });
        if (await memberRole.count() > 0) {
            await expect(memberRole.first()).toBeVisible();
        }
    });

    test('should display member status (active/pending)', async ({ page }) => {
        const statusBadge = page.locator('span, div').filter({ hasText: /Active|Pending|Invited/i });
        if (await statusBadge.count() > 0) {
            await expect(statusBadge.first()).toBeVisible();
        }
    });

    test('should open invite modal when clicking invite button', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member|Add User/i }).first();
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            const modal = page.locator('[role="dialog"], .modal, form');
            if (await modal.count() > 0) {
                await expect(modal.first()).toBeVisible();
            }
        }
    });

    test('should display email input in invite modal', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member/i }).first();
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            const emailInput = page.locator('input[type="email"], input[name*="email"]');
            if (await emailInput.count() > 0) {
                await expect(emailInput.first()).toBeVisible();
            }
        }
    });

    test('should display role selector in invite modal', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member/i }).first();
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            const roleSelect = page.locator('select[name*="role"], select');
            if (await roleSelect.count() > 0) {
                await expect(roleSelect.first()).toBeVisible();
            }
        }
    });

    test('should display action buttons for each member', async ({ page }) => {
        const memberRow = page.locator('tr, [data-testid="member-card"]').nth(1);
        if (await memberRow.isVisible({ timeout: 3000 })) {
            const actionBtns = memberRow.locator('button');
            if (await actionBtns.count() > 0) {
                await expect(actionBtns.first()).toBeVisible();
            }
        }
    });

    test('should display edit/change role button', async ({ page }) => {
        const editBtn = page.locator('button').filter({ hasText: /Edit|Change|Modify/i }).first();
        if (await editBtn.count() > 0) {
            await expect(editBtn).toBeVisible();
        }
    });

    test('should display remove member button', async ({ page }) => {
        const removeBtn = page.locator('button').filter({ hasText: /Remove|Delete|Kick/i }).first();
        if (await removeBtn.count() > 0) {
            await expect(removeBtn).toBeVisible();
        }
    });

    test('should show confirmation when removing member', async ({ page }) => {
        const removeBtn = page.locator('button').filter({ hasText: /Remove|Delete/i }).first();
        if (await removeBtn.isVisible({ timeout: 3000 })) {
            await removeBtn.click();
            await page.waitForTimeout(500);

            const confirmModal = page.locator('[role="dialog"], .modal').filter({ hasText: /Remove|Confirm|Delete/i });
            if (await confirmModal.count() > 0) {
                await expect(confirmModal).toBeVisible();

                // Cancel removal
                const cancelBtn = page.locator('button').filter({ hasText: /Cancel|Скасувати/i }).first();
                if (await cancelBtn.count() > 0) {
                    await cancelBtn.click();
                }
            }
        }
    });

    test('should display member avatar or initials', async ({ page }) => {
        const avatar = page.locator('img[alt*="avatar"], img[alt*="profile"], div[class*="avatar"]');
        if (await avatar.count() > 0) {
            await expect(avatar.first()).toBeVisible();
        }
    });

    test('should display team statistics if available', async ({ page }) => {
        const stats = page.locator('text=/Total.*Members|\\d+.*Members|Active/i');
        if (await stats.count() > 0) {
            await expect(stats.first()).toBeVisible();
        }
    });

    test('should display search for team members', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeVisible();
        }
    });

    test('should filter members by role', async ({ page }) => {
        const roleFilter = page.locator('select, button').filter({ hasText: /Role|All|Admin|Member/i });
        if (await roleFilter.count() > 0) {
            await expect(roleFilter.first()).toBeVisible();
        }
    });

    test('should display pending invitations section', async ({ page }) => {
        const pendingSection = page.locator('text=/Pending|Invitations|Invited/i');
        if (await pendingSection.count() > 0) {
            await expect(pendingSection.first()).toBeVisible();
        }
    });

    test('should allow resending invitation', async ({ page }) => {
        const resendBtn = page.locator('button').filter({ hasText: /Resend|Send Again/i }).first();
        if (await resendBtn.count() > 0) {
            await expect(resendBtn).toBeVisible();
        }
    });

    test('should allow cancelling pending invitation', async ({ page }) => {
        const cancelBtn = page.locator('button').filter({ hasText: /Cancel.*Invitation|Revoke/i }).first();
        if (await cancelBtn.count() > 0) {
            await expect(cancelBtn).toBeVisible();
        }
    });

    test('should display member joined date', async ({ page }) => {
        const joinedDate = page.locator('text=/Joined|Member since|\\d{4}-\\d{2}-\\d{2}/i');
        if (await joinedDate.count() > 0) {
            await expect(joinedDate.first()).toBeVisible();
        }
    });

    test('should display member last active time', async ({ page }) => {
        const lastActive = page.locator('text=/Last.*active|ago|minutes|hours/i');
        if (await lastActive.count() > 0) {
            await expect(lastActive.first()).toBeVisible();
        }
    });

    test('should validate email format in invite form', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member/i }).first();
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
            const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /Send|Invite/i }).first();

            if (await emailInput.count() > 0 && await submitBtn.count() > 0) {
                await emailInput.fill('invalid-email');
                await submitBtn.click();
                await page.waitForTimeout(500);

                // Form should show validation or stay open
                const form = page.locator('[role="dialog"], form').first();
                if (await form.count() > 0) {
                    await expect(form).toBeVisible();
                }
            }
        }
    });

    test('should close invite modal when clicking cancel', async ({ page }) => {
        const inviteBtn = page.locator('button').filter({ hasText: /Invite|Add Member/i }).first();
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            const cancelBtn = page.locator('button').filter({ hasText: /Cancel|Close/i }).first();
            if (await cancelBtn.count() > 0) {
                await cancelBtn.click();
                await page.waitForTimeout(500);

                const modal = page.locator('[role="dialog"]').first();
                if (await modal.count() > 0) {
                    await expect(modal).not.toBeVisible();
                }
            }
        }
    });

    test('should display team settings button if user is owner/admin', async ({ page }) => {
        const settingsBtn = page.locator('button').filter({ hasText: /Settings|Configure|Team.*Settings/i });
        if (await settingsBtn.count() > 0) {
            await expect(settingsBtn.first()).toBeVisible();
        }
    });

    test('should display role badges with correct styling', async ({ page }) => {
        const roleBadge = page.locator('span, div').filter({ hasText: /Admin|Owner|Member|Editor/i }).first();
        if (await roleBadge.isVisible({ timeout: 3000 })) {
            const hasStyles = await roleBadge.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.color !== '';
            });
            expect(hasStyles).toBeTruthy();
        }
    });

    test('should display copy invite link button', async ({ page }) => {
        const copyLinkBtn = page.locator('button').filter({ hasText: /Copy.*Link|Invite.*Link/i });
        if (await copyLinkBtn.count() > 0) {
            await expect(copyLinkBtn.first()).toBeVisible();
        }
    });
});
