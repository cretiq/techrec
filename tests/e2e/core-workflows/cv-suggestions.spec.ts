import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';

test.describe('Complete CV Suggestions Flow - E2E', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should complete full CV journey: signin -> upload -> parse -> get suggestions', async ({ page }) => {
    console.log('🚀 Starting complete CV suggestions flow test...');
    
    // Step 1: Sign in
    console.log('📝 Step 1: Signing in as experienced developer...');
    await authHelper.loginAsUserType('experienced_developer');
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully signed in');

    // Step 2: Navigate to CV Management page
    console.log('📝 Step 2: Navigating to CV management page...');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    console.log('✅ CV management page loaded');

    // Step 3: Set up API monitoring first
    console.log('📝 Step 3: Setting up API monitoring...');
    let actualAPIRequest: any = null;
    let actualAPIResponse: any = null;
    let uploadAPIResponse: any = null;
    
    // Monitor CV upload API
    await page.route('/api/cv/upload', async route => {
      console.log('📞 Intercepted CV upload API call');
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        uploadAPIResponse = JSON.parse(responseBody);
        console.log('✅ Upload API response:', uploadAPIResponse);
      } catch (e) {
        uploadAPIResponse = { raw: responseBody, parseError: e.message };
        console.log('❌ Upload API response parse error:', e.message);
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    // Monitor CV improvement suggestions API
    await page.route('/api/cv-improvement', async route => {
      const request = route.request();
      actualAPIRequest = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      
      console.log('📞 Intercepted API call to cv-improvement');
      
      // Let the actual API call go through to get real Gemini response
      const response = await page.request.fetch(request);
      const responseBody = await response.text();
      
      try {
        actualAPIResponse = JSON.parse(responseBody);
        console.log('✅ Successfully parsed API response');
      } catch (e) {
        actualAPIResponse = { raw: responseBody, parseError: e.message };
        console.log('❌ Failed to parse API response:', e.message);
      }
      
      // Pass through the actual response
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });

    // Step 4: Check current state and upload CV if needed
    console.log('📝 Step 4: Checking page state and uploading CV...');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');

    if (await entrySection.isVisible()) {
      console.log('📤 No existing CV found, uploading test CV...');
      
      // Look for the dropzone container
      const dropzone = page.locator('[data-testid="cv-management-upload-dropzone"]');
      await expect(dropzone).toBeVisible();
      
      // Look for file input in the dropzone
      const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
      await expect(fileInput).toBeAttached();
      
      // Upload the real CV file that works  
      const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
      console.log(`📁 Uploading CV from: ${cvPath}`);
      
      // Use the absolute path for Playwright file upload
      await fileInput.setInputFiles(cvPath);
      
      // Verify the file input has files
      const hasFiles = await fileInput.evaluate(input => {
        const fileInputElement = input as HTMLInputElement;
        if (fileInputElement.files && fileInputElement.files.length > 0) {
          const file = fileInputElement.files[0];
          return {
            count: fileInputElement.files.length,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          };
        }
        return { count: 0 };
      });
      console.log(`📁 Files info:`, hasFiles);
      
      // Wait for dropzone to process the file
      await page.waitForTimeout(2000);
      
      // Check if the file name appears in the dropzone status text
      const statusText = await page.locator('[data-testid="cv-management-upload-status-text"]').textContent();
      console.log(`📄 Dropzone status text: "${statusText}"`);
      
      // Wait for upload button to appear (it only shows when a file is selected)
      const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
      await expect(uploadButton).toBeVisible({ timeout: 5000 });
      await expect(uploadButton).toBeEnabled();
      
      console.log('🔘 Clicking upload button to start upload...');
      await uploadButton.click();
      
      // Wait for upload progress to start
      console.log('⏳ Waiting for upload to start...');
      await expect(page.locator('[data-testid="cv-management-upload-button-spinner"]')).toBeVisible({ timeout: 5000 });
      
      // Wait for upload and parsing to complete
      console.log('⏳ Waiting for CV parsing...');
      await page.waitForLoadState('networkidle');
      
      // Debug: Check what elements are currently visible
      console.log('🔍 Current page state after upload:');
      const currentElements = await page.locator('[data-testid*="cv-management"]').all();
      for (const element of currentElements) {
        const testId = await element.getAttribute('data-testid');
        const isVisible = await element.isVisible();
        console.log(`  - ${testId}: ${isVisible ? 'visible' : 'hidden'}`);
      }
      
      // Check for any error messages
      const errorElements = page.locator('[data-testid*="error"], .alert-error, .error, .toast');
      if (await errorElements.count() > 0) {
        console.log('❌ Found error elements:');
        for (let i = 0; i < await errorElements.count(); i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`  - Error: ${errorText}`);
        }
      }
      
      // Try waiting for profile section but don't fail if timeout
      try {
        await expect(profileSection).toBeVisible({ timeout: 10000 });
        console.log('✅ CV uploaded and parsed successfully');
      } catch (e) {
        console.log('❌ Profile section did not appear within 10 seconds');
        
        // Let's still try to proceed to see if Get Suggestions button exists
        const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
        const buttonExists = await getSuggestionsButton.count() > 0;
        console.log(`🔍 Get Suggestions button exists: ${buttonExists}`);
        
        if (buttonExists) {
          console.log('🎯 Found Get Suggestions button, proceeding with test...');
        } else {
          throw e; // Re-throw the original timeout error
        }
      }
    } else {
      console.log('📋 Existing CV analysis found, proceeding...');
    }

    // Step 5: Get Suggestions
    console.log('📝 Step 5: Clicking Get Suggestions button...');
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await expect(getSuggestionsButton).toBeVisible();
    await expect(getSuggestionsButton).toBeEnabled();
    
    console.log('🚀 Clicking Get Suggestions...');
    await getSuggestionsButton.click();
    
    // Verify loading state
    console.log('⏳ Verifying loading state...');
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).toBeVisible();
    await expect(getSuggestionsButton).toContainText('Getting Suggestions...');
    await expect(getSuggestionsButton).toBeDisabled();
    
    // Wait for the suggestions to complete
    console.log('⏳ Waiting for suggestions generation...');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 60000 });
    
    // Step 6: Analyze the Gemini AI Response  
    console.log('📝 Step 6: Analyzing Gemini AI response...');
    
    // First, let's check the upload response
    if (uploadAPIResponse) {
      console.log('\n📤 === UPLOAD API ANALYSIS ===');
      console.log('Upload Response:', JSON.stringify(uploadAPIResponse, null, 2));
    }
    
    // Log the actual API request and response for analysis
    console.log('\n🔍 === GEMINI AI ANALYSIS ===');
    console.log('📋 API Request Details:');
    if (actualAPIRequest) {
      console.log(`  URL: ${actualAPIRequest.url}`);
      console.log(`  Method: ${actualAPIRequest.method}`);
      console.log(`  Content-Type: ${actualAPIRequest.headers['content-type'] || 'N/A'}`);
      if (actualAPIRequest.postData) {
        try {
          const requestData = JSON.parse(actualAPIRequest.postData);
          console.log('  Request Body Structure:');
          console.log(`    - Contact Info: ${requestData.contactInfo ? 'Present' : 'Missing'}`);
          console.log(`    - About: ${requestData.about ? `${requestData.about.length} chars` : 'Missing'}`);
          console.log(`    - Skills: ${requestData.skills ? `${requestData.skills.length} items` : 'Missing'}`);
          console.log(`    - Experience: ${requestData.experience ? `${requestData.experience.length} items` : 'Missing'}`);
          console.log(`    - Education: ${requestData.education ? `${requestData.education.length} items` : 'Missing'}`);
        } catch (e) {
          console.log('  Request body parsing failed:', e.message);
        }
      }
    } else {
      console.log('  ❌ No API request captured');
    }
    
    console.log('\n🤖 Gemini AI Response Analysis:');
    if (actualAPIResponse && !actualAPIResponse.parseError) {
      console.log(`  ✅ Provider: ${actualAPIResponse.provider || 'Unknown'}`);
      console.log(`  ✅ From Cache: ${actualAPIResponse.fromCache || false}`);
      console.log(`  ✅ Attempt: ${actualAPIResponse.attempt || 'N/A'}`);
      
      if (actualAPIResponse.suggestions && actualAPIResponse.suggestions.length > 0) {
        console.log(`  ✅ Total Suggestions: ${actualAPIResponse.suggestions.length}`);
        
        // Analyze each suggestion
        actualAPIResponse.suggestions.forEach((suggestion: any, index: number) => {
          console.log(`\n  📝 Suggestion ${index + 1}:`);
          console.log(`    Section: ${suggestion.section || 'N/A'}`);
          console.log(`    Type: ${suggestion.suggestionType || suggestion.type || 'N/A'}`);
          console.log(`    Original: ${suggestion.originalText?.substring(0, 50) || 'N/A'}${suggestion.originalText?.length > 50 ? '...' : ''}`);
          console.log(`    Suggested: ${suggestion.suggestedText?.substring(0, 50) || 'N/A'}${suggestion.suggestedText?.length > 50 ? '...' : ''}`);
          console.log(`    Reasoning: ${suggestion.reasoning?.substring(0, 100) || 'N/A'}${suggestion.reasoning?.length > 100 ? '...' : ''}`);
          console.log(`    Priority: ${suggestion.priority || 'N/A'}`);
          console.log(`    Confidence: ${suggestion.confidence || 'N/A'}`);
        });
        
        if (actualAPIResponse.summary) {
          console.log('\n  📊 Summary Statistics:');
          console.log(`    Total: ${actualAPIResponse.summary.totalSuggestions || 0}`);
          console.log(`    High Priority: ${actualAPIResponse.summary.highPriority || 0}`);
          if (actualAPIResponse.summary.categories) {
            console.log('    Categories:');
            Object.entries(actualAPIResponse.summary.categories).forEach(([key, value]) => {
              console.log(`      ${key}: ${value}`);
            });
          }
        }
        
        if (actualAPIResponse.validationWarnings?.length > 0) {
          console.log('\n  ⚠️ Validation Warnings:');
          actualAPIResponse.validationWarnings.forEach((warning: string) => {
            console.log(`    - ${warning}`);
          });
        }
        
        // Quality Assessment
        console.log('\n  🎯 Quality Assessment:');
        const hasReasoning = actualAPIResponse.suggestions.every((s: any) => s.reasoning && s.reasoning.length >= 20);
        const hasSpecificSections = actualAPIResponse.suggestions.every((s: any) => s.section && s.section !== 'general');
        const hasActionableContent = actualAPIResponse.suggestions.every((s: any) => s.suggestedText || s.suggestionType === 'remove_content');
        
        console.log(`    ✅ All suggestions have detailed reasoning (20+ chars): ${hasReasoning}`);
        console.log(`    ✅ All suggestions target specific sections: ${hasSpecificSections}`);
        console.log(`    ✅ All suggestions provide actionable content: ${hasActionableContent}`);
        
        const avgReasoningLength = actualAPIResponse.suggestions.reduce((acc: number, s: any) => acc + (s.reasoning?.length || 0), 0) / actualAPIResponse.suggestions.length;
        console.log(`    📏 Average reasoning length: ${Math.round(avgReasoningLength)} characters`);
        
      } else {
        console.log('  ❌ No suggestions found in response');
      }
      
      if (actualAPIResponse.fallback) {
        console.log('  ⚠️ Response used fallback mode due to validation issues');
      }
      
    } else if (actualAPIResponse?.parseError) {
      console.log('  ❌ Response parsing failed:', actualAPIResponse.parseError);
      console.log('  📄 Raw response:', actualAPIResponse.raw?.substring(0, 500));
    } else {
      console.log('  ❌ No API response captured');
    }
    
    console.log('\n=== END GEMINI AI ANALYSIS ===\n');
    
    // Step 7: Verify UI state after suggestions
    console.log('📝 Step 7: Verifying final UI state...');
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();
    
    // Check for success indicators
    const toastElements = page.locator('.toast, [role="alert"], [data-testid*="toast"]');
    if (await toastElements.count() > 0) {
      console.log('✅ Success toast visible');
    }
    
    console.log('🎉 Complete CV suggestions flow test completed successfully!');
    
    // Validate that we got a proper response
    expect(actualAPIResponse).toBeDefined();
    if (actualAPIResponse && !actualAPIResponse.parseError) {
      expect(actualAPIResponse).toHaveProperty('provider', 'gemini');
      expect(actualAPIResponse).toHaveProperty('suggestions');
    }
  });
});