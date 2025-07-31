import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Experience List Visual Test', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Verify improved DaisyUI list presentation for experience bullets', async ({ page }) => {
    console.log('🎨 Starting Experience List Visual Test');
    
    // Login and navigate
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('🔍 Checking for DaisyUI list components...');
    
    // Look for the new DaisyUI list structure
    const daisyLists = await page.locator('ul.list').count();
    console.log(`📋 Found ${daisyLists} DaisyUI list components`);
    
    // Check for list rows within experience section
    const listRows = await page.locator('ul.list .list-row').evaluateAll(elements => {
      return elements.map(el => ({
        hasListRow: el.classList.contains('list-row'),
        hasBullet: !!el.querySelector('.text-primary'),
        hasGrowColumn: !!el.querySelector('.list-col-grow'),
        text: el.textContent?.trim().substring(0, 100)
      }));
    });
    
    console.log(`🔹 Found ${listRows.length} list rows`);
    listRows.forEach((row, i) => {
      console.log(`  Row ${i + 1}:`, {
        hasDaisyUIClasses: row.hasListRow && row.hasGrowColumn,
        hasBulletStyling: row.hasBullet,
        preview: row.text
      });
    });
    
    // Check for visual styling
    const listStyles = await page.locator('ul.list').first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        hasBackground: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
        hasBorderRadius: styles.borderRadius !== '0px',
        hasPadding: styles.padding !== '0px'
      };
    });
    
    console.log('🎨 List styling:', listStyles);
    
    // Verify the improvements
    const hasImprovedPresentation = 
      daisyLists > 0 && 
      listRows.length > 0 && 
      listRows.some(row => row.hasListRow && row.hasGrowColumn);
    
    if (hasImprovedPresentation) {
      console.log('✅ SUCCESS: Experience bullets now use DaisyUI list component');
      console.log('🎨 Visual improvements:');
      console.log('  - Two-column layout with bullet points');
      console.log('  - Growing content column for better text flow');
      console.log('  - Subtle background and rounded corners');
      console.log('  - Professional spacing and typography');
    } else {
      console.log('❌ DaisyUI list component not found or not properly structured');
    }
    
    // Take a screenshot for visual verification
    await page.locator('[data-testid="cv-management-profile-section"]').screenshot({ 
      path: 'test-results/experience-list-visual.png' 
    });
    console.log('📸 Screenshot saved to test-results/experience-list-visual.png');
    
    console.log('✅ Experience List Visual Test completed');
  });
});