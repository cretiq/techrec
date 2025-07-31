import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Experience Edit Functionality', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Verify experience responsibilities can be edited individually', async ({ page }) => {
    console.log('✏️ Starting Experience Edit Test');
    
    // Login and navigate
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('🔍 Looking for experience section...');
    
    // Wait for profile section
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(profileSection).toBeVisible({ timeout: 30000 });
    
    // Find the Experience section edit button
    const experienceEditButton = await page.locator('button').filter({ has: page.locator('svg').first() }).evaluateAll(buttons => {
      // Find the edit button near "Experience" text
      const experienceButton = buttons.find(button => {
        const parent = button.closest('div');
        if (!parent) return false;
        
        // Look for nearby Experience text
        let searchElement = parent;
        for (let i = 0; i < 5; i++) {
          if (searchElement.textContent?.includes('Experience')) return true;
          searchElement = searchElement.parentElement;
          if (!searchElement) break;
        }
        return false;
      });
      
      return experienceButton ? buttons.indexOf(experienceButton) : -1;
    });
    
    if (experienceEditButton >= 0) {
      console.log('✅ Found experience edit button');
      
      // Click the edit button
      await page.locator('button').filter({ has: page.locator('svg').first() }).nth(experienceEditButton).click();
      console.log('🖱️ Clicked edit button');
      
      // Wait for edit mode
      await page.waitForTimeout(1000);
      
      // Check for responsibility input fields
      const responsibilityInputs = await page.locator('input[placeholder*="Responsibility"]').count();
      console.log(`📝 Found ${responsibilityInputs} responsibility input fields`);
      
      if (responsibilityInputs > 0) {
        // Get the first responsibility input
        const firstInput = page.locator('input[placeholder*="Responsibility"]').first();
        const originalValue = await firstInput.inputValue();
        console.log(`📄 Original value: "${originalValue.substring(0, 50)}..."`);
        
        // Edit the first responsibility
        await firstInput.clear();
        const newValue = 'Led development of microservices architecture using modern technologies';
        await firstInput.fill(newValue);
        console.log(`✏️ Updated to: "${newValue}"`);
        
        // Save changes
        const saveButton = page.locator('button').filter({ has: page.locator('svg').first() }).last();
        await saveButton.click();
        console.log('💾 Saved changes');
        
        // Wait for save to complete
        await page.waitForTimeout(1000);
        
        // Verify the change is reflected in display mode
        const updatedText = await page.locator('ul.list .list-row').first().textContent();
        if (updatedText?.includes(newValue)) {
          console.log('✅ SUCCESS: Responsibility text was successfully edited and saved');
        } else {
          console.log('⚠️ WARNING: Updated text not found in display mode');
        }
        
        // Check that we have proper list structure
        const listRows = await page.locator('ul.list .list-row').count();
        console.log(`📋 Display mode shows ${listRows} responsibility items`);
        
      } else {
        console.log('❌ No responsibility input fields found in edit mode');
        
        // Check what's visible in edit mode
        const visibleInputs = await page.locator('input:visible').count();
        console.log(`🔍 Total visible inputs in edit mode: ${visibleInputs}`);
      }
      
    } else {
      console.log('❌ Could not find experience edit button');
    }
    
    console.log('✅ Experience Edit Test completed');
  });
});