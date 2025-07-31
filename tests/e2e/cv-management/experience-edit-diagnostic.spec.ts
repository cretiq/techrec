import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Experience Edit Diagnostic', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Diagnose experience section and edit functionality', async ({ page }) => {
    console.log('🔍 Starting Experience Edit Diagnostic');
    
    // Login and navigate
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📊 Analyzing page structure...');
    
    // Look for all buttons with edit icons
    const editButtons = await page.locator('button').evaluateAll(buttons => 
      buttons.map((btn, index) => ({
        index,
        hasEditIcon: !!btn.querySelector('svg'),
        nearbyText: btn.closest('div')?.textContent?.substring(0, 100) || '',
        ariaLabel: btn.getAttribute('aria-label') || '',
        classes: btn.className
      })).filter(btn => btn.hasEditIcon)
    );
    
    console.log(`🔘 Found ${editButtons.length} buttons with icons:`);
    editButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. Button ${btn.index}: "${btn.nearbyText.trim().substring(0, 50)}..."`);
    });
    
    // Look specifically for experience-related content
    const experienceElements = await page.locator('*').evaluateAll(elements => {
      const expElements = elements.filter(el => 
        el.textContent?.includes('Experience') && 
        !el.textContent?.includes('Experience Level')
      );
      
      return expElements.slice(0, 5).map(el => ({
        tagName: el.tagName,
        className: el.className,
        textPreview: el.textContent?.substring(0, 150),
        hasButton: !!el.querySelector('button'),
        parentHasButton: !!el.parentElement?.querySelector('button')
      }));
    });
    
    console.log(`💼 Found ${experienceElements.length} experience-related elements:`);
    experienceElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}: ${el.textPreview?.substring(0, 50)}...`);
      console.log(`     Has button: ${el.hasButton}, Parent has button: ${el.parentHasButton}`);
    });
    
    // Try to find the specific experience section button
    const experienceButton = await page.locator('button').evaluateAll(buttons => {
      for (let btn of buttons) {
        // Check if button is near "Experience" text
        let parent = btn.parentElement;
        for (let i = 0; i < 3; i++) {
          if (!parent) break;
          if (parent.textContent?.includes('Experience') && 
              !parent.textContent?.includes('Experience Level')) {
            return {
              found: true,
              buttonIndex: Array.from(document.querySelectorAll('button')).indexOf(btn),
              parentText: parent.textContent?.substring(0, 100)
            };
          }
          parent = parent.parentElement;
        }
      }
      return { found: false };
    });
    
    if (experienceButton.found) {
      console.log(`✅ Found experience button at index ${experienceButton.buttonIndex}`);
      console.log(`   Near text: "${experienceButton.parentText}"`);
      
      // Click the button
      await page.locator('button').nth(experienceButton.buttonIndex).click();
      console.log('🖱️ Clicked experience edit button');
      
      // Wait and check what happens
      await page.waitForTimeout(1000);
      
      // Check for edit mode elements
      const editModeInputs = await page.locator('input, textarea').evaluateAll(inputs => 
        inputs.filter(inp => inp.offsetParent !== null).map(inp => ({
          type: inp.type,
          placeholder: inp.getAttribute('placeholder') || '',
          value: inp.value.substring(0, 50),
          name: inp.name || '',
          id: inp.id || ''
        }))
      );
      
      console.log(`📝 Found ${editModeInputs.length} visible inputs in edit mode:`);
      editModeInputs.forEach((inp, i) => {
        console.log(`  ${i + 1}. ${inp.type} - placeholder: "${inp.placeholder}" value: "${inp.value}..."`);
      });
      
      // Look specifically for responsibility inputs
      const respInputs = editModeInputs.filter(inp => 
        inp.placeholder.toLowerCase().includes('responsibility')
      );
      
      if (respInputs.length > 0) {
        console.log(`✅ Found ${respInputs.length} responsibility input fields`);
      } else {
        console.log('❌ No responsibility input fields found');
        
        // Check if we're in edit mode at all
        const saveButtons = await page.locator('button').evaluateAll(buttons =>
          buttons.filter(btn => 
            btn.textContent?.includes('Save') || 
            btn.querySelector('svg')
          ).length
        );
        
        console.log(`💾 Save buttons found: ${saveButtons}`);
      }
    } else {
      console.log('❌ Could not find experience edit button');
    }
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'test-results/experience-edit-diagnostic.png', fullPage: true });
    console.log('📸 Full page screenshot saved');
    
    console.log('✅ Experience Edit Diagnostic completed');
  });
});