import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';
import { TestDataHelper } from './utils/test-data-helper';

/**
 * E2E Tests for Project Ideas Generation (FR 24)
 * Tests the complete user journey from questionnaire to project planning
 */
test.describe('Project Ideas Generation (FR 24)', () => {
  let authHelper: AuthHelper;
  let testDataHelper: TestDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
    
    // Set up AI mocking for consistent test results
    await testDataHelper.mockAIResponses('success');
  });

  test('Complete project ideas generation flow - happy path', async ({ page }) => {
    // Login as a user who needs project ideas
    await authHelper.loginAsUserType('new_user');
    
    // Navigate to project ideas page
    await page.goto('/developer/projects/ideas');
    
    // Verify page loaded correctly
    await expect(page.locator('[data-testid="project-ideas-wizard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-ideas-wizard-title"]')).toContainText('Get New Project Ideas');

    // Step 1: Fill problem statement with custom text
    await page.fill(
      '[data-testid="project-ideas-input-problem-statement"]',
      'I want to track my daily expenses and budget better'
    );

    // Verify auto-save is working
    await testDataHelper.waitForAutoSave();

    // Step 2: Select project scope using pills
    await page.click('[data-testid="project-ideas-pill-scope-1-month"]');
    
    // Verify pill is selected
    await expect(page.locator('[data-testid="project-ideas-pill-scope-1-month"]')).toHaveClass(/selected/);

    // Step 3: Select multiple learning goals
    await page.click('[data-testid="project-ideas-pill-learning-new-framework"]');
    await page.click('[data-testid="project-ideas-pill-learning-backend-skills"]');
    
    // Verify multiple selection works
    await expect(page.locator('[data-testid="project-ideas-pill-learning-new-framework"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="project-ideas-pill-learning-backend-skills"]')).toHaveClass(/selected/);

    // Step 4: Select target users
    await page.click('[data-testid="project-ideas-pill-users-just-me"]');

    // Step 5: Select platform preference
    await page.click('[data-testid="project-ideas-pill-platform-web-app"]');

    // Wait for form validation to complete
    await page.waitForSelector('[data-testid="project-ideas-button-generate-trigger"]:not([disabled])');

    // Generate project ideas
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="project-ideas-spinner-generating"]')).toBeVisible();
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="project-ideas-card-grid-container"]', { timeout: 15000 });
    
    // Verify project cards are displayed
    const projectCards = page.locator('[data-testid^="project-ideas-card-project-"]');
    await expect(projectCards).toHaveCount(2); // Expecting 2-3 projects
    
    // Verify each card has required elements
    const firstCard = page.locator('[data-testid="project-ideas-card-project-1"]');
    await expect(firstCard.locator('[data-testid="project-card-title"]')).toContainText('Personal Finance Tracker');
    await expect(firstCard.locator('[data-testid="project-card-difficulty"]')).toContainText('Beginner');
    await expect(firstCard.locator('[data-testid="project-card-skills"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="project-card-time-estimate"]')).toContainText('2-3 weeks');

    // Select a project card
    await firstCard.click();
    
    // Verify navigation to detailed plan page
    await page.waitForURL(/\/developer\/projects\/plan\/.*\/1/);
    await expect(page.locator('[data-testid="project-plan-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-plan-title"]')).toContainText('Personal Finance Tracker');
    
    // Verify plan content is displayed
    await expect(page.locator('[data-testid="project-plan-phases"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-plan-setup-instructions"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-plan-resources"]')).toBeVisible();
    
    // Verify navigation breadcrumb
    await expect(page.locator('[data-testid="project-plan-breadcrumb"]')).toBeVisible();
    
    // Test back navigation
    await page.click('[data-testid="project-plan-button-back-to-cards"]');
    await expect(page.locator('[data-testid="project-ideas-card-grid-container"]')).toBeVisible();
  });

  test('Project ideas generation with pills vs custom text conflict resolution', async ({ page }) => {
    await authHelper.loginAsUserType('new_user');
    await page.goto('/developer/projects/ideas');

    // First select a pill
    await page.click('[data-testid="project-ideas-pill-problem-track-expenses"]');
    
    // Verify pill is selected
    await expect(page.locator('[data-testid="project-ideas-pill-problem-track-expenses"]')).toHaveClass(/selected/);
    
    // Then type custom text (should override pill)
    await page.fill(
      '[data-testid="project-ideas-input-problem-statement"]',
      'I want to build a recipe sharing platform'
    );
    
    // Verify pill is deselected when custom text is entered
    await expect(page.locator('[data-testid="project-ideas-pill-problem-track-expenses"]')).not.toHaveClass(/selected/);
    
    // Complete the rest of the form
    await page.click('[data-testid="project-ideas-pill-scope-weekend-project"]');
    await page.click('[data-testid="project-ideas-pill-learning-ui-ux-design"]');
    await page.click('[data-testid="project-ideas-pill-users-friends-family"]');
    await page.click('[data-testid="project-ideas-pill-platform-web-app"]');
    
    // Generate ideas and verify custom text took precedence
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    await page.waitForSelector('[data-testid="project-ideas-card-grid-container"]');
    
    // The generated projects should be related to recipe sharing, not expense tracking
    const firstCard = page.locator('[data-testid="project-ideas-card-project-1"]');
    await expect(firstCard.locator('[data-testid="project-card-title"]')).not.toContainText('Expense');
  });

  test('Session recovery after browser refresh', async ({ page }) => {
    await authHelper.loginAsUserType('new_user');
    await page.goto('/developer/projects/ideas');

    // Fill out questionnaire partially
    await page.fill(
      '[data-testid="project-ideas-input-problem-statement"]',
      'Test problem statement for recovery'
    );
    await page.click('[data-testid="project-ideas-pill-scope-1-week"]');
    await page.click('[data-testid="project-ideas-pill-learning-new-framework"]');
    
    // Wait for auto-save
    await testDataHelper.waitForAutoSave();
    
    // Refresh the page
    await page.reload();
    
    // Verify session recovery
    await expect(page.locator('[data-testid="project-ideas-session-recovery-banner"]')).toBeVisible();
    await page.click('[data-testid="project-ideas-button-recover-session"]');
    
    // Verify form state is recovered
    await expect(page.locator('[data-testid="project-ideas-input-problem-statement"]')).toHaveValue('Test problem statement for recovery');
    await expect(page.locator('[data-testid="project-ideas-pill-scope-1-week"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="project-ideas-pill-learning-new-framework"]')).toHaveClass(/selected/);
  });

  test('Error handling - AI generation failure', async ({ page }) => {
    // Set up AI to fail
    await testDataHelper.mockAIResponses('failure');
    
    await authHelper.loginAsUserType('new_user');
    await page.goto('/developer/projects/ideas');
    
    // Fill out questionnaire
    await testDataHelper.fillProjectIdeasQuestionnaire({
      problemStatement: 'Test problem',
      projectScope: '1-month',
      learningGoals: ['new-framework'],
      targetUsers: 'just-me',
      platformPreference: 'web-app'
    });
    
    // Attempt generation
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="project-ideas-error-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-ideas-error-message"]')).toContainText('AI service unavailable');
    
    // Verify retry mechanism
    await expect(page.locator('[data-testid="project-ideas-button-retry-trigger"]')).toBeVisible();
    
    // Test fallback generation
    await page.click('[data-testid="project-ideas-button-use-templates-trigger"]');
    await expect(page.locator('[data-testid="project-ideas-fallback-templates"]')).toBeVisible();
  });

  test('Insufficient points handling', async ({ page }) => {
    await authHelper.loginAsUserType('new_user');
    
    // Set user points to 0 (would need API endpoint)
    await authHelper.setUserPoints(0);
    
    await page.goto('/developer/projects/ideas');
    
    // Fill out questionnaire
    await testDataHelper.fillProjectIdeasQuestionnaire({
      problemStatement: 'Test problem',
      projectScope: '1-month',
      learningGoals: ['new-framework'],
      targetUsers: 'just-me',
      platformPreference: 'web-app'
    });
    
    // Attempt generation
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    
    // Verify upgrade prompt
    await expect(page.locator('[data-testid="project-ideas-upgrade-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-ideas-upgrade-message"]')).toContainText('insufficient points');
    await expect(page.locator('[data-testid="project-ideas-button-upgrade-trigger"]')).toBeVisible();
  });

  test('Mobile responsive behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await authHelper.loginAsUserType('new_user');
    await page.goto('/developer/projects/ideas');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="project-ideas-wizard-container"]')).toBeVisible();
    
    // Test pill interaction on mobile
    await page.click('[data-testid="project-ideas-pill-scope-weekend-project"]');
    await expect(page.locator('[data-testid="project-ideas-pill-scope-weekend-project"]')).toHaveClass(/selected/);
    
    // Fill form and generate
    await page.fill('[data-testid="project-ideas-input-problem-statement"]', 'Mobile test');
    await page.click('[data-testid="project-ideas-pill-learning-mobile-development"]');
    await page.click('[data-testid="project-ideas-pill-users-just-me"]');
    await page.click('[data-testid="project-ideas-pill-platform-mobile-app"]');
    
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    await page.waitForSelector('[data-testid="project-ideas-card-grid-container"]');
    
    // Verify mobile card layout
    const cards = page.locator('[data-testid^="project-ideas-card-project-"]');
    await expect(cards.first()).toBeVisible();
    
    // Test mobile navigation to plan
    await cards.first().click();
    await page.waitForURL(/\/developer\/projects\/plan\/.*/);
    await expect(page.locator('[data-testid="project-plan-container"]')).toBeVisible();
  });

  test('Session history and management', async ({ page }) => {
    await authHelper.loginAsUserType('new_user');
    
    // Create first session
    await page.goto('/developer/projects/ideas');
    await testDataHelper.fillProjectIdeasQuestionnaire({
      problemStatement: 'First session test',
      projectScope: '1-week',
      learningGoals: ['new-framework'],
      targetUsers: 'just-me',
      platformPreference: 'web-app'
    });
    await page.click('[data-testid="project-ideas-button-generate-trigger"]');
    await page.waitForSelector('[data-testid="project-ideas-card-grid-container"]');
    
    // Navigate to session history
    await page.click('[data-testid="project-ideas-button-view-history"]');
    await expect(page.locator('[data-testid="project-ideas-history-container"]')).toBeVisible();
    
    // Verify session appears in history
    const historyItems = page.locator('[data-testid^="project-ideas-history-item-"]');
    await expect(historyItems).toHaveCount(1);
    await expect(historyItems.first().locator('[data-testid="history-item-problem"]')).toContainText('First session test');
    
    // Test session deletion
    await historyItems.first().locator('[data-testid="history-item-button-delete"]').click();
    await page.click('[data-testid="project-ideas-confirm-delete-trigger"]');
    await expect(historyItems).toHaveCount(0);
  });
}); 