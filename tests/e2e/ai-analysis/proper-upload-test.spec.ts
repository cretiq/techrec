import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

test.describe('Proper CV Upload Test', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Capture console logs
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('UploadForm')) {
        console.log(`🖥️ [BROWSER] ${msg.text()}`);
      }
    });
  });

  test('Clean user data with admin then test upload', async ({ page }) => {
    console.log('🚀 Starting Proper CV Upload Test');
    
    // STEP 1: Login as admin and clean test user data
    console.log('👑 Step 1: Admin cleanup of test user data');
    await authHelper.loginAsUserType('admin');
    
    // Navigate to admin panel
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-panel-container"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ Admin panel loaded');
    
    // Clean test user data
    const testUserEmail = 'senior@test.techrec.com';
    await page.fill('[data-testid="admin-cleanup-email-input"]', testUserEmail);
    await page.click('[data-testid="admin-cleanup-submit-button"]');
    
    // Wait for cleanup confirmation
    await expect(page.locator('[data-testid="admin-cleanup-success"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ Test user data cleaned by admin');
    
    // STEP 2: Switch to test user and verify clean state
    console.log('👤 Step 2: Switch to test user');
    await authHelper.loginAsUserType('experienced_developer');
    
    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ CV management page loaded');
    
    // Verify clean slate - upload form should be visible
    await expect(page.locator('[data-testid="cv-management-entry-section"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ Clean slate confirmed - upload form is visible');
    
    // STEP 3: Test file upload
    console.log('📤 Step 3: Test file upload');
    
    // Monitor upload API
    let uploadIntercepted = false;
    await page.route('/api/cv/upload', async route => {
      console.log('📞 [API-MONITOR] CV Upload API intercepted');
      uploadIntercepted = true;
      
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      console.log('📁 [UPLOAD-RESPONSE]:', {
        status: response.status(),
        success: response.status() < 400
      });
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    // Verify test file
    const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
    const fileStats = fs.statSync(cvPath);
    console.log('📊 Test file verification:', {
      size: fileStats.size,
      sizeKB: Math.round(fileStats.size / 1024)
    });
    
    // Upload file
    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    await fileInput.setInputFiles(cvPath);
    
    // Wait for file to be processed
    await page.waitForTimeout(1000);
    
    // Click upload button
    const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
    await expect(uploadButton).toBeVisible({ timeout: 30000 });
    await uploadButton.click();
    console.log('🚀 Upload initiated');
    
    // Wait for upload completion
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verify upload was called and succeeded
    expect(uploadIntercepted, 'Upload API should have been called').toBe(true);
    
    // Verify CV analysis is now displayed
    await expect(page.locator('[data-testid="cv-management-profile-section"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ CV analysis now displayed - upload successful');
    
    console.log('✅ Proper CV Upload Test completed successfully');
  });
});