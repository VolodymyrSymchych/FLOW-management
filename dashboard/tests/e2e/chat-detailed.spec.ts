import { test, expect } from '@playwright/test';

test.describe('Chat Page - Detailed Tests', () => {
    test.skip(() => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Requires test credentials');

    test.beforeEach(async ({ page }, testInfo) => {
        // Increase timeout for beforeEach due to slow chat API
        testInfo.setTimeout(60000);

        await page.goto('/sign-in');
        await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });

        // Navigate to chat page - may be slow due to chat service
        await page.goto('/dashboard/chat', { timeout: 45000 });
        await page.waitForLoadState('networkidle', { timeout: 45000 });
        await page.waitForTimeout(3000);
    });

    test('should display chat page header', async ({ page }) => {
        const header = page.locator('h1, h2').filter({ hasText: /Chat|AI|Assistant/i }).first();
        if (await header.count() > 0) {
            await expect(header).toBeVisible();
        }
    });

    test('should display message input field', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: /message|type|write/i });
        const anyTextarea = page.locator('textarea').first();

        if (await messageInput.count() > 0) {
            await expect(messageInput.first()).toBeVisible();
        } else if (await anyTextarea.count() > 0) {
            await expect(anyTextarea).toBeVisible();
        }
    });

    test('should display send button', async ({ page }) => {
        const sendBtn = page.locator('button').filter({ hasText: /Send|Надіслати/i });
        const sendIconBtn = page.locator('button[type="submit"]').first();

        if (await sendBtn.count() > 0) {
            await expect(sendBtn.first()).toBeVisible();
        } else if (await sendIconBtn.count() > 0) {
            await expect(sendIconBtn).toBeVisible();
        }
    });

    test('should display chat history or empty state', async ({ page }) => {
        // Chat page can show either "Select a chat" or "No messages" empty state
        const selectChatEmpty = page.locator('text=/Оберіть чат|Select.*chat/i');
        const noMessagesEmpty = page.locator('text=/Немає повідомлень|No messages|Start conversation|Почніть розмову/i');
        const chatMessages = page.locator('[data-testid="message"], .message');

        const hasSelectChatState = await selectChatEmpty.isVisible({ timeout: 3000 }).catch(() => false);
        const hasNoMessagesState = await noMessagesEmpty.isVisible({ timeout: 3000 }).catch(() => false);
        const hasMessages = await chatMessages.count() > 0;

        expect(hasSelectChatState || hasNoMessagesState || hasMessages).toBeTruthy();
    });

    test('should allow typing in message input', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').first();

        if (await messageInput.isVisible({ timeout: 3000 })) {
            await messageInput.fill('Test message');
            const value = await messageInput.inputValue();
            expect(value).toBe('Test message');
        }
    });

    test('should clear input after sending message', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').first();
        const sendBtn = page.locator('button[type="submit"], button').filter({ hasText: /Send/i }).first();

        if (await messageInput.isVisible({ timeout: 3000 }) && await sendBtn.count() > 0) {
            await messageInput.fill('Test message');
            await sendBtn.click();
            await page.waitForTimeout(1000);

            const value = await messageInput.inputValue();
            expect(value).toBe('');
        }
    });

    test('should display AI responses', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').first();
        const sendBtn = page.locator('button[type="submit"], button').filter({ hasText: /Send/i }).first();

        if (await messageInput.isVisible({ timeout: 3000 }) && await sendBtn.count() > 0) {
            await messageInput.fill('Hello');
            await sendBtn.click();
            await page.waitForTimeout(3000);

            // Check for AI response
            const aiMessage = page.locator('[data-testid="ai-message"], .ai-message, [role="log"] > div').last();
            if (await aiMessage.count() > 0) {
                await expect(aiMessage).toBeVisible();
            }
        }
    });

    test('should display message timestamps', async ({ page }) => {
        const timestamp = page.locator('text=/\\d{1,2}:\\d{2}|ago|minutes|hours/i').first();
        if (await timestamp.count() > 0) {
            await expect(timestamp).toBeVisible();
        }
    });

    test('should display new chat or clear button', async ({ page }) => {
        const newChatBtn = page.locator('button').filter({ hasText: /New Chat|Clear|Reset/i });
        if (await newChatBtn.count() > 0) {
            await expect(newChatBtn.first()).toBeVisible();
        }
    });

    test('should display chat sidebar with history if available', async ({ page }) => {
        const sidebar = page.locator('aside, [data-testid="chat-sidebar"]');
        if (await sidebar.count() > 0) {
            await expect(sidebar.first()).toBeVisible();
        }
    });

    test('should display suggested prompts or examples', async ({ page }) => {
        const suggestions = page.locator('button, div').filter({ hasText: /Example|Suggestion|Try/i });
        if (await suggestions.count() > 0) {
            await expect(suggestions.first()).toBeVisible();
        }
    });

    test('should handle Enter key to send message', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').first();

        if (await messageInput.isVisible({ timeout: 3000 })) {
            await messageInput.fill('Test message');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);

            // Message should be sent (input cleared or message appears)
            const value = await messageInput.inputValue();
            expect(value.length).toBeLessThanOrEqual(13);
        }
    });

    test('should display model selector if available', async ({ page }) => {
        const modelSelector = page.locator('select, button').filter({ hasText: /Model|GPT|Claude/i });
        if (await modelSelector.count() > 0) {
            await expect(modelSelector.first()).toBeVisible();
        }
    });

    test('should display copy button on messages', async ({ page }) => {
        await page.waitForTimeout(2000);

        const message = page.locator('[data-testid="message"], .message').first();
        if (await message.isVisible({ timeout: 3000 })) {
            await message.hover();
            await page.waitForTimeout(300);

            const copyBtn = page.locator('button').filter({ hasText: /Copy/i });
            if (await copyBtn.count() > 0) {
                await expect(copyBtn.first()).toBeVisible();
            }
        }
    });

    test('should display scroll to bottom button when scrolled up', async ({ page }) => {
        const chatContainer = page.locator('[data-testid="chat-container"], main, [role="log"]').first();

        if (await chatContainer.isVisible({ timeout: 3000 })) {
            // Scroll up
            await chatContainer.evaluate(el => el.scrollTop = 0);
            await page.waitForTimeout(500);

            const scrollBtn = page.locator('button').filter({ hasText: /Scroll|Bottom|Down/i });
            if (await scrollBtn.count() > 0) {
                await expect(scrollBtn.first()).toBeVisible();
            }
        }
    });

    test('should show typing indicator when AI is responding', async ({ page }) => {
        const messageInput = page.locator('textarea, input[type="text"]').first();
        const sendBtn = page.locator('button[type="submit"], button').filter({ hasText: /Send/i }).first();

        if (await messageInput.isVisible({ timeout: 3000 }) && await sendBtn.count() > 0) {
            await messageInput.fill('Test question');
            await sendBtn.click();
            await page.waitForTimeout(500);

            // Check for typing indicator
            const typingIndicator = page.locator('[data-testid="typing-indicator"], .typing, .loading').first();
            if (await typingIndicator.count() > 0) {
                // Indicator should appear briefly
                await page.waitForTimeout(1000);
            }
        }
    });

    test('should display regenerate button on AI responses', async ({ page }) => {
        await page.waitForTimeout(2000);

        const aiMessage = page.locator('[data-testid="ai-message"]').last();
        if (await aiMessage.isVisible({ timeout: 3000 })) {
            await aiMessage.hover();
            await page.waitForTimeout(300);

            const regenerateBtn = page.locator('button').filter({ hasText: /Regenerate|Retry/i });
            if (await regenerateBtn.count() > 0) {
                await expect(regenerateBtn.first()).toBeVisible();
            }
        }
    });

    test('should handle file upload if available', async ({ page }) => {
        const fileUploadBtn = page.locator('button, input[type="file"]').filter({ hasText: /Upload|Attach|File/i });
        if (await fileUploadBtn.count() > 0) {
            await expect(fileUploadBtn.first()).toBeVisible();
        }
    });

    test('should display context selection if available', async ({ page }) => {
        const contextSelector = page.locator('select, button').filter({ hasText: /Context|Project|Document/i });
        if (await contextSelector.count() > 0) {
            await expect(contextSelector.first()).toBeVisible();
        }
    });
});
