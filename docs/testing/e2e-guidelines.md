# E2E Testing Guidelines

**Updated**: January 31, 2025  
**Purpose**: Simplified, focused End-to-End testing best practices for TechRec platform

---

## 🎯 E2E TESTING PHILOSOPHY

### Core Principles
1. **User Journey Focus**: Test real user workflows, not technical implementation details
2. **Essential Coverage Only**: 8 focused tests covering critical paths, not exhaustive scenarios  
3. **Authentication First**: All tests start authenticated - no exceptions
4. **Reliable Execution**: Tests should pass consistently, not flake due to timing issues
5. **Maintainable Structure**: Clear, organized test structure that's easy to understand and modify

### Testing Goals
- ✅ Validate complete user workflows work end-to-end
- ✅ Catch integration issues between frontend and backend
- ✅ Ensure authentication flows work correctly
- ✅ Verify data flows from user input to database storage to UI display
- ❌ **NOT** for testing individual component behavior (use unit tests)
- ❌ **NOT** for comprehensive edge case coverage (use integration tests)

---

## 📁 TEST ORGANIZATION

### Directory Structure
```
tests/e2e/
├── core-workflows/              # Essential user journeys (6 tests)
│   ├── cv-upload-and-display.spec.ts     # Complete CV upload → display
│   ├── experience-management.spec.ts      # Experience editing workflows
│   ├── cv-suggestions.spec.ts            # AI suggestion workflows
│   ├── user-authentication.spec.ts       # Login/logout flows
│   ├── cv-reupload-workflow.spec.ts      # Multiple CV handling
│   └── project-enhancement.spec.ts       # Project idea features
├── integration/                 # System integration tests (2 tests) 
│   ├── proper-tables-integration.spec.ts # Database integration
│   └── single-source-truth-verification.spec.ts # Architecture validation
└── utils/                      # Test utilities
    ├── auth-helper.ts          # Authentication management
    ├── test-data-helper.ts     # Test data creation
    └── test-user-setup.ts      # User account management
```

---

## 🔐 AUTHENTICATION REQUIREMENTS

### CRITICAL RULE: Always Authenticate First
**Every E2E test MUST authenticate before accessing protected routes**

```typescript
import { AuthHelper } from '../utils/auth-helper';

test.describe('CV Management', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // REQUIRED: Authenticate before every test
    await authHelper.ensureLoggedIn('junior_developer');
  });

  test('should upload and display CV', async ({ page }) => {
    // Now can access protected routes like /developer/cv-management
    await page.goto('/developer/cv-management');
    // ... rest of test
  });
});
```

### Available Test Users
| User Type | Email | Use Case |
|-----------|-------|----------|
| `junior_developer` | `junior@test.techrec.com` | Basic CV operations |
| `senior_developer` | `senior@test.techrec.com` | Advanced features |
| `newbie_developer` | `newbie@test.techrec.com` | First-time user flows |

### Authentication Helper Usage
```typescript
// Ensure logged in (recommended)
await authHelper.ensureLoggedIn('junior_developer');

// Ensure logged out (for auth flow testing)
await authHelper.ensureLoggedOut();

// Check authentication status
const isLoggedIn = await authHelper.isLoggedIn();
```

---

## 📝 WRITING E2E TESTS

### Test Structure Template
```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

test.describe('Feature Name', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn('junior_developer');
  });

  test('should perform user workflow successfully', async ({ page }) => {
    // 1. ARRANGE: Set up test conditions
    console.log('🚀 Starting [Feature] workflow test');
    
    // 2. ACT: Perform user actions
    await page.goto('/target-page');
    await page.click('[data-testid="action-button"]');
    
    // 3. ASSERT: Verify expected outcomes
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
    
    console.log('✅ [Feature] workflow completed successfully');
  });
});
```

### Selector Best Practices
```typescript
// ✅ GOOD: Use data-testid attributes
await page.click('[data-testid="profile-experience-add-button"]');
await page.fill('[data-testid="experience-title-input"]', 'Senior Developer');

// ✅ GOOD: Specific context selectors
await page.locator(`[data-testid="cv-row-${cvId}"]`).click();

// ❌ AVOID: Text-based selectors (brittle)
await page.click('text=Submit');

// ❌ AVOID: CSS class selectors (change frequently)
await page.click('.btn-primary');
```

### Wait Conditions
```typescript
// ✅ Wait for specific elements
await page.waitForSelector('[data-testid="upload-complete-indicator"]');

// ✅ Wait for network requests to complete
await page.waitForLoadState('networkidle');

// ✅ Wait for specific text content
await expect(page.locator('[data-testid="status"]')).toContainText('Complete');

// ❌ AVOID: Arbitrary timeouts
await page.waitForTimeout(5000); // Flaky!
```

