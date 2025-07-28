import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('CV Management - Get Suggestions Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Ensure user is logged in first
    await authHelper.ensureLoggedIn('experienced_developer');
    
    // Wait for page to settle after login
    await page.waitForLoadState('networkidle');
  });

  test('should test Get Suggestions button behavior with mock API', async ({ page }) => {
    // Mock successful API response
    await page.route('/api/cv-improvement-gemini', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: [
            {
              id: 'test-suggestion-1',
              type: 'experience_bullet',
              section: 'experience',
              title: 'Add quantifiable achievements',
              reasoning: 'Your experience lacks specific metrics and quantifiable results that would make your achievements more impactful',
              suggestedContent: 'Led team of 5 developers and increased productivity by 30% through implementation of agile methodologies',
              originalContent: 'Led team of developers',
              priority: 'high',
              confidence: 0.9
            }
          ],
          summary: {
            totalSuggestions: 1,
            highPriority: 1,
            categories: {
              experienceBullets: 1,
              educationGaps: 0,
              missingSkills: 0,
              summaryImprovements: 0,
              generalImprovements: 0
            }
          },
          fromCache: false,
          provider: 'gemini'
        })
      });
    });
    
    // Navigate to page
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    
    // Check if we have existing analysis, skip if not
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping suggestions test');
      return;
    }
    
    await expect(profileSection).toBeVisible();
    
    // Locate the "Get Suggestions" button
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await expect(getSuggestionsButton).toBeVisible();
    await expect(getSuggestionsButton).toBeEnabled();
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    
    // Click the "Get Suggestions" button
    await getSuggestionsButton.click();
    
    // Verify loading state appears
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).toBeVisible();
    await expect(getSuggestionsButton).toContainText('Getting Suggestions...');
    await expect(getSuggestionsButton).toBeDisabled();
    
    // Wait for mock API response to be processed
    await page.waitForLoadState('networkidle');
    
    // Verify loading state completes
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 10000 });
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();
    
    // Check for success toast (may not always appear depending on UI implementation)
    const toastElements = page.locator('.toast, [role="alert"], [data-testid*="toast"]');
    if (await toastElements.count() > 0) {
      await expect(toastElements.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle get suggestions with no analysis data', async ({ page }) => {
    // Navigate to page
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    
    // Check what state we're in
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      // No analysis exists - this is the expected scenario for this test
      await expect(entrySection).toBeVisible();
      await expect(profileSection).not.toBeVisible();
      
      // Verify Get Suggestions button is not visible when no analysis data
      await expect(page.locator('[data-testid="cv-management-button-get-suggestions"]')).not.toBeVisible();
    } else {
      // Analysis exists - skip this test
      test.skip(true, 'CV analysis exists - this test is for no analysis scenario');
    }
  });

  test('should show error handling for suggestions API failure', async ({ page }) => {
    // Mock API failure for suggestions endpoint
    await page.route('/api/cv-improvement-gemini', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Gemini API temporarily unavailable' })
      });
    });
    
    // Navigate to CV Management page
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    
    // Check if we have existing analysis, skip if not
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping error handling test');
      return;
    }
    
    await expect(profileSection).toBeVisible();
    
    // Click Get Suggestions button
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();
    
    // Verify loading state
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).toBeVisible();
    
    // Wait for error handling
    await page.waitForLoadState('networkidle');
    
    // Verify error toast appears
    await expect(page.locator('.toast')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.toast')).toContainText('Suggestions Error');
    
    // Verify button returns to normal state
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();
  });

  test('should verify suggestions display integration with accordion sections', async ({ page }) => {
    // Navigate to CV Management page
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    
    // Check if we have existing analysis, skip if not
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping accordion integration test');
      return;
    }
    
    await expect(profileSection).toBeVisible();
    
    // Click Get Suggestions
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();
    
    // Wait for suggestions to load
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 30000 });
    
    // Use expand all button to open all sections
    const expandAllButton = page.locator('[data-testid="cv-management-button-expand-all"]');
    await expandAllButton.click();
    
    // Verify all sections are expanded and suggestions are visible
    const sections = ['about', 'skills', 'experience', 'education'];
    
    for (const sectionId of sections) {
      const section = page.locator(`#${sectionId}`);
      if (await section.isVisible()) {
        // Check that section is expanded
        await expect(section.locator('[data-state="open"]')).toBeVisible({ timeout: 5000 });
        
        // Check for suggestion manager in this section
        const suggestionManager = section.locator('[class*="suggestion"]');
        if (await suggestionManager.count() > 0) {
          await expect(suggestionManager.first()).toBeVisible();
        }
      }
    }
    
    // Test collapse all functionality
    const collapseAllButton = page.locator('[data-testid="cv-management-button-collapse-all"]');
    await collapseAllButton.click();
    
    // Verify sections are collapsed but suggestions state is maintained
    for (const sectionId of sections) {
      const section = page.locator(`#${sectionId}`);
      if (await section.isVisible()) {
        await expect(section.locator('[data-state="closed"]')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});