import { test, expect } from '@playwright/test';

test.describe('Experience UI Investigation', () => {

  test('Investigate experience display issue by examining API data and UI components', async ({ page }) => {
    console.log('🚀 Starting Experience UI Investigation');
    
    // STEP 1: Directly access API data we know exists
    console.log('📊 STEP 1: Access known good analysis data');
    
    // From server logs, we know this analysis ID has complete experience data
    const knownAnalysisId = '688b79acbed36d2e66b00eb2';
    
    // Direct API call to get analysis data
    const apiResponse = await page.request.get(`/api/cv-analysis/${knownAnalysisId}`);
    console.log('🔍 API Response status:', apiResponse.status());
    
    if (apiResponse.ok()) {
      const analysisData = await apiResponse.json();
      console.log('✅ Analysis data retrieved successfully');
      console.log('📋 Experience data structure:', {
        experienceCount: analysisData.experience?.length || 0,
        hasExperience: !!analysisData.experience && analysisData.experience.length > 0
      });
      
      if (analysisData.experience && analysisData.experience.length > 0) {
        const firstExp = analysisData.experience[0];
        console.log('💼 First experience entry from API:', {
          title: firstExp.title,
          company: firstExp.company,
          hasDescription: !!firstExp.description,
          descriptionLength: firstExp.description?.length || 0,
          hasResponsibilities: !!firstExp.responsibilities && firstExp.responsibilities.length > 0,
          hasAchievements: !!firstExp.achievements && firstExp.achievements.length > 0
        });
        
        // Log actual description content
        if (firstExp.description) {
          console.log('📝 Description content (first 400 chars):');
          console.log(firstExp.description.substring(0, 400));
          console.log('...');
          
          // Check for bullet points in description
          const hasBullets = firstExp.description.includes('•') || 
                           firstExp.description.includes('-') || 
                           firstExp.description.includes('*');
          console.log('🔍 Description has bullet points:', hasBullets);
        }
        
        // STEP 2: Navigate to a CV management page to examine UI components
        console.log('🖥️ STEP 2: Examine UI components for experience display');
        
        await page.goto('/developer/cv-management');
        await page.waitForLoadState('networkidle');
        
        // Look for experience display components by examining page structure
        console.log('🔍 Examining page structure for experience components...');
        
        // Check for various experience-related elements
        const experienceSelectors = [
          '[data-testid*="experience"]',
          '.experience',
          '#experience',
          'h2:has-text("Experience")',
          'h3:has-text("Experience")',
          '.card:has-text("Experience")',
          '.section:has-text("Experience")',
          '[role="region"]:has-text("Experience")'
        ];
        
        let foundExperienceElements = [];
        for (const selector of experienceSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            foundExperienceElements.push({ selector, count });
            console.log(`✅ Found ${count} elements with selector: ${selector}`);
          }
        }
        
        if (foundExperienceElements.length === 0) {
          console.log('❌ No experience elements found in current page');
          console.log('🔍 Let\'s examine the overall page structure...');
          
          // Get all headings to understand page structure
          const headings = page.locator('h1, h2, h3, h4, h5, h6');
          const headingCount = await headings.count();
          console.log(`📋 Found ${headingCount} headings on page:`);
          
          for (let i = 0; i < Math.min(headingCount, 10); i++) {
            const heading = headings.nth(i);
            const text = await heading.textContent();
            console.log(`  ${i + 1}. ${text}`);
          }
          
          // Check for any cards or sections
          const cards = page.locator('.card, [data-testid*="card"], .section, [data-testid*="section"]');
          const cardCount = await cards.count();
          console.log(`📋 Found ${cardCount} cards/sections on page:`);
          
          for (let i = 0; i < Math.min(cardCount, 5); i++) {
            const card = cards.nth(i);
            const text = await card.textContent();
            const preview = text?.substring(0, 100) || 'No text';
            console.log(`  Card ${i + 1}: ${preview}...`);
          }
        }
        
        // STEP 3: Examine specific UI components that should display experience
        console.log('🔍 STEP 3: Look for experience display components');
        
        // Look for components that might contain experience data
        const possibleContainers = [
          '[data-testid="cv-management-profile-section"]',
          '.analysis-result',
          '.cv-display',
          '.profile-section',
          '.analysis-display'
        ];
        
        for (const containerSelector of possibleContainers) {
          const container = page.locator(containerSelector);
          if (await container.isVisible()) {
            console.log(`✅ Found container: ${containerSelector}`);
            const containerText = await container.textContent();
            const hasExperienceText = containerText?.toLowerCase().includes('experience');
            console.log(`  Contains "experience" text: ${hasExperienceText}`);
            console.log(`  Total text length: ${containerText?.length || 0}`);
            
            if (hasExperienceText) {
              console.log('  Experience-related text preview:', containerText?.substring(0, 300));
            }
          }
        }
        
        // STEP 4: Analysis and conclusions
        console.log('📊 STEP 4: Analysis Summary');
        
        const apiHasDetailedExperience = analysisData.experience && 
                                       analysisData.experience.length > 0 && 
                                       analysisData.experience[0].description && 
                                       analysisData.experience[0].description.length > 100;
        
        console.log('🔍 Investigation Results:');
        console.log(`  ✅ API data contains detailed experience: ${apiHasDetailedExperience}`);
        console.log(`  🔍 Experience UI elements found: ${foundExperienceElements.length}`);
        
        if (apiHasDetailedExperience && foundExperienceElements.length === 0) {
          console.log('❌ ISSUE IDENTIFIED: API has detailed experience data but no UI components found to display it');
          console.log('🔧 RECOMMENDATION: Check experience display components in the codebase');
        } else if (apiHasDetailedExperience && foundExperienceElements.length > 0) {
          console.log('✅ Both API data and UI components exist - may be a data binding issue');
        }
        
      } else {
        console.log('❌ No experience data found in API response');
      }
    } else {
      console.log('❌ Failed to retrieve analysis data from API');
    }
    
    console.log('✅ Experience UI Investigation completed');
  });
});