---

## 🧪 TESTING PATTERNS

### File Upload Testing
```typescript
test('should upload CV file successfully', async ({ page }) => {
  await page.goto('/developer/cv-management');
  
  // Prepare file upload
  const filePath = path.join(__dirname, '../fixtures/sample-cv.pdf');
  expect(fs.existsSync(filePath)).toBeTruthy();
  
  // Perform upload
  await page.setInputFiles('[data-testid="cv-upload-input"]', filePath);
  await page.click('[data-testid="upload-submit-button"]');
  
  // Verify upload success
  await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible();
});
```

### Form Interaction Testing
```typescript
test('should edit experience information', async ({ page }) => {
  await page.goto('/developer/profile');
  
  // Fill form fields
  await page.fill('[data-testid="experience-title-input"]', 'Senior Developer');
  await page.fill('[data-testid="experience-company-input"]', 'TechCorp');
  await page.selectOption('[data-testid="experience-location-select"]', 'Remote');
  
  // Submit form
  await page.click('[data-testid="experience-save-button"]');
  
  // Verify save success
  await expect(page.locator('[data-testid="save-success-indicator"]')).toBeVisible();
});
```

### API Response Validation
```typescript
test('should generate AI suggestions successfully', async ({ page }) => {
  // Monitor API calls
  let suggestionsReceived = false;
  await page.route('/api/cv-improvement/**', async route => {
    const response = await route.fetch();
    const data = await response.json();
    
    if (data.suggestions && data.suggestions.length > 0) {
      suggestionsReceived = true;
    }
    
    await route.fulfill({ response });
  });
  
  // Trigger suggestion generation
  await page.click('[data-testid="get-suggestions-button"]');
  
  // Verify API call and UI update
  await expect(page.locator('[data-testid="suggestions-container"]')).toBeVisible();
  expect(suggestionsReceived).toBe(true);
});
```

---

## 🔧 DEBUGGING E2E TESTS

### Common Issues & Solutions

#### 1. **Authentication Failures**
```
Error: Navigation to /developer/cv-management redirected to /auth/signin
```
**Solution**: Ensure `AuthHelper.ensureLoggedIn()` is called in `test.beforeEach()`

#### 2. **Element Not Found**
```
Error: Selector '[data-testid="upload-button"]' not found
```
**Solutions**:
- Check if element exists on the page
- Verify data-testid is correctly spelled
- Add wait condition for element to appear

#### 3. **Network Request Failures**
```
Error: Request to /api/cv/upload failed with 500
```
**Solutions**:
- Check development server is running
- Verify API endpoints are available
- Review server logs for backend errors

### Debug Logging
```typescript
test('debug test with comprehensive logging', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    console.log(`🖥️ [BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  // Log API requests
  page.on('response', response => {
    console.log(`📡 [API] ${response.request().method()} ${response.url()} ${response.status()}`);
  });
  
  // Your test steps...
});
```

### Test Isolation
```typescript
test.beforeEach(async ({ page }) => {
  // Clean state before each test
  await authHelper.ensureLoggedOut();
  await authHelper.ensureLoggedIn('junior_developer');
  
  // Clear any existing data that might interfere
  await cleanupTestData();
});
```

---

## 📊 TEST EXECUTION

### Local Development
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test cv-upload-and-display.spec.ts

# Run tests with visible browser (debugging)
npx playwright test --headed

# Debug specific test with step-by-step execution
npx playwright test --debug cv-upload-and-display.spec.ts
```

### CI/CD Pipeline
```bash
# Headless execution for CI
npx playwright test --browser=chromium

# Generate test report
npx playwright show-report

# Capture screenshots on failure
npx playwright test --screenshot=only-on-failure
```

### Performance Considerations
- **Parallel Execution**: Tests run in parallel by default
- **Resource Management**: Close database connections after tests
- **File Cleanup**: Remove uploaded test files after completion
- **Browser Management**: Playwright handles browser lifecycle automatically

---

## 📈 SUCCESS METRICS

### Test Quality Indicators
- **Pass Rate**: > 95% test pass rate in CI
- **Execution Time**: < 10 minutes for full E2E suite
- **Flakiness**: < 2% flaky test rate
- **Coverage**: 100% of critical user journeys covered

### Maintenance Goals
- **Clear Test Intent**: Each test name clearly describes user value
- **Minimal Duplication**: No overlapping test coverage
- **Easy Debugging**: Test failures provide clear diagnostic information
- **Quick Fixes**: Most test issues resolved within 15 minutes

---

*These E2E guidelines ensure TechRec maintains reliable, focused end-to-end testing that validates real user value while remaining maintainable and fast to execute.*