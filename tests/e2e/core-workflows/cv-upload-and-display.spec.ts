import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { CVTestHelper } from '../utils/cv-test-helper';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Complete CV Flow Analysis', () => {
  let authHelper: AuthHelper;
  let cvHelper: CVTestHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    cvHelper = new CVTestHelper(page);
  });

  test('should upload CV and display results for clean user', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for Gemini 2.5 analysis
    console.log('🚀 Starting CV upload test with clean user');
    
    // STEP 1: Login as fresh user (guaranteed clean)
    console.log('👤 STEP 1: Login as fresh user (guaranteed clean state)');
    await authHelper.loginAsUserType('cv_upload_1');
    
    // STEP 2: Navigate to CV management 
    console.log('📄 STEP 2: Navigate to CV management');
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // STEP 3: Verify upload form is visible (fresh user = clean state)
    console.log('🔍 STEP 3: Verify fresh user shows upload form');
    
    // Wait a moment for any async loading to complete
    await page.waitForTimeout(2000);
    
    // Check current state first
    const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    
    const uploadVisible = await uploadSection.isVisible();
    const profileVisible = await profileSection.isVisible();
    
    console.log(`📋 Upload section visible: ${uploadVisible}`);
    console.log(`👤 Profile section visible: ${profileVisible}`);
    
    if (profileVisible) {
      throw new Error('❌ CRITICAL: Fresh user should not have profile data. Check user creation logic.');
    }
    
    if (!uploadVisible) {
      // Debug: Check what elements are actually present
      const pageContent = await page.locator('body').textContent();
      console.log('🔍 Page contains text about CV:', pageContent?.includes('CV') || pageContent?.includes('upload'));
      
      // Check if page is still loading
      const loadingElements = await page.locator('[data-testid*="loading"], .loading, .spinner').count();
      console.log(`⏳ Loading elements found: ${loadingElements}`);
      
      // Check for any error messages
      const errorElements = await page.locator('.error, .alert-error, [role="alert"]').count();
      console.log(`❌ Error elements found: ${errorElements}`);
      
      throw new Error('❌ CRITICAL: Upload form not visible for fresh user. Check page state.');
    }
    
    console.log('✅ Fresh user verified - upload form is visible');
    
    // STEP 4: Upload CV file
    console.log('📤 STEP 4: Upload CV file');
    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    const testFilePath = path.join(__dirname, '../../fixtures/Filip_Mellqvist_CV.pdf');
    
    // Verify file exists
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Test CV file not found: ${testFilePath}`);
    }
    
    await fileInput.setInputFiles(testFilePath);
    console.log('📁 CV file selected');
    
    // STEP 5: Click upload button and wait for completion
    console.log('🚀 STEP 5: Initiate upload');
    const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
    await uploadButton.click();
    
    // STEP 6: Wait for analysis completion (with Gemini 2.5)
    console.log('⏳ STEP 6: Wait for Gemini 2.5 analysis completion');
    await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
      timeout: 60000 
    });
    
    // STEP 7: Verify upload success with Gemini 2.5
    console.log('✅ STEP 7: Verify upload success with Gemini 2.5');
    const newProfileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(newProfileSection).toBeVisible();
    
    console.log('🎉 CV upload test completed successfully!');
  });
});