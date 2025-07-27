import { Page, expect } from '@playwright/test';

export class AuthPage {
  constructor(public page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions
  async login(email: string, password: string) {
    // Wait for form to be ready
    await this.page.waitForSelector('input[type="email"]');
    
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
  }

  async submitLoginForm() {
    await this.page.click('button[type="submit"]');
  }

  async clickSignUpLink() {
    await this.page.click('a[href*="signup"]');
  }

  // Assertions
  async expectLoginSuccess() {
    // Should redirect to dashboard
    await expect(this.page).toHaveURL(/.*\/developer\/dashboard/);
  }

  async expectLoginError() {
    // Should show error message
    await expect(this.page.locator('text=Invalid credentials')).toBeVisible();
  }

  async expectFormValidationError(field: 'email' | 'password') {
    // Should show field-specific validation
    await expect(this.page.locator(`[data-error="${field}"]`)).toBeVisible();
  }

  async expectOnSignInPage() {
    await expect(this.page).toHaveURL(/.*\/auth\/signin/);
    await expect(this.page.locator('input[type="email"]')).toBeVisible();
  }

  // Getters for elements
  get emailInput() {
    return this.page.locator('input[type="email"]');
  }

  get passwordInput() {
    return this.page.locator('input[type="password"]');
  }

  get submitButton() {
    return this.page.locator('button[type="submit"]');
  }

  get errorMessage() {
    return this.page.locator('[data-testid="error-message"], .error, .alert-error');
  }
} 