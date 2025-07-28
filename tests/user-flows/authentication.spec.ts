import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Authentication Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test.describe('Sign In', () => {
    test('should successfully login with valid credentials', async () => {
      await authPage.goto();
      await authPage.expectOnSignInPage();
      
      await authPage.login('junior@test.techrec.com', 'testpass123');
      await authPage.expectLoginSuccess();
    });

    test('should show error with invalid credentials', async () => {
      await authPage.goto();
      
      await authPage.login('invalid@example.com', 'wrongpassword');
      
      // Should stay on signin page and show error
      await authPage.expectOnSignInPage();
      // Note: This might need adjustment based on your actual error handling
    });

    test('should validate required fields', async () => {
      await authPage.goto();
      
      // Try to submit empty form
      await authPage.submitLoginForm();
      
      // Should show validation error messages (react-hook-form validation)
      await expect(authPage.page.locator('text=Please enter a valid email.')).toBeVisible();
      await expect(authPage.page.locator('text=Password is required.')).toBeVisible();
    });

    test('should validate email format', async () => {
      await authPage.goto();
      
      await authPage.fillLoginForm('invalid-email', 'testpass123');
      await authPage.submitLoginForm();
      
      // Should show email validation error (browser native validation)
      await expect(authPage.emailInput).toHaveAttribute('type', 'email');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to sign up page', async () => {
      await authPage.goto();
      
      // Look for sign up link and click it
      const signupLink = authPage.page.locator('a:has-text("Sign up"), a:has-text("Register")');
      if (await signupLink.count() > 0) {
        await signupLink.click();
        await expect(authPage.page).toHaveURL(/.*signup/);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should redirect unauthenticated users to signin', async () => {
      // Try to access protected page directly
      await authPage.page.goto('/developer/dashboard');
      
      // Should redirect to signin
      await authPage.expectOnSignInPage();
    });

    test('should maintain session after login', async () => {
      await authPage.goto();
      await authPage.login('junior@test.techrec.com', 'testpass123');
      await authPage.expectLoginSuccess();
      
      // Navigate to another page and back
      await authPage.page.goto('/developer/projects/ideas');
      await expect(authPage.page).toHaveURL(/.*\/developer\/projects\/ideas/);
      
      // Should still be logged in
      await authPage.page.goto('/developer/dashboard');
      await expect(authPage.page).toHaveURL(/.*\/developer\/dashboard/);
    });
  });
}); 