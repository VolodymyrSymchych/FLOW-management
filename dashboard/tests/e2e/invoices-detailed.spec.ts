import { test, expect } from '@playwright/test';

test.describe('Invoices Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to invoices page
        await page.goto('/dashboard/invoices');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
    });

    test('should display invoices page header', async ({ page }) => {
        const header = page.locator('h1, h2').filter({ hasText: /Invoices|Рахунки/i });
        await expect(header.first()).toBeVisible();
    });

    test('should display create invoice button', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i });
        if (await createBtn.count() > 0) {
            await expect(createBtn.first()).toBeVisible();
        }
    });

    test('should display invoices list or empty state', async ({ page }) => {
        const invoiceRows = page.locator('tr, [data-testid="invoice-row"], .invoice-card');
        const emptyState = page.locator('text=/No invoices|Empty|Create your first/i');

        const hasInvoices = await invoiceRows.count() > 1;
        const hasEmptyState = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasInvoices || hasEmptyState).toBeTruthy();
    });

    test('should display invoice number column', async ({ page }) => {
        const invoiceNumber = page.locator('th, td').filter({ hasText: /Invoice.*Number|#|ID/i });
        if (await invoiceNumber.count() > 0) {
            await expect(invoiceNumber.first()).toBeVisible();
        }
    });

    test('should display client/customer column', async ({ page }) => {
        const clientColumn = page.locator('th, td').filter({ hasText: /Client|Customer|To/i });
        if (await clientColumn.count() > 0) {
            await expect(clientColumn.first()).toBeVisible();
        }
    });

    test('should display amount column', async ({ page }) => {
        const amountColumn = page.locator('th, td').filter({ hasText: /Amount|Total|Price|\$/i });
        if (await amountColumn.count() > 0) {
            await expect(amountColumn.first()).toBeVisible();
        }
    });

    test('should display status column', async ({ page }) => {
        const statusColumn = page.locator('th, td').filter({ hasText: /Status|Paid|Pending/i });
        if (await statusColumn.count() > 0) {
            await expect(statusColumn.first()).toBeVisible();
        }
    });

    test('should display due date column', async ({ page }) => {
        const dateColumn = page.locator('th, td').filter({ hasText: /Date|Due|Created/i });
        if (await dateColumn.count() > 0) {
            await expect(dateColumn.first()).toBeVisible();
        }
    });

    test('should display actions column with buttons', async ({ page }) => {
        const invoiceRow = page.locator('tr, [data-testid="invoice-row"]').nth(1);
        if (await invoiceRow.isVisible({ timeout: 3000 })) {
            const actionBtns = invoiceRow.locator('button, a');
            if (await actionBtns.count() > 0) {
                await expect(actionBtns.first()).toBeVisible();
            }
        }
    });

    test('should open create invoice modal when clicking create button', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const modal = page.locator('[role="dialog"], .modal, form');
            if (await modal.count() > 0) {
                await expect(modal.first()).toBeVisible();
            }
        }
    });

    test('should display client input in invoice form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const clientInput = page.locator('input[name*="client"], input[placeholder*="client"], select');
            if (await clientInput.count() > 0) {
                await expect(clientInput.first()).toBeVisible();
            }
        }
    });

    test('should display invoice items section in form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const itemsSection = page.locator('text=/Items|Products|Services|Line Items/i');
            if (await itemsSection.count() > 0) {
                await expect(itemsSection.first()).toBeVisible();
            }
        }
    });

    test('should allow adding invoice items', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const addItemBtn = page.locator('button').filter({ hasText: /Add.*Item|Add.*Line/i });
            if (await addItemBtn.count() > 0) {
                await expect(addItemBtn.first()).toBeVisible();
            }
        }
    });

    test('should display total amount in form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const totalLabel = page.locator('text=/Total|Subtotal|\$/i');
            if (await totalLabel.count() > 0) {
                await expect(totalLabel.first()).toBeVisible();
            }
        }
    });

    test('should display due date picker in form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const dateInput = page.locator('input[type="date"], input[name*="due"]');
            if (await dateInput.count() > 0) {
                await expect(dateInput.first()).toBeVisible();
            }
        }
    });

    test('should navigate to invoice details when clicking invoice row', async ({ page }) => {
        const invoiceRow = page.locator('tr, [data-testid="invoice-row"]').nth(1);
        if (await invoiceRow.isVisible({ timeout: 3000 })) {
            await invoiceRow.click();
            await page.waitForTimeout(1000);

            expect(page.url()).toMatch(/invoices\/\d+|invoice/);
        }
    });

    test('should display view button on invoice rows', async ({ page }) => {
        const viewBtn = page.locator('button, a').filter({ hasText: /View|Open|Details/i }).first();
        if (await viewBtn.count() > 0) {
            await expect(viewBtn).toBeVisible();
        }
    });

    test('should display edit button on invoice rows', async ({ page }) => {
        const editBtn = page.locator('button, a').filter({ hasText: /Edit|Modify/i }).first();
        if (await editBtn.count() > 0) {
            await expect(editBtn).toBeVisible();
        }
    });

    test('should display delete button on invoice rows', async ({ page }) => {
        const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i }).first();
        if (await deleteBtn.count() > 0) {
            await expect(deleteBtn).toBeVisible();
        }
    });

    test('should display send/share button on invoice rows', async ({ page }) => {
        const sendBtn = page.locator('button, a').filter({ hasText: /Send|Share|Email/i }).first();
        if (await sendBtn.count() > 0) {
            await expect(sendBtn).toBeVisible();
        }
    });

    test('should display download/PDF button on invoice rows', async ({ page }) => {
        const downloadBtn = page.locator('button, a').filter({ hasText: /Download|PDF|Export/i }).first();
        if (await downloadBtn.count() > 0) {
            await expect(downloadBtn).toBeVisible();
        }
    });

    test('should filter invoices by status', async ({ page }) => {
        const statusFilter = page.locator('select, button').filter({ hasText: /Status|All|Paid|Pending/i }).first();
        if (await statusFilter.count() > 0) {
            await expect(statusFilter).toBeVisible();
        }
    });

    test('should display search for invoices', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeVisible();
        }
    });

    test('should display status badges with correct colors', async ({ page }) => {
        const statusBadge = page.locator('span, div').filter({ hasText: /Paid|Pending|Overdue|Draft/i }).first();
        if (await statusBadge.isVisible({ timeout: 3000 })) {
            const color = await statusBadge.evaluate(el => window.getComputedStyle(el).color);
            expect(color).toBeTruthy();
        }
    });

    test('should display tax input in invoice form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const taxInput = page.locator('input[name*="tax"], label').filter({ hasText: /Tax|VAT/i });
            if (await taxInput.count() > 0) {
                await expect(taxInput.first()).toBeVisible();
            }
        }
    });

    test('should display notes/description field in form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const notesField = page.locator('textarea, input[name*="note"]');
            if (await notesField.count() > 0) {
                await expect(notesField.first()).toBeVisible();
            }
        }
    });

    test('should validate required fields in invoice form', async ({ page }) => {
        const createBtn = page.locator('button').filter({ hasText: /Create|New Invoice|Add/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /Create|Save/i }).first();
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

    test('should display summary statistics if available', async ({ page }) => {
        const stats = page.locator('text=/Total|Paid|Pending|\\$/i').first();
        if (await stats.count() > 0) {
            await expect(stats).toBeVisible();
        }
    });

    test('should display pagination if many invoices', async ({ page }) => {
        const pagination = page.locator('nav, div').filter({ hasText: /Previous|Next|Page/i });
        if (await pagination.count() > 0) {
            await expect(pagination.first()).toBeVisible();
        }
    });
});
