# TechRec E2E Testing with Playwright

This directory contains comprehensive end-to-end tests for TechRec's browser-based features, with a focus on automating manual testing workflows for FR 23 (Project Enhancement) and FR 24 (Project Ideas Generation).

## 🎯 Overview

Our E2E testing setup provides:
- **Autonomous browser testing** for complete user journeys
- **Data-testid strategy integration** using TechRec's existing naming conventions
- **Cross-browser compatibility** testing (Chrome, Firefox, Safari)
- **Mobile responsive** testing for all major features
- **Error scenario testing** with API mocking and failure simulation
- **Performance validation** with loading state verification

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Playwright (already added to package.json)
npm install

# Install browser engines
npx playwright install
```

### 2. Start Development Server
```bash
# The tests expect the app to be running on localhost:3000
npm run dev
```

### 3. Run Tests
```bash
# Run all E2E tests
npm run test:e2e all

# Run specific feature tests
npm run test:e2e fr23    # Project Enhancement
npm run test:e2e fr24    # Project Ideas Generation

# Run with visible browser (helpful for debugging)
npm run test:e2e headed

# Run in interactive debug mode
npm run test:e2e debug

# Run interactive UI mode
npm run test:e2e ui
```

## 📋 Test Coverage

### FR 23: Project Enhancement
- ✅ **Complete GitHub OAuth flow** with repository selection
- ✅ **README analysis** with quality assessment and confidence scoring
- ✅ **Enhancement questionnaire** with business context and impact metrics
- ✅ **AI CV description generation** with points system integration
- ✅ **Error handling**: GitHub API failures, insufficient points, AI failures
- ✅ **Mobile responsive** behavior across all enhancement steps
- ✅ **Portfolio assessment** accuracy for different user types
- ✅ **Manual entry fallbacks** when GitHub API is unavailable

### FR 24: Project Ideas Generation
- ✅ **Smart questionnaire flow** with pill buttons and custom text input
- ✅ **Input conflict resolution** between pills and custom text
- ✅ **Auto-save and session recovery** after browser refresh
- ✅ **AI project generation** with 2-3 diverse project suggestions
- ✅ **Project card display** with difficulty, skills, and time estimates
- ✅ **Detailed project planning** with dedicated plan pages
- ✅ **Error scenarios**: AI failures, insufficient points, malformed responses
- ✅ **Session management** with history and cleanup functionality

### Cross-Feature Testing
- ✅ **Authentication flows** with different user types
- ✅ **Points system integration** and upgrade prompts
- ✅ **Mobile responsiveness** across all features
- ✅ **Navigation state management** and breadcrumb functionality
- ✅ **Performance validation** with loading states and timeouts

## 🧪 Test Architecture

### Helper Classes

#### AuthHelper
Manages user authentication and session handling:
```typescript
const authHelper = new AuthHelper(page);

// Login as specific user type
await authHelper.loginAsUserType('junior_developer');

// Ensure user is logged in
await authHelper.ensureLoggedIn();

// Get current points balance
const points = await authHelper.getCurrentPoints();
```

#### TestDataHelper
Sets up test data and mocks external services:
```typescript
const testDataHelper = new TestDataHelper(page);

// Upload test CV with specific characteristics
await testDataHelper.uploadTestCV('minimal_projects');

// Mock GitHub repositories
await testDataHelper.mockGitHubRepositories('good_readmes');

// Mock AI responses
await testDataHelper.mockAIResponses('success');

// Fill project questionnaire
await testDataHelper.fillProjectIdeasQuestionnaire({
  problemStatement: 'Track expenses',
  projectScope: '1-month',
  learningGoals: ['new-framework']
});
```

### Data-TestID Integration

All tests use TechRec's existing data-testid strategy:

```typescript
// Following the established naming convention
await page.click('[data-testid="project-ideas-button-generate-trigger"]');
await page.fill('[data-testid="project-enhancement-input-business-context"]', 'context');

// Dynamic IDs for specific entities
await expect(page.locator('[data-testid="project-ideas-card-project-1"]')).toBeVisible();
await page.click('[data-testid="project-enhancement-repo-card-awesome-project"]');

// Checking CSS classes for state
await expect(page.locator('[data-testid="project-ideas-pill-scope-1-month"]')).toHaveClass(/selected/);
```

### API Mocking Strategy

Tests use Playwright's route interception for reliable, fast testing:

```typescript
// Mock successful AI generation
await page.route('**/api/project-ideas/session/*/generate', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ projects: [...] })
  });
});

