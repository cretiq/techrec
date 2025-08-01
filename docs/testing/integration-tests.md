# Integration Testing Guide

**Updated**: January 31, 2025  
**Purpose**: Component contract testing and data pipeline validation to prevent integration failures

---

## 🎯 INTEGRATION TESTING PHILOSOPHY

### Purpose & Scope
**Integration tests validate data contracts between system components**:
- ✅ **Data Pipeline Integrity**: Ensure data flows correctly between layers
- ✅ **API Contract Validation**: Verify request/response structures
- ✅ **Component Interface Testing**: Test boundaries between modules
- ✅ **Schema Evolution Safety**: Prevent breaking changes
- ❌ **NOT** for UI behavior testing (use E2E tests)
- ❌ **NOT** for individual function logic (use unit tests)

### Critical Integration Points
1. **AI → Schema Validation** - Gemini responses match expected structure
2. **Schema → Database Transform** - Data transformation preserves all fields  
3. **Database → API Response** - API responses match frontend expectations
4. **API → UI Components** - Components can consume API data correctly

---

## 📋 TEST CATEGORIES

### 1. Data Pipeline Integration Tests
**Location**: `utils/__tests__/*DataFlow.test.ts`  
**Purpose**: Validate complete data flows end-to-end

#### Experience Data Pipeline Test
```typescript
// utils/__tests__/experienceDataFlow.test.ts
describe('Experience Data Flow Integration', () => {
  it('validates complete pipeline: AI → Transform → Database → UI', () => {
    // 1. Mock Gemini response with complete data
    const mockAiResponse: ExperienceItem = {
      title: "Senior Engineer",
      company: "TechCorp", 
      current: true,
      responsibilities: ["API development", "Team mentoring"],
      achievements: ["99.9% uptime", "40% improvement"],
      teamSize: 4,
      techStack: ["Node.js", "React", "PostgreSQL"]
    };
    
    // 2. Validate AI response schema
    const aiValidation = ExperienceItemSchema.safeParse(mockAiResponse);
    expect(aiValidation.success).toBe(true);
    
    // 3. Test data transformation
    const transformed = transformExperience([mockAiResponse]);
    expect(transformed[0].responsibilities).toEqual(mockAiResponse.responsibilities);
    
    // 4. Verify database compatibility
    expect(validateDatabaseCompatibility(transformed)).toEqual({
      compatible: true,
      errors: []
    });
    
    // 5. Ensure UI can consume result
    expect(validateTransformedExperience(transformed[0])).toBe(true);
  });
});
```

### 2. API Contract Testing
**Location**: `api/__tests__/*.test.ts`  
**Purpose**: Validate REST endpoint contracts

#### CV Upload API Integration
```typescript
// api/__tests__/cvUpload.test.ts
describe('CV Upload API Integration', () => {
  it('should handle complete upload → analysis → response flow', async () => {
    // Mock file upload
    const mockFile = new File(['CV content'], 'test-cv.pdf', { type: 'application/pdf' });
    
    // Mock Gemini analysis response
    jest.spyOn(geminiService, 'analyzeCv').mockResolvedValue({
      experience: [mockExperienceData],
      skills: [mockSkillData],
      contactInfo: mockContactData
    });
    
    // Test API endpoint
    const response = await request(app)
      .post('/api/cv/upload')
      .attach('file', Buffer.from('CV content'), 'test-cv.pdf')
      .expect(201);
    
    // Validate response structure
    expect(response.body).toMatchObject({
      cvId: expect.any(String),
      status: 'PENDING',
      filename: 'test-cv.pdf'
    });
    
    // Verify database record created
    const cvRecord = await prisma.cv.findUnique({
      where: { id: response.body.cvId }
    });
    expect(cvRecord).toBeTruthy();
  });
});
```

### 3. Component Contract Testing
**Location**: `components/__tests__/*.integration.test.ts`  
**Purpose**: Test component interfaces and data consumption

#### Analysis Result Display Integration
```typescript
// components/__tests__/AnalysisResultDisplay.integration.test.ts
describe('AnalysisResultDisplay Integration', () => {
  it('should render complete analysis data correctly', () => {
    const mockAnalysisData = {
      experience: [createMockExperience()],
      skills: [createMockSkill()],
      contactInfo: createMockContactInfo(),
      about: "Test about section"
    };
    
    render(
      <Provider store={createMockStore({ analysisData: mockAnalysisData })}>
        <AnalysisResultDisplay />
      </Provider>
    );
    
    // Verify all data sections render
    expect(screen.getByTestId('experience-section')).toBeInTheDocument();
    expect(screen.getByTestId('skills-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    
    // Verify specific experience data renders
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });
  
  it('should handle missing optional data gracefully', () => {
    const minimalData = {
      experience: [{
        title: "Developer",
        company: "StartupCorp"
        // Missing: achievements, responsibilities, techStack
      }]
    };
    
    render(
      <Provider store={createMockStore({ analysisData: minimalData })}>
        <AnalysisResultDisplay />
      </Provider>
    );
    
    // Should render without errors
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('StartupCorp')).toBeInTheDocument();
  });
});
```

---

## 🔧 TESTING UTILITIES

### Mock Data Factories
```typescript
// utils/__tests__/testFactories.ts
export const createMockExperience = (overrides: Partial<ExperienceItem> = {}): ExperienceItem => ({
  title: "Software Engineer",
  company: "TestCorp", 
  description: "Developed applications",
  location: "Test City",
  startDate: "2023-01",
  endDate: null,
  current: true,
  responsibilities: ["Write code", "Review PRs"],
  achievements: ["Delivered on time", "High quality"],
  teamSize: 3,
  techStack: ["JavaScript", "React"],
  ...overrides
});

export const createMockApiResponse = (data: any) => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});
```

