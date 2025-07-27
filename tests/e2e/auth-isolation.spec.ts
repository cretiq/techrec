import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

/**
 * Tests to verify authentication state isolation between tests
 * Ensures every test starts from a clean logged-out state
 */
test.describe('Authentication State Isolation', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
  });

  test('Test 1: Should start logged out and be able to login', async ({ page }) => {
    console.log('=== Test 1: Starting ===');
    
    // Verify we start logged out (should be redirected to signin when accessing protected route)
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    console.log('URL after accessing protected route:', page.url());
    
    // Should be redirected to signin OR the page should not load the protected content
    const isOnSigninPage = page.url().includes('/auth/signin');
    const hasSigninForm = await page.locator('input[type="email"]').count() > 0;
    
    if (isOnSigninPage || hasSigninForm) {
      console.log('✅ Correctly starting from logged-out state');
    } else {
      console.log('⚠️  Not redirected to signin, checking for protected content...');
      // Check if we see the actual project ideas content (would indicate we're logged in)
      const hasProjectContent = await page.getByText('Project Ideas Generator').count() > 0;
      expect(hasProjectContent).toBe(false); // Should not see protected content when logged out
    }
    
    // Now login
    await authHelper.loginAsUserType('new_user');
    
    // Should be able to access protected route
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Should see the project ideas page content
    await expect(page.getByText('Project Ideas Generator')).toBeVisible();
    
    console.log('✅ Test 1: Login successful');
  });

  test('Test 2: Should start logged out again (isolation test)', async ({ page }) => {
    console.log('=== Test 2: Starting ===');
    
    // This test should start completely fresh, even though Test 1 logged in
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    console.log('URL after accessing protected route:', page.url());
    
    // Should again be logged out (isolation working)
    const isOnSigninPage = page.url().includes('/auth/signin');
    const hasSigninForm = await page.locator('input[type="email"]').count() > 0;
    
    if (isOnSigninPage || hasSigninForm) {
      console.log('✅ Correctly isolated - starting from logged-out state again');
    } else {
      console.log('⚠️  Checking for protected content visibility...');
      const hasProjectContent = await page.getByText('Project Ideas Generator').count() > 0;
      expect(hasProjectContent).toBe(false); // Should not see protected content
    }
    
    console.log('✅ Test 2: Isolation confirmed');
  });

  test('Test 3: Can login with different user type', async ({ page }) => {
    console.log('=== Test 3: Starting ===');
    
    // Login with a different user type
    await authHelper.loginAsUserType('junior_developer');
    
    // Should be able to access protected route
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Should see the project ideas page content
    await expect(page.getByText('Project Ideas Generator')).toBeVisible();
    
    console.log('✅ Test 3: Different user login successful');
  });

  test('Test 4: Verify storage and cookies are cleared', async ({ page }) => {
    console.log('=== Test 4: Starting ===');
    
    // Check that localStorage is empty
    const localStorageItems = await page.evaluate(() => {
      const items: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key);
        }
      }
      return items;
    });
    
    console.log('LocalStorage items:', localStorageItems);
    
    // Should have no persisted Redux state
    const hasPersistData = Object.keys(localStorageItems).some(key => key.startsWith('persist:'));
    expect(hasPersistData).toBe(false);
    
    // Check that cookies are minimal (no session cookies)
    const cookies = await page.context().cookies();
    console.log('Cookies count:', cookies.length);
    console.log('Cookie names:', cookies.map(c => c.name));
    
    // Should not have NextAuth session cookies
    const hasSessionCookies = cookies.some(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('session') ||
      cookie.name.includes('__Secure-next-auth')
    );
    expect(hasSessionCookies).toBe(false);
    
    console.log('✅ Test 4: Storage and cookies properly cleared');
  });
}); 