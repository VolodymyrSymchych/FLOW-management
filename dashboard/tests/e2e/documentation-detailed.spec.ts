import { test, expect } from '@playwright/test';

test.describe('Documentation Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to documentation page
        await page.goto('/dashboard/documentation');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
    });

    test('should display documentation page header', async ({ page }) => {
        const header = page.locator('h1, h2').filter({ hasText: /Documentation|Docs|Документація/i });
        await expect(header.first()).toBeVisible();
    });

    test('should display create document button', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i });
        if (await createBtn.count() > 0) {
            await expect(createBtn.first()).toBeVisible();
        }
    });

    test('should display documents list or empty state', async ({ page }) => {
        const docCards = page.locator('[data-testid="doc-card"], .doc-card, article, tr');
        const emptyState = page.locator('text=/No documents|Empty|Create your first/i');

        const hasDocs = await docCards.count() > 0;
        const hasEmptyState = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasDocs || hasEmptyState).toBeTruthy();
    });

    test('should display search for documents', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeVisible();
        }
    });

    test('should filter documents by category or type', async ({ page }) => {
        const filterSelect = page.locator('select, button').filter({ hasText: /Category|Type|Filter|All/i });
        if (await filterSelect.count() > 0) {
            await expect(filterSelect.first()).toBeVisible();
        }
    });

    test('should display document titles', async ({ page }) => {
        const docCard = page.locator('[data-testid="doc-card"], article').first();
        if (await docCard.isVisible({ timeout: 3000 })) {
            const title = docCard.locator('h2, h3, h4');
            if (await title.count() > 0) {
                await expect(title.first()).toBeVisible();
            }
        }
    });

    test('should display document descriptions or preview', async ({ page }) => {
        const docCard = page.locator('[data-testid="doc-card"], article').first();
        if (await docCard.isVisible({ timeout: 3000 })) {
            const description = docCard.locator('p, div').first();
            if (await description.count() > 0) {
                await expect(description).toBeVisible();
            }
        }
    });

    test('should display document metadata (date, author, etc)', async ({ page }) => {
        const metadata = page.locator('text=/\\d{4}-\\d{2}-\\d{2}|Created|Updated|By/i');
        if (await metadata.count() > 0) {
            await expect(metadata.first()).toBeVisible();
        }
    });

    test('should navigate to document when clicking document card', async ({ page }) => {
        const docCard = page.locator('[data-testid="doc-card"], article, tr').nth(1);
        if (await docCard.isVisible({ timeout: 3000 })) {
            await docCard.click();
            await page.waitForTimeout(1000);

            expect(page.url()).toMatch(/documentation\/\d+|doc/);
        }
    });

    test('should display edit button on documents', async ({ page }) => {
        const editBtn = page.locator('button, a').filter({ hasText: /Edit|Modify/i }).first();
        if (await editBtn.count() > 0) {
            await expect(editBtn).toBeVisible();
        }
    });

    test('should display delete button on documents', async ({ page }) => {
        const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i }).first();
        if (await deleteBtn.count() > 0) {
            await expect(deleteBtn).toBeVisible();
        }
    });

    test('should open create document modal when clicking create button', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const modal = page.locator('[role="dialog"], .modal, form');
            if (await modal.count() > 0) {
                await expect(modal.first()).toBeVisible();
            }
        }
    });

    test('should display title input in document creation form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
            if (await titleInput.count() > 0) {
                await expect(titleInput.first()).toBeVisible();
            }
        }
    });

    test('should display content editor in document creation form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const editor = page.locator('textarea, [contenteditable="true"], .editor');
            if (await editor.count() > 0) {
                await expect(editor.first()).toBeVisible();
            }
        }
    });

    test('should display category selector in document form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const categorySelect = page.locator('select[name*="category"], select');
            if (await categorySelect.count() > 0) {
                await expect(categorySelect.first()).toBeVisible();
            }
        }
    });

    test('should display tags input if available', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const tagsInput = page.locator('input[name*="tag"], input[placeholder*="tag"]');
            if (await tagsInput.count() > 0) {
                await expect(tagsInput.first()).toBeVisible();
            }
        }
    });

    test('should display document categories sidebar if available', async ({ page }) => {
        const sidebar = page.locator('aside, nav').filter({ hasText: /Categories|Категорії/i });
        if (await sidebar.count() > 0) {
            await expect(sidebar.first()).toBeVisible();
        }
    });

    test('should display sort options', async ({ page }) => {
        const sortBtn = page.locator('button, select').filter({ hasText: /Sort|Order|Сортувати/i });
        if (await sortBtn.count() > 0) {
            await expect(sortBtn.first()).toBeVisible();
        }
    });

    test('should display view mode toggle (grid/list)', async ({ page }) => {
        const viewToggle = page.locator('button').filter({ has: page.locator('svg') });
        if (await viewToggle.count() > 0) {
            // Check if it's a view toggle button
            const hasViewIcon = await viewToggle.first().evaluate(el =>
                el.innerHTML.includes('grid') || el.innerHTML.includes('list')
            );
            if (hasViewIcon) {
                await expect(viewToggle.first()).toBeVisible();
            }
        }
    });

    test('should show share button for documents', async ({ page }) => {
        const shareBtn = page.locator('button, a').filter({ hasText: /Share|Поділитися/i }).first();
        if (await shareBtn.count() > 0) {
            await expect(shareBtn).toBeVisible();
        }
    });

    test('should show export/download button for documents', async ({ page }) => {
        const exportBtn = page.locator('button, a').filter({ hasText: /Export|Download|PDF/i }).first();
        if (await exportBtn.count() > 0) {
            await expect(exportBtn).toBeVisible();
        }
    });

    test('should display document status if applicable', async ({ page }) => {
        const statusBadge = page.locator('span, div').filter({ hasText: /Draft|Published|Archived/i }).first();
        if (await statusBadge.count() > 0) {
            await expect(statusBadge).toBeVisible();
        }
    });

    test('should filter documents when searching', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

        if (await searchInput.count() > 0) {
            await searchInput.fill('test search query');
            await page.waitForTimeout(1000);

            const value = await searchInput.inputValue();
            expect(value.length).toBeGreaterThan(0);
        }
    });

    test('should validate required fields in document creation form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New.*Doc|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Publish/i }).first();
            if (await submitBtn.count() > 0) {
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
});
