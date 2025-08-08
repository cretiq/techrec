# 🧪 Claude Testing Strategy & Commands

**🚨 CRITICAL**: Read the comprehensive E2E testing best practices first:  
**📖 See: [`../E2E_TESTING_BEST_PRACTICES.md`](../E2E_TESTING_BEST_PRACTICES.md)**

## 🎯 Current Testing Framework (Post-Cleanup)

### **Updated Testing Philosophy (August 2025)**
- **Authentication First**: EVERY test must authenticate - no exceptions
- **CV Data Handling**: Expect existing user data, handle gracefully
- **Focused Testing**: Simple, reliable tests over complex workflows
- **Success Metrics**: 91% success rate (41/45 tests passing)

### **Current Testing Architecture (Post-Cleanup)**
```
tests/
├── user-flows/                  # Authentication tests (35/35 PASS ✅)
├── e2e/core-workflows/          # Core functionality tests  
│   ├── cv-upload-and-display.spec.ts    # CV management (WORKING ✅)
│   └── experience-management.spec.ts    # Profile editing (WORKING ✅)
├── utils/                       # Authentication helpers
│   └── auth-helper.ts          # CRITICAL: Authentication utilities
└── global-setup.ts             # Test user creation

# REMOVED (problematic tests):
# ❌ project-ideas.spec.ts       - API dependencies
# ❌ cv-reupload-workflow.spec.ts - Complex workflows  
# ❌ project-enhancement.spec.ts  - Timeout issues
# ❌ role-search-*.spec.ts       - Session conflicts
# ❌ dashboard-*.spec.ts         - State management issues
```

## 🔧 MANDATORY Test Patterns (Updated August 2025)

### **MANDATORY Authentication Pattern**
```typescript
// ✅ CRITICAL: Every test MUST follow this pattern
import { AuthHelper } from '../utils/auth-helper';

test.beforeEach(async ({ page }) => {
  const auth = new AuthHelper(page);
  // MANDATORY: Authenticate before ANY operations
  await auth.ensureLoggedIn('junior_developer');
});

test('should test protected functionality', async ({ page }) => {
  // Now can safely access protected routes
  await page.goto('/developer/dashboard');
  // ... test logic
});
```

### **CV Data Handling Pattern**
```typescript
// ✅ CRITICAL: Handle existing user data gracefully
test('should handle CV functionality for any user state', async ({ page }) => {
  await page.goto('/developer/cv-management');
  
  const uploadVisible = await page.locator('[data-testid="cv-management-entry-section"]').isVisible();
  const profileVisible = await page.locator('[data-testid="cv-management-profile-section"]').isVisible();
  
  if (profileVisible && !uploadVisible) {
    // User has existing data - skip or adapt test
    test.skip('User has existing CV data from previous runs');
    return;
  }
  
  // Continue with test logic
});
```

### **Common Issue Patterns & Solutions**

#### **Port Mismatches**
```typescript
// Problem: Tests expect different port than server
// Check: playwright.config.ts baseURL matches actual server port
baseURL: process.env.BASE_URL || 'http://localhost:3000',
webServer: { url: 'http://localhost:3000' }
```

#### **Redux Store Issues**
```typescript
// Problem: "client-side exception" errors
// Solution: Ensure all reducers are registered in store.ts
import featureReducer from './features/featureSlice';
// Add to combinedReducer object
```

#### **Selector Reliability**
```typescript
// ✅ Robust: Text-based selectors with fallbacks
button:has-text("Generate Ideas"), button:has-text("Generate")

// ✅ Robust: Multiple selector strategies  
'[data-testid="generate"], button:has-text("Generate")'

// ❌ Fragile: Single data-testid dependency
'[data-testid="generate-button"]'
```

#### **AI Generation Testing**
```typescript
// Handle long-running AI operations
await this.page.waitForSelector('h2:has-text("Results")', { 
  timeout: 60000 // AI can take time
});

// Look for loading states
await expect(this.page.locator('text=Generating...')).toBeVisible();

// Test CV suggestion workflows
test('user can accept AI suggestions and see green highlighting', async ({ page }) => {
  // Given: User has CV with suggestions available
  await page.goto('/cv-management');
  await page.click('[data-testid="get-suggestions-button"]');
  await page.waitForSelector('[data-testid="suggestion-overlay-about"]');
  
  // When: User accepts a suggestion
  await page.click('[data-testid="suggestion-accept-button"]');
  
  // Then: Content is updated and highlighted green
  await expect(page.locator('.bg-green-100')).toBeVisible();
  await expect(page.locator('[data-testid="suggestion-overlay-about"]')).not.toBeVisible();
});
```

