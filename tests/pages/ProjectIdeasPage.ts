import { Page, expect } from '@playwright/test';

export interface QuestionnaireAnswers {
  problem?: string;
  skills?: string;
  experience?: string;
  timeframe?: string;
  preferences?: string;
}

export class ProjectIdeasPage {
  constructor(public page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/developer/projects/ideas');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions - Questionnaire Flow
  async fillQuestionnaire(answers: QuestionnaireAnswers) {
    // Wait for questionnaire to load
    await this.page.waitForSelector('textarea, input[type="text"]');

    if (answers.problem) {
      const problemField = this.page.locator('textarea').first();
      await problemField.fill(answers.problem);
    }

    if (answers.skills) {
      const skillsField = this.page.locator('input[placeholder*="skills" i], textarea').nth(1);
      if (await skillsField.count() > 0) {
        await skillsField.fill(answers.skills);
      }
    }

    if (answers.experience) {
      const experienceField = this.page.locator('select, input[type="radio"]').first();
      if (await experienceField.count() > 0) {
        await experienceField.selectOption(answers.experience);
      }
    }
  }

  async clickGetStarted() {
    await this.page.click('button:has-text("Get Started"), button:has-text("Start")');
  }

  async generateIdeas() {
    // Look for the generate button
    const generateButton = this.page.locator(
      'button:has-text("Generate Ideas"), button:has-text("Start Generating"), button[type="submit"]'
    ).first();
    
    await generateButton.click();
    
    // Wait for generation to complete
    await this.page.waitForSelector('[data-testid*="project"], .project-card, .idea-card', {
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
    await expect(this.page.locator('textarea, form')).toBeVisible();
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
    return this.page.locator(
      'button:has-text("Generate"), button:has-text("Start Generating"), button[type="submit"]'
    ).first();
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