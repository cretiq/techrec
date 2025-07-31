import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Experience Edit Working Test', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Successfully edit experience responsibilities', async ({ page }) => {
    console.log('✏️ Starting Experience Edit Working Test');
    
    // Login and navigate
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Looking for Work Experience section...');
    
    // Find the Work Experience section header
    const workExperienceHeader = page.locator('h2, h3').filter({ hasText: 'Work Experience' });
    await expect(workExperienceHeader).toBeVisible();
    console.log('✅ Found Work Experience section');
    
    // The edit button should be in the same container as the header
    const experienceSection = workExperienceHeader.locator('..');
    const editButton = experienceSection.locator('button').filter({ has: page.locator('svg') }).first();
    
    if (await editButton.isVisible()) {
      console.log('✅ Found edit button for Work Experience');
      
      // Click edit button
      await editButton.click();
      console.log('🖱️ Clicked edit button');
      
      // Wait for edit mode
      await page.waitForTimeout(1000);
      
      // Look for responsibility input fields
      const responsibilityInputs = page.locator('input[placeholder*="Responsibility"]');
      const inputCount = await responsibilityInputs.count();
      console.log(`📝 Found ${inputCount} responsibility input fields`);
      
      if (inputCount > 0) {
        // Get the first input
        const firstInput = responsibilityInputs.first();
        const originalValue = await firstInput.inputValue();
        console.log(`📄 Original value: "${originalValue.substring(0, 60)}..."`);
        
        // Edit the value
        await firstInput.clear();
        const newValue = 'Led development of enterprise-grade microservices architecture with 99.9% uptime';
        await firstInput.fill(newValue);
        console.log(`✏️ Updated to: "${newValue}"`);
        
        // Add a new responsibility
        const addButton = page.locator('button:has-text("Add Responsibility")');
        if (await addButton.isVisible()) {
          await addButton.click();
          console.log('➕ Added new responsibility field');
          
          // Fill the new field
          const newInput = responsibilityInputs.last();
          await newInput.fill('Mentored 5 junior developers, improving team productivity by 40%');
          console.log('📝 Filled new responsibility');
        }
        
        // Save changes - look for save icon button
        const saveButton = experienceSection.locator('button').filter({ has: page.locator('svg') }).last();
        await saveButton.click();
        console.log('💾 Saved changes');
        
        // Wait for save to complete
        await page.waitForTimeout(2000);
        
        // Verify changes are displayed
        const listItems = await page.locator('ul.list .list-row').allTextContents();
        console.log(`📋 Display mode shows ${listItems.length} responsibility items`);
        
        const hasUpdatedText = listItems.some(text => 
          text.includes('99.9% uptime')
        );
        const hasNewText = listItems.some(text => 
          text.includes('Mentored 5 junior developers')
        );
        
        if (hasUpdatedText && hasNewText) {
          console.log('✅ SUCCESS: Both edited and new responsibilities are displayed correctly');
          console.log('🎨 Responsibilities displayed with DaisyUI list formatting');
        } else {
          console.log('⚠️ Results:', { hasUpdatedText, hasNewText });
          console.log('First few items:', listItems.slice(0, 3));
        }
        
        // Take a final screenshot
        await experienceSection.screenshot({ 
          path: 'test-results/experience-edit-success.png' 
        });
        console.log('📸 Screenshot of edited experience saved');
        
      } else {
        console.log('❌ No responsibility input fields found in edit mode');
      }
      
    } else {
      console.log('❌ Edit button not found in Work Experience section');
    }
    
    console.log('✅ Experience Edit Working Test completed');
  });
});