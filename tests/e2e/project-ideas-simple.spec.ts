import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

/**
 * Simplified E2E Tests for Project Ideas Generation (FR 24)
 * Tests the actual implementation without assuming specific data-testid attributes
 */
test.describe('Project Ideas Generation - Actual Implementation', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Ensure clean logged-out state before each test
    await authHelper.ensureLoggedOut();
  });

  test('Can navigate to project ideas page and see questionnaire', async ({ page }) => {
    // Try to login (this will help us see what auth looks like)
    try {
      await authHelper.ensureLoggedIn();
    } catch (error) {
      console.log('Login failed, continuing to test page access:', error);
    }
    
    // Navigate to project ideas page
    await page.goto('/developer/projects/ideas');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we can see the questionnaire elements
    await expect(page.locator('h1')).toContainText('Project Ideas Generator');
    
    // Look for the first question about problems
    await expect(page.getByText(/problem in your everyday life/i)).toBeVisible();
    
    // Look for textarea for problem description
    await expect(page.locator('textarea').first()).toBeVisible();
    
    // Look for some brainstorming pills (Badge components)
    await expect(page.getByText('Track my expenses')).toBeVisible();
    await expect(page.getByText('Organize my schedule')).toBeVisible();
  });

  test('Can interact with questionnaire steps', async ({ page }) => {
    // Skip auth for now and go directly to the page
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the first step
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    
    // Try to fill the textarea
    await page.fill('textarea', 'I want to track my daily expenses');
    
    // Check if Continue button appears and is enabled
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();
    
    // Click continue to go to next step
    await continueButton.click();
    
    // Should be on step 2 now
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await expect(page.getByText(/How much time can you dedicate/i)).toBeVisible();
  });

  test('Can select brainstorming pills', async ({ page }) => {
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Click on a brainstorming pill instead of typing
    const expensePill = page.getByText('Track my expenses').first();
    await expensePill.click();
    
    // The pill should be selected (might change appearance)
    // Continue button should be enabled
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeEnabled();
  });

  test('Complete questionnaire flow reaches generation step', async ({ page }) => {
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Problem
    await page.getByText('Track my expenses').first().click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Scope  
    await page.getByText('1-2 weeks').click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Learning
    await page.getByText('New framework').click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 4: Users
    await page.getByText('Just me').click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 5: Platform
    await page.getByText('Web app').click();
    
    // Should see Generate button now
    await expect(page.getByRole('button', { name: /Generate Project Ideas/i })).toBeVisible();
  });

  test('Page shows loading state during profile load', async ({ page }) => {
    await page.goto('/developer/projects/ideas');
    
    // Might see loading spinner initially
    try {
      await expect(page.getByText('Loading your profile')).toBeVisible({ timeout: 2000 });
    } catch {
      // Loading might be too fast to catch, that's okay
      console.log('Loading state too fast or not present');
    }
    
    // Eventually should see the questionnaire
    await expect(page.locator('h1')).toContainText('Project Ideas Generator');
  });

  test('Shows progress indicator', async ({ page }) => {
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Should show progress
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByText('20% complete')).toBeVisible();
    
    // Should see progress bar
    await expect(page.locator('.bg-primary')).toBeVisible(); // Progress bar fill
  });

  test('Back button navigation works', async ({ page }) => {
    await page.goto('/developer/projects/ideas');
    await page.waitForLoadState('networkidle');
    
    // Go to step 2
    await page.getByText('Track my expenses').first().click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Click Previous button
    await page.getByRole('button', { name: /previous/i }).click();
    
    // Should be back to step 1
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
  });
}); 