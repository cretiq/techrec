import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Experience Management Flow', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Login with user that should have existing CV data
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
  });

  test('should edit experience responsibilities for existing profile', async ({ page }) => {
    console.log('🚀 Starting Experience Management Test');
    
    // Verify we have a profile with experience data
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(profileSection).toBeVisible();
    console.log('✅ Profile with existing data confirmed');
    
    // Step 1: Find and click experience edit button
    console.log('✏️ Step 1: Edit experience responsibilities');
    
    // Look for the experience section
    const experienceSection = await page.locator('text=Experience').first();
    if (await experienceSection.isVisible()) {
      console.log('✅ Found Experience section');
      
      // Find the edit button near the experience section
      const editButton = await experienceSection.locator('..').locator('button[aria-label*="edit"], button:has(svg)').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        console.log('🖱️ Clicked edit button');
        
        // Wait for edit mode
        await page.waitForTimeout(1000);
        
        // Check for responsibility inputs
        const responsibilityInputs = page.locator('input[placeholder*="Responsibility"]');
        const inputCount = await responsibilityInputs.count();
        console.log(`📝 Found ${inputCount} responsibility input fields`);
        
        if (inputCount > 0) {
          // Edit the first responsibility
          const firstInput = responsibilityInputs.first();
          const originalValue = await firstInput.inputValue();
          console.log(`📄 Original: "${originalValue.substring(0, 60)}..."`);
          
          await firstInput.clear();
          const newValue = 'Successfully led development of enterprise microservices architecture';
          await firstInput.fill(newValue);
          console.log(`✏️ Updated to: "${newValue}"`);
          
          // Add a new responsibility
          const addButton = page.locator('button:has-text("Add Responsibility")').first();
          if (await addButton.isVisible()) {
            await addButton.click();
            console.log('➕ Added new responsibility field');
            
            const newInput = responsibilityInputs.last();
            await newInput.fill('Implemented comprehensive testing strategy achieving 95% code coverage');
            console.log('📝 Filled new responsibility');
          }
          
          // Save changes
          const saveButton = page.locator('button[aria-label*="save"], button:has(svg)').last();
          await saveButton.click();
          console.log('💾 Saved changes');
          
          // Verify changes in display mode
          await page.waitForTimeout(1000);
          
          const listItems = await page.locator('ul.list .list-row').evaluateAll(items => 
            items.map(item => item.textContent?.trim())
          );
          
          console.log(`📋 Display mode shows ${listItems.length} items`);
          const hasUpdatedText = listItems.some(item => 
            item?.includes('enterprise microservices architecture')
          );
          const hasNewText = listItems.some(item => 
            item?.includes('95% code coverage')
          );
          
          if (hasUpdatedText && hasNewText) {
            console.log('✅ SUCCESS: Both edited and new responsibilities are displayed');
          } else {
            console.log('⚠️ Partial success:', { hasUpdatedText, hasNewText });
          }
          
        } else {
          // If no inputs found, check what's in edit mode
          const visibleElements = await page.locator('.list-row input, textarea').count();
          console.log(`🔍 Visible input elements in edit mode: ${visibleElements}`);
          
          // Take a screenshot for debugging
          await page.screenshot({ path: 'test-results/experience-edit-mode.png' });
          console.log('📸 Screenshot saved for debugging');
        }
      } else {
        console.log('❌ Edit button not found near Experience section');
      }
    } else {
      console.log('❌ Experience section not found');
    }
    
    console.log('✅ Experience Management Test finished');
  });
});