# Data Contracts & Schema Validation

**Updated**: January 31, 2025  
**Purpose**: Comprehensive schema validation strategy to prevent data flow mismatches between UI, backend, and database layers

---

## 🎯 OVERVIEW

### Problem Statement
**Historical Issue**: Data mismatches between UI display, backend processing, and database storage causing:
- Missing work experience in UI despite database storage
- Incorrect data type transformations
- Schema evolution breaking existing components
- Unreliable data pipeline behavior

### Solution Approach
**Schema-First Development**: Every data interface validated at runtime and compile-time using Zod schemas with comprehensive integration testing.

---

## 📋 SCHEMA ARCHITECTURE

### Experience Data Contract
**Primary Focus**: Experience data flows from AI analysis to database storage to UI display

```typescript
// Complete Experience Schema (types/cv.ts)
export const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(), 
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().optional(),
  
  // NEW FIELDS (added to prevent data loss)
  responsibilities: z.array(z.string()).nullable().optional(),
  achievements: z.array(z.string()).nullable().optional(),
  teamSize: z.number().nullable().optional(),
  techStack: z.array(z.string()).nullable().optional(),
  
  isNew: z.boolean().optional(),
});
```

### Data Flow Validation Points

#### 1. **AI Response Validation**
```typescript
// Validate Gemini API response
const aiResponse = await analyzeCvWithGemini(cvText);
const validation = ProfileAnalysisDataSchema.safeParse(aiResponse);

if (!validation.success) {
  throw new GeminiValidationError('AI response schema validation failed', {
    errors: validation.error.flatten()
  });
}
```

#### 2. **Transformation Validation** 
```typescript
// Validate data transformation
const transformedData = transformExperience(aiResponse.experience);
const transformedValidation = ExperienceItemSchema.array().safeParse(transformedData);

if (!transformedValidation.success) {
  throw new TransformationError('Experience transformation failed validation');
}
```

#### 3. **Database Compatibility**
```typescript
// Ensure data matches Prisma schema
const dbValidation = validateDatabaseCompatibility(transformedData);
expect(dbValidation.compatible).toBe(true);
```

---

## 🧪 CONTRACT TESTING PATTERNS

### Integration Test Framework
**File**: `utils/__tests__/experienceDataFlow.test.ts`

```typescript
describe('Experience Data Contract Validation', () => {
  it('validates complete pipeline: AI → Transform → Database → UI', () => {
    // Step 1: Mock realistic AI response
    const mockAiResponse: ExperienceItem = {
      title: "Senior Software Engineer",
      company: "TechCorp",
      current: true,
      responsibilities: ["API development", "Team mentoring"],
      achievements: ["99.9% uptime", "40% performance improvement"],
      teamSize: 4,
      techStack: ["Node.js", "React", "PostgreSQL"]
    };
    
    // Step 2: Validate AI response schema
    const aiValidation = ExperienceItemSchema.safeParse(mockAiResponse);
    expect(aiValidation.success).toBe(true);
    
    // Step 3: Test transformation
    const transformed = transformExperience([mockAiResponse]);
    expect(transformed[0].responsibilities).toEqual(mockAiResponse.responsibilities);
    
    // Step 4: Verify UI can consume result
    expect(validateTransformedExperience(transformed[0])).toBe(true);
  });
});
```

### Schema Evolution Testing
```typescript
describe('Schema Backward Compatibility', () => {
  it('handles missing optional fields gracefully', () => {
    const minimalExperience: ExperienceItem = {
      title: "Developer",
      company: "StartupCorp"
      // Missing: achievements, responsibilities, techStack, teamSize
    };
    
    const validation = ExperienceItemSchema.safeParse(minimalExperience);
    expect(validation.success).toBe(true);
    
    const transformed = transformExperience([minimalExperience]);
    expect(transformed[0].achievements).toEqual([]);
    expect(transformed[0].techStack).toEqual([]);
  });
});
```

---

## 🔧 VALIDATION UTILITIES

### Runtime Validation Functions

