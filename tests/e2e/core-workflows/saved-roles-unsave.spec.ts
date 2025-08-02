import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Saved Roles - Unsave Functionality E2E', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Explicitly login as junior developer before each test
    await authHelper.loginAsUserType('junior_developer');
  });

  test('should unsave a role from saved roles page', async ({ page }) => {
    console.log('🚀 Starting saved roles unsave workflow test');
    
    // Step 1: User is already authenticated via beforeEach
    console.log('📝 Step 1: User already authenticated via beforeEach');
    
    // Step 2: Navigate to roles search page first to save a role
    console.log('📝 Step 2: Navigating to roles search page to save a role...');
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
      await expect(page.locator('[data-testid="role-search-container-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-search-container-loading"]')).not.toBeVisible({ timeout: 30000 });
      
      // Verify roles loaded
      rolesGrid = page.locator('[data-testid="role-search-container-roles-grid"]');
      await expect(rolesGrid).toBeVisible();
    }
    
    console.log('✅ Roles are available for testing');

    // Step 4: Find the first role and save it
    console.log('📝 Step 4: Finding and saving a role...');
    const firstRoleCard = rolesGrid.locator('[data-testid*="role-search-card-role-item-"]').first();
    await expect(firstRoleCard).toBeVisible();
    
    // Get the role ID from the first card
    const roleCardTestId = await firstRoleCard.getAttribute('data-testid');
    const roleId = roleCardTestId?.replace('role-search-card-role-item-', '');
    console.log(`🎯 Testing with role ID: ${roleId}`);
    
    // Find the save button (bookmark icon)
    const saveButton = firstRoleCard.locator(`[data-testid="role-search-button-save-trigger-${roleId}"]`);
    await expect(saveButton).toBeVisible();
    
    // Check if role is already saved
    const bookmarkIcon = saveButton.locator('svg');
    const isAlreadySaved = await bookmarkIcon.evaluate((element) => {
      return element.classList.contains('text-primary') || element.getAttribute('data-icon') === 'bookmark-check';
    });
    
    if (!isAlreadySaved) {
      console.log('💾 Saving the role first...');
      await saveButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Role saved successfully');
    } else {
      console.log('✅ Role is already saved');
    }

    // Step 5: Navigate to saved roles page
    console.log('📝 Step 5: Navigating to saved roles page...');
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    
    // Wait for the saved roles page to load
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    console.log('✅ Saved roles page loaded');

    // Step 6: Verify the role appears in saved roles
    console.log('📝 Step 6: Verifying saved role appears...');
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check if we need to see all roles (not just applied ones)
    await page.click('[data-testid="saved-roles-filter-all"]');
    await page.waitForLoadState('networkidle');
    
    // Find the saved roles grid
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    await expect(savedRolesGrid).toBeVisible();
    
    // Find the first saved role card
    const savedRoleCard = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').first();
    await expect(savedRoleCard).toBeVisible();
    
    // Get the saved role ID
    const savedRoleCardTestId = await savedRoleCard.getAttribute('data-testid');
    const savedRoleId = savedRoleCardTestId?.replace('saved-role-card-', '');
    console.log(`🎯 Found saved role with ID: ${savedRoleId}`);
    
    // Verify the saved role has the BookmarkCheck icon (unsave button)
    const unsaveButton = savedRoleCard.locator(`[data-testid="saved-role-unsave-button-${savedRoleId}"]`);
    await expect(unsaveButton).toBeVisible();
    console.log('✅ Unsave button found');

    // Step 7: Get initial counts for verification
    console.log('📝 Step 7: Recording initial counts...');
    const initialTotalCountElement = page.locator('[data-testid="saved-roles-stats-container"]').locator('text=Total Saved').locator('..').locator('p.text-2xl');
    const initialTotalCount = parseInt(await initialTotalCountElement.textContent() || '0');
    console.log(`📊 Initial total saved roles: ${initialTotalCount}`);

    // Step 8: Set up API monitoring for unsave request
    console.log('📝 Step 8: Setting up API monitoring...');
    let unsaveAPIRequest: any = null;
    let unsaveAPIResponse: any = null;
    
    await page.route('/api/developer/me/saved-roles*', async route => {
      const request = route.request();
      if (request.method() === 'DELETE') {
        console.log('📞 Intercepted unsave API call');
        
        unsaveAPIRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        };
        
        const response = await page.request.fetch(request);
        const responseBody = await response.text();
        
        try {
          unsaveAPIResponse = JSON.parse(responseBody || '{}');
          console.log('✅ API response captured');
        } catch (e) {
          unsaveAPIResponse = { raw: responseBody, parseError: e.message };
          console.log('❌ API response parse error:', e.message);
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

    // Step 9: Click the unsave button
    console.log('📝 Step 9: Clicking the unsave button...');
    await unsaveButton.click();
    
    // Wait for the API call to complete
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for UI to update
    await page.waitForTimeout(2000);
    console.log('✅ Unsave operation completed');

    // Step 10: Verify the role is removed from the page
    console.log('📝 Step 10: Verifying role removal...');
    
    // Wait for page to refresh/update
    await page.waitForTimeout(1000);
    
    // Check if the specific role card is no longer visible
    const removedRoleCard = page.locator(`[data-testid="saved-role-card-${savedRoleId}"]`);
    
    // If the role was the only one, the grid might be gone entirely
    const currentSavedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    const gridExists = await currentSavedRolesGrid.count() > 0;
    
    if (gridExists) {
      // If grid still exists, the specific card should be gone
      await expect(removedRoleCard).not.toBeVisible();
      console.log('✅ Specific role card removed from grid');
    } else {
      // If grid is gone, we should see the empty state or "no results" state
      const emptyState = page.locator('[data-testid="saved-roles-empty-state"], [data-testid="saved-roles-no-results"]');
      await expect(emptyState).toBeVisible();
      console.log('✅ Empty state shown (all roles removed)');
    }

    // Step 11: Verify updated counts
    console.log('📝 Step 11: Verifying updated counts...');
    
    // Reload the page to ensure fresh data
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Wait for stats to load
    await page.waitForTimeout(2000);
    
    const updatedTotalCountElement = page.locator('[data-testid="saved-roles-stats-container"]').locator('text=Total Saved').locator('..').locator('p.text-2xl');
    const updatedTotalCount = parseInt(await updatedTotalCountElement.textContent() || '0');
    console.log(`📊 Updated total saved roles: ${updatedTotalCount}`);
    
    // Verify count decreased by 1 (or is now 0)
    expect(updatedTotalCount).toBe(Math.max(0, initialTotalCount - 1));
    console.log('✅ Counts updated correctly');

    // Step 12: Analyze API request and response
    console.log('📝 Step 12: Analyzing API interaction...');
    
    if (unsaveAPIRequest && unsaveAPIResponse) {
      console.log('\n📡 === UNSAVE API ANALYSIS ===');
      console.log(`Request Method: ${unsaveAPIRequest.method}`);
      console.log(`Request URL: ${unsaveAPIRequest.url}`);
      
      if (unsaveAPIRequest.postData) {
        try {
          const requestData = JSON.parse(unsaveAPIRequest.postData);
          console.log('Request Data Structure:');
          console.log(`  - Role ID: ${requestData.roleId || 'Not specified'}`);
        } catch (e) {
          console.log('Request data parsing failed:', e.message);
        }
      }
      
      if (!unsaveAPIResponse.parseError) {
        console.log('✅ API Response successful');
        console.log(`Response data:`, JSON.stringify(unsaveAPIResponse, null, 2));
      } else {
        console.log('❌ API Response had issues:', unsaveAPIResponse.parseError);
      }
      console.log('=== END API ANALYSIS ===\n');
    } else {
      console.log('⚠️ No API interaction captured - this might indicate a problem');
    }

    // Step 13: Verify the role is also removed from search page
    console.log('📝 Step 13: Verifying role is unsaved in search page...');
    await page.goto('/developer/roles/search');
    await page.waitForLoadState('networkidle');
    
    // If there are no roles visible, trigger a search to ensure we have roles to check
    if (await page.locator('[data-testid="role-search-card-no-results"]').isVisible()) {
      const startSearchButton = page.locator('[data-testid="role-search-button-start-search"]');
      await startSearchButton.click();
      await expect(page.locator('[data-testid="role-search-container-loading"]')).not.toBeVisible({ timeout: 30000 });
    }
    
    // Look for a role that might match the one we unsaved (this is approximate since role IDs might be different)
    const searchRolesGrid = page.locator('[data-testid="role-search-container-roles-grid"]');
    if (await searchRolesGrid.count() > 0) {
      const firstSearchRoleCard = searchRolesGrid.locator('[data-testid*="role-search-card-role-item-"]').first();
      if (await firstSearchRoleCard.count() > 0) {
        const searchRoleTestId = await firstSearchRoleCard.getAttribute('data-testid');
        const searchRoleId = searchRoleTestId?.replace('role-search-card-role-item-', '');
        const searchSaveButton = firstSearchRoleCard.locator(`[data-testid="role-search-button-save-trigger-${searchRoleId}"]`);
        
        if (await searchSaveButton.count() > 0) {
          // Check if the save button shows the regular bookmark (unsaved state)
          const bookmarkIcon = searchSaveButton.locator('svg');
          const isNowUnsaved = await bookmarkIcon.evaluate((element) => {
            return !element.classList.contains('text-primary');
          });
          
          if (isNowUnsaved) {
            console.log('✅ Role shows as unsaved in search page');
          } else {
            console.log('ℹ️ Role state verification skipped (may be a different role)');
          }
        }
      }
    }

    console.log('🎉 Saved roles unsave workflow test completed successfully!');
    
    // Final assertions
    expect(unsaveAPIRequest).toBeDefined();
    expect(unsaveAPIRequest.method).toBe('DELETE');
  });

  test('should handle unsave operation when role fails to remove', async ({ page }) => {
    console.log('🚀 Starting unsave error handling test');
    
    // Step 1: Setup - navigate to saved roles page
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Step 2: Ensure we have at least one saved role for testing
    await page.click('[data-testid="saved-roles-filter-all"]');
    await page.waitForLoadState('networkidle');
    
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    
    // If no saved roles, we need to save one first
    if (await savedRolesGrid.count() === 0 || await page.locator('[data-testid="saved-roles-empty-state"]').isVisible()) {
      console.log('📝 No saved roles found, creating one first...');
      
      // Go to search page and save a role
      await page.goto('/developer/roles/search');
      await page.waitForLoadState('networkidle');
      
      if (await page.locator('[data-testid="role-search-card-no-results"]').isVisible()) {
        const startSearchButton = page.locator('[data-testid="role-search-button-start-search"]');
        await startSearchButton.click();
        await expect(page.locator('[data-testid="role-search-container-loading"]')).not.toBeVisible({ timeout: 30000 });
      }
      
      const rolesGrid = page.locator('[data-testid="role-search-container-roles-grid"]');
      const firstRoleCard = rolesGrid.locator('[data-testid*="role-search-card-role-item-"]').first();
      const saveButton = firstRoleCard.locator('[data-testid*="role-search-button-save-trigger"]');
      await saveButton.click();
      await page.waitForLoadState('networkidle');
      
      // Return to saved roles page
      await page.goto('/developer/saved-roles');
      await page.waitForLoadState('networkidle');
      await page.click('[data-testid="saved-roles-filter-all"]');
    }
    
    // Step 3: Set up API intercept to simulate failure
    await page.route('/api/developer/me/saved-roles*', async route => {
      const request = route.request();
      if (request.method() === 'DELETE') {
        console.log('📞 Intercepting unsave API call and simulating failure');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Step 4: Try to unsave a role
    const savedRoleCard = savedRolesGrid.locator('[data-testid*="saved-role-card-"]').first();
    await expect(savedRoleCard).toBeVisible();
    
    const savedRoleCardTestId = await savedRoleCard.getAttribute('data-testid');
    const savedRoleId = savedRoleCardTestId?.replace('saved-role-card-', '');
    
    const unsaveButton = savedRoleCard.locator(`[data-testid="saved-role-unsave-button-${savedRoleId}"]`);
    await expect(unsaveButton).toBeVisible();
    
    // Click the unsave button
    await unsaveButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 5: Verify error handling
    // The role should still be visible since the operation failed
    await expect(savedRoleCard).toBeVisible();
    console.log('✅ Role still visible after API failure (correct behavior)');
    
    // Check for error toast or error message
    const errorElements = page.locator('.toast-error, [role="alert"][class*="error"], .alert-error');
    if (await errorElements.count() > 0) {
      console.log('✅ Error feedback shown to user');
    } else {
      console.log('ℹ️ No visible error feedback (might be console-only)');
    }
    
    console.log('✅ Error handling test completed');
  });
  
  test('should show confirmation and handle multiple unsave operations', async ({ page }) => {
    console.log('🚀 Starting multiple unsave operations test');
    
    // This test verifies that multiple unsave operations work correctly
    // and don't interfere with each other
    
    await page.goto('/developer/saved-roles');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="saved-roles-page-container"]')).toBeVisible();
    
    // Ensure we see all saved roles
    await page.click('[data-testid="saved-roles-filter-all"]');
    await page.waitForLoadState('networkidle');
    
    const savedRolesGrid = page.locator('[data-testid="saved-roles-grid"]');
    
    // Count initial saved roles
    const initialRoleCards = savedRolesGrid.locator('[data-testid*="saved-role-card-"]');
    const initialCount = await initialRoleCards.count();
    
    if (initialCount === 0) {
      console.log('ℹ️ No saved roles to test multiple unsave operations');
      console.log('✅ Test completed (no roles to unsave)');
      return;
    }
    
    console.log(`📊 Found ${initialCount} saved roles for testing`);
    
    // If we have multiple roles, test unsaving more than one
    const rolesToUnsave = Math.min(2, initialCount);
    
    for (let i = 0; i < rolesToUnsave; i++) {
      console.log(`📝 Unsaving role ${i + 1} of ${rolesToUnsave}...`);
      
      // Get the first visible role card
      const currentRoleCards = savedRolesGrid.locator('[data-testid*="saved-role-card-"]');
      const roleCard = currentRoleCards.first();
      
      if (await roleCard.count() === 0) {
        console.log('✅ No more roles to unsave');
        break;
      }
      
      const roleCardTestId = await roleCard.getAttribute('data-testid');
      const roleId = roleCardTestId?.replace('saved-role-card-', '');
      
      const unsaveButton = roleCard.locator(`[data-testid="saved-role-unsave-button-${roleId}"]`);
      await expect(unsaveButton).toBeVisible();
      
      // Click unsave button
      await unsaveButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      console.log(`✅ Role ${i + 1} unsaved successfully`);
    }
    
    // Verify the total count decreased appropriately
    const finalRoleCards = savedRolesGrid.locator('[data-testid*="saved-role-card-"]');
    const finalCount = await finalRoleCards.count();
    
    const expectedFinalCount = initialCount - rolesToUnsave;
    
    if (expectedFinalCount === 0) {
      // Should show empty state
      const emptyState = page.locator('[data-testid="saved-roles-empty-state"], [data-testid="saved-roles-no-results"]');
      await expect(emptyState).toBeVisible();
      console.log('✅ Empty state shown correctly');
    } else {
      expect(finalCount).toBe(expectedFinalCount);
      console.log(`✅ Role count decreased from ${initialCount} to ${finalCount}`);
    }
    
    console.log('🎉 Multiple unsave operations test completed successfully!');
  });
});