### **Test Data Strategy**
```typescript
// Use predefined test users from global-setup.ts
const testUser = 'junior@test.techrec.com' / 'testpass123';

// Realistic test data that reflects user scenarios
const sampleData = {
  problem: 'I need a productivity app to manage daily tasks',
  timeframe: '1-2 weeks',
  skills: 'New framework'
};
```

## Updated Commands (Post-Cleanup - August 2025)

### @test-all
**Description**: Run the cleaned, reliable E2E test suite  
**Usage**: `@test-all`  
**Command**: `npx playwright test --timeout=60000`  
**Success Rate**: 91% (41/45 tests pass)  
**When to use**: Comprehensive validation, before deployment

### @test-auth
**Description**: Run authentication flow tests (HIGHLY RELIABLE)  
**Usage**: `@test-auth`  
**Command**: `npx playwright test tests/user-flows/authentication.spec.ts`  
**Success Rate**: 100% (35/35 tests pass)  
**When to use**: Quick validation, before starting work

### @test-cv
**Description**: Run CV management functionality tests  
**Usage**: `@test-cv`  
**Command**: `npx playwright test tests/e2e/core-workflows/cv-upload-and-display.spec.ts`  
**Success Rate**: ~60% (handles user data gracefully)  
**When to use**: After CV-related changes

### @test-experience
**Description**: Run experience management tests  
**Usage**: `@test-experience`  
**Command**: `npx playwright test tests/e2e/core-workflows/experience-management.spec.ts`  
**Success Rate**: 100% (all browsers)  
**When to use**: After profile editing changes

### @test-quick
**Description**: Run only the most reliable tests  
**Usage**: `@test-quick`  
**Commands**: 
```bash
npx playwright test tests/user-flows/authentication.spec.ts
npx playwright test tests/e2e/core-workflows/experience-management.spec.ts
```
**When to use**: During active development, quick feedback

### @create-test
**Description**: Guide for creating a new E2E test
**Usage**: `@create-test [feature-name]`
**Actions**:
1. Analyze feature requirements
2. Create Page Object if needed
3. Write test following established patterns
4. Add to appropriate test suite

### @test-debug
**Description**: Run tests in debug mode for troubleshooting
**Usage**: `@test-debug [test-pattern]`
**Command**: `npm run test:e2e:debug -- --grep="[pattern]"`
**When to use**: When tests are failing and need investigation

### @test-headed
**Description**: Run tests with visible browser for visual debugging
**Usage**: `@test-headed`
**Command**: `npm run test:e2e:headed`
**When to use**: Visual debugging, seeing what tests are doing

### @test-suggestions
**Description**: Test CV improvement suggestions workflow (accept/decline/highlighting)
**Usage**: `@test-suggestions`
**Command**: `npx playwright test cv-management-get-suggestions.spec.ts`
**When to use**: After suggestion feature changes, UI updates, or AI integration work

### @test-component
**Description**: Test specific component in isolation
**Usage**: `@test-component [component-name]`
**Command**: `npx playwright test --grep "[component-name]"`
**When to use**: Component-specific testing, focused debugging

## 🚀 Advanced Testing Workflows

### **🔄 Iterative Development with Tests**
```
1. @test-auth (baseline verification)
2. Write failing test (@create-test)
3. Implement feature (guided by test failures)
4. @test-[feature] (validate implementation)
5. Refactor with confidence
6. @test-user-flows (integration verification)
```

### **🐛 Systematic Bug Resolution**
```
1. @test-full (reproduce issue in controlled environment)
2. Create minimal reproduction test case
3. Debug with @test-debug or @test-headed
4. Implement fix targeting specific failure
5. @test-quick (verify fix)
6. @test-full (ensure no regressions)
```

### **⚡ Feature Development TDD**
```
1. Analyze requirements → identify user flows
2. @create-test [feature-name] (write failing tests first)
3. Create Page Objects for new UI elements
4. Implement feature (tests guide implementation)
5. @test-[feature] (validate against original requirements)
6. @test-user-flows (ensure integration works)
7. @test-full (comprehensive pre-deployment check)
```

