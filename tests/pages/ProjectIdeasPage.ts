import { Page, expect } from '@playwright/test';

export interface QuestionnaireAnswers {
  problem?: string;      // Step 1: Problem statement (textarea)
  timeframe?: string;    // Step 2: Project scope (1-2 weeks, 1 month, etc.)
  skills?: string;       // Step 3: Learning goals (New framework, Backend skills, etc.)
  experience?: string;   // Step 4: Target users (Just me, General public, etc.)
  preferences?: string;  // Step 5: Platform preference (Web app, Mobile app, etc.)
}

export class ProjectIdeasPage {
  constructor(public page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/developer/projects/ideas');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions - Questionnaire Flow (5 steps)
  async fillQuestionnaire(answers: QuestionnaireAnswers) {
    // Wait for questionnaire to load
    await this.page.waitForSelector('textarea');

    // Step 1: Problem statement
    if (answers.problem) {
      const problemField = this.page.locator('textarea').first();
      await problemField.fill(answers.problem);
    }
    await this.clickContinue();

    // Step 2: Project scope (timeframe)
    if (answers.timeframe) {
      const scopeButton = this.page.locator(`button:has-text("${answers.timeframe}")`).first();
      await scopeButton.click();
    }
    await this.clickContinue();

    // Step 3: Learning goals (skills)
    if (answers.skills) {
      const learningButton = this.page.locator(`button:has-text("${answers.skills}")`).first();
      await learningButton.click();
    }
    await this.clickContinue();

    // Step 4: Target users
    if (answers.experience) {
      const usersButton = this.page.locator(`button:has-text("${answers.experience}")`).first();
      await usersButton.click();
    }
    await this.clickContinue();

    // Step 5: Platform preference (final step)
    if (answers.preferences) {
      const platformButton = this.page.locator(`button:has-text("${answers.preferences}")`).first();
      await platformButton.click();
    }
    
    // Now on final step - ready to generate
  }

  async clickContinue() {
    const continueButton = this.page.locator('button:has-text("Continue")');
    await continueButton.click();
    await this.page.waitForTimeout(500); // Wait for step transition
  }

  async clickGetStarted() {
    await this.page.click('button:has-text("Get Started"), button:has-text("Start")');
  }

  async generateIdeas() {
    // Wait for the final step to load and generate button to be available
    await this.page.waitForSelector('button:has-text("Generate Project Ideas")', { timeout: 10000 });
    
    const generateButton = this.page.locator('button:has-text("Generate Project Ideas")');
    await generateButton.click();
    
    // Wait for generation to complete - look for the results section
    await this.page.waitForSelector('h2:has-text("Project Ideas for You"), [data-testid*="project"], .project-card, .idea-card', {
      timeout: 30000 // AI generation can take time
    });
  }

  async clickStartBuilding(cardIndex: number = 0) {
    const startBuildingButtons = this.page.locator('button:has-text("Start Building")');
    await startBuildingButtons.nth(cardIndex).click();
  }

  async selectProjectIdea(index: number = 0) {
    const projectCards = this.page.locator('[data-testid*="project"], .project-card, .idea-card');
    await projectCards.nth(index).click();
  }

  // Assertions
  async expectOnIdeasPage() {
    await expect(this.page).toHaveURL(/.*\/developer\/projects\/ideas/);
  }

  async expectQuestionnaireVisible() {
    // Look for the specific questionnaire elements that exist
    await expect(this.page.locator('textarea')).toBeVisible();
  }

  async expectIdeasGenerated(minimumCount: number = 1) {
    const projectCards = this.page.locator('[data-testid*="project"], .project-card, .idea-card');
    await expect(projectCards).toHaveCount(minimumCount, { timeout: 30000 });
  }

  async expectProjectCard(index: number = 0) {
    const projectCards = this.page.locator('[data-testid*="project"], .project-card, .idea-card');
    await expect(projectCards.nth(index)).toBeVisible();
  }

  async expectStartBuildingButton(index: number = 0) {
    const startBuildingButtons = this.page.locator('button:has-text("Start Building")');
    await expect(startBuildingButtons.nth(index)).toBeVisible();
  }

  async expectValidationError() {
    await expect(
      this.page.locator('[data-testid="error"], .error, .alert-error, text=required')
    ).toBeVisible();
  }

  async expectLoadingState() {
    await expect(
      this.page.locator('[data-testid="loading"], .loading, .spinner, text=generating')
    ).toBeVisible();
  }

  async expectProjectDetails(cardIndex: number = 0) {
    const card = this.page.locator('[data-testid*="project"], .project-card, .idea-card').nth(cardIndex);
    
    // Should have title
    await expect(card.locator('h2, h3, .title')).toBeVisible();
    
    // Should have description or content
    await expect(card.locator('p, .description, .content')).toBeVisible();
  }

  // Getters for common elements
  get questionnaireForm() {
    return this.page.locator('form, [data-testid="questionnaire"]');
  }

  get problemInput() {
    return this.page.locator('textarea').first();
  }

  get generateButton() {
    return this.page.locator('button:has-text("Generate Project Ideas")');
  }

  get projectCards() {
    return this.page.locator('[data-testid*="project"], .project-card, .idea-card');
  }

  get startBuildingButtons() {
    return this.page.locator('button:has-text("Start Building")');
  }

  get loadingIndicator() {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  // Helper methods
  async getProjectCardCount(): Promise<number> {
    return await this.projectCards.count();
  }

  async getProjectTitle(index: number = 0): Promise<string> {
    const card = this.projectCards.nth(index);
    const title = card.locator('h2, h3, .title').first();
    return await title.textContent() || '';
  }
} 