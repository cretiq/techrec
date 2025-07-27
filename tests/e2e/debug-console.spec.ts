import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

/**
 * Debug test to capture console errors and understand rendering issues
 */
test.describe('Debug - Console errors and rendering', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
    
    // Listen to console messages
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR:`, error.message);
    });

    // Listen to request failures
    page.on('requestfailed', request => {
      console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Debug project ideas page with console monitoring', async ({ page }) => {
    console.log('=== Starting debug test ===');
    
    // Step 1: Login
    console.log('1. Attempting login...');
    try {
      await authHelper.loginAsUserType('new_user');
      console.log('✅ Login completed');
    } catch (error) {
      console.log('❌ Login failed:', error);
    }
    
    // Step 2: Navigate and monitor
    console.log('2. Navigating to project ideas page...');
    await page.goto('/developer/projects/ideas');
    
    // Wait for page load and capture state
    console.log('3. Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Give extra time for React to render
    await page.waitForTimeout(5000);
    
    console.log('4. Checking page state...');
    console.log('   URL:', page.url());
    console.log('   Title:', await page.title());
    
    // Check if there are any error messages on the page
    const errorElements = await page.locator('text=/error|Error|ERROR/').count();
    console.log('   Error messages found:', errorElements);
    
    // Check for loading indicators
    const loadingElements = await page.locator('text=/loading|Loading|LOADING/').count();
    console.log('   Loading indicators found:', loadingElements);
    
    // Check React root mounting
    const reactRoot = await page.locator('#__next').count();
    console.log('   React root found:', reactRoot);
    
    // Check if there's any content at all
    const bodyContent = await page.locator('body').textContent();
    const hasContent = bodyContent && bodyContent.length > 100 && !bodyContent.includes('__next_f');
    console.log('   Has meaningful content:', hasContent);
    
    if (!hasContent) {
      console.log('   Body content preview:', bodyContent?.substring(0, 200));
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'debug-console-final.png', fullPage: true });
    
    console.log('=== Debug test completed ===');
    
    // The test itself doesn't need to assert anything specific
    expect(true).toBe(true);
  });

  test('Test direct access without login to see middleware behavior', async ({ page }) => {
    console.log('=== Testing direct access (no login) ===');
    
    // Try to access the page directly without login
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Direct access URL:', page.url());
    console.log('Direct access title:', await page.title());
    
    // Should be redirected to signin
    if (page.url().includes('/auth/signin')) {
      console.log('✅ Correctly redirected to signin (middleware working)');
    } else {
      console.log('❌ Not redirected to signin - middleware issue?');
    }
    
    await page.screenshot({ path: 'debug-direct-access.png', fullPage: true });
    
    expect(true).toBe(true);
  });
}); 