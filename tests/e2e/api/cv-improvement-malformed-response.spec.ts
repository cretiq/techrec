import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('CV Improvement API - Retry Mechanism & Response Handling', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn('experienced_developer');
  });

  test('should retry and succeed after initial malformed response', async ({ page }) => {
    let attemptCount = 0;
    
    // Mock Gemini to fail first 6 attempts, succeed on 7th
    await page.route('https://generativelanguage.googleapis.com/v1beta/models/**', route => {
      attemptCount++;
      
      if (attemptCount <= 6) {
        // Return malformed response for first 6 attempts (Gemini format)
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    "suggestions": [
                      {
                        "section": "contactInfo.email",
                        "originalText": "test@gmal.com",
                        "suggestionType": "wording",
                        "suggestedText": "test@gmail.com",
                        "reasoning": "Correct the email address domain"
                      },
                      "reasoning"  // <- Malformed element
                    ]
                  })
                }]
              }
            }]
          })
        });
      } else {
        // Return valid response on 7th attempt (Gemini format)
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    "suggestions": [
                      {
                        "section": "contactInfo.email",
                        "originalText": "test@gmal.com",
                        "suggestionType": "wording",
                        "suggestedText": "test@gmail.com",
                        "reasoning": "Correct the email address domain to ensure professionalism"
                      },
                      {
                        "section": "about",
                        "originalText": "Developer with experience",
                        "suggestionType": "wording",
                        "suggestedText": "Experienced software developer with 5+ years",
                        "reasoning": "Add specific experience level for better impact"
                      }
                    ]
                  })
                }]
              }
            }]
          })
        });
      }
    });

    await page.goto('/developer/cv-management');
    
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping retry test');
      return;
    }

    await expect(profileSection).toBeVisible();

    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();

    // Wait for loading to complete (should succeed after retries)
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 30000 });
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();

    // Should show success toast
    const successToast = page.locator('.toast:has-text("Generated"), [role="alert"]:has-text("Generated")');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Verify that retry mechanism was called (7 attempts should have been made)
    expect(attemptCount).toBe(7);
  });

  test('should handle malformed Gemini responses with trailing string elements', async ({ page }) => {
    // Mock Gemini to return malformed JSON similar to the bug report
    await page.route('https://generativelanguage.googleapis.com/v1beta/models/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  "suggestions": [
                    {
                      "section": "contactInfo.email",
                      "originalText": "test@gmal.com",
                      "suggestionType": "wording",
                      "suggestedText": "test@gmail.com",
                      "reasoning": "Correct the email address domain"
                    },
                    {
                      "section": "about",
                      "originalText": "Developer with experience",
                      "suggestionType": "wording",
                      "suggestedText": "Experienced developer",
                      "reasoning": "Improve wording for impact"
                    },
                    "reasoning"  // <- This malformed element should be filtered out
                  ]
                })
              }]
            }
          }]
        })
      });
    });

    // Navigate to page and set up test data
    await page.goto('/developer/cv-management');
    
    // Skip if no analysis exists
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping malformed response test');
      return;
    }

    await expect(profileSection).toBeVisible();

    // Click Get Suggestions button to trigger the API call
    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await expect(getSuggestionsButton).toBeVisible();
    await getSuggestionsButton.click();

    // Wait for loading to complete
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Verify that the request succeeds despite malformed response
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 15000 });
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();

    // Check that no error toast appears (or if it does, it should be handled gracefully)
    const errorToast = page.locator('.toast:has-text("Error"), [role="alert"]:has-text("Error")');
    const errorCount = await errorToast.count();
    
    // If an error toast appears, it should contain a meaningful message, not a schema validation error
    if (errorCount > 0) {
      const errorText = await errorToast.first().textContent();
      expect(errorText).not.toContain('schema');
      expect(errorText).not.toContain('Expected object, received string');
    }
  });

  test('should handle completely malformed JSON responses gracefully', async ({ page }) => {
    // Mock Gemini to return completely invalid JSON
    await page.route('https://generativelanguage.googleapis.com/v1beta/models/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: '{"suggestions": [{"section": "test", "reasoning": "incomplete'  // Invalid JSON
              }]
            }
          }]
        })
      });
    });

    await page.goto('/developer/cv-management');
    
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping malformed JSON test');
      return;
    }

    await expect(profileSection).toBeVisible();

    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();
    
    await page.waitForLoadState('networkidle');

    // Should handle the error gracefully and show user-friendly error message
    const errorToast = page.locator('.toast:has-text("Error"), [role="alert"]:has-text("Error")');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    
    const errorText = await errorToast.textContent();
    expect(errorText).toContain('Could not generate suggestions');
    expect(errorText).not.toContain('JSON'); // Should not expose technical details
  });

  test('should successfully process valid Gemini responses', async ({ page }) => {
    // Mock Gemini to return perfectly valid JSON
    await page.route('https://generativelanguage.googleapis.com/v1beta/models/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  "suggestions": [
                    {
                      "section": "about",
                      "originalText": "Software engineer",
                      "suggestionType": "wording",
                      "suggestedText": "Experienced software engineer",
                      "reasoning": "Adding 'experienced' provides more impact and credibility"
                    },
                    {
                      "section": "skills",
                      "originalText": "JavaScript, React",
                      "suggestionType": "add_content",
                      "suggestedText": "JavaScript (ES6+), React.js, Node.js",
                      "reasoning": "Adding specific versions and related technologies shows deeper expertise"
                    }
                  ]
                })
              }]
            }
          }]
        })
      });
    });

    await page.goto('/developer/cv-management');
    
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping valid response test');
      return;
    }

    await expect(profileSection).toBeVisible();

    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();
    
    await page.waitForLoadState('networkidle');
    
    // Should complete successfully
    await expect(page.locator('[data-testid="cv-management-icon-suggestions-loading"]')).not.toBeVisible({ timeout: 15000 });
    await expect(getSuggestionsButton).toContainText('Get Suggestions');
    await expect(getSuggestionsButton).toBeEnabled();

    // Should show success toast
    const successToast = page.locator('.toast:has-text("Generated"), [role="alert"]:has-text("Generated")');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('should show API failure modal when all 7 retries fail', async ({ page }) => {
    let attemptCount = 0;
    
    // Mock Gemini to always return malformed responses (all 7 attempts fail)
    await page.route('https://generativelanguage.googleapis.com/v1beta/models/**', route => {
      attemptCount++;
      
      // Always return malformed response (Gemini format)
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  "suggestions": [
                    {
                      "section": "contactInfo.email",
                      "originalText": "test@gmal.com",
                      "suggestionType": "wording",
                      "suggestedText": "test@gmail.com",
                      "reasoning": "Correct the email address domain"
                    },
                    "reasoning"  // <- Always malformed
                  ]
                })
              }]
            }
          }]
        })
      });
    });

    await page.goto('/developer/cv-management');
    
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    
    if (await entrySection.isVisible()) {
      test.skip(true, 'No existing CV analysis found - skipping retry exhaustion test');
      return;
    }

    await expect(profileSection).toBeVisible();

    const getSuggestionsButton = page.locator('[data-testid="cv-management-button-get-suggestions"]');
    await getSuggestionsButton.click();

    // Wait for all retries to complete and modal to appear
    const apiFailureModal = page.locator('[data-testid="api-failure-modal-close-button"]');
    await expect(apiFailureModal).toBeVisible({ timeout: 45000 }); // Allow time for all 7 retries
    
    // Verify modal content
    await expect(page.locator('text=AI Service Temporarily Unavailable')).toBeVisible();
    await expect(page.locator('text=CV suggestions generation')).toBeVisible();
    await expect(page.locator('text=Our team has been automatically notified')).toBeVisible();
    
    // Verify that all 7 retry attempts were made
    expect(attemptCount).toBe(7);
    
    // Close the modal
    await apiFailureModal.click();
    await expect(apiFailureModal).not.toBeVisible();
  });
});