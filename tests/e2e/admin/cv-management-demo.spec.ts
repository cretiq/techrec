import { test, expect } from '@playwright/test';

test.describe('Admin CV Management Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin gamification page where CV management exists
    await page.goto('/admin/gamification');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display admin CV management interface', async ({ page }) => {
    // Look for the CV Management tab/section in the admin interface
    // This should show the existing admin CV management functionality
    
    // Check if we can see admin interface elements
    const adminHeader = page.locator('h1, h2, h3').filter({ hasText: /admin|gamification/i });
    await expect(adminHeader.first()).toBeVisible({ timeout: 10000 });
    
    // Look for CV management related elements
    const cvManagementElements = page.locator('text=/CV|upload|file|manage/i');
    
    if (await cvManagementElements.first().isVisible({ timeout: 5000 })) {
      console.log('Admin CV management interface found');
      
      // Take a screenshot to show the admin interface
      await page.screenshot({ 
        path: 'admin-cv-management-interface.png',
        fullPage: true 
      });
      
      // Look for any CV-related buttons or actions
      const cvButtons = page.locator('button').filter({ hasText: /delete|remove|manage|cv/i });
      const buttonCount = await cvButtons.count();
      console.log(`Found ${buttonCount} CV-related buttons in admin interface`);
      
      // If we find CV management buttons, interact with them
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = cvButtons.nth(i);
          const buttonText = await button.textContent();
          console.log(`CV management button ${i + 1}: "${buttonText}"`);
        }
      }
    } else {
      console.log('Admin CV management interface not immediately visible');
      
      // Try to find tabs or navigation that might lead to CV management
      const tabs = page.locator('[role="tab"], .tab, button').filter({ hasText: /cv|file|upload|manage/i });
      const tabCount = await tabs.count();
      
      if (tabCount > 0) {
        console.log(`Found ${tabCount} potential CV management tabs`);
        const firstTab = tabs.first();
        const tabText = await firstTab.textContent();
        console.log(`Clicking on tab: "${tabText}"`);
        
        await firstTab.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking tab
        await page.screenshot({ 
          path: 'admin-cv-management-after-tab-click.png',
          fullPage: true 
        });
      }
    }
    
    // Always take a final screenshot to show current state
    await page.screenshot({ 
      path: 'admin-cv-management-final-state.png',
      fullPage: true 
    });
  });

  test('should demonstrate admin CV deletion workflow', async ({ page }) => {
    // This test will look for existing CV management functionality
    // and demonstrate the deletion workflow if CVs are present
    
    console.log('Looking for existing CV management functionality...');
    
    // Check if there are any CVs in the system to manage
    const cvItems = page.locator('[data-testid*="cv"], [data-testid*="file"], td, tr').filter({ 
      hasText: /\.pdf|\.docx|\.txt|CV|resume/i 
    });
    
    const cvCount = await cvItems.count();
    console.log(`Found ${cvCount} potential CV items in admin interface`);
    
    if (cvCount > 0) {
      // Look for delete buttons associated with CVs
      const deleteButtons = page.locator('button').filter({ hasText: /delete|remove|trash/i });
      const deleteCount = await deleteButtons.count();
      console.log(`Found ${deleteCount} delete buttons`);
      
      if (deleteCount > 0) {
        // Take screenshot before interaction
        await page.screenshot({ 
          path: 'admin-before-cv-deletion.png',
          fullPage: true 
        });
        
        // Click on first delete button to show modal/confirmation
        const firstDeleteButton = deleteButtons.first();
        await firstDeleteButton.click();
        
        // Wait for confirmation modal or dialog
        await page.waitForTimeout(2000);
        
        // Look for confirmation dialog
        const confirmDialog = page.locator('[role="dialog"], .modal, .popup').filter({ 
          hasText: /confirm|delete|sure|warning/i 
        });
        
        if (await confirmDialog.isVisible({ timeout: 3000 })) {
          console.log('Confirmation dialog appeared for CV deletion');
          
          // Take screenshot of confirmation dialog
          await page.screenshot({ 
            path: 'admin-cv-deletion-confirmation.png',
            fullPage: true 
          });
          
          // Look for cancel button to safely exit without actually deleting
          const cancelButton = page.locator('button').filter({ hasText: /cancel|close|no/i });
          if (await cancelButton.first().isVisible({ timeout: 2000 })) {
            await cancelButton.first().click();
            console.log('Cancelled deletion to preserve data');
          }
        }
      }
    } else {
      console.log('No CVs found in admin interface for deletion demo');
      
      // Take screenshot showing empty state
      await page.screenshot({ 
        path: 'admin-cv-management-empty-state.png',
        fullPage: true 
      });
    }
  });
});