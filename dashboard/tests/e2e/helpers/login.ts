import { Page } from '@playwright/test';

/**
 * Helper function to login a user
 * Handles Vercel service delays and provides better error messages
 */
export async function loginUser(page: Page, email: string, password: string, timeout = 120000) {
  // Navigate to sign-in page
  await page.goto('/sign-in');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').waitFor({ timeout: 30000 });
  
  // Fill login form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  
  // Click login button and wait for navigation
  // Use Promise.all to ensure navigation listener is set up before clicking
  const loginButton = page.getByRole('button', { name: /Log In/i });
  
  try {
    // Set up navigation wait first, then click
    const navigationPromise = page.waitForURL(/dashboard/, { timeout });
    await loginButton.click();
    await navigationPromise;
  } catch (error: any) {
    // Wait a bit for any error messages to appear
    await page.waitForTimeout(3000);
    
    // Check if there's an error message on the page
    const errorElement = page.locator('.text-danger, .text-red-500, [role="alert"], .bg-danger, [class*="error"], p:has-text("locked"), p:has-text("temporarily")');
    const hasError = await errorElement.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasError) {
      const errorText = await errorElement.textContent();
      const currentUrl = page.url();
      
      // Check for account lockout specifically
      if (errorText && (errorText.includes('locked') || errorText.includes('temporarily') || errorText.includes('minute'))) {
        throw new Error(`Account locked: ${errorText}. Please wait before running tests again. Current URL: ${currentUrl}`);
      }
      
      throw new Error(`Login failed with error: ${errorText || 'Unknown error'}. Current URL: ${currentUrl}`);
    }
    
    // Check current URL to see where we are
    const currentUrl = page.url();
    if (currentUrl.includes('/sign-in')) {
      // Check if button is disabled (might indicate loading state)
      const isDisabled = await loginButton.isDisabled().catch(() => false);
      if (isDisabled) {
        throw new Error(`Login timeout: Button is disabled, might be stuck in loading state. Waited ${timeout}ms.`);
      }
      throw new Error(`Login timeout: Still on sign-in page after ${timeout}ms. Current URL: ${currentUrl}`);
    }
    
    // If we're not on sign-in but not on dashboard either, log the URL
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Login redirected to unexpected page: ${currentUrl}`);
    }
    
    throw error;
  }
  
  // Wait for the shell anchor instead of networkidle because the dashboard keeps live queries open
  await page.locator('[data-testid="app-shell-sidebar"], [data-testid="app-header"]').first().waitFor({ timeout: 90000 });
  
  // Verify we're actually logged in by checking for dashboard content
  // Give it more time for Vercel services to respond
  try {
    const dashboardContent = page.locator('body').filter({ hasText: /dashboard|projects|tasks|welcome/i });
    await dashboardContent.waitFor({ timeout: 15000, state: 'visible' });
  } catch {
    // If dashboard content not found, check if we're still on sign-in
    const currentUrl = page.url();
    if (currentUrl.includes('/sign-in')) {
      throw new Error('Login appeared to succeed but redirected back to sign-in page');
    }
    // If we're on dashboard URL, consider it successful even if content is slow to load
    if (currentUrl.includes('/dashboard')) {
      // Wait a bit more for content
      await page.waitForTimeout(3000);
    }
  }
}
