import { Page, expect } from '@playwright/test';

/**
 * Authentication helper for E2E tests
 * Provides methods for login, logout, and user management
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to sign-in page
   */
  async goto() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.page.waitForSelector('input[type="email"]');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await expect(this.page).toHaveURL(/.*\/developer\/dashboard/);
  }

  /**
   * Login as specific user type for testing
   */
  async loginAsUserType(userType: 'junior_developer' | 'experienced_developer' | 'new_user') {
    const users = {
      junior_developer: { email: 'junior@test.techrec.com', password: 'testpass123' },
      experienced_developer: { email: 'senior@test.techrec.com', password: 'testpass123' },
      new_user: { email: 'newbie@test.techrec.com', password: 'testpass123' }
    };

    const user = users[userType];
    await this.goto();
    await this.login(user.email, user.password);
  }

  /**
   * Ensure user is logged in (opposite of ensureLoggedOut)
   */
  async ensureLoggedIn(userType: 'junior_developer' | 'experienced_developer' | 'new_user' = 'junior_developer') {
    // Check if already logged in by trying to access dashboard
    await this.page.goto('/developer/dashboard');
    
    if (!this.page.url().includes('/auth/signin')) {
      // Already logged in
      return;
    }
    
    // Not logged in, so log in
    await this.loginAsUserType(userType);
  }

  /**
   * Ensure user is logged out
   */
  async ensureLoggedOut() {
    // Try to go to a protected page
    await this.page.goto('/developer/dashboard');
    
    // If we're redirected to signin, we're already logged out
    if (this.page.url().includes('/auth/signin')) {
      return;
    }
    
    // If we're still on the dashboard, logout
    try {
      // Look for logout button/menu
      const logoutButton = this.page.locator('[data-testid="nav-logout-button"], [data-testid="user-menu-logout"], button:has-text("Logout"), button:has-text("Sign Out")');
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
      } else {
        // Clear session manually
        await this.page.goto('/api/auth/signout');
        await this.page.waitForLoadState('networkidle');
      }
    } catch (error) {
      // Fallback: clear cookies and local storage
      await this.page.context().clearCookies();
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    
    // Verify we're logged out
    await this.page.goto('/developer/dashboard');
    await expect(this.page).toHaveURL(/.*\/auth\/signin/);
  }

  /**
   * Set user points for testing premium features
   */
  async setUserPoints(points: number) {
    // This would typically involve API calls or database manipulation
    // For now, we'll mock it through the API
    await this.page.evaluate(async (pointsValue) => {
      try {
        const response = await fetch('/api/test/set-user-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: pointsValue })
        });
        
        if (!response.ok) {
          console.warn('Failed to set user points:', response.statusText);
        }
      } catch (error) {
        console.warn('Points setting not implemented:', error);
      }
    }, points);
  }

  /**
   * Verify user is on sign-in page
   */
  async expectOnSignInPage() {
    await expect(this.page).toHaveURL(/.*\/auth\/signin/);
    await expect(this.page.locator('input[type="email"]')).toBeVisible();
  }

  /**
   * Verify successful login
   */
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/.*\/developer\/dashboard/);
  }

  /**
   * Verify login error message
   */
  async expectLoginError() {
    await expect(this.page.locator('text=Invalid credentials')).toBeVisible();
  }

  /**
   * Get current user's email (if logged in)
   */
  async getCurrentUserEmail(): Promise<string | null> {
    try {
      return await this.page.evaluate(() => {
        // This would depend on how user info is stored in the app
        const userElement = document.querySelector('[data-testid="user-email"], [data-user-email]');
        return userElement?.textContent || null;
      });
    } catch {
      return null;
    }
  }

  /**
   * Wait for authentication state to settle
   */
  async waitForAuthState(timeout: number = 10000) {
    await this.page.waitForLoadState('networkidle');
    
    // Wait for either dashboard or signin page
    await this.page.waitForFunction(() => {
      return window.location.pathname.includes('/developer/') || 
             window.location.pathname.includes('/auth/signin');
    }, { timeout });
  }
}