### **🔧 Test Maintenance & Optimization**
```
1. Regular @test-full runs to identify flaky tests
2. Update Page Objects when UI changes
3. Refactor test data when requirements evolve
4. Optimize selectors for reliability over speed
5. Add regression tests for every bug found
```

## 🎯 Testing Strategy Principles

### **Multi-Layer Testing Approach**
- **Unit Tests**: Individual component behavior
- **Integration Tests**: Component interactions
- **E2E Tests**: Complete user workflows
- **Cross-Browser**: Ensure compatibility

### **Test Reliability Strategies**
- **Robust Selectors**: Text-based with fallbacks
- **Wait Strategies**: `waitForLoadState`, `waitForSelector`
- **Error Handling**: Graceful failures with clear messages
- **Test Isolation**: Each test starts with clean state

### **Performance & Feedback Optimization**
- **Parallel Execution**: Run multiple tests simultaneously
- **Selective Testing**: Target specific areas during development
- **Fast Feedback**: Quick tests (2-5 min) during development
- **Comprehensive Validation**: Full suite (10-15 min) before deployment

### **AI-Specific Testing Considerations**
- **Long Timeouts**: AI operations can take 30-60 seconds
- **Loading States**: Test intermediate states, not just final results
- **Fallback Handling**: Test when AI services fail
- **Result Validation**: Verify AI-generated content quality

## 🧪 Test-Driven Development with Playwright

### **TDD Loop Implementation**
```typescript
// 1. RED PHASE - Write failing test first
test('user can manage experience entries with inline editing', async ({ page }) => {
  // This test should fail initially - feature doesn't exist yet
  await page.goto('/cv-management');
  await page.click('[data-testid="experience-edit-button"]');
  await page.fill('[data-testid="experience-title-input"]', 'Senior Developer');
  await page.click('[data-testid="experience-save-button"]');
  await expect(page.locator('[data-testid="experience-title"]')).toContainText('Senior Developer');
});

// 2. GREEN PHASE - Implement minimal code to pass
// Build just enough functionality to make the test pass

// 3. REFACTOR PHASE - Improve code while keeping tests green
// Enhance implementation while maintaining test success
```

### **Component Testing Patterns**
```typescript
// Test component states and user interactions
class ComponentTestPage {
  constructor(public page: Page) {}

  async testLoadingState() {
    await expect(this.page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  }

  async testErrorState() {
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible();
  }

  async testSuccessState() {
    await expect(this.page.locator('[data-testid="success-indicator"]')).toBeVisible();
  }

  async testEmptyState() {
    await expect(this.page.locator('[data-testid="empty-state"]')).toBeVisible();
  }
}
```

### **User-Centric Test Design**
```typescript
// Focus on user value, not implementation details
test('user can improve their CV with AI suggestions', async ({ page }) => {
  // User story: As a user, I want to get AI suggestions to improve my CV
  
  // Setup: User has a CV uploaded
  await setupUserWithCV(page);
  
  // Action: User requests suggestions
  await page.click('[data-testid="get-suggestions-button"]');
  await page.waitForSelector('[data-testid="suggestion-overlay"]');
  
  // Verification: User sees actionable suggestions
  await expect(page.locator('[data-testid="suggestion-item"]')).toHaveCount.greaterThan(0);
  
  // Action: User accepts a suggestion
  await page.click('[data-testid="suggestion-accept-button"]').first();
  
  // Verification: Content is updated with visual feedback
  await expect(page.locator('.bg-green-100')).toBeVisible();
  await expect(page.locator('[data-testid="suggestion-overlay"]')).not.toBeVisible();
});
```

### **Data-Driven Testing**
```typescript
// Test multiple scenarios with different data sets
const testScenarios = [
  { userLevel: 'junior', expectedSuggestions: 5 },
  { userLevel: 'senior', expectedSuggestions: 3 },
  { userLevel: 'expert', expectedSuggestions: 1 }
];

for (const scenario of testScenarios) {
  test(`${scenario.userLevel} user gets appropriate suggestions`, async ({ page }) => {
    await setupUser(page, scenario.userLevel);
    await requestSuggestions(page);
    await expect(page.locator('[data-testid="suggestion-item"]'))
      .toHaveCount(scenario.expectedSuggestions);
  });
}
```

