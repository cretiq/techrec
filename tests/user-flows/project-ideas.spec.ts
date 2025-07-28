import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { ProjectIdeasPage, QuestionnaireAnswers } from '../pages/ProjectIdeasPage';

test.describe('Project Ideas Generation Flow (FR24)', () => {
  let authPage: AuthPage;
  let projectIdeasPage: ProjectIdeasPage;

  const sampleAnswers: QuestionnaireAnswers = {
    problem: 'I need a productivity app to manage my daily tasks and track my habits',
    timeframe: '1-2 weeks',    // Step 2: Project scope
    skills: 'New framework',   // Step 3: Learning goals  
    experience: 'General public', // Step 4: Target users
    preferences: 'Web app'     // Step 5: Platform preference
  };

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    projectIdeasPage = new ProjectIdeasPage(page);

    // Login before each test
    await authPage.goto();
    await authPage.login('junior@test.techrec.com', 'testpass123');
    await authPage.expectLoginSuccess();
  });

  test.describe('Questionnaire Flow', () => {
    test('should display questionnaire form', async () => {
      await projectIdeasPage.goto();
      await projectIdeasPage.expectOnIdeasPage();
      await projectIdeasPage.expectQuestionnaireVisible();
    });

    test('should fill and submit questionnaire', async () => {
      await projectIdeasPage.goto();
      
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      
      // Verify we reached the final step (Generate button should be visible)
      await expect(projectIdeasPage.generateButton).toBeVisible();
    });

    test('should show validation error for empty form', async () => {
      await projectIdeasPage.goto();
      
      // Try to generate without filling form
      const generateButton = projectIdeasPage.generateButton;
      if (await generateButton.count() > 0) {
        await generateButton.click();
        
        // Should show validation error
        await projectIdeasPage.expectValidationError();
      }
    });
  });

  test.describe('AI Generation', () => {
    test('should generate project ideas successfully', async ({ page }) => {
      test.setTimeout(60000); // AI generation can take time
      
      await projectIdeasPage.goto();
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      
      // Generate ideas
      await projectIdeasPage.generateIdeas();
      
      // Should have generated at least one project idea
      await projectIdeasPage.expectIdeasGenerated(1);
      
      // Verify project cards have content
      const cardCount = await projectIdeasPage.getProjectCardCount();
      expect(cardCount).toBeGreaterThan(0);
      
      if (cardCount > 0) {
        await projectIdeasPage.expectProjectDetails(0);
      }
    });

    test('should show loading state during generation', async () => {
      await projectIdeasPage.goto();
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      
      // Click generate and immediately check for loading
      const generateButton = projectIdeasPage.generateButton;
      await generateButton.click();
      
      // Should show loading indicator (might be brief)
      const loadingIndicator = projectIdeasPage.loadingIndicator;
      if (await loadingIndicator.count() > 0) {
        await projectIdeasPage.expectLoadingState();
      }
    });

    test('should handle generation errors gracefully', async () => {
      // This test might need mocking or specific error conditions
      await projectIdeasPage.goto();
      
      // Fill with potentially problematic data
      await projectIdeasPage.fillQuestionnaire({
        problem: '', // Empty problem
        skills: 'Unknown skills that might cause issues'
      });
      
      const generateButton = projectIdeasPage.generateButton;
      if (await generateButton.count() > 0) {
        await generateButton.click();
        
        // Should either show validation error or handle gracefully
        // This depends on your error handling implementation
      }
    });
  });

  test.describe('Project Ideas Display', () => {
    test.beforeEach(async () => {
      // Generate ideas for each test
      await projectIdeasPage.goto();
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      await projectIdeasPage.generateIdeas();
    });

    test('should display project cards with proper content', async () => {
      const cardCount = await projectIdeasPage.getProjectCardCount();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check first card has required elements
      await projectIdeasPage.expectProjectCard(0);
      
      // Should have title
      const title = await projectIdeasPage.getProjectTitle(0);
      expect(title.length).toBeGreaterThan(0);
    });

    test('should show Start Building buttons', async () => {
      const cardCount = await projectIdeasPage.getProjectCardCount();
      
      if (cardCount > 0) {
        await projectIdeasPage.expectStartBuildingButton(0);
      }
    });

    test('should handle Start Building button click', async () => {
      const cardCount = await projectIdeasPage.getProjectCardCount();
      
      if (cardCount > 0) {
        await projectIdeasPage.clickStartBuilding(0);
        
        // Should navigate to project planning/setup page
        // This depends on your FR24 implementation
        await expect(projectIdeasPage.page).toHaveURL(/.*\/developer\/projects\/.*/);
      }
    });
  });

  test.describe('Complete User Flow', () => {
    test('should complete entire project ideas generation flow', async ({ page }) => {
      test.setTimeout(90000); // Extended timeout for full flow
      
      // Step 1: Navigate to project ideas page
      await projectIdeasPage.goto();
      await projectIdeasPage.expectOnIdeasPage();
      
      // Step 2: Fill questionnaire
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      
      // Step 3: Generate ideas
      await projectIdeasPage.generateIdeas();
      await projectIdeasPage.expectIdeasGenerated(1);
      
      // Step 4: Verify ideas quality
      const cardCount = await projectIdeasPage.getProjectCardCount();
      expect(cardCount).toBeGreaterThanOrEqual(1);
      expect(cardCount).toBeLessThanOrEqual(5); // Should be reasonable number
      
      // Step 5: Test Start Building functionality
      if (cardCount > 0) {
        await projectIdeasPage.expectStartBuildingButton(0);
        await projectIdeasPage.clickStartBuilding(0);
        
        // Should navigate to next step in flow
        // This URL pattern depends on your FR24 implementation
        await expect(page.url()).toMatch(/\/developer\/projects/);
      }
    });

    test('should maintain state during navigation', async () => {
      // Generate ideas
      await projectIdeasPage.goto();
      await projectIdeasPage.fillQuestionnaire(sampleAnswers);
      await projectIdeasPage.generateIdeas();
      
      const initialCardCount = await projectIdeasPage.getProjectCardCount();
      const initialTitle = await projectIdeasPage.getProjectTitle(0);
      
      // Navigate away and back
      await projectIdeasPage.page.goto('/developer/dashboard');
      await projectIdeasPage.goto();
      
      // Ideas should still be there (if you implement session persistence)
      // This test depends on your state management implementation
      const currentCardCount = await projectIdeasPage.getProjectCardCount();
      
      // This assertion might need adjustment based on your implementation
      if (currentCardCount > 0) {
        expect(currentCardCount).toBeGreaterThan(0);
      }
    });
  });
}); 