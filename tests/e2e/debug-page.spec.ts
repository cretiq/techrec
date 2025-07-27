import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

/**
 * Debug test to see what's actually happening on the page
 */
test.describe('Debug - What is actually on the page', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
  });

  test('Screenshot of project ideas page after login attempt', async ({ page }) => {
    console.log('Attempting to login...');
    
    try {
      await authHelper.loginAsUserType('new_user');
      console.log('Login attempt completed');
    } catch (error) {
      console.log('Login failed:', error);
    }
    
    // Navigate to project ideas page
    console.log('Navigating to project ideas page...');
    await page.goto('/developer/projects/ideas');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'debug-project-ideas-page.png', fullPage: true });
    
    // Log the page title and URL
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Log all text content on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page content preview:', bodyText?.substring(0, 500));
    
    // Log all h1 elements
    const h1Elements = await page.locator('h1').all();
    console.log('H1 elements found:', h1Elements.length);
    for (let i = 0; i < h1Elements.length; i++) {
      const text = await h1Elements[i].textContent();
      console.log(`H1 ${i + 1}:`, text);
    }
    
    // Check if we're redirected to signin
    if (page.url().includes('/auth/signin')) {
      console.log('We were redirected to signin - authentication failed');
      await page.screenshot({ path: 'debug-signin-page.png', fullPage: true });
    }
    
    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });

  test('Direct signin page test', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    console.log('Signin page title:', await page.title());
    console.log('Signin page URL:', page.url());
    
    // Take screenshot of signin page
    await page.screenshot({ path: 'debug-signin-direct.png', fullPage: true });
    
    // Check if form elements exist
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    
    console.log('Email inputs found:', emailInput);
    console.log('Password inputs found:', passwordInput);
    console.log('Submit buttons found:', submitButton);
    
    expect(true).toBe(true);
  });
}); 