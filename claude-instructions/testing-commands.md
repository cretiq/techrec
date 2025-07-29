# 🧪 Claude Testing Strategy & Commands

## 🎯 Comprehensive Testing Framework with Playwright

### **Testing Philosophy**
- **Test-Driven Development**: Write tests before or alongside features
- **Page Object Model**: Reusable, maintainable test components
- **Autonomous Execution**: Tests run independently with comprehensive reporting
- **Issue Resolution**: Built-in patterns for common problems

### **Testing Architecture**
```
tests/
├── pages/           # Page Object Models (AuthPage, ProjectIdeasPage)
├── user-flows/      # Complete user journey tests
├── global-setup.ts  # Test user creation and setup
└── utils/           # Test data and helper functions
```

## 🔧 Test Creation & Debugging Patterns

### **Page Object Model Creation**
```typescript
export class FeaturePage {
  constructor(public page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/feature');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions with error handling
  async performAction(data: ActionData) {
    await this.clickContinue();  // Multi-step flows
    await this.selectOption(data.choice);
    await this.submitForm();
  }

  // Assertions
  async expectSuccess() {
    await expect(this.page).toHaveURL(/.*\/success/);
    await expect(this.page.locator('h2:has-text("Success")')).toBeVisible();
  }

  // Robust selectors
  get submitButton() {
    return this.page.locator('button:has-text("Submit"), button[type="submit"]');
  }
}
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

## Available Commands

### @test-auth
**Description**: Run authentication flow tests to verify login/logout functionality
**Usage**: `@test-auth`
**Command**: `npm run test:auth`
**When to use**: Before starting work, after auth changes, quick verification

### @test-project-ideas  
**Description**: Test the complete Project Ideas Generation flow (FR24)
**Usage**: `@test-project-ideas`
**Command**: `npm run test:project-ideas`
**When to use**: When working on project ideas feature, testing AI generation flow

### @test-user-flows
**Description**: Run all user flow tests (complete user journeys)
**Usage**: `@test-user-flows`
**Command**: `npm run test:user-flows`
**When to use**: Before code review, comprehensive user flow validation

### @test-full
**Description**: Run complete E2E test suite with cross-browser testing
**Usage**: `@test-full`
**Command**: `./run-reliable-tests.sh`
**When to use**: Before deployment, comprehensive validation, after major changes

### @test-quick
**Description**: Run quick development tests (auth + current feature)
**Usage**: `@test-quick`
**Commands**: 
```bash
npm run test:auth
npm run test:project-ideas
```
**When to use**: During active development, quick feedback loops

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