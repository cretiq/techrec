import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';
import { TestDataHelper } from './utils/test-data-helper';

/**
 * E2E Tests for Project Enhancement (FR 23)
 * Tests the complete GitHub project enhancement flow for CV improvement
 */
test.describe('Project Enhancement (FR 23)', () => {
  let authHelper: AuthHelper;
  let testDataHelper: TestDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
  });

  test('Complete project enhancement flow - GitHub OAuth and enhancement', async ({ page }) => {
    // Login as user with limited portfolio
    await authHelper.loginAsUserType('junior_developer');
    
    // Upload a CV with minimal projects to trigger portfolio assessment
    await testDataHelper.uploadTestCV('minimal_projects');
    
    // Navigate to CV analysis to trigger portfolio suggestion
    await page.goto('/developer/cv-analysis');
    
    // Click "Get AI suggestions" to trigger portfolio assessment
    await page.click('[data-testid="cv-analysis-button-get-suggestions-trigger"]');
    
    // Verify portfolio enhancement suggestion appears
    await expect(page.locator('[data-testid="cv-analysis-project-recommendation-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-recommendation-title"]')).toContainText('Enhance Your Project Portfolio');
    
    // Click enhance projects button
    await page.click('[data-testid="project-recommendation-button-enhance-trigger"]');
    
    // Verify navigation to project enhancement page
    await page.waitForURL('/developer/projects/enhance');
    await expect(page.locator('[data-testid="project-enhancement-container"]')).toBeVisible();
    
    // Step 1: GitHub OAuth Connection
    await expect(page.locator('[data-testid="project-enhancement-github-connect-section"]')).toBeVisible();
    
    // Mock GitHub repositories for testing
    await testDataHelper.mockGitHubRepositories('good_readmes');
    
    // Start GitHub OAuth flow
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    
    // Verify OAuth loading state
    await expect(page.locator('[data-testid="project-enhancement-github-connecting-spinner"]')).toBeVisible();
    
    // Wait for OAuth completion (mocked)
    await page.waitForSelector('[data-testid="project-enhancement-github-connected-success"]');
    
    // Step 2: Repository Selection
    await expect(page.locator('[data-testid="project-enhancement-repository-list"]')).toBeVisible();
    
    // Verify repositories are displayed
    const repoCards = page.locator('[data-testid^="project-enhancement-repo-card-"]');
    await expect(repoCards).toHaveCount(2);
    
    // Select first repository
    const firstRepo = page.locator('[data-testid="project-enhancement-repo-card-awesome-project"]');
    await expect(firstRepo.locator('[data-testid="repo-card-name"]')).toContainText('awesome-project');
    await expect(firstRepo.locator('[data-testid="repo-card-description"]')).toContainText('A full-featured web application');
    
    await firstRepo.click();
    
    // Verify repository selection
    await expect(firstRepo).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="project-enhancement-button-analyze-trigger"]')).toBeEnabled();
    
    // Step 3: README Analysis
    await page.click('[data-testid="project-enhancement-button-analyze-trigger"]');
    
    // Verify analysis loading state
    await expect(page.locator('[data-testid="project-enhancement-analyzing-spinner"]')).toBeVisible();
    
    // Wait for analysis completion
    await page.waitForSelector('[data-testid="project-enhancement-analysis-results"]');
    
    // Verify analysis results
    await expect(page.locator('[data-testid="project-enhancement-analysis-confidence"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-analysis-gaps"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-analysis-suggestions"]')).toBeVisible();
    
    // Step 4: Enhancement Questionnaire
    await page.click('[data-testid="project-enhancement-button-proceed-enhancement-trigger"]');
    
    // Fill enhancement details
    await page.fill(
      '[data-testid="project-enhancement-input-business-context"]',
      'This project helped me learn full-stack development and user experience design'
    );
    
    await page.fill(
      '[data-testid="project-enhancement-input-impact-metrics"]',
      'Reduced user task completion time by 40% and increased user engagement'
    );
    
    await page.fill(
      '[data-testid="project-enhancement-input-technical-challenges"]',
      'Implemented real-time updates using WebSockets and optimized database queries'
    );
    
    // Step 5: CV Description Generation
    await page.click('[data-testid="project-enhancement-button-generate-description-trigger"]');
    
    // Verify points deduction warning
    await expect(page.locator('[data-testid="project-enhancement-points-warning"]')).toContainText('This will cost');
    await page.click('[data-testid="project-enhancement-confirm-points-trigger"]');
    
    // Verify generation loading
    await expect(page.locator('[data-testid="project-enhancement-generating-spinner"]')).toBeVisible();
    
    // Wait for CV description generation
    await page.waitForSelector('[data-testid="project-enhancement-generated-description"]');
    
    // Verify generated content follows "Problem → Solution → Impact" structure
    const generatedText = page.locator('[data-testid="project-enhancement-generated-description"]');
    await expect(generatedText).toBeVisible();
    await expect(generatedText).toContainText('problem'); // Problem section
    await expect(generatedText).toContainText('solution'); // Solution section
    await expect(generatedText).toContainText('impact'); // Impact section
    
    // Step 6: Review and Accept
    await page.click('[data-testid="project-enhancement-button-accept-description-trigger"]');
    
    // Verify success and CV score update
    await expect(page.locator('[data-testid="project-enhancement-success-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-cv-score-improvement"]')).toContainText('+');
    
    // Verify project is saved to profile
    await page.click('[data-testid="project-enhancement-button-view-profile-trigger"]');
    await page.waitForURL('/developer/profile');
    await expect(page.locator('[data-testid="profile-project-awesome-project"]')).toBeVisible();
  });

  test('GitHub API failure with manual entry fallback', async ({ page }) => {
    await authHelper.loginAsUserType('junior_developer');
    await testDataHelper.uploadTestCV('minimal_projects');
    
    await page.goto('/developer/projects/enhance');
    
    // Mock GitHub API failure
    await page.route('**/api/github/connect', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'GitHub API unavailable' })
      });
    });
    
    // Attempt GitHub connection
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="project-enhancement-github-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-github-error-message"]')).toContainText('GitHub API unavailable');
    
    // Verify manual entry fallback appears
    await expect(page.locator('[data-testid="project-enhancement-manual-entry-option"]')).toBeVisible();
    
    // Use manual entry
    await page.click('[data-testid="project-enhancement-button-manual-entry-trigger"]');
    
    // Fill manual project details
    await page.fill('[data-testid="project-enhancement-manual-input-name"]', 'My Portfolio Website');
    await page.fill('[data-testid="project-enhancement-manual-input-description"]', 'Personal portfolio showcasing my development skills');
    await page.fill('[data-testid="project-enhancement-manual-input-technologies"]', 'React, TypeScript, Tailwind CSS');
    
    // Proceed with manual enhancement
    await page.click('[data-testid="project-enhancement-manual-button-proceed-trigger"]');
    
    // Verify manual enhancement flow continues
    await expect(page.locator('[data-testid="project-enhancement-manual-questionnaire"]')).toBeVisible();
  });

  test('Insufficient points handling and upgrade flow', async ({ page }) => {
    await authHelper.loginAsUserType('junior_developer');
    
    // Set user points to 0
    await authHelper.setUserPoints(0);
    
    await testDataHelper.uploadTestCV('minimal_projects');
    await page.goto('/developer/projects/enhance');
    
    // Complete setup to generation step
    await testDataHelper.mockGitHubRepositories('good_readmes');
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-repository-list"]');
    
    await page.click('[data-testid="project-enhancement-repo-card-awesome-project"]');
    await page.click('[data-testid="project-enhancement-button-analyze-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-analysis-results"]');
    
    await page.click('[data-testid="project-enhancement-button-proceed-enhancement-trigger"]');
    
    // Fill questionnaire
    await page.fill('[data-testid="project-enhancement-input-business-context"]', 'Test context');
    await page.fill('[data-testid="project-enhancement-input-impact-metrics"]', 'Test metrics');
    
    // Attempt generation with insufficient points
    await page.click('[data-testid="project-enhancement-button-generate-description-trigger"]');
    
    // Verify insufficient points modal
    await expect(page.locator('[data-testid="project-enhancement-insufficient-points-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="insufficient-points-message"]')).toContainText('insufficient points');
    
    // Verify upgrade options
    await expect(page.locator('[data-testid="insufficient-points-button-upgrade-trigger"]')).toBeVisible();
    await expect(page.locator('[data-testid="insufficient-points-pricing-info"]')).toBeVisible();
    
    // Test upgrade flow
    await page.click('[data-testid="insufficient-points-button-upgrade-trigger"]');
    await page.waitForURL(/.*subscription.*/);
  });

  test('Portfolio assessment accuracy - different user types', async ({ page }) => {
    // Test 1: User with no projects (should trigger suggestion)
    await authHelper.loginAsUserType('new_user');
    await testDataHelper.uploadTestCV('no_projects');
    
    await page.goto('/developer/cv-analysis');
    await page.click('[data-testid="cv-analysis-button-get-suggestions-trigger"]');
    
    // Should show project enhancement suggestion
    await expect(page.locator('[data-testid="cv-analysis-project-recommendation-card"]')).toBeVisible();
    
    // Test 2: Experienced user with good projects (should NOT trigger suggestion)
    await authHelper.loginAsUserType('experienced_developer');
    await testDataHelper.uploadTestCV('good_projects');
    
    await page.goto('/developer/cv-analysis');
    await page.click('[data-testid="cv-analysis-button-get-suggestions-trigger"]');
    
    // Should NOT show project enhancement suggestion
    await expect(page.locator('[data-testid="cv-analysis-project-recommendation-card"]')).not.toBeVisible();
  });

  test('README analysis quality assessment', async ({ page }) => {
    await authHelper.loginAsUserType('junior_developer');
    await page.goto('/developer/projects/enhance');
    
    // Test with empty README
    await testDataHelper.mockGitHubRepositories('empty_readmes');
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-repository-list"]');
    
    await page.click('[data-testid="project-enhancement-repo-card-project1"]');
    await page.click('[data-testid="project-enhancement-button-analyze-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-analysis-results"]');
    
    // Verify low confidence score for empty README
    const confidenceScore = page.locator('[data-testid="project-enhancement-analysis-confidence-score"]');
    await expect(confidenceScore).toContainText('Low'); // Expecting low confidence
    
    // Verify specific gaps are identified
    await expect(page.locator('[data-testid="project-enhancement-gap-business-context"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-gap-impact-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-enhancement-gap-technical-details"]')).toBeVisible();
  });

  test('Mobile responsive enhancement flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await authHelper.loginAsUserType('junior_developer');
    await testDataHelper.uploadTestCV('minimal_projects');
    
    await page.goto('/developer/projects/enhance');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="project-enhancement-container"]')).toBeVisible();
    
    // Test GitHub connection on mobile
    await testDataHelper.mockGitHubRepositories('good_readmes');
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    
    await page.waitForSelector('[data-testid="project-enhancement-repository-list"]');
    
    // Verify mobile repository cards
    const repoCards = page.locator('[data-testid^="project-enhancement-repo-card-"]');
    await expect(repoCards.first()).toBeVisible();
    
    // Test mobile selection and analysis
    await repoCards.first().click();
    await page.click('[data-testid="project-enhancement-button-analyze-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-analysis-results"]');
    
    // Verify mobile analysis display
    await expect(page.locator('[data-testid="project-enhancement-analysis-confidence"]')).toBeVisible();
  });

  test('Multiple project enhancement workflow', async ({ page }) => {
    await authHelper.loginAsUserType('junior_developer');
    await testDataHelper.uploadTestCV('minimal_projects');
    
    await page.goto('/developer/projects/enhance');
    
    // Set up and enhance first project
    await testDataHelper.mockGitHubRepositories('good_readmes');
    await page.click('[data-testid="project-enhancement-button-connect-github-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-repository-list"]');
    
    // Enhance first project
    await page.click('[data-testid="project-enhancement-repo-card-awesome-project"]');
    await page.click('[data-testid="project-enhancement-button-analyze-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-analysis-results"]');
    
    await page.click('[data-testid="project-enhancement-button-proceed-enhancement-trigger"]');
    await page.fill('[data-testid="project-enhancement-input-business-context"]', 'First project context');
    await page.click('[data-testid="project-enhancement-button-generate-description-trigger"]');
    await page.click('[data-testid="project-enhancement-confirm-points-trigger"]');
    await page.waitForSelector('[data-testid="project-enhancement-generated-description"]');
    await page.click('[data-testid="project-enhancement-button-accept-description-trigger"]');
    
    // Start second project enhancement
    await page.click('[data-testid="project-enhancement-button-enhance-another-trigger"]');
    
    // Should return to repository list
    await expect(page.locator('[data-testid="project-enhancement-repository-list"]')).toBeVisible();
    
    // Verify first project is marked as enhanced
    await expect(page.locator('[data-testid="project-enhancement-repo-card-awesome-project"]')).toHaveClass(/enhanced/);
    
    // Enhance second project
    await page.click('[data-testid="project-enhancement-repo-card-api-service"]');
    // Continue with second project enhancement...
  });

  test('Enhancement history and portfolio management', async ({ page }) => {
    await authHelper.loginAsUserType('junior_developer');
    
    // Navigate to portfolio management
    await page.goto('/developer/portfolio');
    
    // Verify portfolio dashboard
    await expect(page.locator('[data-testid="portfolio-dashboard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="portfolio-stats-enhanced-projects"]')).toBeVisible();
    
    // View enhancement history
    await page.click('[data-testid="portfolio-button-view-history-trigger"]');
    
    // Verify history displays
    await expect(page.locator('[data-testid="portfolio-history-container"]')).toBeVisible();
    
    // Test portfolio export
    await page.click('[data-testid="portfolio-button-export-trigger"]');
    await expect(page.locator('[data-testid="portfolio-export-modal"]')).toBeVisible();
    
    // Test different export formats
    await page.click('[data-testid="portfolio-export-format-pdf"]');
    await page.click('[data-testid="portfolio-button-download-trigger"]');
    
    // Verify download initiated (would need file system testing)
    await expect(page.locator('[data-testid="portfolio-export-success"]')).toBeVisible();
  });
}); 