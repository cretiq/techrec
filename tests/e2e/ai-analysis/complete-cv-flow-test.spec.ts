import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

test.describe('Complete CV Flow Analysis', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Complete flow: Admin cleanup → Upload → Analysis → UI verification', async ({ page }) => {
    console.log('🚀 Starting Complete CV Flow Analysis');
    
    // STEP 1: Login and clean test user data via API
    console.log('👑 STEP 1: Clean test user data');
    const testUserEmail = 'senior@test.techrec.com';
    
    // Login first to establish session
    await authHelper.loginAsUserType('experienced_developer');
    
    // Clean user data via API
    const cleanupResult = await page.evaluate(async (email) => {
      try {
        const response = await fetch(`${window.location.origin}/api/test/clean-user-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        return { success: response.ok, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, testUserEmail);

    if (cleanupResult.success) {
      console.log('✅ User data cleaned via API:', cleanupResult.data.message);
    } else {
      console.log('⚠️ Cleanup failed:', cleanupResult.error);
    }
    
    // STEP 2: Navigate to CV management 
    console.log('👤 STEP 2: Navigate to CV management');
    
    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ CV management page loaded');
    
    // Verify clean state (upload form visible)
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    if (await entrySection.isVisible()) {
      console.log('✅ Clean state confirmed - upload form visible');
    } else {
      console.log('⚠️ Upload form not visible - user may already have CV data');
    }
    
    // STEP 3: Monitor and analyze complete data flow
    console.log('📊 STEP 3: Monitor complete data flow');
    
    let uploadResponse: any = null;
    let analysisResponse: any = null;
    
    // Monitor upload API
    await page.route('/api/cv/upload', async route => {
      console.log('📞 [MONITOR] Upload API intercepted');
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        uploadResponse = JSON.parse(responseBody);
        console.log('📁 [UPLOAD] Success:', {
          status: response.status(),
          cvId: uploadResponse.cvId,
          analysisId: uploadResponse.analysisId
        });
      } catch (e) {
        console.log('❌ [UPLOAD] Failed to parse response');
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    // Monitor analysis API
    await page.route('/api/cv-analysis/**', async route => {
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        analysisResponse = JSON.parse(responseBody);
        console.log('🧠 [ANALYSIS] Retrieved:', {
          status: response.status(),
          hasExperience: !!analysisResponse.experience,
          experienceCount: analysisResponse.experience?.length || 0
        });
        
        // Log first experience entry details if available
        if (analysisResponse.experience && analysisResponse.experience.length > 0) {
          const firstExp = analysisResponse.experience[0];
          console.log('💼 [EXPERIENCE] First entry:', {
            title: firstExp.title,
            company: firstExp.company,
            hasDescription: !!firstExp.description,
            descriptionLength: firstExp.description?.length || 0,
            hasResponsibilities: !!firstExp.responsibilities && firstExp.responsibilities.length > 0,
            hasAchievements: !!firstExp.achievements && firstExp.achievements.length > 0
          });
        }
      } catch (e) {
        console.log('❌ [ANALYSIS] Failed to parse response');
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
      const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
      console.log('📤 Uploading CV:', { fileSize: fs.statSync(cvPath).size });
      
      await fileInput.setInputFiles(cvPath);
      await page.waitForTimeout(1000);
      
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      await expect(uploadButton).toBeVisible();
      await uploadButton.click();
      console.log('🚀 Upload initiated');
      
      // Wait for upload and analysis to complete
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ Upload form not available, checking existing data');
    }
    
    // STEP 4: Verify UI display of experience data
    console.log('🖥️ STEP 4: Verify UI display of experience data');
    
    // Wait for CV analysis to be displayed
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    await expect(profileSection).toBeVisible({ timeout: 30000 });
    console.log('✅ CV analysis section visible');
    
    // Check for experience section
    const experienceSection = page.locator('[data-testid*="experience"]').first();
    if (await experienceSection.isVisible()) {
      console.log('✅ Experience section found in UI');
      
      // Get experience entries from UI
      const experienceItems = page.locator('[data-testid*="experience-item"], .experience-item, [data-testid*="experience"] .job, [data-testid*="experience"] .position');
      const itemCount = await experienceItems.count();
      console.log(`📋 UI shows ${itemCount} experience items`);
      
      // Check first experience item details
      if (itemCount > 0) {
        const firstItem = experienceItems.first();
        const itemText = await firstItem.textContent();
        console.log('💼 [UI] First experience item text length:', itemText?.length || 0);
        console.log('💼 [UI] First experience preview:', itemText?.substring(0, 200) || 'No text');
        
        // Look for bullet points or detailed descriptions
        const hasBullets = itemText?.includes('•') || itemText?.includes('-') || itemText?.includes('*');
        const hasDetailedText = (itemText?.length || 0) > 100;
        
        console.log('🔍 [UI] Experience detail analysis:', {
          hasBullets,
          hasDetailedText,
          textLength: itemText?.length || 0
        });
      }
    } else {
      console.log('❌ Experience section not found in UI');
    }
    
    // STEP 5: Compare data flow
    console.log('🔄 STEP 5: Data flow comparison');
    
    if (analysisResponse && analysisResponse.experience) {
      console.log('📊 [COMPARISON] Server vs UI data:');
      console.log(`  Server experience count: ${analysisResponse.experience.length}`);
      
      if (analysisResponse.experience.length > 0) {
        const serverExp = analysisResponse.experience[0];
        console.log('  Server first experience:', {
          title: serverExp.title,
          company: serverExp.company,
          descriptionLength: serverExp.description?.length || 0,
          hasDetailedDescription: (serverExp.description?.length || 0) > 100
        });
      }
      
      const uiExperienceItems = await page.locator('[data-testid*="experience-item"], .experience-item').count();
      console.log(`  UI experience count: ${uiExperienceItems}`);
      
      if (analysisResponse.experience.length > 0 && uiExperienceItems === 0) {
        console.log('❌ ISSUE IDENTIFIED: Server has experience data but UI shows none');
      } else if (analysisResponse.experience.length !== uiExperienceItems) {
        console.log('⚠️ ISSUE IDENTIFIED: Experience count mismatch between server and UI');
      }
    }
    
    console.log('✅ Complete CV Flow Analysis finished');
  });
});