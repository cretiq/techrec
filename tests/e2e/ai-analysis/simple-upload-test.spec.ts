import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

test.describe('Simple CV Upload Test', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Upload CV and check server logs for file size', async ({ page }) => {
    console.log('🚀 Starting Simple CV Upload Test');
    
    // Monitor CV upload API
    let uploadIntercepted = false;
    await page.route('/api/cv/upload', async route => {
      console.log('📞 [API-MONITOR] CV Upload API intercepted');
      uploadIntercepted = true;
      
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      console.log('📁 [UPLOAD-RESPONSE]:', {
        status: response.status(),
        bodyPreview: responseBody.substring(0, 200)
      });
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });

    // Login
    await authHelper.loginAsUserType('experienced_developer');
    console.log('✅ Test user authenticated');

    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    console.log('✅ CV management page loaded');

    // Verify test file
    const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
    const fileStats = fs.statSync(cvPath);
    console.log('📊 Test file verification:', {
      path: cvPath,
      exists: fs.existsSync(cvPath),
      size: fileStats.size,
      sizeKB: Math.round(fileStats.size / 1024)
    });

    // Upload file
    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    await fileInput.setInputFiles(cvPath);
    
    // Verify file is selected
    const hasFiles = await fileInput.evaluate(input => {
      const fileInputElement = input as HTMLInputElement;
      if (fileInputElement.files && fileInputElement.files.length > 0) {
        const file = fileInputElement.files[0];
        return {
          count: fileInputElement.files.length,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        };
      }
      return { count: 0 };
    });
    console.log('📁 File input verification:', hasFiles);
    
    if (hasFiles.fileSize === 0) {
      console.error('❌ File input shows 0 bytes - this is the root issue!');
    } else {
      console.log('✅ File input shows correct size');
    }

    // Trigger upload
    const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    console.log('🚀 Upload initiated');

    // Wait for network completion
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for processing

    // Verify upload was intercepted
    expect(uploadIntercepted, 'Upload API should have been called').toBe(true);
    
    console.log('✅ Simple CV Upload Test completed');
  });
});