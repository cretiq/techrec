import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Simple Experience Display Test', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Check if experience bullet points are displayed after fix', async ({ page }) => {
    console.log('🚀 Simple Experience Display Test');
    
    // Login and navigate to CV management
    await authHelper.loginAsUserType('experienced_developer');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // Wait for any existing data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📊 Checking for experience bullet points in UI...');
    
    // Look for profile section that should contain experience data
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    
    if (await profileSection.isVisible()) {
      console.log('✅ Profile section is visible');
      
      // Check for bullet points in lists
      const bulletPoints = await page.locator('ul li, ol li').evaluateAll(elements => {
        return elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 10)
          .slice(0, 10); // First 10 meaningful bullet points
      });
      
      console.log(`🔹 Found ${bulletPoints.length} bullet points in UI:`);
      bulletPoints.forEach((bullet, i) => {
        console.log(`  ${i + 1}. ${bullet?.substring(0, 80)}...`);
      });
      
      // Check specifically for experience-related content
      const experienceText = await page.locator('*').evaluateAll(elements => {
        return elements
          .filter(el => el.textContent?.toLowerCase().includes('experience'))
          .map(el => el.textContent?.substring(0, 200))
          .slice(0, 3);
      });
      
      console.log('💼 Experience-related elements found:');
      experienceText.forEach((text, i) => {
        console.log(`  ${i + 1}. ${text}...`);
      });
      
      // Look for detailed experience descriptions
      const hasDetailedExperience = bulletPoints.some(bullet => 
        bullet && (
          bullet.includes('developed') || 
          bullet.includes('managed') || 
          bullet.includes('implemented') ||
          bullet.includes('engineered') ||
          bullet.includes('Full-stack') ||
          bullet.includes('microservices')
        )
      );
      
      console.log(`✅ Has detailed experience descriptions: ${hasDetailedExperience}`);
      
      if (bulletPoints.length > 0 && hasDetailedExperience) {
        console.log('🎉 SUCCESS: Experience bullet points are displayed correctly');
      } else if (bulletPoints.length > 0) {
        console.log('⚠️ PARTIAL: Bullet points found but may not be experience-related');
      } else {
        console.log('❌ ISSUE: No bullet points found in UI');
      }
      
    } else {
      console.log('❌ Profile section not visible - user may not have CV data uploaded');
      
      // Check if we're in upload state
      const uploadSection = page.locator('[data-testid="cv-management-entry-section"]');
      if (await uploadSection.isVisible()) {
        console.log('📋 User is in upload state - no existing CV data to display');
      }
    }
    
    console.log('✅ Simple Experience Display Test completed');
  });
});