#### Experience Validation
```typescript
export const validateTransformedExperience = (
  experience: ProfileUpdatePayload['experience'][0]
): boolean => {
  const requiredFields = ['title', 'company'];
  const arrayFields = ['responsibilities', 'achievements', 'techStack'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!experience[field as keyof typeof experience]) {
      return false;
    }
  }
  
  // Validate array fields
  for (const field of arrayFields) {
    const value = experience[field as keyof typeof experience];
    if (!Array.isArray(value)) {
      return false;
    }
  }
  
  return true;
};
```

#### Database Compatibility Check
```typescript
export const validateDatabaseCompatibility = (data: any[]): ValidationResult => {
  return {
    compatible: data.every(item => {
      return typeof item.title === 'string' &&
             typeof item.company === 'string' &&
             Array.isArray(item.responsibilities) &&
             Array.isArray(item.achievements) &&
             Array.isArray(item.techStack) &&
             (typeof item.teamSize === 'number' || item.teamSize === null);
    }),
    errors: []
  };
};
```

### Test Data Factories
```typescript
export const createMockExperience = (overrides: Partial<ExperienceItem> = {}): ExperienceItem => ({
  title: "Software Engineer", 
  company: "TestCorp",
  description: "Developed software applications",
  location: "Test City",
  startDate: "2023-01",
  endDate: null,
  current: true,
  responsibilities: ["Write code", "Review PRs"],
  achievements: ["Delivered on time", "High quality work"],
  teamSize: 3,
  techStack: ["JavaScript", "React"],
  ...overrides
});
```

---

## 📊 SCHEMA MONITORING

### Validation Metrics
Track schema validation success/failure rates:

```typescript
// API endpoint validation tracking
const validateAndLog = (data: unknown, schema: ZodSchema, context: string) => {
  const validation = schema.safeParse(data);
  
  // Log metrics
  logger.info('Schema validation', {
    context,
    success: validation.success,
    errors: validation.success ? null : validation.error.flatten()
  });
  
  return validation;
};
```

### Breaking Change Detection
```typescript
// Pre-deployment schema compatibility check
const validateSchemaCompatibility = (newSchema: ZodSchema, testData: any[]) => {
  const incompatibleItems = testData.filter(item => {
    const validation = newSchema.safeParse(item);
    return !validation.success;
  });
  
  if (incompatibleItems.length > 0) {
    throw new SchemaBreakingChangeError(
      `Schema change breaks ${incompatibleItems.length} existing data items`
    );
  }
};
```

---

## 🚨 ERROR HANDLING

### Schema Validation Errors
```typescript
export class SchemaValidationError extends Error {
  constructor(
    message: string, 
    public context: string,
    public validationErrors: ZodError
  ) {
    super(`${context}: ${message}`);
    this.name = 'SchemaValidationError';
  }
}

// Usage in API endpoints
app.post('/api/experience', (req, res) => {
  try {
    const validation = ExperienceItemSchema.safeParse(req.body);
    if (!validation.success) {
      throw new SchemaValidationError(
        'Request body validation failed',
        'POST /api/experience',
        validation.error
      );
    }
    // Process valid data...
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      return res.status(400).json({
        error: error.message,
        validationErrors: error.validationErrors.flatten()
      });
    }
    // Handle other errors...
  }
});
```

### Graceful Degradation
```typescript
// Handle partial data gracefully
const transformExperienceWithFallbacks = (experiences: ExperienceItem[]) => {
  return experiences.map(exp => ({
    ...exp,
    responsibilities: exp.responsibilities || [],
    achievements: exp.achievements || [],
    techStack: exp.techStack || [],
    teamSize: exp.teamSize || null,
    description: exp.description || '',
    current: exp.current || false
  }));
};
```

---

## 📈 SUCCESS METRICS

### Contract Validation KPIs
- **Schema Validation Success Rate**: > 99%
- **Data Pipeline Integrity**: 100% field preservation
- **UI Data Display Accuracy**: Zero missing field incidents
- **API Contract Stability**: Zero breaking changes without migration

### Monitoring Dashboard
Track in real-time:
- Schema validation failures by endpoint
- Data transformation success rates  
- UI component data consumption errors
- Database constraint violations

---

*Data contracts ensure reliable, type-safe data flows throughout TechRec, preventing the UI/backend/database mismatches that previously caused user-facing issues.*