// Mock GitHub API failure
await page.route('**/api/github/connect', async route => {
  await route.fulfill({
    status: 500,
    body: JSON.stringify({ error: 'API unavailable' })
  });
});
```

## 🛠 Configuration

### Playwright Config (playwright.config.ts)
- **Multi-browser testing**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Automatic dev server**: Starts `npm run dev` if not running
- **Rich reporting**: HTML, JSON, and JUnit reports
- **Smart retries**: 2 retries in CI, 0 locally for faster feedback
- **Screenshots/videos**: Captured on failure for debugging

### Environment Variables
```bash
# Base URL (defaults to http://localhost:3000)
BASE_URL=http://localhost:3000

# CI mode (affects parallelization and retries)
CI=true
```

## 📊 Test Execution Modes

### Development Mode
```bash
# Fast feedback with no retries
npm run test:e2e fr24

# Debug mode with DevTools open
npm run test:e2e debug

# Interactive UI mode
npm run test:e2e ui
```

### CI/Production Mode
```bash
# Full cross-browser suite
npm run test:e2e cross-browser

# Mobile responsiveness testing
npm run test:e2e mobile

# All tests with retries
CI=true npm run test:e2e all
```

## 🐛 Debugging Tests

### Common Issues & Solutions

**1. Test Timeouts**
```typescript
// Increase timeout for slow operations
await page.waitForSelector('[data-testid="element"]', { timeout: 30000 });
```

**2. Flaky Element Selection**
```typescript
// Wait for element to be actionable
await page.waitForSelector('[data-testid="button"]:not([disabled])');
```

**3. Authentication State**
```typescript
// Always ensure logged in before test actions
await authHelper.ensureLoggedIn('junior_developer');
```

**4. API Mocking**
```typescript
// Set up mocks before navigation
await testDataHelper.mockAIResponses('success');
await page.goto('/developer/projects/ideas');
```

### Debug Tools

**Playwright UI Mode**
```bash
npm run test:e2e ui
```
- Interactive test runner
- Step-by-step execution
- Visual DOM inspection

**Debug Mode**
```bash
npm run test:e2e debug
```
- Browser DevTools available
- Pauses at each action
- Console logging visible

**Headed Mode**
```bash
npm run test:e2e headed
```
- Visible browser window
- Real-time test execution
- Manual intervention possible

## 📈 Extending Tests

### Adding New Test Scenarios

1. **Create test file** following naming convention:
```typescript
// tests/e2e/feature-name.spec.ts
import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';
import { TestDataHelper } from './utils/test-data-helper';
```

2. **Follow established patterns**:
```typescript
test.describe('Feature Name', () => {
  let authHelper: AuthHelper;
  let testDataHelper: TestDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Happy path scenario', async ({ page }) => {
    await authHelper.loginAsUserType('user_type');
    // Test implementation
  });
});
```

3. **Add to test runner**:
```typescript
// tests/e2e/run-tests.ts
{
  name: 'feature',
  description: 'Run Feature Name tests',
  command: 'npx playwright test feature-name.spec.ts --project=chromium'
}
```

### Adding New Helper Methods

**AuthHelper additions**:
```typescript
async loginAsAdminUser() {
  // Implementation for admin login
}
```

**TestDataHelper additions**:
```typescript
async setupSpecificTestScenario() {
  // Setup for specific test needs
}
```

## 🔍 Best Practices

### 1. Test Independence
- Each test should be able to run in isolation
- Use `test.beforeEach` for setup, avoid shared state
- Clean up after tests when necessary

### 2. Reliable Selectors
- Always use `data-testid` attributes
- Follow TechRec's naming convention exactly
- Avoid CSS selectors or text-based selectors

### 3. Realistic Test Data
- Use meaningful test data that represents real usage
- Mock external APIs for reliability and speed
- Test with various user types and data states

### 4. Error Scenarios
- Test both happy path and error conditions
- Verify error messages and recovery mechanisms
- Test API failures and network issues

### 5. Performance Awareness
- Use appropriate timeouts for different operations
- Avoid unnecessary waits with explicit conditions
- Mock heavy operations for speed

## 📝 Reporting

Test results are generated in multiple formats:

- **HTML Report**: `playwright-report/index.html` (visual, interactive)
- **JSON Report**: `test-results/results.json` (programmatic access)
- **JUnit Report**: `test-results/results.xml` (CI integration)

View reports after test runs:
```bash
npx playwright show-report
```

## 🎯 Next Steps

This E2E testing foundation provides immediate value for FR 23 & 24 while establishing patterns for expanding to autonomous testing across all TechRec features. The data-testid integration and helper architecture make it easy to add comprehensive testing for any new features.

Key areas for expansion:
- **Visual regression testing** with screenshot comparison
- **Performance testing** with Core Web Vitals measurement
- **Accessibility testing** with automated a11y validation
- **API testing** integration with existing backend tests
- **Load testing** with multiple concurrent user simulation 