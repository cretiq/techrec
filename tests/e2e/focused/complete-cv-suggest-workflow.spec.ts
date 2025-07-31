import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Test files path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFilesPath = path.join(__dirname, '../../fixtures');

test.describe('Complete CV Upload → Immediate Display Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication first
    await page.context().clearCookies();
    
    // Navigate to login/auth first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for potential authentication
    await page.waitForTimeout(2000);
  });

  test('should upload CV and display immediately without page refresh', async ({ page }) => {
    console.log('🎯 CRITICAL TEST: Upload → Immediate Display Flow');
    
    // Capture network requests for debugging
    const networkLogs: string[] = [];
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/cv') || url.includes('/api/auth')) {
        networkLogs.push(`${response.request().method()} ${url} ${status}`);
      }
    });

    // Capture console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Navigate to CV management page
    console.log('📍 Navigating to CV management page...');
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Check authentication status
    const authSession = await page.locator('[data-testid="auth-session-indicator"]').textContent().catch(() => null);
    console.log('🔐 Authentication status:', authSession || 'Unknown');

    // Look for upload section or existing CV
    const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    
    let testingReUpload = false;
    
    if (await profileSection.isVisible({ timeout: 5000 })) {
      console.log('📄 Existing CV found - testing re-upload flow');
      testingReUpload = true;
      
      // Use re-upload button
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await expect(reUploadButton).toBeVisible();
      await reUploadButton.click();
      
      // Confirm replacement
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Wait for file chooser to appear
      console.log('⏳ Waiting for file chooser after deletion...');
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
    } else if (await uploadSection.isVisible({ timeout: 5000 })) {
      console.log('📄 No existing CV - testing initial upload flow');
      
      // Upload initial CV
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      await fileInput.setInputFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
      // Click upload button if needed
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      if (await uploadButton.isVisible({ timeout: 3000 })) {
        await uploadButton.click();
      }
      
    } else {
      console.log('❌ Neither upload section nor profile section is visible');
      await page.screenshot({ path: 'debug-no-sections-visible.png', fullPage: true });
      throw new Error('CV management page is not displaying correctly');
    }
    
    console.log('⏳ Monitoring upload progress and callback execution...');
    
    // Monitor for upload progress indicators
    const uploadProgress = page.locator('text=Uploading (');
    if (await uploadProgress.isVisible({ timeout: 10000 })) {
      console.log('📊 Upload progress visible - monitoring progress...');
      
      // Wait for upload to complete (progress text disappears)
      await uploadProgress.waitFor({ state: 'hidden', timeout: 45000 });
      console.log('✅ Upload progress completed');
    }
    
    // Monitor for success indicators
    const successIndicator = page.locator('text=Upload Complete!');
    if (await successIndicator.isVisible({ timeout: 10000 })) {
      console.log('✅ Upload success indicator visible');
    }
    
    // CRITICAL ASSERTION: CV profile section should appear immediately
    console.log('🔍 CRITICAL TEST: Waiting for immediate CV display...');
    
    try {
      await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
        timeout: 60000  // Extended timeout for thorough testing
      });
      console.log('✅ CV profile section appeared');
      
      // Verify the profile section contains actual data (not just loading state)
      const profileContent = await page.locator('[data-testid="cv-management-profile-section"]').textContent();
      expect(profileContent).toBeTruthy();
      expect(profileContent.length).toBeGreaterThan(50); // Should have substantial content
      
      console.log('✅ CV profile section contains actual data');
      
    } catch (error) {
      console.log('❌ CRITICAL FAILURE: CV profile section did not appear');
      
      // Debug information
      console.log('📊 Network requests captured:');
      networkLogs.forEach(log => console.log(`  ${log}`));
      
      console.log('📋 Console logs captured:');
      consoleLogs.forEach(log => console.log(`  ${log}`));
      
      // Take debug screenshot
      await page.screenshot({ path: 'debug-cv-not-displayed.png', fullPage: true });
      
      // Check what sections are visible
      const uploadVisible = await uploadSection.isVisible();
      const profileVisible = await profileSection.isVisible();
      console.log(`🔍 Upload section visible: ${uploadVisible}`);
      console.log(`🔍 Profile section visible: ${profileVisible}`);
      
      // Check for any error messages
      const errorMessages = await page.locator('text=Error').count();
      const failedMessages = await page.locator('text=Failed').count();
      console.log(`🚨 Error messages found: ${errorMessages}`);
      console.log(`🚨 Failed messages found: ${failedMessages}`);
      
      throw error;
    }
    
    // Verify URL doesn't contain analysisId parameter (single CV approach)
    const currentUrl = page.url();
    console.log('🔍 Current URL after upload:', currentUrl);
    expect(currentUrl).not.toContain('analysisId=');
    console.log('✅ No analysisId URL parameter found (correct single CV approach)');
    
    // Verify action buttons are present and functional
    const actionButtons = [
      '[data-testid="cv-management-action-reupload"]',
      '[data-testid="cv-management-action-export"]',
      '[data-testid="cv-management-action-analysis"]'
    ];
    
    for (const buttonSelector of actionButtons) {
      const button = page.locator(buttonSelector);
      await expect(button).toBeVisible();
      const buttonText = await button.textContent();
      console.log(`✅ Found action button: ${buttonText}`);
    }
    
    // Final verification: No loading spinners should be visible
    const loadingSpinner = page.locator('[data-testid="cv-management-profile-loading-spinner"]');
    await expect(loadingSpinner).not.toBeVisible();
    
    // Print final debug information
    console.log('📊 Final Network Activity:');
    networkLogs.forEach(log => console.log(`  ${log}`));
    
    console.log('📋 Final Console Logs:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    
    console.log('🎉 Upload → Immediate Display Flow Test PASSED!');
    
    if (testingReUpload) {
      console.log('✅ Re-upload workflow validated successfully');
    } else {
      console.log('✅ Initial upload workflow validated successfully');
    }
  });

  test('should handle authentication issues gracefully', async ({ page }) => {
    console.log('🔐 Testing authentication handling in upload flow');
    
    // Track 401 responses specifically
    const authErrors: string[] = [];
    page.on('response', response => {
      if (response.status() === 401) {
        authErrors.push(`401 Unauthorized: ${response.url()}`);
      }
    });
    
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Wait and capture any 401 errors
    await page.waitForTimeout(5000);
    
    if (authErrors.length > 0) {
      console.log('🚨 Authentication errors detected:');
      authErrors.forEach(error => console.log(`  ${error}`));
      
      // This helps identify the root cause of the immediate display issue
      console.log('⚠️ Authentication issues may be preventing immediate CV display');
    } else {
      console.log('✅ No authentication errors detected');
    }
  });
});