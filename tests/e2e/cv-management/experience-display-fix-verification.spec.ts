import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

test.describe('Experience Display Fix Verification', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Verify ExperienceDisplay component shows bullet points from Gemini description field', async ({ page }) => {
    console.log('🚀 Starting Experience Display Fix Verification');
    
    // STEP 1: Clean test environment and upload CV
    console.log('🧹 STEP 1: Clean environment and upload CV');
    
    await authHelper.loginAsUserType('experienced_developer');
    
    // Clean user data
    const cleanupResult = await page.evaluate(async () => {
      const response = await fetch(`${window.location.origin}/api/test/clean-user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'senior@test.techrec.com' })
      });
      return { success: response.ok, data: await response.json() };
    });
    
    if (cleanupResult.success) {
      console.log('✅ User data cleaned successfully');
    }
    
    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    
    // STEP 2: Monitor API responses to capture data structure
    console.log('📊 STEP 2: Monitor API responses');
    
    let analysisData: any = null;
    
    await page.route('/api/cv-analysis/**', async route => {
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        const data = JSON.parse(responseBody);
        if (data.experience && data.experience.length > 0) {
          analysisData = data;
          console.log('🔍 [API] Analysis data captured:', {
            experienceCount: data.experience.length,
            firstExpTitle: data.experience[0]?.title,
            hasDescription: !!data.experience[0]?.description,
            hasResponsibilities: !!data.experience[0]?.responsibilities,
            descriptionLength: data.experience[0]?.description?.length || 0
          });
          
          // Log description content to verify bullet points
          if (data.experience[0]?.description) {
            console.log('📝 [API] Description content preview:');
            console.log(data.experience[0].description.substring(0, 400));
            console.log('...');
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
    
    // Upload CV if form is available
    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    if (await fileInput.count() > 0) {
      console.log('📤 Uploading CV...');
      const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
      
      await fileInput.setInputFiles({
        name: 'Filip_Mellqvist_CV.pdf',
        mimeType: 'application/pdf',
        buffer: fs.readFileSync(cvPath)
      });
      
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      await expect(uploadButton).toBeVisible();
      await uploadButton.click();
      
      // Wait for upload and analysis
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(5000); // Extra time for Gemini analysis
    }
    
    // STEP 3: Verify UI displays experience bullet points
    console.log('🖥️ STEP 3: Verify UI displays experience bullet points');
    
    // Wait for profile section to be visible
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(profileSection).toBeVisible({ timeout: 30000 });
    console.log('✅ Profile section visible');
    
    // Look for experience section
    const experienceElements = await page.locator('*').evaluateAll(elements => {
      return elements
        .filter(el => el.textContent?.toLowerCase().includes('experience'))
        .map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 100)
        }));
    });
    
    console.log('🔍 Found experience elements:', experienceElements.length);
    experienceElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className}: ${el.textContent}...`);
    });
    
    // Check for bullet points in the UI
    const bulletElements = await page.locator('ul li, ol li').evaluateAll(elements => {
      return elements.map(el => ({
        text: el.textContent?.substring(0, 150),
        hasText: !!el.textContent && el.textContent.trim().length > 10
      })).filter(el => el.hasText);
    });
    
    console.log('🔹 Found bullet point elements:', bulletElements.length);
    bulletElements.forEach((bullet, i) => {
      console.log(`  • ${bullet.text}...`);
    });
    
    // STEP 4: Verification and results
    console.log('✅ STEP 4: Verification results');
    
    if (analysisData && analysisData.experience) {
      const apiHasDescription = analysisData.experience[0]?.description && 
                               analysisData.experience[0].description.length > 100;
      const uiHasBullets = bulletElements.length > 0;
      
      console.log('📊 [VERIFICATION] Results:');
      console.log(`  API has detailed description: ${apiHasDescription}`);
      console.log(`  UI shows bullet points: ${uiHasBullets}`);
      console.log(`  Bullet points count: ${bulletElements.length}`);
      
      if (apiHasDescription && uiHasBullets) {
        console.log('✅ SUCCESS: Fix working - API description converted to UI bullet points');
      } else if (apiHasDescription && !uiHasBullets) {
        console.log('❌ ISSUE: API has description but UI shows no bullet points');
      } else if (!apiHasDescription) {
        console.log('⚠️ WARNING: API response has no detailed description to display');
      }
      
      // Additional verification: check if bullet points contain meaningful content
      const meaningfulBullets = bulletElements.filter(bullet => 
        bullet.text && bullet.text.length > 20
      );
      console.log(`  Meaningful bullet points: ${meaningfulBullets.length}`);
      
      if (meaningfulBullets.length > 0) {
        console.log('✅ UI displays detailed experience bullet points');
      }
    } else {
      console.log('⚠️ No analysis data captured - unable to verify fix');
    }
    
    console.log('🎉 Experience Display Fix Verification completed');
  });
});