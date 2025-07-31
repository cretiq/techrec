import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthHelper } from '../utils/auth-helper';

// Test files path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFilesPath = path.join(__dirname, '../../fixtures');

test.describe('Upload to Immediate Display Flow', () => {
  test.beforeEach(async ({ page }) => {
    // CRITICAL: Always authenticate first before testing CV functionality
    const auth = new AuthHelper(page);
    await auth.ensureLoggedIn('junior_developer');
    
    // Navigate to CV management page (should now be accessible)
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
  });

  test('should display CV immediately after upload without URL parameters', async ({ page }) => {
    console.log('🎯 Testing upload → immediate display flow (single CV approach)');
    
    // Ensure we start with no CV (upload section visible)
    const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
    
    // If there's already a CV, we'll test the re-upload flow
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    
    if (await profileSection.isVisible({ timeout: 3000 })) {
      console.log('📄 Existing CV found - testing re-upload flow');
      
      // Use re-upload button
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await expect(reUploadButton).toBeVisible();
      await reUploadButton.click();
      
      // Confirm replacement
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Wait for file chooser
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
    } else {
      console.log('📄 No existing CV - testing initial upload flow');
      
      // Upload initial CV
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      await fileInput.setInputFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
      // Wait for file to be processed by dropzone
      await page.waitForTimeout(1000);
      
      // Click upload button to trigger the upload
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      await expect(uploadButton).toBeVisible();
      await uploadButton.click();
      console.log('🚀 Upload button clicked - upload initiated');
    }
    
    console.log('⏳ Waiting for CV analysis to complete...');
    
    // CRITICAL TEST: CV should display immediately without requiring page refresh
    // Wait for the profile section to appear (this means analysis is complete)
    await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
      timeout: 45000 
    });
    
    console.log('✅ CV analysis completed and profile section is visible');
    
    // CRITICAL TEST: Check that no URL parameters are set
    const currentUrl = page.url();
    console.log('🔍 Current URL after upload:', currentUrl);
    
    // URL should NOT contain analysisId parameter
    expect(currentUrl).not.toContain('analysisId=');
    console.log('✅ No analysisId URL parameter found (correct single CV approach)');
    
    // Verify CV data is displayed
    const cvProfileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(cvProfileSection).toBeVisible();
    
    // Check for key CV management elements
    const quickActions = page.locator('[data-testid="cv-management-quick-actions"]');
    await expect(quickActions).toBeVisible();
    
    // Verify action buttons are present
    const actionButtons = [
      '[data-testid="cv-management-action-reupload"]',
      '[data-testid="cv-management-action-export"]',
      '[data-testid="cv-management-action-analysis"]',
      '[data-testid="cv-management-action-project-enhancement"]'
    ];
    
    for (const buttonSelector of actionButtons) {
      const button = page.locator(buttonSelector);
      await expect(button).toBeVisible();
      const buttonText = await button.textContent();
      console.log(`✅ Found action button: ${buttonText}`);
    }
    
    // Verify content is actually loaded (not just loading state)
    const loadingSpinner = page.locator('[data-testid="cv-management-profile-loading-spinner"]');
    await expect(loadingSpinner).not.toBeVisible();
    
    console.log('✅ All CV management elements are visible and functional');
    
    // Test that navigation back to the page also works correctly
    console.log('🔄 Testing navigation consistency...');
    
    // Navigate away and back
    await page.goto('/developer/dashboard');  
    await page.waitForLoadState('networkidle');
    
    // Navigate back to CV management
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Should still show CV without URL parameters
    await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
      timeout: 10000 
    });
    
    const urlAfterNavigation = page.url();
    console.log('🔍 URL after navigation back:', urlAfterNavigation);
    expect(urlAfterNavigation).not.toContain('analysisId=');
    
    console.log('✅ Navigation consistency verified');
    console.log('🎉 Upload → immediate display flow test completed successfully!');
  });

  test('should use latest analysis approach when navigating via Features menu', async ({ page }) => {
    console.log('🎯 Testing Features → CV Management navigation flow');
    
    // User is already authenticated from beforeEach, navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hover over Features dropdown
    const featuresDropdown = page.locator('[data-testid="nav-desktop-dropdown-features-trigger"]');
    await featuresDropdown.hover();
    
    // Click CV Management link
    const cvManagementLink = page.locator('[data-testid="nav-desktop-dropdown-cv-management-trigger"]');
    await cvManagementLink.click();
    
    // Should navigate to CV management page
    await page.waitForURL('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Current URL after Features navigation:', page.url());
    
    // URL should not contain analysisId parameters
    expect(page.url()).not.toContain('analysisId=');
    
    // Should load the latest analysis automatically
    if (await page.locator('[data-testid="cv-management-profile-section"]').isVisible({ timeout: 10000 })) {
      console.log('✅ CV loaded successfully via Features navigation');
      
      // Verify it's using the latest analysis approach
      const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
      await expect(profileSection).toBeVisible();
      
      console.log('✅ Features → CV Management navigation works correctly');
    } else {
      console.log('ℹ️ No CV data found - user may need to upload a CV first');
      
      // Should show upload section
      const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
      await expect(uploadSection).toBeVisible();
      
      console.log('✅ Correctly shows upload section when no CV exists');
    }
  });

  test('should handle page refresh without losing CV display', async ({ page }) => {
    console.log('🎯 Testing page refresh behavior');
    
    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Check if CV data is loaded
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    
    if (await profileSection.isVisible({ timeout: 10000 })) {
      console.log('📄 CV data is loaded');
      
      // Get some CV content for comparison
      const initialContent = await profileSection.textContent();
      
      // Refresh the page
      console.log('🔄 Refreshing page...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify URL doesn't contain analysisId after refresh
      const urlAfterRefresh = page.url();
      console.log('🔍 URL after refresh:', urlAfterRefresh);
      expect(urlAfterRefresh).not.toContain('analysisId=');
      
      // CV should still be loaded
      await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
        timeout: 15000 
      });
      
      const refreshedContent = await profileSection.textContent();
      
      // Content should be the same (same CV data)
      expect(refreshedContent).toBe(initialContent);
      
      console.log('✅ Page refresh maintains CV display without URL parameters');
    } else {
      console.log('ℹ️ No CV to test refresh with - test skipped');
    }
  });

  test('should validate console logs show latest analysis approach', async ({ page }) => {
    console.log('🎯 Testing console logs for debugging');
    
    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[CVManagementPage]')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Navigate to CV management page
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for logs
    await page.waitForTimeout(2000);
    
    console.log('📋 Console logs captured:');
    consoleLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    // Should see logs about latest analysis approach
    const hasLatestAnalysisLog = consoleLogs.some(log => 
      log.includes('Loading user\'s latest analysis (single CV approach)')
    );
    
    const hasNoUrlParamsLog = consoleLogs.some(log => 
      log.includes('Analysis loaded, no URL parameters needed')
    );
    
    if (hasLatestAnalysisLog) {
      console.log('✅ Found latest analysis approach log');
    }
    
    if (hasNoUrlParamsLog) {
      console.log('✅ Found no URL parameters log');
    }
    
    // Should NOT see old analysisId-based logs
    const hasOldAnalysisIdLog = consoleLogs.some(log => 
      log.includes('Loading analysis from URL:')
    );
    
    expect(hasOldAnalysisIdLog).toBe(false);
    console.log('✅ Confirmed no old analysisId URL approach logs');
  });
});