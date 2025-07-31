import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

test.describe('Debug CV Upload Test', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Capture console logs
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`🖥️ [BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`);
      }
    });
  });

  test('Trace file upload issue with detailed debugging', async ({ page }) => {
    console.log('🚀 Starting Debug CV Upload Test');
    
    // Monitor CV upload API
    let uploadIntercepted = false;
    await page.route('/api/cv/upload', async route => {
      console.log('📞 [API-MONITOR] CV Upload API intercepted');
      uploadIntercepted = true;
      
      const request = route.request();
      console.log('📞 [REQUEST-DETAILS]:', {
        method: request.method(),
        headers: Object.fromEntries(Object.entries(request.headers()).filter(([k]) => k.toLowerCase().includes('content'))),
        postDataBuffer: request.postDataBuffer()?.length || 0
      });
      
      const response = await page.request.fetch(request);
      const responseBody = await response.text();
      
      console.log('📁 [UPLOAD-RESPONSE]:', {
        status: response.status(),
        bodyPreview: responseBody.substring(0, 300)
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

    // Upload file using the dropzone
    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    console.log('📁 Setting file input...');
    await fileInput.setInputFiles(cvPath);
    
    // Wait for the file to be processed by dropzone
    await page.waitForTimeout(1000);
    
    // Verify file is selected in UI
    const fileName = await page.locator('[data-testid="cv-management-upload-status-text"]').textContent();
    console.log('📁 Upload status text:', fileName);
    
    // Verify upload button appears
    const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
    await expect(uploadButton).toBeVisible();
    console.log('✅ Upload button is visible');
    
    // Wait a moment for any file processing
    await page.waitForTimeout(500);
    
    // Click upload button
    console.log('🚀 Clicking upload button...');
    await uploadButton.click();
    console.log('🚀 Upload button clicked');

    // Wait for network completion with longer timeout
    console.log('⏳ Waiting for upload to complete...');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify upload was intercepted
    expect(uploadIntercepted, 'Upload API should have been called').toBe(true);
    
    console.log('✅ Debug CV Upload Test completed');
  });
});