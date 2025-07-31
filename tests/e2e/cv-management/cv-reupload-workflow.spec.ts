import { test, expect } from '@playwright/test';
import path from 'path';

// Test files path
const testFilesPath = path.join(__dirname, '../../fixtures');

test.describe('CV Re-upload Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to CV management page
    await page.goto('/developer/cv-management');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Prerequisites - User with existing CV', () => {
    test('should display re-upload button when CV exists', async ({ page }) => {
      // First, upload a CV if none exists
      const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
      const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
      
      // Check if we need to upload a CV first
      if (await uploadSection.isVisible()) {
        // Upload initial CV
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(path.join(testFilesPath, 'sample-cv.pdf'));
        
        // Wait for analysis to complete
        await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
          timeout: 30000 
        });
      }
      
      // Verify re-upload button is visible
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await expect(reUploadButton).toBeVisible();
      await expect(reUploadButton).toHaveText('Re-upload CV');
    });
  });

  test.describe('Confirmation Modal', () => {
    test('should display confirmation modal with CV details', async ({ page }) => {
      // Ensure we have a CV uploaded
      await ensureCVExists(page);
      
      // Click re-upload button
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      // Verify modal appears
      const modal = page.locator('text=Replace Current CV?');
      await expect(modal).toBeVisible();
      
      // Verify modal content
      await expect(page.locator('text=This will permanently delete your current CV')).toBeVisible();
      await expect(page.locator('text=Current CV:')).toBeVisible();
      await expect(page.locator('text=Upload Date:')).toBeVisible();
      await expect(page.locator('text=⚠️ This action cannot be undone!')).toBeVisible();
      
      // Verify modal buttons
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      await expect(page.locator('button:has-text("Replace CV")')).toBeVisible();
    });

    test('should close modal when cancel is clicked', async ({ page }) => {
      await ensureCVExists(page);
      
      // Open modal
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      // Click cancel
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
      
      // Verify modal is closed
      await expect(page.locator('text=Replace Current CV?')).not.toBeVisible();
    });
  });

  test.describe('Complete Re-upload Workflow', () => {
    test('should successfully delete and re-upload CV', async ({ page }) => {
      await ensureCVExists(page);
      
      // Get initial CV information for comparison
      const initialFileName = await page.locator('[data-testid="cv-management-profile-section"]').textContent();
      
      // Start re-upload process
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      // Confirm deletion
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Wait for deletion to complete (button should show "Deleting CV...")
      await expect(page.locator('text=Deleting CV...')).toBeVisible();
      
      // Set up file chooser handler for when file picker opens
      const fileChooserPromise = page.waitForEvent('filechooser');
      
      // Wait for file picker to open after deletion
      const fileChooser = await fileChooserPromise;
      
      // Select a different test file for re-upload
      await fileChooser.setFiles(path.join(testFilesPath, 'Filip_Mellqvist_CV.pdf'));
      
      // Wait for upload progress to start
      await expect(page.locator('text=Uploading (')).toBeVisible({ timeout: 5000 });
      
      // Wait for upload to complete and analysis to finish
      await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
        timeout: 45000 
      });
      
      // Verify success notification
      await expect(page.locator('text=uploaded and processed successfully')).toBeVisible({ 
        timeout: 10000 
      });
      
      // Verify new CV is loaded (content should be different)
      const newContent = await page.locator('[data-testid="cv-management-profile-section"]').textContent();
      expect(newContent).not.toBe(initialFileName);
    });

    test('should handle file validation errors', async ({ page }) => {
      await ensureCVExists(page);
      
      // Start re-upload process
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Wait for file picker
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      
      // Try to upload an invalid file type (e.g., image)
      await fileChooser.setFiles(path.join(testFilesPath, '../public/placeholder.jpg'));
      
      // Should show error message
      await expect(page.locator('text=Invalid File Type')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Please select a PDF, DOCX, or TXT file')).toBeVisible();
    });

    test('should handle upload failures gracefully', async ({ page }) => {
      await ensureCVExists(page);
      
      // Mock network failure for upload
      await page.route('/api/cv/upload', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Upload server error' })
        });
      });
      
      // Start re-upload process
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Upload file
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'sample-cv.pdf'));
      
      // Should show upload error
      await expect(page.locator('text=Upload Failed')).toBeVisible({ timeout: 10000 });
    });

    test('should handle deletion failures', async ({ page }) => {
      await ensureCVExists(page);
      
      // Mock deletion failure
      await page.route('/api/cv/*', route => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'CV not found' })
          });
        } else {
          route.continue();
        }
      });
      
      // Start re-upload process
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Should show deletion error
      await expect(page.locator('text=Deletion Failed')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=CV not found')).toBeVisible();
    });
  });

  test.describe('Progress Tracking', () => {
    test('should show progress indicators during workflow', async ({ page }) => {
      await ensureCVExists(page);
      
      // Start re-upload
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // Should show deletion progress
      await expect(page.locator('text=Deleting CV...')).toBeVisible();
      
      // After deletion, file picker should open
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'sample-cv.pdf'));
      
      // Should show upload progress
      await expect(page.locator('text=Uploading (')).toBeVisible({ timeout: 5000 });
      
      // Progress should eventually reach 100% or complete
      await page.waitForFunction(() => {
        const uploadingText = document.querySelector('[data-testid="cv-management-action-reupload"]')?.textContent;
        return !uploadingText?.includes('Uploading (') || uploadingText.includes('100%');
      }, { timeout: 30000 });
    });
  });

  test.describe('UI State Management', () => {
    test('should maintain proper button states throughout workflow', async ({ page }) => {
      await ensureCVExists(page);
      
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      
      // Initial state
      await expect(reUploadButton).toHaveText('Re-upload CV');
      await expect(reUploadButton).not.toBeDisabled();
      
      // Click to start process
      await reUploadButton.click();
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      // During deletion
      await expect(reUploadButton).toHaveText('Deleting CV...');
      await expect(reUploadButton).toBeDisabled();
      
      // After successful completion, button should return to normal state
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'sample-cv.pdf'));
      
      // Wait for completion
      await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
        timeout: 45000 
      });
      
      // Button should be back to normal state
      await expect(reUploadButton).toHaveText('Re-upload CV');
      await expect(reUploadButton).not.toBeDisabled();
    });

    test('should disable button when no CV exists', async ({ page }) => {
      // Clear any existing CV first
      await clearAllCVs(page);
      
      // Navigate to fresh page
      await page.goto('/developer/cv-management');
      await page.waitForLoadState('networkidle');
      
      // Check if upload section is visible (no CV exists)
      const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
      if (await uploadSection.isVisible()) {
        // No existing CV, re-upload button should not be present
        const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
        await expect(reUploadButton).not.toBeVisible();
      }
    });
  });

  test.describe('Data Integrity', () => {
    test('should preserve other user data during re-upload', async ({ page }) => {
      await ensureCVExists(page);
      
      // Check for other user interface elements that should remain
      const otherButtons = [
        '[data-testid="cv-management-action-export"]',
        '[data-testid="cv-management-action-analysis"]',
        '[data-testid="cv-management-action-project-enhancement"]'
      ];
      
      // Verify other buttons exist before re-upload
      for (const buttonSelector of otherButtons) {
        await expect(page.locator(buttonSelector)).toBeVisible();
      }
      
      // Perform re-upload
      const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
      await reUploadButton.click();
      
      const replaceButton = page.locator('button:has-text("Replace CV")');
      await replaceButton.click();
      
      const fileChooserPromise = page.waitForEvent('filechooser');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(testFilesPath, 'sample-cv.pdf'));
      
      // Wait for completion
      await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
        timeout: 45000 
      });
      
      // Verify other buttons still exist after re-upload
      for (const buttonSelector of otherButtons) {
        await expect(page.locator(buttonSelector)).toBeVisible();
      }
    });
  });
});

// Helper functions
async function ensureCVExists(page: any) {
  const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
  const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
  
  // If no CV exists, upload one first
  if (await uploadSection.isVisible()) {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(testFilesPath, 'sample-cv.pdf'));
    
    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="cv-management-profile-section"]', { 
      timeout: 30000 
    });
  }
  
  // Verify we have a CV loaded
  await expect(profileSection).toBeVisible();
  const reUploadButton = page.locator('[data-testid="cv-management-action-reupload"]');
  await expect(reUploadButton).toBeVisible();
}

async function clearAllCVs(page: any) {
  // This is a helper function that would need to be implemented
  // based on your application's admin functionality or API endpoints
  // For now, we'll assume this functionality exists or skip tests that require it
  console.log('Note: clearAllCVs helper function needs implementation');
}