# TechRec Testing Strategy

**Updated**: January 31, 2025  
**Purpose**: Master testing strategy for TechRec platform ensuring data flow integrity and reliable development

---

## 🎯 TESTING PHILOSOPHY

### Core Principles
1. **Data Flow Integrity**: Every data transformation must be tested end-to-end
2. **Schema Contract Validation**: All interfaces between layers must be validated
3. **User Journey Focus**: E2E tests follow real user workflows, not technical implementation
4. **Rapid Feedback**: Tests provide immediate insight into system health
5. **Maintainable Coverage**: Focused, essential tests over comprehensive duplication

### Testing Pyramid
```
        🔺 E2E Tests (8 focused tests)
          - Core user workflows
          - Authentication & security
          - Integration verification
          
      🔺🔺 Integration Tests (Critical layer)
        - Data pipeline validation  
        - Schema contract testing
        - API endpoint verification
        
  🔺🔺🔺 Unit Tests (Comprehensive coverage)
    - Individual function behavior
    - Business logic validation
    - Error handling scenarios
```

---

## 📋 TESTING FRAMEWORK OVERVIEW

### Test Types & Tools

#### 1. **Unit Tests** (Jest + Testing Library)
**Purpose**: Validate individual functions and business logic  
**Location**: `utils/__tests__/`, `components/__tests__/`  
**Focus**: Data transformations, calculations, validation logic

#### 2. **Integration Tests** (Jest + Mocked APIs)
**Purpose**: Validate data flows between system components  
**Location**: `utils/__tests__/*DataFlow.test.ts`  
**Focus**: Complete pipeline validation (Gemini → Schema → Database → UI)

#### 3. **End-to-End Tests** (Playwright)
**Purpose**: Validate complete user workflows  
**Location**: `tests/e2e/core-workflows/`  
**Focus**: Real user scenarios with proper authentication

#### 4. **API Tests** (Supertest + Jest)
**Purpose**: Validate REST endpoints and data contracts  
**Location**: `tests/api/`  
**Focus**: Request/response validation, error handling

---

## 🧪 CRITICAL DATA FLOW VALIDATION

### Experience Data Pipeline Testing
**Problem Solved**: Prevents UI/backend/database data mismatches

```typescript
// Integration Test Pattern
describe('Experience Data Flow', () => {
  it('should preserve all fields from AI → Database → UI', () => {
    // 1. Mock Gemini response with complete Experience data
    // 2. Validate against ExperienceItemSchema
    // 3. Transform via backgroundProfileSync
    // 4. Verify database compatibility
    // 5. Ensure UI can consume result
  });
});
```

**Critical Fields Validated**:
- `techStack: string[]` - Technology skills extraction
- `teamSize: number | null` - Team management experience  
- `current: boolean` - Position status tracking
- `achievements: string[]` - Quantified accomplishments
- `responsibilities: string[]` - Role duties and tasks

### Schema Contract Testing
**Ensures**: Type safety across all system boundaries

```typescript
// Schema Validation Pattern
const validation = ExperienceItemSchema.safeParse(aiResponse);
expect(validation.success).toBe(true);
```

---

## 🎭 E2E TESTING GUIDELINES

### Essential User Workflows (8 Tests)

#### Core Workflows (`tests/e2e/core-workflows/`)
1. **`cv-upload-and-display.spec.ts`** - Complete CV upload → analysis → display
2. **`experience-management.spec.ts`** - Experience editing and management
3. **`cv-suggestions.spec.ts`** - AI suggestion generation and application
4. **`user-authentication.spec.ts`** - Login/logout workflows
5. **`cv-reupload-workflow.spec.ts`** - Multiple CV handling
6. **`project-enhancement.spec.ts`** - Project idea generation

#### Integration Tests (`tests/e2e/integration/`)
7. **`proper-tables-integration.spec.ts`** - Database integration verification
8. **`single-source-truth-verification.spec.ts`** - Architecture validation

### Authentication Requirements
**CRITICAL**: All E2E tests must authenticate before accessing protected routes

```typescript
test.beforeEach(async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.ensureLoggedIn('junior_developer');
});
```

**Available Test Users**:
- `junior_developer` → `junior@test.techrec.com`
- `senior_developer` → `senior@test.techrec.com`  
- `newbie_developer` → `newbie@test.techrec.com`

### Test Data Management
- **Consistent Test Data**: Use `createMockExperience()` utilities
- **Clean State**: Each test starts with known data state
- **Realistic Scenarios**: Test data mirrors real user content

---

## 🔧 TESTING BEST PRACTICES

### Data-Testid Standards
**Naming Convention**: `{page/section}-{component}-{element}-{identifier?}`

```typescript
// ✅ Good test IDs
<Button data-testid="profile-experience-add-button">
<TableRow data-testid={`cv-management-row-cv-item-${cv.id}`}>
<Input data-testid="profile-info-input-name" />

// ❌ Avoid generic IDs
<Button data-testid="button">
<div data-testid="item">
```

### Error Handling Testing
```typescript
describe('Error Scenarios', () => {
  it('should handle API failures gracefully', () => {
    // Test system behavior when external services fail
  });
  
  it('should validate malformed input', () => {
    // Test data validation and sanitization
  });
});
```

### Performance Testing
- **Load Testing**: API endpoints under realistic load
- **Rendering Performance**: Component render time validation
- **Memory Management**: Check for memory leaks in long-running operations

---

## 📊 CONTINUOUS INTEGRATION

### Pre-Commit Validation
```bash
# Required passing tests before commit
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests  
npm run lint              # Code quality
npm run typecheck         # TypeScript validation
```

### CI/CD Pipeline Testing
```bash
# Full test suite in CI
npm run test:all          # All tests
npm run test:e2e          # E2E tests with headless browser
npm run build             # Production build validation
```

### Test Coverage Requirements
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: 100% coverage for data pipelines
- **E2E Tests**: 100% coverage for critical user journeys

---

## 🚨 DEBUGGING & TROUBLESHOOTING

### Test Failure Investigation
1. **Check Authentication**: Most E2E failures are auth-related
2. **Validate Test Data**: Ensure test data matches expected schema
3. **Review Server Logs**: Use development server logging for debugging
4. **Inspect Network Requests**: Monitor API calls during test execution

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| E2E test can't reach protected page | Add `AuthHelper.ensureLoggedIn()` |
| Data mismatch between layers | Run integration tests to identify break |
| API test failures | Validate request/response schemas |
| Flaky test behavior | Add proper wait conditions and state cleanup |

---

## 📈 SUCCESS METRICS

### Quality Gates
- ✅ **Zero data flow mismatches** in Experience pipeline
- ✅ **All critical user journeys** covered by E2E tests
- ✅ **100% schema contract validation** between layers
- ✅ **Fast test execution** (< 5 minutes for full suite)

### Monitoring
- **Test Execution Time**: Track performance degradation
- **Failure Rate**: Monitor test stability and reliability
- **Coverage Trends**: Ensure coverage maintains standards

---

*This strategy ensures TechRec maintains reliable, efficient testing that prevents data flow issues while supporting rapid development cycles.*