### Validation Utilities
```typescript
// utils/__tests__/validationHelpers.ts
export const validateExperienceIntegrity = (
  original: ExperienceItem,
  transformed: ProfileUpdatePayload['experience'][0]
): boolean => {
  const checks = [
    original.title === transformed.title,
    original.company === transformed.company,
    JSON.stringify(original.responsibilities || []) === JSON.stringify(transformed.responsibilities),
    JSON.stringify(original.techStack || []) === JSON.stringify(transformed.techStack),
    original.teamSize === transformed.teamSize
  ];
  
  return checks.every(check => check === true);
};

export const validateDatabaseCompatibility = (data: any[]): ValidationResult => {
  const errors: string[] = [];
  
  const compatible = data.every((item, index) => {
    if (typeof item.title !== 'string') {
      errors.push(`Item ${index}: title must be string`);
      return false;
    }
    if (!Array.isArray(item.responsibilities)) {
      errors.push(`Item ${index}: responsibilities must be array`);
      return false;
    }
    return true;
  });
  
  return { compatible, errors };
};
```

### Database Test Helpers
```typescript
// utils/__tests__/dbHelpers.ts
export const createTestUser = async () => {
  return await prisma.developer.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      subscriptionTier: 'FREE'
    }
  });
};

export const cleanupTestData = async () => {
  await prisma.cv.deleteMany({ where: { developerId: 'test-user-id' } });
  await prisma.experience.deleteMany({ where: { developerId: 'test-user-id' } });
};
```

---

## 🧪 ADVANCED INTEGRATION PATTERNS

### Redis Integration Testing
```typescript
describe('Redis Cache Integration', () => {
  it('should cache and retrieve analysis results', async () => {
    const cacheKey = 'analysis:test-user:cv-123';
    const analysisData = { experience: [createMockExperience()] };
    
    // Test cache set
    await cacheSet(cacheKey, JSON.stringify(analysisData), 3600);
    
    // Test cache get
    const cached = await cacheGet(cacheKey);
    expect(JSON.parse(cached)).toEqual(analysisData);
    
    // Test cache expiration
    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds
    // Cache should still exist (TTL is 3600 seconds)
    const stillCached = await cacheGet(cacheKey);
    expect(stillCached).toBeTruthy();
  });
  
  it('should handle cache failures gracefully', async () => {
    // Mock Redis failure
    jest.spyOn(redis, 'get').mockRejectedValue(new Error('Redis connection failed'));
    
    // Function should not throw, should return null
    const result = await cacheGet('any-key');
    expect(result).toBeNull();
  });
});
```

### Gemini API Integration Testing
```typescript
describe('Gemini AI Integration', () => {
  it('should parse CV and return structured data', async () => {
    const mockCvText = `
      John Doe - Senior Developer
      Experience: Led team of 5 developers at TechCorp
      Technologies: React, Node.js, PostgreSQL
    `;
    
    // Mock Gemini API response
    const mockGeminiResponse = {
      response: {
        text: () => JSON.stringify({
          experience: [{
            title: "Senior Developer",
            company: "TechCorp", 
            teamSize: 5,
            techStack: ["React", "Node.js", "PostgreSQL"]
          }]
        })
      }
    };
    
    jest.spyOn(geminiModel, 'generateContent').mockResolvedValue(mockGeminiResponse);
    
    const result = await analyzeCvWithGemini(mockCvText);
    
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].teamSize).toBe(5);
    expect(result.experience[0].techStack).toContain("React");
  });
});
```

### Webhook Integration Testing
```typescript
describe('Stripe Webhook Integration', () => {
  it('should process subscription update webhook', async () => {
    const webhookPayload = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          items: {
            data: [{ price: { id: 'price_premium' } }]
          }
        }
      }
    };
    
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(webhookPayload),
      secret: process.env.STRIPE_WEBHOOK_SECRET!
    });
    
    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .send(webhookPayload)
      .expect(200);
    
    // Verify user subscription was updated
    const user = await prisma.developer.findUnique({
      where: { stripeCustomerId: 'cus_123' }
    });
    expect(user?.subscriptionTier).toBe('PREMIUM');
  });
});
```

---

## 📊 INTEGRATION TEST EXECUTION

### Test Environment Setup
```typescript
// jest.config.integration.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.setup.ts'],
  testTimeout: 30000 // Longer timeout for integration tests
};
```

### Setup and Teardown
```typescript
// tests/setup/integration.setup.ts
beforeAll(async () => {
  // Start test database
  await startTestDatabase();
  
  // Initialize Redis connection
  await connectToTestRedis();
  
  // Setup mock external services
  setupMockServices();
});

afterAll(async () => {
  // Cleanup test data
  await cleanupTestDatabase();
  
  // Close connections
  await closeTestConnections();
});

beforeEach(async () => {
  // Clear test data before each test
  await clearTestData();
});
```

### Running Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test suite
npm run test:integration -- experienceDataFlow

# Run with coverage
npm run test:integration -- --coverage

# Run in watch mode during development
npm run test:integration -- --watch
```

---

## 📈 SUCCESS METRICS

### Integration Test Quality Indicators
- **Data Pipeline Integrity**: 100% field preservation across transformations
- **Schema Validation Coverage**: All API contracts validated
- **Error Handling**: Graceful degradation for external service failures
- **Performance**: Integration tests complete within 2 minutes

### Monitoring & Alerts
- **Schema Validation Failures**: Alert on any contract breaking changes
- **Data Transformation Errors**: Monitor field mapping accuracy
- **API Response Time**: Track integration test execution speed
- **External Service Mocking**: Ensure mocks stay up-to-date with real services

---

*Integration testing ensures TechRec's components work together reliably, preventing the data flow mismatches and integration failures that impact user experience.*