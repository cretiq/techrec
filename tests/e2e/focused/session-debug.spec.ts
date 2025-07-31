import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Test files path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFilesPath = path.join(__dirname, '../../fixtures');

test.describe('Session Debug Test', () => {
  test('should debug session object in upload API', async ({ page }) => {
    console.log('🔍 Testing session debug in upload API...');
    
    // Navigate to CV management page
    await page.goto('/developer/cv-management');
    await page.waitForLoadState('networkidle');
    
    // Check if upload section is visible
    const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await uploadSection.isVisible({ timeout: 5000 })) {
      console.log('📄 Upload section found - attempting file upload to debug session...');
      
      // Upload a file to trigger the session debug
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
      // Wait for file to be selected
      await page.waitForTimeout(1000);
      
      // Click upload button if needed
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      if (await uploadButton.isVisible({ timeout: 3000 })) {
        console.log('🔄 Clicking upload button to trigger session debug...');
        await uploadButton.click();
      }
      
      // Wait for upload request to complete (will fail but we want the logs)
      await page.waitForTimeout(5000);
      
      console.log('✅ Upload attempted - check server logs for session debug info');
      
    } else {
      console.log('❌ Upload section not visible - cannot test upload session');
    }
  });
});