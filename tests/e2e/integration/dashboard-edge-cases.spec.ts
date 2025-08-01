import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Dashboard Edge Cases - cvAnalyses Removal Verification', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should handle dashboard with completely empty profile data', async ({ page }) => {
    console.log('🕳️ Testing dashboard with empty profile data...');
    
    // === STEP 1: AUTHENTICATION ===
    console.log('📝 Step 1: Authenticating as new user (minimal data)...');
    await authHelper.ensureLoggedIn('new_user');
    console.log('✅ Authentication completed');

    // === STEP 2: API MONITORING ===
    console.log('📝 Step 2: Setting up API monitoring for empty profile scenario...');
    let dashboardAPIResponse: any = null;
    let apiError: string | null = null;

    await page.route('/api/gamification/dashboard', async route => {
      console.log('📞 Intercepted dashboard API call for empty profile test');
      
      try {
        const response = await page.request.fetch(route.request());
        const responseBody = await response.text();
        
        if (response.status() >= 400) {
          apiError = `HTTP ${response.status()}: ${responseBody}`;
          console.error('❌ API Error:', apiError);
        } else {
          dashboardAPIResponse = JSON.parse(responseBody);
          console.log('✅ API response captured for empty profile');
        }
        
        route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        });
      } catch (error) {
        apiError = `Network error: ${error.message}`;
        console.error('❌ Network error:', error);
        route.abort();
      }
    });

    // === STEP 3: NAVIGATE TO DASHBOARD ===
    console.log('📝 Step 3: Loading dashboard with minimal profile data...');
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // === STEP 4: VERIFY NO ERRORS WITH EMPTY DATA ===
    console.log('📝 Step 4: Verifying dashboard handles empty profile gracefully...');
    
    expect(apiError).toBeNull();
    expect(dashboardAPIResponse).toBeTruthy();
    
    if (apiError) {
      expect(apiError).not.toContain('cvAnalyses');
      expect(apiError).not.toContain('PrismaClientValidationError');
      expect(apiError).not.toContain('Unknown field');
    }

    // === STEP 5: VERIFY EMPTY DATA HANDLING ===
    console.log('📝 Step 5: Analyzing empty profile data handling...');
    
    if (dashboardAPIResponse) {
      console.log('\n🕳️ === EMPTY PROFILE DATA ANALYSIS ===');
      
      // Profile completeness should handle missing data
      const profileCompleteness = dashboardAPIResponse.profileCompleteness;
      if (profileCompleteness) {
        console.log(`  📊 Profile score with empty data: ${profileCompleteness.score}%`);
        console.log(`  📋 Sections analyzed: ${profileCompleteness.sections?.length || 0}`);
        
        expect(profileCompleteness.score).toBeGreaterThanOrEqual(0);
        expect(profileCompleteness.score).toBeLessThanOrEqual(100);
        
        // With empty data, score should be low
        expect(profileCompleteness.score).toBeLessThan(50);
      }
      
      // Roadmap should handle no CV uploads
      const roadmapProgress = dashboardAPIResponse.roadmapProgress;
      if (roadmapProgress) {
        console.log(`  🗺️ Roadmap progress with no data: ${roadmapProgress.progress}%`);
        console.log(`  ✅ Completed milestones: ${roadmapProgress.completedCount}`);
        
        expect(roadmapProgress.progress).toBeGreaterThanOrEqual(0);
        // Should be 0 or low for new user
        expect(roadmapProgress.progress).toBeLessThan(50);
      }
      
      // Activity stats should handle no activity
      const activityStats = dashboardAPIResponse.activityStats;
      if (activityStats) {
        console.log(`  📈 CVs analyzed: ${activityStats.cvsAnalyzed || 0}`);
        expect(activityStats.cvsAnalyzed).toBe(0); // New user should have 0
      }
    }
    
    console.log('✅ Empty profile data handling verified');

    // === STEP 6: UI VERIFICATION ===
    console.log('📝 Step 6: Verifying UI displays gracefully with empty data...');
    
    const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
    console.log(`  🖥️ Dashboard visible: ${dashboardVisible ? '✅' : '❌'}`);
    expect(dashboardVisible).toBe(true);
    
    // Should not show error messages
    const errorChecks = [
      'text=Error',
      'text=cvAnalyses',
      'text=PrismaClientValidationError',
      'text=Something went wrong'
    ];
    
    for (const errorCheck of errorChecks) {
      const hasError = await page.locator(errorCheck).isVisible().catch(() => false);
      console.log(`  🚫 Error "${errorCheck}": ${hasError ? '❌ Found' : '✅ None'}`);
      expect(hasError).toBe(false);
    }
    
    console.log('✅ Empty profile UI test passed');
  });

  test('should handle dashboard when user has partial profile data', async ({ page }) => {
    console.log('📋 Testing dashboard with partial profile data...');
    
    await authHelper.ensureLoggedIn('junior_developer');
    
    let dashboardAPIResponse: any = null;
    
    await page.route('/api/gamification/dashboard', async route => {
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      if (response.status() === 200) {
        dashboardAPIResponse = JSON.parse(responseBody);
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });
    
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📝 Analyzing partial profile data handling...');
    
    if (dashboardAPIResponse) {
      console.log('\n📋 === PARTIAL PROFILE DATA ANALYSIS ===');
      
      const profileCompleteness = dashboardAPIResponse.profileCompleteness;
      if (profileCompleteness) {
        console.log(`  📊 Partial profile score: ${profileCompleteness.score}%`);
        
        // With partial data, should be between 0-100
        expect(profileCompleteness.score).toBeGreaterThanOrEqual(0);
        expect(profileCompleteness.score).toBeLessThanOrEqual(100);
        
        // Check individual sections
        if (profileCompleteness.sections) {
          profileCompleteness.sections.forEach(section => {
            console.log(`    📝 ${section.name}: ${section.score}%`);
            expect(section.score).toBeGreaterThanOrEqual(0);
            expect(section.score).toBeLessThanOrEqual(100);
          });
        }
      }
    }
    
    console.log('✅ Partial profile data test passed');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    console.log('🌐 Testing dashboard with network errors...');
    
    await authHelper.ensureLoggedIn('experienced_developer');
    
    // === SIMULATE NETWORK ERROR ===
    console.log('📝 Simulating dashboard API network error...');
    
    await page.route('/api/gamification/dashboard', route => {
      console.log('📞 Intercepting dashboard API to simulate network error');
      route.abort('failed');
    });
    
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // === VERIFY ERROR HANDLING ===
    console.log('📝 Verifying error handling...');
    
    // Dashboard should still be visible (showing loading or error state)
    const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
    console.log(`  🖥️ Dashboard container visible: ${dashboardVisible ? '✅' : '❌'}`);
    expect(dashboardVisible).toBe(true);
    
    // Should not show cvAnalyses errors specifically
    const hasCvAnalysesError = await page.locator('text=cvAnalyses, text=PrismaClientValidationError').isVisible().catch(() => false);
    console.log(`  🚫 No cvAnalyses errors: ${!hasCvAnalysesError ? '✅' : '❌'}`);
    expect(hasCvAnalysesError).toBe(false);
    
    console.log('✅ Network error handling test passed');
  });

  test('should handle API timeout scenarios', async ({ page }) => {
    console.log('⏱️ Testing dashboard with API timeout...');
    
    await authHelper.ensureLoggedIn('experienced_developer');
    
    // === SIMULATE SLOW API ===
    console.log('📝 Simulating slow dashboard API response...');
    
    await page.route('/api/gamification/dashboard', async route => {
      console.log('📞 Intercepting dashboard API to simulate timeout');
      
      // Add long delay to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await page.request.fetch(route.request());
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: await response.text()
      });
    });
    
    const startTime = Date.now();
    await page.goto('/developer/dashboard');
    
    // Don't wait for networkidle since API is slow
    await page.waitForLoadState('load');
    
    // === VERIFY LOADING STATES ===
    console.log('📝 Checking loading states during slow API...');
    
    // Dashboard should show loading states
    const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
    console.log(`  🖥️ Dashboard visible during load: ${dashboardVisible ? '✅' : '❌'}`);
    expect(dashboardVisible).toBe(true);
    
    // Look for loading indicators
    const loadingIndicators = [
      '[data-testid*="loading"]',
      '[data-testid*="spinner"]',
      '[data-testid*="skeleton"]',
      'text=Loading',
      'text=loading'
    ];
    
    let foundLoadingState = false;
    for (const indicator of loadingIndicators) {
      const isVisible = await page.locator(indicator).isVisible().catch(() => false);
      if (isVisible) {
        console.log(`    ✅ Found loading indicator: "${indicator}"`);
        foundLoadingState = true;
        break;
      }
    }
    
    console.log(`  ⏳ Loading states shown: ${foundLoadingState ? '✅' : '⚠️ None found'}`);
    
    // Wait for API to eventually respond
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const endTime = Date.now();
    
    console.log(`  ⏱️ Total load time: ${endTime - startTime}ms`);
    console.log('✅ API timeout handling test passed');
  });

  test('should handle malformed API responses', async ({ page }) => {
    console.log('🔧 Testing dashboard with malformed API responses...');
    
    await authHelper.ensureLoggedIn('experienced_developer');
    
    // === SIMULATE MALFORMED RESPONSE ===
    console.log('📝 Simulating malformed dashboard API response...');
    
    await page.route('/api/gamification/dashboard', route => {
      console.log('📞 Intercepting dashboard API to return malformed response');
      
      route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: '{ "malformed": json response without proper structure'
      });
    });
    
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // === VERIFY GRACEFUL HANDLING ===
    console.log('📝 Verifying graceful handling of malformed response...');
    
    const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
    console.log(`  🖥️ Dashboard visible: ${dashboardVisible ? '✅' : '❌'}`);
    expect(dashboardVisible).toBe(true);
    
    // Should not show cvAnalyses-specific errors
    const hasCvAnalysesError = await page.locator('text=cvAnalyses, text=PrismaClientValidationError').isVisible().catch(() => false);
    console.log(`  🚫 No cvAnalyses errors: ${!hasCvAnalysesError ? '✅' : '❌'}`);
    expect(hasCvAnalysesError).toBe(false);
    
    console.log('✅ Malformed response handling test passed');
  });

  test('should verify no deprecated cvAnalyses references in any error state', async ({ page }) => {
    console.log('🔍 Comprehensive cvAnalyses reference check...');
    
    const errorScenarios = [
      {
        name: 'Network Failure',
        setup: async () => {
          await page.route('/api/gamification/dashboard', route => route.abort('failed'));
        }
      },
      {
        name: 'Server Error',
        setup: async () => {
          await page.route('/api/gamification/dashboard', route => {
            route.fulfill({
              status: 500,
              body: 'Internal Server Error'
            });
          });
        }
      },
      {
        name: 'Unauthorized',
        setup: async () => {
          await page.route('/api/gamification/dashboard', route => {
            route.fulfill({
              status: 401,
              body: JSON.stringify({ error: 'Unauthorized' })
            });
          });
        }
      }
    ];
    
    for (const scenario of errorScenarios) {
      console.log(`\n📝 Testing ${scenario.name} scenario...`);
      
      await authHelper.ensureLoggedIn('experienced_developer');
      await scenario.setup();
      
      await page.goto('/developer/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check page content for any cvAnalyses references
      const pageContent = await page.content();
      const hasCvAnalysesRef = pageContent.includes('cvAnalyses') || pageContent.includes('cvAnalysis');
      
      console.log(`  ${scenario.name} - cvAnalyses references: ${hasCvAnalysesRef ? '❌ Found' : '✅ None'}`);
      expect(hasCvAnalysesRef).toBe(false);
      
      // Check for specific Prisma error messages
      const hasPrismaError = pageContent.includes('PrismaClientValidationError') || pageContent.includes('Unknown field');
      console.log(`  ${scenario.name} - Prisma errors: ${hasPrismaError ? '❌ Found' : '✅ None'}`);
      expect(hasPrismaError).toBe(false);
    }
    
    console.log('✅ Comprehensive cvAnalyses reference check passed');
  });

  test('should maintain data integrity across user types with edge cases', async ({ page }) => {
    console.log('👥 Testing data integrity across user types...');
    
    const userTypes = ['new_user', 'junior_developer', 'experienced_developer'] as const;
    
    for (const userType of userTypes) {
      console.log(`\n📝 Testing ${userType} edge cases...`);
      
      let apiResponse: any = null;
      let apiError: string | null = null;
      
      await page.route('/api/gamification/dashboard', async route => {
        try {
          const response = await page.request.fetch(route.request());
          const responseBody = await response.text();
          
          if (response.status() >= 400) {
            apiError = responseBody;
          } else {
            apiResponse = JSON.parse(responseBody);
          }
          
          route.fulfill({
            status: response.status(),
            headers: response.headers(),
            body: responseBody
          });
        } catch (error) {
          apiError = error.message;
          route.abort();
        }
      });
      
      await authHelper.ensureLoggedOut();
      await authHelper.ensureLoggedIn(userType);
      await page.goto('/developer/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verify data integrity for each user type
      console.log(`  ${userType} - API Error: ${apiError || 'None'}`);
      console.log(`  ${userType} - API Success: ${!!apiResponse}`);
      
      if (apiError) {
        expect(apiError).not.toContain('cvAnalyses');
        expect(apiError).not.toContain('PrismaClientValidationError');
      }
      
      if (apiResponse) {
        // Verify required sections exist
        const requiredSections = ['profile', 'profileCompleteness', 'roadmapProgress'];
        for (const section of requiredSections) {
          const hasSection = apiResponse.hasOwnProperty(section);
          console.log(`    ${userType} - ${section}: ${hasSection ? '✅' : '❌'}`);
          expect(hasSection).toBe(true);
        }
        
        // Verify profile completeness is valid
        if (apiResponse.profileCompleteness) {
          const score = apiResponse.profileCompleteness.score;
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
          console.log(`    ${userType} - Profile score: ${score}% ✅`);
        }
      }
      
      expect(apiError).toBeNull();
      expect(apiResponse).toBeTruthy();
    }
    
    console.log('✅ Data integrity test across user types passed');
  });
});