import { test, expect } from '@playwright/test';

test.describe('Authentication Debugging', () => {
  test('should debug authentication flow for CV upload', async ({ page }) => {
    console.log('🔐 Testing authentication flow...');
    
    // Track authentication-related requests
    const authRequests: string[] = [];
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/auth') || url.includes('/api/cv')) {
        authRequests.push(`${response.request().method()} ${url} ${status}`);
      }
    });

    // Start from homepage to ensure proper auth flow
    console.log('📍 Navigating to homepage first...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for authentication indicators
    const authElements = await page.locator('[data-testid*="auth"], [data-testid*="login"], [data-testid*="signin"]').count();
    console.log(`🔍 Found ${authElements} authentication-related elements on homepage`);
    
    // Check if user appears to be logged in
    const userIndicators = await page.locator('text=Profile, text=Dashboard, text=Logout').count();
    console.log(`👤 Found ${userIndicators} user-related indicators`);
    
    // Navigate to CV management
    console.log('📍 Navigating to CV management...');
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for any auth checks
    
    // Check what sections are visible
    const uploadSection = await page.locator('[data-testid="cv-management-entry-section"]').isVisible().catch(() => false);
    const profileSection = await page.locator('[data-testId="cv-management-profile-section"]').isVisible().catch(() => false);
    const authRedirect = page.url().includes('/auth/signin');
    
    console.log(`📊 Page state:`);
    console.log(`  - Upload section visible: ${uploadSection}`);
    console.log(`  - Profile section visible: ${profileSection}`);
    console.log(`  - Redirected to login: ${authRedirect}`);
    console.log(`  - Current URL: ${page.url()}`);
    
    // Check if we can see any authentication status
    const sessionCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        return { status: response.status, session };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`🔍 Client-side session check:`, sessionCheck);
    
    // Print all authentication requests
    console.log(`📊 Authentication requests captured:`);
    authRequests.forEach(req => console.log(`  ${req}`));
    
    // Take debug screenshot
    await page.screenshot({ path: 'auth-debug-state.png', fullPage: true });
    
    // If we're not authenticated, try to understand the login flow
    if (authRedirect || (!uploadSection && !profileSection)) {
      console.log('🚨 User appears to not be authenticated');
      console.log('💡 This explains why CV upload returns 401 Unauthorized');
      
      // Look for authentication options
      const authButtons = await page.locator('button, a').filter({ hasText: /sign|login|auth/i }).count();
      console.log(`🔗 Found ${authButtons} potential authentication buttons`);
      
      if (authButtons > 0) {
        const authButton = page.locator('button, a').filter({ hasText: /sign|login|auth/i }).first();
        const buttonText = await authButton.textContent();
        console.log(`🔗 First auth button: "${buttonText}"`);
      }
    } else {
      console.log('✅ User appears to be authenticated');
      console.log('🤔 But CV upload still fails - this suggests a session handling issue');
    }
  });
  
  test('should test Google OAuth authentication flow', async ({ page }) => {
    console.log('🔐 Testing Google OAuth flow...');
    
    // Navigate to sign-in page
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Look for Google sign-in button
    const googleButton = page.locator('button, a').filter({ hasText: /google/i });
    
    if (await googleButton.isVisible()) {
      console.log('✅ Google sign-in button found');
      console.log('ℹ️ In a real test, this would require Google OAuth credentials');
      console.log('ℹ️ For now, we\'ll document the expected flow');
      
      await page.screenshot({ path: 'google-signin-page.png', fullPage: true });
    } else {
      console.log('❌ Google sign-in button not found');
      
      // Check what authentication options are available
      const authOptions = await page.locator('button, a').filter({ hasText: /sign|login|auth/i }).count();
      console.log(`🔍 Found ${authOptions} authentication options`);
      
      for (let i = 0; i < authOptions; i++) {
        const option = page.locator('button, a').filter({ hasText: /sign|login|auth/i }).nth(i);
        const text = await option.textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      await page.screenshot({ path: 'signin-options.png', fullPage: true });
    }
  });
});