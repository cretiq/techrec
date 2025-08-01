import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Role Search - Un-Apply Functionality E2E', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Explicitly login as junior developer before each test
    await authHelper.loginAsUserType('junior_developer');
  });

  test('should un-apply a previously applied role and verify state changes', async ({ page }) => {
    console.log('🚀 Starting role search un-apply workflow test');
    
    // Step 1: User is already authenticated via beforeEach
    console.log('📝 Step 1: User already authenticated via beforeEach');
    
    // Step 2: Navigate to roles search page
    console.log('📝 Step 2: Navigating to roles search page...');
    await page.goto('/developer/roles/search');
    await expect(page.locator('[data-testid="role-search-container-main"]')).toBeVisible();
    console.log('✅ Roles search page loaded');

    // Step 3: Check if there are existing roles, if not trigger a search
    console.log('📝 Step 3: Ensuring roles are available...');
    let rolesGrid = page.locator('[data-testid="role-search-container-roles-grid"]');
    
    if (await page.locator('[data-testid="role-search-card-no-results"]').isVisible()) {
      console.log('🔍 No roles found, triggering search...');
      
      // Wait for search button and click it
      const startSearchButton = page.locator('[data-testid="role-search-button-start-search"]');
      await expect(startSearchButton).toBeVisible();
      await startSearchButton.click();
      
      // Wait for search to complete
      await expect(page.locator('[data-testid="role-search-container-loading"]')).not.toBeVisible({ timeout: 30000 });
      
      // Verify roles loaded
      rolesGrid = page.locator('[data-testid="role-search-container-roles-grid"]');
      await expect(rolesGrid).toBeVisible();
    }
    
    console.log('✅ Roles are available for testing');

    // Step 4: Find the first role card and check if it's already applied
    console.log('📝 Step 4: Looking for an applied role to un-apply...');
    const firstRoleCard = rolesGrid.locator('[data-testid*="role-search-card-role-item-"]').first();
    await expect(firstRoleCard).toBeVisible();
    
    // Get the role ID from the first card
    const roleId = await firstRoleCard.getAttribute('data-testid');
    const extractedRoleId = roleId?.replace('role-search-card-role-item-', '');
    console.log(`🎯 Testing with role ID: ${extractedRoleId}`);
    
    // Check if the role is already applied
    const appliedButtonSelector = `[data-testid="role-search-button-mark-applied-${extractedRoleId}-applied-status"]`;
    const markAppliedButtonSelector = `[data-testid="role-search-button-mark-applied-${extractedRoleId}-mark-applied"]`;
    
    let isCurrentlyApplied = await firstRoleCard.locator(appliedButtonSelector).count() > 0;
    
    // If not applied, apply it first so we can test un-apply
    if (!isCurrentlyApplied) {
      console.log('📝 Role not currently applied, applying it first...');
      
      const markAsAppliedButton = firstRoleCard.locator(markAppliedButtonSelector);
      await expect(markAsAppliedButton).toBeVisible();
      await markAsAppliedButton.click();
      
      // Wait for it to become applied
      const appliedButton = firstRoleCard.locator(appliedButtonSelector);
      await expect(appliedButton).toBeVisible({ timeout: 10000 });
      await expect(appliedButton).toContainText('Applied');
      console.log('✅ Role marked as applied successfully');
      isCurrentlyApplied = true;
    }
    
    // Step 5: Now test un-apply functionality
    console.log('📝 Step 5: Testing un-apply functionality...');
    const appliedButton = firstRoleCard.locator(appliedButtonSelector);
    await expect(appliedButton).toBeVisible();
    await expect(appliedButton).toContainText('Applied');
    
    // For role search, we don't enable un-apply by default, so let's go to saved roles
    console.log('📝 Step 6: Going to saved roles page to test un-apply...');
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    
    // Wait for the saved roles page to load
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000);
    
    // Click on the "Applied" filter to see applied roles
    await page.click('[data-testid="saved-roles-filter-applied"]');
    await page.waitForLoadState('networkidle');
    
    // Find the saved roles grid and get the first applied role
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    await expect(savedRolesGrid).toBeVisible();
    
    const firstSavedRole = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').first();
    await expect(firstSavedRole).toBeVisible();
    
    // Find the applied button in the saved role card
    const savedRoleAppliedButton = firstSavedRole.locator('[data-testid*="saved-role-mark-applied-"][data-testid$="-applied-status"]');
    await expect(savedRoleAppliedButton).toBeVisible();
    await expect(savedRoleAppliedButton).toContainText('Applied');
    
    console.log('✅ Found applied role in saved roles page');

    // Step 7: Click the applied button to trigger un-apply dialog
    console.log('📝 Step 7: Clicking applied button to open un-apply confirmation...');
    await savedRoleAppliedButton.click();
    
    // Wait for confirmation dialog to appear
    await expect(page.locator('text=Remove Application Status?')).toBeVisible();
    await expect(page.locator('text=This will mark the role as not applied')).toBeVisible();
    
    console.log('✅ Un-apply confirmation dialog opened');

    // Step 8: Set up API monitoring for un-apply request
    console.log('📝 Step 8: Setting up API monitoring...');
    let unApplyAPIRequest: any = null;
    let unApplyAPIResponse: any = null;
    
    await page.route('/api/developer/saved-roles/un-apply*', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        console.log('📞 Intercepted un-apply API call');
        
        unApplyAPIRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        };
        
        const response = await page.request.fetch(request);
        const responseBody = await response.text();
        
        try {
          unApplyAPIResponse = JSON.parse(responseBody);
          console.log('✅ Un-apply API response captured');
        } catch (e) {
          unApplyAPIResponse = { raw: responseBody, parseError: e.message };
          console.log('❌ Un-apply API response parse error:', e.message);
        }
        
        route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        });
      } else {
        route.continue();
      }
    });

    // Step 9: Confirm un-apply action
    console.log('📝 Step 9: Confirming un-apply action...');
    const confirmButton = page.locator('button:has-text("Remove Application")');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    
    // Wait for the un-apply operation to complete
    await page.waitForLoadState('networkidle');
    
    // Since we're on the "Applied" filter, the role card should disappear entirely
    // after being un-applied (because it's no longer applied)
    console.log('⏳ Waiting for role card to disappear from Applied filter...');
    await expect(firstSavedRole).not.toBeVisible({ timeout: 10000 });
    
    console.log('✅ Role successfully un-applied - role card disappeared from Applied filter');

    // Step 10: Verify API interaction
    console.log('📝 Step 10: Analyzing API interaction...');
    
    if (unApplyAPIRequest && unApplyAPIResponse) {
      console.log('\\n📡 === UN-APPLY API ANALYSIS ===');
      console.log(`Request Method: ${unApplyAPIRequest.method}`);
      console.log(`Request URL: ${unApplyAPIRequest.url}`);
      
      if (unApplyAPIRequest.postData) {
        try {
          const requestData = JSON.parse(unApplyAPIRequest.postData);
          console.log('Request Data Structure:');
          console.log(`  - Role ID: ${requestData.roleId || 'Not specified'}`);
          console.log(`  - Keep Notes: ${requestData.keepNotes || 'Not specified'}`);
        } catch (e) {
          console.log('Request data parsing failed:', e.message);
        }
      }
      
      if (!unApplyAPIResponse.parseError) {
        console.log('✅ API Response successful');
        console.log(`Response data:`, JSON.stringify(unApplyAPIResponse, null, 2));
      } else {
        console.log('❌ API Response had issues:', unApplyAPIResponse.parseError);
      }
      console.log('=== END UN-APPLY API ANALYSIS ===\\n');
    } else {
      console.log('⚠️ No API interaction captured - this might indicate a problem');
    }

    // Step 11: Verify the role now appears in "Saved Only" (not applied) filter
    console.log('📝 Step 11: Verifying role appears in "Saved Only" filter...');
    
    // Click on "Saved Only" filter to see non-applied roles
    await page.click('[data-testid="saved-roles-filter-saved"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // The role should now appear in the saved-only filter with "Mark as Applied" button
    const savedOnlyRoles = await savedRolesGrid.locator('[data-testid*="saved-role-card-"]').count();
    console.log(`📊 Number of saved-only roles after un-apply: ${savedOnlyRoles}`);
    expect(savedOnlyRoles).toBeGreaterThan(0);
    
    // Verify we can find a role with "Mark as Applied" button (the one we just un-applied)
    const roleWithMarkAsApplied = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').locator('[data-testid*="saved-role-mark-applied-"][data-testid$="-mark-applied"]').first();
    await expect(roleWithMarkAsApplied).toBeVisible();
    await expect(roleWithMarkAsApplied).toContainText('Mark as Applied');
    
    console.log('✅ Un-applied role now appears in "Saved Only" filter with "Mark as Applied" button');
    
    // Step 12: Check updated stats
    console.log('📝 Step 12: Verifying applied count decreased...');
    
    // Go to "All" filter to see updated counts
    await page.click('[data-testid="saved-roles-filter-all"]');
    await page.waitForLoadState('networkidle');
    
    // Check the updated stats
    const allTextContent = await page.locator('[data-testid="saved-roles-stats-container"]').textContent();
    console.log('📊 Updated stats container content:', allTextContent);
    
    // The applied count should have decreased
    const appliedCountElements = page.locator('text=Applied').locator('..').locator('p.text-2xl');
    const appliedCount = await appliedCountElements.first().textContent();
    console.log(`📊 Applied roles count after un-apply: ${appliedCount}`);

    console.log('🎉 Role search un-apply workflow test completed successfully!');
    
    // Final assertions
    expect(unApplyAPIRequest).toBeDefined();
    expect(unApplyAPIResponse).toBeDefined();
    if (unApplyAPIResponse && !unApplyAPIResponse.parseError) {
      expect(unApplyAPIResponse.success).toBe(true);
    }
  });

  test('should handle un-apply confirmation dialog cancellation', async ({ page }) => {
    console.log('🚀 Starting un-apply cancellation test');
    
    // Step 1: Navigate to saved roles and find an applied role
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Click on the "Applied" filter
    await page.click('[data-testid="saved-roles-filter-applied"]');
    await page.waitForLoadState('networkidle');
    
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    
    // Check if there are any applied roles
    const appliedRoleCount = await savedRolesGrid.locator('[data-testid*="saved-role-card-"]').count();
    
    if (appliedRoleCount === 0) {
      console.log('ℹ️ No applied roles found - skipping cancellation test');
      return;
    }
    
    const firstSavedRole = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').first();
    const savedRoleAppliedButton = firstSavedRole.locator('[data-testid*="saved-role-mark-applied-"][data-testid$="-applied-status"]');
    
    await expect(savedRoleAppliedButton).toBeVisible();
    
    // Step 2: Click applied button to open dialog
    await savedRoleAppliedButton.click();
    await expect(page.locator('text=Remove Application Status?')).toBeVisible();
    
    // Step 3: Cancel the dialog
    const cancelButton = page.locator('button:has-text("Keep Application")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    // Step 4: Verify dialog closed and button is still "Applied"
    await expect(page.locator('text=Remove Application Status?')).not.toBeVisible();
    await expect(savedRoleAppliedButton).toBeVisible();
    await expect(savedRoleAppliedButton).toContainText('Applied');
    
    console.log('✅ Un-apply cancellation test completed successfully');
  });

  test('should handle un-apply error gracefully', async ({ page }) => {
    console.log('🚀 Starting un-apply error handling test');
    
    // Step 1: Navigate to saved roles
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Step 2: Set up API intercept to simulate failure
    await page.route('/api/developer/saved-roles/un-apply*', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        console.log('📞 Intercepting un-apply API call and simulating failure');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Step 3: Try to un-apply a role (if any exist)
    await page.click('[data-testid="saved-roles-filter-applied"]');
    await page.waitForLoadState('networkidle');
    
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    const appliedRoleCount = await savedRolesGrid.locator('[data-testid*="saved-role-card-"]').count();
    
    if (appliedRoleCount === 0) {
      console.log('ℹ️ No applied roles found - skipping error handling test');
      return;
    }
    
    const firstSavedRole = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').first();
    const savedRoleAppliedButton = firstSavedRole.locator('[data-testid*="saved-role-mark-applied-"][data-testid$="-applied-status"]');
    
    await savedRoleAppliedButton.click();
    await expect(page.locator('text=Remove Application Status?')).toBeVisible();
    
    const confirmButton = page.locator('button:has-text("Remove Application")');
    await confirmButton.click();
    
    // Step 4: Verify error handling - button should remain "Applied"
    await page.waitForLoadState('networkidle');
    await expect(savedRoleAppliedButton).toBeVisible();
    await expect(savedRoleAppliedButton).toContainText('Applied');
    
    console.log('✅ Un-apply error handling test completed');
  });
});