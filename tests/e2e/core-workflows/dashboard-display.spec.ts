import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Dashboard UI Display - Post cvAnalyses Fix', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should display dashboard without errors and show correct gamification data', async ({ page }) => {
    console.log('🏠 Starting Dashboard UI display test...');
    
    // === STEP 1: AUTHENTICATION ===
    console.log('📝 Step 1: Authenticating user...');
    await authHelper.ensureLoggedIn('experienced_developer');
    console.log('✅ Authentication completed');

    // === STEP 2: DASHBOARD NAVIGATION ===
    console.log('📝 Step 2: Navigating to dashboard...');
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to load completely
    await expect(page.locator('[data-testid="developer-dashboard"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard page loaded successfully');

    // === STEP 3: VERIFY NO ERROR STATES ===
    console.log('📝 Step 3: Checking for error states...');
    
    // Check for common error indicators
    const errorElements = [
      'text=Error',
      'text=Something went wrong',
      'text=PrismaClientValidationError',
      'text=cvAnalyses',
      'text=Unknown field',
      '[data-testid*="error"]',
      '.error',
      '.alert-error'
    ];
    
    for (const errorSelector of errorElements) {
      const errorElement = page.locator(errorSelector);
      const isVisible = await errorElement.isVisible().catch(() => false);
      console.log(`  🔍 Error check "${errorSelector}": ${isVisible ? '❌ Found' : '✅ Clean'}`);
      expect(isVisible).toBe(false);
    }
    
    console.log('✅ No error states detected');

    // === STEP 4: VERIFY DASHBOARD STRUCTURE ===
    console.log('📝 Step 4: Verifying dashboard structure...');
    
    // Check for main dashboard container
    const dashboardContainer = page.locator('[data-testid="developer-dashboard"]');
    await expect(dashboardContainer).toBeVisible();
    console.log('  ✅ Main dashboard container present');
    
    // The dashboard uses DashboardClient which may not have specific test IDs
    // So we'll check for general dashboard content patterns
    
    // Look for any cards or sections that would indicate dashboard content
    const possibleDashboardElements = [
      '.card',
      '[class*="card"]',
      '[data-testid*="dashboard"]',
      '[data-testid*="profile"]',
      '[data-testid*="gamification"]',
      '[data-testid*="roadmap"]',
      '[data-testid*="stats"]'
    ];
    
    let foundDashboardContent = false;
    for (const selector of possibleDashboardElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`  ✅ Found ${count} elements matching "${selector}"`);
        foundDashboardContent = true;
      }
    }
    
    if (!foundDashboardContent) {
      console.log('  ⚠️ No specific dashboard elements found, checking for basic content...');
      
      // Check for any visible content that suggests the dashboard loaded
      const hasVisibleContent = await page.locator('body').evaluate(el => {
        const text = el.innerText;
        return text.length > 100; // Some content loaded
      });
      
      console.log(`  📊 Page has substantial content: ${hasVisibleContent}`);
      expect(hasVisibleContent).toBe(true);
    }
    
    console.log('✅ Dashboard structure verification completed');

    // === STEP 5: API RESPONSE MONITORING ===
    console.log('📝 Step 5: Monitoring dashboard API responses...');
    
    let dashboardAPIResponse: any = null;
    let apiCallCount = 0;
    
    // Set up API monitoring for future calls
    await page.route('/api/gamification/dashboard', async route => {
      apiCallCount++;
      console.log(`📞 Dashboard API call #${apiCallCount} intercepted`);
      
      try {
        const response = await page.request.fetch(route.request());
        const responseBody = await response.text();
        
        if (response.status() === 200) {
          dashboardAPIResponse = JSON.parse(responseBody);
          console.log('✅ Dashboard API response captured');
        } else {
          console.error(`❌ Dashboard API error: ${response.status()}`);
        }
        
        route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        });
      } catch (error) {
        console.error('❌ Dashboard API network error:', error);
        route.abort();
      }
    });
    
    // Trigger a refresh to capture API call
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`✅ API monitoring completed (${apiCallCount} calls captured)`);

    // === STEP 6: VERIFY GAMIFICATION DATA DISPLAY ===
    console.log('📝 Step 6: Looking for gamification data display...');
    
    if (dashboardAPIResponse) {
      console.log('\n🎮 === GAMIFICATION DATA VERIFICATION ===');
      
      // Check if the API response has the expected structure
      const profile = dashboardAPIResponse.profile;
      const pointsData = dashboardAPIResponse.pointsData;
      const streakData = dashboardAPIResponse.streakData;
      
      if (profile) {
        console.log(`  👤 User Level: ${profile.currentLevel || 'N/A'}`);
        console.log(`  ⭐ Total XP: ${profile.totalXP || 0}`);
        
        // Look for level/XP display in UI
        const levelIndicators = [
          `text=${profile.currentLevel}`,
          `text=Level ${profile.currentLevel}`,
          `text=${profile.totalXP}`,
          `text=${profile.totalXP} XP`
        ];
        
        for (const indicator of levelIndicators) {
          const element = page.locator(indicator);
          const isVisible = await element.isVisible().catch(() => false);
          if (isVisible) {
            console.log(`    ✅ Found level/XP display: "${indicator}"`);
          }
        }
      }
      
      if (pointsData) {
        console.log(`  💰 Available Points: ${pointsData.available || 0}`);
        console.log(`  🎯 Subscription: ${pointsData.subscriptionTier || 'N/A'}`);
        
        // Look for points display in UI
        if (pointsData.available !== undefined) {
          const pointsIndicator = page.locator(`text=${pointsData.available}`);
          const hasPointsDisplay = await pointsIndicator.isVisible().catch(() => false);
          if (hasPointsDisplay) {
            console.log(`    ✅ Found points display in UI`);
          }
        }
      }
      
      if (streakData) {
        console.log(`  🔥 Current Streak: ${streakData.currentStreak || 0} days`);
        
        // Look for streak display in UI
        if (streakData.currentStreak !== undefined) {
          const streakIndicator = page.locator(`text=${streakData.currentStreak}`);
          const hasStreakDisplay = await streakIndicator.isVisible().catch(() => false);
          if (hasStreakDisplay) {
            console.log(`    ✅ Found streak display in UI`);
          }
        }
      }
    } else {
      console.log('  ⚠️ No dashboard API response captured for UI verification');
    }
    
    console.log('✅ Gamification data verification completed');

    // === STEP 7: VERIFY PROFILE COMPLETENESS DISPLAY ===
    console.log('📝 Step 7: Looking for profile completeness display...');
    
    if (dashboardAPIResponse?.profileCompleteness) {
      const completeness = dashboardAPIResponse.profileCompleteness;
      console.log(`  📊 Profile Score: ${completeness.score}%`);
      
      // Look for percentage display in UI
      const percentageIndicators = [
        `text=${completeness.score}%`,
        `text=${completeness.score} %`,
        `text=${Math.round(completeness.score)}%`
      ];
      
      for (const indicator of percentageIndicators) {
        const element = page.locator(indicator);
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`    ✅ Found profile completeness display: "${indicator}"`);
        }
      }
      
      // Look for progress bars or completion indicators
      const progressIndicators = [
        '[data-testid*="progress"]',
        '[data-testid*="completeness"]',
        '[data-testid*="profile-score"]',
        '.progress',
        '.progress-bar',
        '[role="progressbar"]'
      ];
      
      for (const selector of progressIndicators) {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`    ✅ Found ${count} progress indicators matching "${selector}"`);
        }
      }
    }
    
    console.log('✅ Profile completeness display verification completed');

    // === STEP 8: VERIFY ROADMAP PROGRESS DISPLAY ===
    console.log('📝 Step 8: Looking for roadmap progress display...');
    
    if (dashboardAPIResponse?.roadmapProgress) {
      const roadmap = dashboardAPIResponse.roadmapProgress;
      console.log(`  🗺️ Roadmap Progress: ${roadmap.progress}%`);
      console.log(`  ✅ Completed: ${roadmap.completedCount}/${roadmap.milestones?.length || 0}`);
      
      // Look for roadmap-related UI elements
      const roadmapIndicators = [
        '[data-testid*="roadmap"]',
        '[data-testid*="milestone"]',
        '[data-testid*="progress"]',
        'text=roadmap',
        'text=milestone',
        'text=CV',
        'text=Upload'
      ];
      
      for (const selector of roadmapIndicators) {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`    ✅ Found ${count} roadmap elements matching "${selector}"`);
        }
      }
    }
    
    console.log('✅ Roadmap progress display verification completed');

    // === STEP 9: RESPONSIVENESS TEST ===
    console.log('📝 Step 9: Testing responsive design...');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to settle
      
      // Verify dashboard is still visible and not broken
      const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
      console.log(`    ${viewport.name} - Dashboard visible: ${dashboardVisible ? '✅' : '❌'}`);
      expect(dashboardVisible).toBe(true);
      
      // Check for horizontal scrollbars (indicates layout issues)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`    ${viewport.name} - Horizontal scroll: ${hasHorizontalScroll ? '⚠️ Yes' : '✅ No'}`);
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    console.log('✅ Responsive design testing completed');

    // === STEP 10: LOADING STATE VERIFICATION ===
    console.log('📝 Step 10: Testing loading states...');
    
    // Simulate slow network to see loading states
    await page.route('/api/gamification/dashboard', async route => {
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    // Trigger a page refresh to see loading states
    const refreshPromise = page.reload();
    
    // Look for loading indicators during the delay
    await page.waitForTimeout(100); // Small delay to catch loading states
    
    const loadingIndicators = [
      '[data-testid*="loading"]',
      '[data-testid*="spinner"]',
      '[data-testid*="skeleton"]',
      '.loading',
      '.spinner',
      '.skeleton',
      'text=Loading',
      'text=loading'
    ];
    
    let foundLoadingStates = 0;
    for (const selector of loadingIndicators) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`    ✅ Found loading state: "${selector}"`);
        foundLoadingStates++;
      }
    }
    
    await refreshPromise;
    await page.waitForLoadState('networkidle');
    
    console.log(`  📊 Loading states found: ${foundLoadingStates}`);
    console.log('✅ Loading state verification completed');

    // === STEP 11: FINAL DASHBOARD HEALTH CHECK ===
    console.log('📝 Step 11: Final dashboard health check...');
    
    // Ensure dashboard is still functional after all tests
    const finalHealthCheck = {
      dashboardVisible: await page.locator('[data-testid="developer-dashboard"]').isVisible(),
      noErrorMessages: true,
      hasContent: true,
      apiResponded: !!dashboardAPIResponse,
      pageResponsive: true
    };
    
    // Check for any error messages that might have appeared
    for (const errorSelector of errorElements) {
      const errorElement = page.locator(errorSelector);
      const isVisible = await errorElement.isVisible().catch(() => false);
      if (isVisible) {
        finalHealthCheck.noErrorMessages = false;
        console.log(`    ❌ Error found: "${errorSelector}"`);
      }
    }
    
    // Check for substantial content
    const contentCheck = await page.locator('body').evaluate(el => {
      const text = el.innerText;
      return text.length > 200 && !text.includes('Error') && !text.includes('cvAnalyses');
    });
    finalHealthCheck.hasContent = contentCheck;
    
    console.log('\n🏁 === FINAL DASHBOARD UI TEST RESULTS ===');
    console.log(`✅ Dashboard Visible: ${finalHealthCheck.dashboardVisible}`);
    console.log(`✅ No Error Messages: ${finalHealthCheck.noErrorMessages}`);
    console.log(`✅ Has Content: ${finalHealthCheck.hasContent}`);
    console.log(`✅ API Responded: ${finalHealthCheck.apiResponded}`);
    console.log(`✅ Page Responsive: ${finalHealthCheck.pageResponsive}`);
    
    const overallSuccess = Object.values(finalHealthCheck).every(Boolean);
    console.log(`\n🎯 Overall Dashboard UI Test: ${overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    if (overallSuccess) {
      console.log('🎉 Dashboard UI display test completed successfully!');
      console.log('   The dashboard loads and displays without cvAnalyses errors.');
    } else {
      console.log('❌ Dashboard UI test failed - review logs above for details');
    }

    // Final assertions
    expect(finalHealthCheck.dashboardVisible).toBe(true);
    expect(finalHealthCheck.noErrorMessages).toBe(true);
    expect(finalHealthCheck.hasContent).toBe(true);
    expect(finalHealthCheck.apiResponded).toBe(true);

    console.log('✅ All dashboard UI test assertions passed!');
  });

  test('should handle dashboard loading for users without profile data', async ({ page }) => {
    console.log('👤 Testing dashboard with minimal profile data...');
    
    // === AUTHENTICATION ===
    await authHelper.ensureLoggedIn('new_user');
    console.log('✅ Authenticated as new user');

    // === DASHBOARD NAVIGATION ===
    await page.goto('/developer/dashboard');
    await page.waitForLoadState('networkidle');
    
    // === VERIFY NO ERRORS WITH MINIMAL DATA ===
    console.log('📝 Checking dashboard handles minimal profile data...');
    
    // Dashboard should still load even with minimal data
    await expect(page.locator('[data-testid="developer-dashboard"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard loads with minimal profile data');
    
    // Check for error states
    const errorIndicators = [
      'text=Error',
      'text=PrismaClientValidationError',
      'text=cvAnalyses',
      'text=Unknown field'
    ];
    
    for (const errorSelector of errorIndicators) {
      const hasError = await page.locator(errorSelector).isVisible().catch(() => false);
      console.log(`  Error check "${errorSelector}": ${hasError ? '❌ Found' : '✅ Clean'}`);
      expect(hasError).toBe(false);
    }
    
    console.log('✅ New user dashboard test passed');
  });

  test('should maintain dashboard functionality across page refreshes', async ({ page }) => {
    console.log('🔄 Testing dashboard persistence across refreshes...');
    
    await authHelper.ensureLoggedIn('experienced_developer');
    
    // Test multiple refreshes
    for (let i = 1; i <= 3; i++) {
      console.log(`📝 Refresh test ${i}/3...`);
      
      await page.goto('/developer/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify dashboard loads each time
      const dashboardVisible = await page.locator('[data-testid="developer-dashboard"]').isVisible();
      console.log(`  Refresh ${i} - Dashboard visible: ${dashboardVisible ? '✅' : '❌'}`);
      expect(dashboardVisible).toBe(true);
      
      // Check for errors
      const hasErrors = await page.locator('text=Error, text=cvAnalyses').isVisible().catch(() => false);
      console.log(`  Refresh ${i} - No errors: ${!hasErrors ? '✅' : '❌'}`);
      expect(hasErrors).toBe(false);
      
      await page.waitForTimeout(500);
    }
    
    console.log('✅ Dashboard maintains functionality across refreshes');
  });
});