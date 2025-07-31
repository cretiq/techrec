import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('UI Experience Display Analysis', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Analyze experience data display in UI vs API response', async ({ page }) => {
    console.log('🚀 Starting UI Experience Display Analysis');
    
    // STEP 1: Login and navigate to CV management with existing data
    console.log('👤 STEP 1: Login as user with existing CV data');
    
    // Use experienced_developer user which should have existing CV data
    await authHelper.loginAsUserType('experienced_developer');
    
    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ CV management page loaded');
    
    // STEP 2: Intercept and analyze API data
    console.log('📊 STEP 2: Monitor API data');
    
    let analysisApiData: any = null;
    
    // Monitor analysis API calls
    await page.route('/api/cv-analysis/**', async route => {
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        const data = JSON.parse(responseBody);
        if (data.experience && data.experience.length > 0) {
          analysisApiData = data;
          console.log('🧠 [API] Analysis data intercepted:', {
            experienceCount: data.experience.length,
            firstExpTitle: data.experience[0]?.title,
            firstExpCompany: data.experience[0]?.company,
            firstExpHasDescription: !!data.experience[0]?.description,
            firstExpDescriptionLength: data.experience[0]?.description?.length || 0
          });
          
          // Log detailed first experience
          if (data.experience[0]?.description) {
            console.log('💼 [API] First experience description preview:');
            console.log(data.experience[0].description.substring(0, 300) + '...');
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse API response');
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    // Wait for page to load and APIs to be called
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // STEP 3: Analyze UI display
    console.log('🖥️ STEP 3: Analyze UI experience display');
    
    // Check if CV analysis section is visible
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    if (await profileSection.isVisible()) {
      console.log('✅ CV analysis section is visible');
      
      // Look for experience section with various possible selectors
      const experienceSelectors = [
        '[data-testid*="experience"]',
        '.experience-section',
        '[id*="experience"]',
        'h2:has-text("Experience"), h3:has-text("Experience")',
        '.card:has-text("Experience")',
        '[role="region"]:has-text("Experience")'
      ];
      
      let experienceSection = null;
      for (const selector of experienceSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          experienceSection = element;
          console.log(`✅ Experience section found with selector: ${selector}`);
          break;
        }
      }
      
      if (experienceSection) {
        // Analyze experience content
        const experienceText = await experienceSection.textContent();
        console.log('💼 [UI] Experience section text length:', experienceText?.length || 0);
        console.log('💼 [UI] Experience section preview:');
        console.log(experienceText?.substring(0, 500) || 'No text');
        
        // Look for experience entries/items
        const experienceItems = page.locator(`${experienceSection} .job-item, ${experienceSection} .experience-item, ${experienceSection} .position, ${experienceSection} .role`);
        const itemCount = await experienceItems.count();
        console.log(`📋 [UI] Found ${itemCount} experience items`);
        
        // Check for bullet points or detailed descriptions
        const hasBullets = experienceText?.includes('•') || experienceText?.includes('-') || experienceText?.includes('*');
        const hasDetailedDescriptions = (experienceText?.length || 0) > 500;
        
        console.log('🔍 [UI] Experience detail analysis:', {
          hasBullets,
          hasDetailedDescriptions,
          totalTextLength: experienceText?.length || 0
        });
        
        // If we have individual items, analyze first one
        if (itemCount > 0) {
          const firstItem = experienceItems.first();
          const firstItemText = await firstItem.textContent();
          console.log('💼 [UI] First experience item:', {
            textLength: firstItemText?.length || 0,
            preview: firstItemText?.substring(0, 200) || 'No text'
          });
        }
      } else {
        console.log('❌ No experience section found in UI');
        
        // Log all visible sections to understand UI structure
        const allSections = page.locator('section, .section, .card, [data-testid*="section"]');
        const sectionCount = await allSections.count();
        console.log(`🔍 [DEBUG] Found ${sectionCount} sections in UI`);
        
        for (let i = 0; i < Math.min(sectionCount, 5); i++) {
          const section = allSections.nth(i);
          const sectionText = await section.textContent();
          const preview = sectionText?.substring(0, 100) || 'No text';
          console.log(`  Section ${i + 1}: ${preview}...`);
        }
      }
    } else {
      console.log('❌ CV analysis section not visible - user may not have CV data');
      
      // Check if we're in upload state
      const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
      if (await entrySection.isVisible()) {
        console.log('📋 User is in upload state - no existing CV data');
      }
    }
    
    // STEP 4: Compare API vs UI data
    console.log('🔄 STEP 4: Compare API vs UI data');
    
    if (analysisApiData && analysisApiData.experience) {
      const apiExperienceCount = analysisApiData.experience.length;
      const apiFirstExpDesc = analysisApiData.experience[0]?.description || '';
      
      console.log('📊 [COMPARISON] API vs UI Analysis:');
      console.log(`  API experience entries: ${apiExperienceCount}`);
      console.log(`  API first exp description length: ${apiFirstExpDesc.length}`);
      console.log(`  API has detailed bullets: ${apiFirstExpDesc.includes('•') || apiFirstExpDesc.includes('-')}`);
      
      // Get UI experience content for comparison
      const allUIText = await page.locator('[data-testid="cv-management-profile-section"]').textContent();
      const uiHasExperienceData = allUIText?.toLowerCase().includes('experience') || false;
      const uiHasDetailedContent = (allUIText?.length || 0) > 1000;
      
      console.log(`  UI has experience section: ${uiHasExperienceData}`);
      console.log(`  UI has detailed content: ${uiHasDetailedContent}`);
      console.log(`  UI total content length: ${allUIText?.length || 0}`);
      
      // Identify potential issues
      if (apiExperienceCount > 0 && !uiHasExperienceData) {
        console.log('❌ ISSUE: API has experience data but UI doesn\'t show experience section');
      } else if (apiFirstExpDesc.length > 100 && !uiHasDetailedContent) {
        console.log('❌ ISSUE: API has detailed descriptions but UI doesn\'t show detailed content');
      } else if (apiExperienceCount > 0 && uiHasExperienceData && uiHasDetailedContent) {
        console.log('✅ Data flow appears correct - both API and UI have experience data');
      }
    } else {
      console.log('⚠️ No API data intercepted - unable to compare');
    }
    
    console.log('✅ UI Experience Display Analysis completed');
  });
});