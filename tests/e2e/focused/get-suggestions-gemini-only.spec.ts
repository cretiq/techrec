import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('CV Get Suggestions - Gemini AI Response Only', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Login as experienced developer who should have CV data
    await authHelper.loginAsUserType('experienced_developer');
    await page.waitForLoadState('networkidle');
  });

  test('should test Gemini AI Get Suggestions response quality', async ({ page }) => {
    // Mock the Gemini API response to capture what we actually get
    let actualAPIRequest: any = null;
    let actualAPIResponse: any = null;
    
    await page.route('/api/cv-improvement', async route => {
      const request = route.request();
      actualAPIRequest = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      
      // Let the actual API call go through to get real Gemini response
      const response = await page.request.fetch(request);
      const responseBody = await response.text();
      
      try {
        actualAPIResponse = JSON.parse(responseBody);
      } catch (e) {
        actualAPIResponse = { raw: responseBody, parseError: e.message };
      }
      
      // Pass through the actual response
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    // Navigate to CV management page
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    
    // Check what state we're in and log it
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    const profileVisible = await profileSection.isVisible();
    const entryVisible = await entrySection.isVisible();
    
    console.log(`🔍 Page state check:`);
    console.log(`  - Profile section visible: ${profileVisible}`);
    console.log(`  - Entry section visible: ${entryVisible}`);
    console.log(`  - Current URL: ${page.url()}`);
    
    if (entryVisible) {
      console.log('⚠️ No existing CV analysis found. User needs to upload and analyze a CV first.');
      console.log('📝 Trying to help with CV upload...');
      
      // Let's try to upload a CV first if there's an upload button
      const uploadButton = page.locator('[data-testid*="upload"], [data-testid*="cv-upload"], input[type="file"]');
      if (await uploadButton.count() > 0) {
        console.log('📤 Found upload option, but need actual file...');
      }
      
      test.skip(true, 'No existing CV analysis found - need existing CV to test suggestions');  
      return;
    }
    
    await expect(profileSection).toBeVisible();
    
    // Click the Get Suggestions button
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await expect(getSuggestionsButton).toBeVisible();
    await expect(getSuggestionsButton).toBeEnabled();
    
    console.log('🚀 Clicking Get Suggestions button...');
    await getSuggestionsButton.click();
    
    // Verify loading state
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).toBeVisible();
    await expect(getSuggestionsButton).toContainText('Getting Suggestions...');
    
    // Wait for the API call to complete
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 30000 });
    
    // Log the actual API request and response for analysis
    console.log('📋 API Request Details:', JSON.stringify(actualAPIRequest, null, 2));
    console.log('🤖 Gemini AI Response:', JSON.stringify(actualAPIResponse, null, 2));
    
    // Basic validation that we got a proper response
    expect(actualAPIResponse).toBeDefined();
    
    if (actualAPIResponse && !actualAPIResponse.parseError) {
      // Validate response structure
      expect(actualAPIResponse).toHaveProperty('suggestions');
      expect(actualAPIResponse).toHaveProperty('provider');
      expect(actualAPIResponse.provider).toBe('gemini');
      
      if (actualAPIResponse.suggestions && actualAPIResponse.suggestions.length > 0) {
        const firstSuggestion = actualAPIResponse.suggestions[0];
        
        // Validate suggestion structure
        expect(firstSuggestion).toHaveProperty('id');
        expect(firstSuggestion).toHaveProperty('type');
        expect(firstSuggestion).toHaveProperty('title');
        expect(firstSuggestion).toHaveProperty('reasoning');
        expect(firstSuggestion).toHaveProperty('suggestedContent');
        expect(firstSuggestion).toHaveProperty('priority');
        expect(firstSuggestion).toHaveProperty('confidence');
        
        console.log('✅ Suggestion validation passed');
        console.log('📝 First suggestion details:');
        console.log(`   Title: ${firstSuggestion.title}`);
        console.log(`   Type: ${firstSuggestion.type}`);
        console.log(`   Priority: ${firstSuggestion.priority}`);
        console.log(`   Confidence: ${firstSuggestion.confidence}`);
        console.log(`   Reasoning: ${firstSuggestion.reasoning?.substring(0, 100)}...`);
      }
      
      if (actualAPIResponse.summary) {
        console.log('📊 Summary stats:');
        console.log(`   Total suggestions: ${actualAPIResponse.summary.totalSuggestions}`);
        console.log(`   High priority: ${actualAPIResponse.summary.highPriority}`);
        console.log(`   Categories:`, actualAPIResponse.summary.categories);
      }
    }
    
    // Verify button returns to normal state
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();
  });
});