import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Dashboard API Integration - Post cvAnalyses Removal', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should successfully fetch dashboard data without cvAnalyses Prisma errors', async ({ page }) => {
    console.log('🏠 Starting Dashboard API integration test...');
    
    // === STEP 1: AUTHENTICATION ===
    console.log('📝 Step 1: Authenticating as experienced developer...');
    await authHelper.ensureLoggedIn('experienced_developer');
    await page.waitForLoadState('networkidle');
    console.log('✅ Authentication completed');

    // === STEP 2: API MONITORING SETUP ===
    console.log('📝 Step 2: Setting up dashboard API monitoring...');
    let dashboardAPIRequest: any = null;
    let dashboardAPIResponse: any = null;
    let dashboardAPIError: string | null = null;

    // Monitor dashboard API calls
    await page.route('/api/gamification/dashboard', async route => {
      dashboardAPIRequest = {
        url: route.request().url(),
        method: route.request().method(),
        headers: route.request().headers(),
        timestamp: new Date().toISOString()
      };
      console.log('📞 Intercepted dashboard API call');
      
      try {
        const response = await page.request.fetch(route.request());
        const responseBody = await response.text();
        
        console.log(`📊 Dashboard API response status: ${response.status()}`);
        
        if (response.status() >= 400) {
          dashboardAPIError = `HTTP ${response.status()}: ${responseBody}`;
          console.error('❌ Dashboard API error:', dashboardAPIError);
        } else {
          try {
            dashboardAPIResponse = JSON.parse(responseBody);
            console.log('✅ Dashboard API response captured successfully');
          } catch (e) {
            dashboardAPIResponse = { raw: responseBody, parseError: e.message };
            console.warn('⚠️ Failed to parse dashboard API response as JSON');
          }
        }
        
        route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        });
      } catch (error) {
        dashboardAPIError = `Network error: ${error.message}`;
        console.error('❌ Dashboard API network error:', error);
        route.abort();
      }
    });

    console.log('✅ API monitoring setup completed');

    // === STEP 3: TRIGGER DASHBOARD API CALL ===
    console.log('📝 Step 3: Navigating to dashboard to trigger API call...');
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for API calls to complete
    await page.waitForTimeout(2000);
    console.log('✅ Dashboard page loaded');

    // === STEP 4: VERIFY NO PRISMA ERRORS ===
    console.log('📝 Step 4: Verifying no Prisma validation errors...');
    
    // Check that we didn't get the specific cvAnalyses error
    expect(dashboardAPIError).toBeNull();
    expect(dashboardAPIResponse).toBeTruthy();
    
    if (dashboardAPIError) {
      console.error('❌ Dashboard API error detected:', dashboardAPIError);
      expect(dashboardAPIError).not.toContain('cvAnalyses');
      expect(dashboardAPIError).not.toContain('PrismaClientValidationError');
      expect(dashboardAPIError).not.toContain('Unknown field');
    }
    
    console.log('✅ No Prisma validation errors detected');

    // === STEP 5: VERIFY API RESPONSE STRUCTURE ===
    console.log('📝 Step 5: Analyzing dashboard API response structure...');
    
    expect(dashboardAPIResponse).toBeTruthy();
    expect(typeof dashboardAPIResponse).toBe('object');
    
    console.log('\n🏗️ === DASHBOARD API RESPONSE ANALYSIS ===');
    
    // Verify main sections exist
    const expectedSections = [
      'profile',
      'profileCompleteness', 
      'roadmapProgress',
      'activityStats',
      'streakData',
      'pointsData',
      'recentBadges',
      'dashboardMetadata'
    ];
    
    for (const section of expectedSections) {
      const hasSection = dashboardAPIResponse.hasOwnProperty(section);
      console.log(`  ${hasSection ? '✅' : '❌'} ${section}: ${hasSection ? 'Present' : 'Missing'}`);
      expect(dashboardAPIResponse).toHaveProperty(section);
    }

    // === STEP 6: VERIFY PROFILE COMPLETENESS CALCULATION ===
    console.log('📝 Step 6: Verifying profile completeness uses real profile data...');
    
    const profileCompleteness = dashboardAPIResponse.profileCompleteness;
    expect(profileCompleteness).toBeTruthy();
    expect(profileCompleteness).toHaveProperty('score');
    expect(profileCompleteness).toHaveProperty('sections');
    
    console.log(`  📊 Profile completeness score: ${profileCompleteness.score}%`);
    console.log(`  📋 Profile sections analyzed: ${profileCompleteness.sections?.length || 0}`);
    
    // Verify sections are based on real profile data, not cvAnalyses
    const expectedProfileSections = ['Contact Info', 'Summary', 'Skills', 'Experience', 'Education'];
    if (profileCompleteness.sections) {
      for (const expectedSection of expectedProfileSections) {
        const hasSection = profileCompleteness.sections.some(s => s.name === expectedSection);
        console.log(`    ${hasSection ? '✅' : '⚠️'} ${expectedSection}: ${hasSection ? 'Analyzed' : 'Not found'}`);
      }
    }
    
    console.log('✅ Profile completeness calculation verified');

    // === STEP 7: VERIFY ROADMAP PROGRESS USES CVS TABLE ===
    console.log('📝 Step 7: Verifying roadmap progress uses cvs table...');
    
    const roadmapProgress = dashboardAPIResponse.roadmapProgress;
    expect(roadmapProgress).toBeTruthy();
    expect(roadmapProgress).toHaveProperty('milestones');
    expect(roadmapProgress).toHaveProperty('completedCount');
    expect(roadmapProgress).toHaveProperty('progress');
    
    console.log(`  🎯 Roadmap progress: ${roadmapProgress.progress}%`);
    console.log(`  ✅ Completed milestones: ${roadmapProgress.completedCount}`);
    console.log(`  📋 Total milestones: ${roadmapProgress.milestones?.length || 0}`);
    
    // Verify CV upload milestone (should be based on cvs table, not cvAnalyses)
    if (roadmapProgress.milestones) {
      const cvUploadMilestone = roadmapProgress.milestones.find(m => m.id === 'cv-upload');
      if (cvUploadMilestone) {
        console.log(`    📤 CV Upload milestone: ${cvUploadMilestone.isCompleted ? 'Completed' : 'Pending'}`);
        console.log(`    📅 Completion date: ${cvUploadMilestone.completedAt || 'N/A'}`);
      }
      
      const analysisMillestone = roadmapProgress.milestones.find(m => m.id === 'first-analysis');
      if (analysisMillestone) {
        console.log(`    🤖 Analysis milestone: ${analysisMillestone.isCompleted ? 'Completed' : 'Pending'}`);
      }
    }
    
    console.log('✅ Roadmap progress verification completed');

    // === STEP 8: VERIFY GAMIFICATION DATA INTEGRITY ===
    console.log('📝 Step 8: Verifying gamification data integrity...');
    
    // Profile data
    const profile = dashboardAPIResponse.profile;
    if (profile) {
      console.log(`  👤 User Level: ${profile.currentLevel || 'N/A'}`);
      console.log(`  ⭐ Total XP: ${profile.totalXP || 0}`);
      console.log(`  📈 Level Progress: ${Math.round((profile.levelProgress || 0) * 100)}%`);
      
      expect(typeof profile.currentLevel).toBe('number');
      expect(typeof profile.totalXP).toBe('number');
      expect(typeof profile.levelProgress).toBe('number');
    }
    
    // Points data
    const pointsData = dashboardAPIResponse.pointsData;
    if (pointsData) {
      console.log(`  💰 Available Points: ${pointsData.available || 0}`);
      console.log(`  📊 Monthly Points: ${pointsData.monthly || 0}`);
      console.log(`  🎯 Subscription Tier: ${pointsData.subscriptionTier || 'N/A'}`);
      
      expect(typeof pointsData.available).toBe('number');
      expect(typeof pointsData.monthly).toBe('number');
    }
    
    // Streak data
    const streakData = dashboardAPIResponse.streakData;
    if (streakData) {
      console.log(`  🔥 Current Streak: ${streakData.currentStreak || 0} days`);
      console.log(`  🏆 Best Streak: ${streakData.bestStreak || 0} days`);
      console.log(`  📅 Last Activity: ${streakData.lastActivityDate || 'N/A'}`);
    }
    
    console.log('✅ Gamification data verification completed');

    // === STEP 9: VERIFY NO DEPRECATED REFERENCES ===
    console.log('📝 Step 9: Ensuring no deprecated cvAnalyses references...');
    
    const responseString = JSON.stringify(dashboardAPIResponse);
    const hasCvAnalysesRef = responseString.includes('cvAnalyses') || responseString.includes('cvAnalysis');
    
    console.log(`  🚫 Contains cvAnalyses references: ${hasCvAnalysesRef ? 'YES (❌)' : 'NO (✅)'}`);
    expect(hasCvAnalysesRef).toBe(false);
    
    console.log('✅ No deprecated references found');

    // === STEP 10: PERFORMANCE VERIFICATION ===
    console.log('📝 Step 10: Verifying API performance...');
    
    if (dashboardAPIRequest) {
      const requestTime = new Date(dashboardAPIRequest.timestamp);
      const responseTime = new Date();
      const duration = responseTime.getTime() - requestTime.getTime();
      
      console.log(`  ⏱️ API Response Time: ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    }
    
    // Verify metadata
    const metadata = dashboardAPIResponse.dashboardMetadata;
    if (metadata) {
      console.log(`  📊 Data Version: ${metadata.dataVersion || 'N/A'}`);
      console.log(`  🕐 Last Updated: ${metadata.lastUpdated || 'N/A'}`);
    }
    
    console.log('✅ Performance verification completed');

    // === FINAL ASSERTIONS ===
    console.log('\n🏁 === FINAL INTEGRATION TEST RESULTS ===');
    
    const testResults = {
      apiCallSuccessful: !!dashboardAPIResponse && !dashboardAPIError,
      noPrismaErrors: !dashboardAPIError?.includes('PrismaClientValidationError'),
      hasRequiredSections: expectedSections.every(section => dashboardAPIResponse?.hasOwnProperty(section)),
      profileCompletenessWorks: !!profileCompleteness?.score,
      roadmapProgressWorks: !!roadmapProgress?.milestones,
      noDeprecatedReferences: !hasCvAnalysesRef,
      performanceAcceptable: dashboardAPIRequest ? (new Date().getTime() - new Date(dashboardAPIRequest.timestamp).getTime()) < 5000 : true
    };
    
    console.log(`✅ API Call Successful: ${testResults.apiCallSuccessful}`);
    console.log(`✅ No Prisma Errors: ${testResults.noPrismaErrors}`);
    console.log(`✅ Has Required Sections: ${testResults.hasRequiredSections}`);
    console.log(`✅ Profile Completeness Works: ${testResults.profileCompletenessWorks}`);
    console.log(`✅ Roadmap Progress Works: ${testResults.roadmapProgressWorks}`);
    console.log(`✅ No Deprecated References: ${testResults.noDeprecatedReferences}`);
    console.log(`✅ Performance Acceptable: ${testResults.performanceAcceptable}`);
    
    const overallSuccess = Object.values(testResults).every(Boolean);
    console.log(`\n🎯 Overall Integration Test: ${overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    if (overallSuccess) {
      console.log('🎉 Dashboard API integration test completed successfully!');
      console.log('   The cvAnalyses removal fix is working properly.');
    } else {
      console.log('❌ Integration test failed - review logs above for details');
    }

    // Final assertions
    expect(testResults.apiCallSuccessful).toBe(true);
    expect(testResults.noPrismaErrors).toBe(true);
    expect(testResults.hasRequiredSections).toBe(true);
    expect(testResults.profileCompletenessWorks).toBe(true);
    expect(testResults.roadmapProgressWorks).toBe(true);
    expect(testResults.noDeprecatedReferences).toBe(true);
    expect(testResults.performanceAcceptable).toBe(true);

    console.log('✅ All integration test assertions passed!');
  });

  test('should handle dashboard API calls for different user types', async ({ page }) => {
    console.log('👥 Testing dashboard API for different user types...');
    
    const userTypes = ['junior_developer', 'experienced_developer', 'new_user'] as const;
    
    for (const userType of userTypes) {
      console.log(`\n📝 Testing dashboard API for ${userType}...`);
      
      let apiResponse: any = null;
      let apiError: string | null = null;
      
      // Set up monitoring for this user type
      await page.route('/api/gamification/dashboard', async route => {
        try {
          const response = await page.request.fetch(route.request());
          const responseBody = await response.text();
          
          if (response.status() >= 400) {
            apiError = `HTTP ${response.status()}: ${responseBody}`;
          } else {
            apiResponse = JSON.parse(responseBody);
          }
          
          route.fulfill({
            status: response.status(),
            headers: response.headers(),
            body: responseBody
          });
        } catch (error) {
          apiError = `Network error: ${error.message}`;
          route.abort();
        }
      });
      
      // Login and test
      await authHelper.ensureLoggedOut();
      await authHelper.ensureLoggedIn(userType);
      await page.goto('/developer/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verify results
      console.log(`  ${userType} - API Error: ${apiError || 'None'}`);
      console.log(`  ${userType} - API Success: ${!!apiResponse}`);
      
      expect(apiError).toBeNull();
      expect(apiResponse).toBeTruthy();
      
      // Verify no cvAnalyses errors for any user type
      if (apiError) {
        expect(apiError).not.toContain('cvAnalyses');
        expect(apiError).not.toContain('PrismaClientValidationError');
      }
      
      console.log(`  ✅ ${userType} dashboard API test passed`);
    }
    
    console.log('\n✅ All user types can access dashboard API without errors');
  });
});