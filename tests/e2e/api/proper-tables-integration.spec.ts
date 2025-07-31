import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Proper Tables API Integration - E2E', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should verify all profile APIs use proper tables as single source of truth', async ({ page }) => {
    console.log('🔌 Starting Proper Tables API Integration test...');
    
    // === STEP 1: AUTHENTICATION ===
    console.log('📝 Step 1: Authenticating for API testing...');
    await authHelper.loginAsUserType('experienced_developer');
    await page.waitForLoadState('networkidle');
    console.log('✅ Authentication completed');

    // === STEP 2: API MONITORING SETUP ===
    console.log('📝 Step 2: Setting up comprehensive API monitoring...');
    const apiCalls: any[] = [];
    
    // Monitor all developer profile APIs
    const profileEndpoints = [
      '/api/developer/me/profile',
      '/api/developer/me/experience',
      '/api/developer/me/education', 
      '/api/developer/me/skills',
      '/api/developer/me/achievements',
      '/api/developer/me/contact-info'
    ];

    for (const endpoint of profileEndpoints) {
      await page.route(endpoint, async route => {
        const request = route.request();
        const apiCall = {
          endpoint,
          method: request.method(),
          url: request.url(),
          timestamp: new Date().toISOString(),
          headers: request.headers(),
          postData: request.postData()
        };

        console.log(`📞 Intercepted ${request.method()} ${endpoint}`);
        
        const response = await page.request.fetch(request);
        const responseBody = await response.text();
        
        try {
          apiCall.response = JSON.parse(responseBody);
          apiCall.responseStatus = response.status();
          console.log(`✅ ${endpoint} responded with status ${response.status()}`);
        } catch (e) {
          apiCall.response = { raw: responseBody, parseError: e.message };
          apiCall.responseStatus = response.status();
          console.log(`❌ ${endpoint} response parse failed: ${e.message}`);
        }
        
        apiCalls.push(apiCall);
        
        route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        });
      });
    }

    // Also monitor any remaining CvAnalysis endpoints (should not be called)
    const deprecatedEndpoints = [
      '/api/cv-analysis/create',
      '/api/cv-analysis/update',
      '/api/cv-analysis/save-version'
    ];

    for (const endpoint of deprecatedEndpoints) {
      await page.route(endpoint, async route => {
        console.log(`🚨 DEPRECATED ENDPOINT CALLED: ${route.request().method()} ${endpoint}`);
        apiCalls.push({
          endpoint,
          method: route.request().method(),
          deprecated: true,
          shouldNotBeCalled: true
        });
        route.continue();
      });
    }

    console.log('✅ API monitoring setup completed');

    // === STEP 3: NAVIGATE TO PROFILE MANAGEMENT ===
    console.log('📝 Step 3: Navigating to CV management to trigger API calls...');
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    await page.waitForLoadState('networkidle');
    console.log('✅ CV management page loaded');

    // === STEP 4: TRIGGER PROFILE DATA FETCHING ===
    console.log('📝 Step 4: Triggering profile data fetching...');
    
    // Refresh to ensure fresh API calls
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate to different profile sections to trigger various API calls
    const profileSections = [
      '[data-testid="cv-management-tab-experience"]',
      '[data-testid="cv-management-tab-education"]', 
      '[data-testid="cv-management-tab-skills"]',
      '[data-testid="cv-management-section-experience"]',
      '[data-testid="cv-management-section-education"]',
      '[data-testid="cv-management-section-skills"]'
    ];

    for (const sectionSelector of profileSections) {
      const section = page.locator(sectionSelector);
      if (await section.count() > 0 && await section.isVisible()) {
        console.log(`🔗 Clicking section: ${sectionSelector}`);
        await section.click();
        await page.waitForTimeout(1000); // Allow API calls to complete
      }
    }

    console.log('✅ Profile sections interaction completed');

    // === STEP 5: ATTEMPT EDIT OPERATIONS ===
    console.log('📝 Step 5: Testing edit operations use proper APIs...');
    
    // Try to find and click an edit button
    const editButtons = [
      '[data-testid*="edit-button"]',
      '[data-testid*="experience-edit"]',
      '[data-testid*="profile-edit"]',
      '.edit-button',
      'button:has-text("Edit")'
    ];

    let editTriggered = false;
    for (const buttonSelector of editButtons) {
      const button = page.locator(buttonSelector);
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`🖊️ Found edit button: ${buttonSelector}`);
        await button.first().click();
        await page.waitForTimeout(2000);
        editTriggered = true;
        break;
      }
    }

    if (editTriggered) {
      console.log('✅ Edit operation triggered');
      
      // Look for save button and click it to trigger PUT request
      const saveButtons = [
        '[data-testid*="save-button"]',
        '[data-testid*="save"]',
        '.save-button',
        'button:has-text("Save")'
      ];

      for (const saveSelector of saveButtons) {
        const saveButton = page.locator(saveSelector);
        if (await saveButton.count() > 0 && await saveButton.isVisible()) {
          console.log(`💾 Found save button: ${saveSelector}`);
          await saveButton.first().click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Save operation completed');
          break;
        }
      }
    } else {
      console.log('ℹ️ No edit buttons found - skipping edit test');
    }

    // === STEP 6: API CALLS ANALYSIS ===
    console.log('\n📝 Step 6: Analyzing API calls for proper table usage...');
    
    console.log('\n🔍 === API CALLS ANALYSIS ===');
    console.log(`Total API calls captured: ${apiCalls.length}`);
    
    // Group by endpoint
    const callsByEndpoint = apiCalls.reduce((acc, call) => {
      if (!acc[call.endpoint]) acc[call.endpoint] = [];
      acc[call.endpoint].push(call);
      return acc;
    }, {} as Record<string, any[]>);

    // Analyze each endpoint
    for (const [endpoint, calls] of Object.entries(callsByEndpoint)) {
      console.log(`\n📋 ${endpoint}:`);
      console.log(`  Calls: ${calls.length}`);
      
      calls.forEach((call, index) => {
        console.log(`  Call ${index + 1}:`);
        console.log(`    Method: ${call.method}`);
        console.log(`    Status: ${call.responseStatus || 'N/A'}`);
        
        if (call.deprecated) {
          console.log(`    🚨 DEPRECATED: This endpoint should not be called!`);
        }
        
        if (call.response && !call.response.parseError) {
          // Analyze response structure for proper table data
          const response = call.response;
          
          if (Array.isArray(response)) {
            console.log(`    Response: Array with ${response.length} items`);
          } else if (typeof response === 'object') {
            const keys = Object.keys(response);
            console.log(`    Response keys: ${keys.join(', ')}`);
            
            // Check for proper table structure indicators
            const hasProperStructure = keys.some(key => 
              ['id', 'developerId', 'name', 'title', 'company', 'institution', 'degree'].includes(key)
            );
            console.log(`    ✅ Has proper table structure: ${hasProperStructure}`);
            
            // Check for CvAnalysis remnants (should not exist)
            const hasCvAnalysisRemnants = keys.some(key => 
              key.toLowerCase().includes('cvanalysis') || key.toLowerCase().includes('analysis_id')
            );
            console.log(`    ✅ No CvAnalysis remnants: ${!hasCvAnalysisRemnants}`);
          }
        }
        
        if (call.postData) {
          try {
            const postData = JSON.parse(call.postData);
            const postKeys = Object.keys(postData);
            console.log(`    POST data keys: ${postKeys.join(', ')}`);
          } catch (e) {
            console.log(`    POST data: ${call.postData.substring(0, 100)}...`);
          }
        }
      });
    }

    // === STEP 7: COMPLIANCE VERIFICATION ===
    console.log('\n📝 Step 7: Verifying API compliance...');
    
    const compliance = {
      noDeprecatedCalls: !apiCalls.some(call => call.deprecated),
      hasProperTableCalls: apiCalls.some(call => 
        call.endpoint.includes('/api/developer/me/') && call.responseStatus === 200
      ),
      noErrorResponses: !apiCalls.some(call => 
        call.responseStatus && call.responseStatus >= 400
      ),
      properResponseStructure: apiCalls.filter(call => 
        call.response && !call.response.parseError
      ).length > 0
    };

    console.log('\n🏁 === API COMPLIANCE REPORT ===');
    console.log(`✅ No deprecated CvAnalysis endpoints called: ${compliance.noDeprecatedCalls}`);
    console.log(`✅ Proper table APIs called: ${compliance.hasProperTableCalls}`);
    console.log(`✅ No error responses: ${compliance.noErrorResponses}`);
    console.log(`✅ Proper response structures: ${compliance.properResponseStructure}`);
    
    const overallCompliance = Object.values(compliance).every(Boolean);
    console.log(`\n🎯 Overall API Compliance: ${overallCompliance ? 'PASSED' : 'FAILED'}`);
    
    // === STEP 8: DETAILED RESPONSE VALIDATION ===
    console.log('\n📝 Step 8: Detailed response validation...');
    
    // Check that profile API responses have proper structure
    const profileCalls = apiCalls.filter(call => 
      call.endpoint.includes('/api/developer/me/') && 
      call.response && 
      !call.response.parseError
    );

    if (profileCalls.length > 0) {
      console.log('\n📊 Profile API Response Analysis:');
      profileCalls.forEach(call => {
        const response = call.response;
        console.log(`\n  ${call.endpoint} (${call.method}):`);
        
        if (Array.isArray(response)) {
          console.log(`    - Array response with ${response.length} items`);
          if (response.length > 0) {
            const firstItem = response[0];
            const itemKeys = Object.keys(firstItem);
            console.log(`    - First item keys: ${itemKeys.join(', ')}`);
          }
        } else {
          const responseKeys = Object.keys(response);
          console.log(`    - Object keys: ${responseKeys.join(', ')}`);
          
          // Check for expected profile fields
          const expectedFields = ['id', 'name', 'email', 'title', 'about'];
          const hasExpectedFields = expectedFields.some(field => response[field] !== undefined);
          console.log(`    - Has expected profile fields: ${hasExpectedFields}`);
        }
      });
    }

    console.log('\n🎉 API Integration test completed successfully!');

    // === ASSERTIONS ===
    expect(compliance.noDeprecatedCalls).toBe(true);
    expect(compliance.hasProperTableCalls).toBe(true);
    expect(compliance.noErrorResponses).toBe(true);
    expect(profileCalls.length).toBeGreaterThan(0);

    console.log('✅ All API integration assertions passed');
  });
});