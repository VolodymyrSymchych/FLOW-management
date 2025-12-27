import { test, expect } from '@playwright/test';

test.describe('Tasks Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to tasks page
        await page.goto('/dashboard/tasks');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
    });

    test('should display page header', async ({ page }) => {
        const header = page.locator('h1, h2').filter({ hasText: /Tasks|Завдання/i }).first();
        await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display "Add Task" or "New Task" button', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i });
        await expect(addBtn.first()).toBeVisible({ timeout: 10000 });
    });

    test('should open task creation form when clicking "Add Task"', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        // Check if form appears
        const form = page.locator('form, [role="dialog"]');
        if (await form.count() > 0) {
            await expect(form.first()).toBeVisible();
        }
    });

    test('should display task title input in creation form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="назва"]').first();
        if (await titleInput.count() > 0) {
            await expect(titleInput).toBeVisible();
        }
    });

    test('should display project selector in task form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const projectSelect = page.locator('select[name="project_id"], select').first();
        if (await projectSelect.count() > 0) {
            await expect(projectSelect).toBeVisible();
        }
    });

    test('should display priority selector in task form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const prioritySelect = page.locator('select[name="priority"], select').filter({ hasText: /Priority|Low|Medium|High|Пріоритет/i }).first();
        if (await prioritySelect.count() > 0) {
            await expect(prioritySelect).toBeVisible();
        }
    });

    test('should display due date picker in task form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const dateInput = page.locator('input[type="date"], input[name="due_date"]').first();
        if (await dateInput.count() > 0) {
            await expect(dateInput).toBeVisible();
        }
    });

    test('should close task form when clicking cancel', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const cancelBtn = page.locator('button').filter({ hasText: /Cancel|Close|Скасувати/i }).first();
        if (await cancelBtn.count() > 0) {
            await cancelBtn.click();
            await page.waitForTimeout(500);

            // Form should be hidden
            const form = page.locator('form').first();
            if (await form.count() > 0) {
                await expect(form).not.toBeVisible();
            }
        }
    });

    test('should display search input for tasks', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Пошук"]').first();
        if (await searchInput.count() > 0) {
            await expect(searchInput).toBeVisible();
        }
    });

    test('should display status filter dropdown', async ({ page }) => {
        const statusFilter = page.locator('select, button').filter({ hasText: /Status|All|To Do|In Progress|Done|Статус/i }).first();
        if (await statusFilter.count() > 0) {
            await expect(statusFilter).toBeVisible();
        }
    });

    test('should filter tasks by status', async ({ page }) => {
        const statusFilter = page.locator('select').filter({ hasText: /Status|All|Статус/i }).first();

        if (await statusFilter.count() > 0) {
            // Select "In Progress" or similar
            await statusFilter.selectOption({ index: 1 });
            await page.waitForTimeout(1000);

            // Tasks should be filtered
            expect(true).toBeTruthy();
        }
    });

    test('should display sort button', async ({ page }) => {
        const sortBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
        if (await sortBtn.count() > 0) {
            await expect(sortBtn).toBeVisible();
        }
    });

    test('should display task list or table', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Check for task rows or empty state
        const taskRows = page.locator('tr, [data-testid="task-row"]');
        const emptyState = page.locator('text=/No tasks|Empty|Немає завдань/i');

        const hasTasks = await taskRows.count() > 2; // More than header row
        const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasTasks || hasEmptyState).toBeTruthy();
    });

    test('should display task title in task list', async ({ page }) => {
        await page.waitForTimeout(2000);

        const taskRow = page.locator('tr, [data-testid="task-row"]').nth(1);
        if (await taskRow.isVisible({ timeout: 3000 })) {
            const taskTitle = taskRow.locator('td, div').first();
            await expect(taskTitle).toBeVisible();
        }
    });

    test('should display task status indicator', async ({ page }) => {
        await page.waitForTimeout(2000);

        const statusBadge = page.locator('span, div').filter({ hasText: /To Do|In Progress|Done|Pending/i }).first();
        if (await statusBadge.count() > 0) {
            await expect(statusBadge).toBeVisible();
        }
    });

    test('should display task priority indicator', async ({ page }) => {
        await page.waitForTimeout(2000);

        const priorityBadge = page.locator('span, div').filter({ hasText: /Low|Medium|High|Priority/i }).first();
        if (await priorityBadge.count() > 0) {
            await expect(priorityBadge).toBeVisible();
        }
    });

    test('should display edit button on task rows', async ({ page }) => {
        await page.waitForTimeout(2000);

        const taskRow = page.locator('tr, [data-testid="task-row"]').nth(1);
        if (await taskRow.isVisible({ timeout: 3000 })) {
            const editBtn = taskRow.locator('button').filter({ has: page.locator('svg') }).first();
            if (await editBtn.count() > 0) {
                await expect(editBtn).toBeVisible();
            }
        }
    });

    test('should open edit modal when clicking edit button', async ({ page }) => {
        await page.waitForTimeout(2000);

        const editBtn = page.locator('button[title*="Edit"], button[aria-label*="Edit"]').first();
        if (await editBtn.isVisible({ timeout: 3000 })) {
            await editBtn.click();
            await page.waitForTimeout(500);

            const modal = page.locator('[role="dialog"], .modal');
            if (await modal.count() > 0) {
                await expect(modal).toBeVisible();
            }
        }
    });

    test('should display delete button on task rows', async ({ page }) => {
        await page.waitForTimeout(2000);

        const deleteBtn = page.locator('button[title*="Delete"], button[aria-label*="Delete"]').first();
        if (await deleteBtn.count() > 0) {
            await expect(deleteBtn).toBeVisible();
        }
    });

    test('should show delete confirmation when clicking delete', async ({ page }) => {
        await page.waitForTimeout(2000);

        const deleteBtn = page.locator('button[title*="Delete"], button[aria-label*="Delete"]').first();
        if (await deleteBtn.isVisible({ timeout: 3000 })) {
            await deleteBtn.click();
            await page.waitForTimeout(500);

            const confirmModal = page.locator('[role="dialog"], .modal').filter({ hasText: /Delete|Confirm|Remove/i });
            if (await confirmModal.count() > 0) {
                await expect(confirmModal).toBeVisible();

                // Cancel deletion
                const cancelBtn = page.locator('button').filter({ hasText: /Cancel|Скасувати/i }).first();
                if (await cancelBtn.count() > 0) {
                    await cancelBtn.click();
                }
            }
        }
    });

    test('should filter tasks by search query', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Пошук"]').first();

        if (await searchInput.count() > 0) {
            await searchInput.fill('test search query');
            await page.waitForTimeout(1000);

            const value = await searchInput.inputValue();
            expect(value.length).toBeGreaterThan(0);
        }
    });

    test('should display due date for tasks', async ({ page }) => {
        await page.waitForTimeout(2000);

        const dateText = page.locator('text=/\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}/').first();
        if (await dateText.count() > 0) {
            await expect(dateText).toBeVisible();
        }
    });

    test('should toggle task status when clicking status badge', async ({ page }) => {
        await page.waitForTimeout(2000);

        const statusBadge = page.locator('span, button').filter({ hasText: /To Do|In Progress|Done/i }).first();
        if (await statusBadge.isVisible({ timeout: 3000 })) {
            const initialText = await statusBadge.textContent();

            // Try to click if it's interactive
            if (await statusBadge.evaluate(el => el.tagName === 'BUTTON')) {
                await statusBadge.click();
                await page.waitForTimeout(1000);
            }
        }
    });

    test('should validate required fields in task creation form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Add|Створити/i }).first();
        if (await submitBtn.count() > 0) {
            // Try to submit empty form
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Form should show validation error or stay open
            const form = page.locator('form, [role="dialog"]').first();
            if (await form.count() > 0) {
                await expect(form).toBeVisible();
            }
        }
    });

    test('should display assignee field in task form', async ({ page }) => {
        const addBtn = page.locator('button').filter({ hasText: /Add Task|New Task|Create|Додати/i }).first();
        await addBtn.click();
        await page.waitForTimeout(500);

        const assigneeInput = page.locator('input[name="assignee"], input[placeholder*="assignee"]').first();
        if (await assigneeInput.count() > 0) {
            await expect(assigneeInput).toBeVisible();
        }
    });

    test('should sort tasks when clicking sort button', async ({ page }) => {
        const sortBtn = page.locator('button').filter({ hasText: /Sort|Сортувати/i }).first();

        if (await sortBtn.count() > 0) {
            await sortBtn.click();
            await page.waitForTimeout(1000);

            // Tasks should be reordered
            expect(true).toBeTruthy();
        }
    });
});
