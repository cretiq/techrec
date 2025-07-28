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

## 📊 Success Metrics & Monitoring

- **Test Coverage**: >90% of user flows covered
- **Pass Rate**: >95% consistent success rate
- **Execution Time**: <5 minutes for quick feedback
- **Maintenance Overhead**: Tests update easily with UI changes
- **Bug Detection**: Catch issues before user reports

Refer to: 
- [AI Testing Strategy](mdc:testing/ai-driven-testing-strategy.md)
- [E2E Testing Guidelines](mdc:.cursor/rules/e2e-testing.mdc)
- [Test Data Management](mdc:.cursor/rules/test-data-management.mdc) 