### **Accessibility Testing Integration**
```typescript
// Include accessibility testing in your TDD workflow
test('suggestion interface is accessible', async ({ page }) => {
  await page.goto('/cv-management');
  
  // Test keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="get-suggestions-button"]')).toBeFocused();
  
  // Test screen reader labels
  await expect(page.locator('[data-testid="suggestion-accept-button"]'))
    .toHaveAttribute('aria-label', /accept.*suggestion/i);
  
  // Test color contrast (via visual comparison)
  await expect(page.locator('.bg-green-100')).toHaveCSS('background-color', 'rgb(220, 252, 231)');
});
```

## 📊 Success Metrics & Monitoring

### **Quality Assurance Metrics**
- **Test Coverage**: >90% of user flows covered
- **Pass Rate**: >95% consistent success rate
- **Execution Time**: <5 minutes for quick feedback
- **Maintenance Overhead**: Tests update easily with UI changes
- **Bug Detection**: Catch issues before user reports

### **TDD Implementation Metrics**
- **Test-First Development**: New features start with failing tests
- **Red-Green-Refactor Cycles**: Complete TDD loop for each feature
- **Test Reliability**: Consistent results across multiple runs
- **User Story Coverage**: Every user story has corresponding E2E tests

### **Development Integration Success**
- **Pre-Commit Testing**: All commits pass core test suite
- **Feature Branch Validation**: Complete testing before merge
- **Deployment Confidence**: Full test suite passes before production
- **Regression Prevention**: New bugs immediately get test coverage

## 🎯 Strategic Testing Integration

### **Claude AI Development Workflow**
1. **Always Reference This Document**: Consult `@claude-instructions/testing-commands.md` before feature work
2. **Test-Driven Feature Development**: Write tests before implementing features
3. **Comprehensive User Journey Coverage**: Focus on complete user workflows
4. **Continuous Quality Assurance**: Use testing to guide architectural decisions

### **Proactive Testing Excellence**
- **Feature Planning**: Every new feature gets test strategy planning
- **Implementation Validation**: Tests verify feature meets requirements
- **Regression Protection**: Existing functionality protected by test suite
- **Documentation Through Tests**: Tests serve as living feature documentation

## 🚨 CRITICAL TEST RELIABILITY PRINCIPLES

### **Test Integrity Requirements**
1. **REAL FUNCTIONALITY TESTING**: Tests MUST perform actual operations, not simulate them
   - CV upload tests MUST upload real files
   - Database tests MUST write to actual database
   - API tests MUST call real endpoints
   
2. **IMMEDIATE PROBLEM FLAGGING**: If a test doesn't work as expected:
   - **STOP** attempting repairs without 100% confidence
   - **FLAG** the issue immediately to the user
   - **OFFER** manual testing as alternative
   - **DOCUMENT** what works vs. what doesn't

3. **HEAD TEST PROTOCOL**: When uncertain about test fixes:
   - Run a quick validation test first
   - Report exactly what works and what fails
   - Let user decide on manual testing vs. continued debugging
   - Never claim fixes work without verification

### **Test Debugging Hierarchy**
```
1. ✅ CONFIDENT FIX: Know exactly what's wrong and how to fix it
   → Apply fix and validate immediately

2. ⚠️ UNCERTAIN FIX: Suspect the issue but not 100% sure
   → Run HEAD test, report findings, get user approval

3. 🛑 UNKNOWN ISSUE: Don't understand the root cause
   → STOP, FLAG to user, suggest manual testing
```

### **Upload Flow Test Requirements**
- **File Upload Tests**: MUST use real file uploads, not mocked interactions
- **Database Integration**: MUST write to actual database tables
- **End-to-End Validation**: MUST verify complete pipeline (upload → process → display)
- **Error Handling**: MUST test actual error scenarios, not simulated ones

### **When Tests Are Unreliable**
- **Document** specific test failures and limitations
- **Provide** clear guidance on manual testing procedures  
- **Flag** tests that don't reflect real user workflows
- **Prioritize** user confidence over test coverage metrics

---

**Enhanced Focus Areas**:
- Contemporary Test-Driven Development practices
- Playwright as primary E2E testing framework
- User-centric test design over implementation-focused testing  
- Comprehensive coverage of AI features and workflows
- Accessibility and performance testing integration

Refer to: 
- [AI Testing Strategy](mdc:testing/ai-driven-testing-strategy.md)
- [E2E Testing Guidelines](mdc:.cursor/rules/e2e-testing.mdc)
- [Test Data Management](mdc:.cursor/rules/test-data-management.mdc)
- [CLAUDE.md - Testing Section](mdc:CLAUDE.md#test-driven-development-mastery) 