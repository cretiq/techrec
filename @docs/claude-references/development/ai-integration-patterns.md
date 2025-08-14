# AI Integration Patterns

## 🚨 CRITICAL: Centralized Model Management

**All Gemini model versions are now centralized in `lib/modelConfig.ts`**

## Mandatory Usage Pattern

```typescript
// ✅ MANDATORY: Use centralized model configuration
import { getGeminiModel } from '@/lib/modelConfig';

// ✅ Get model for specific use case
const model = genAI.getGenerativeModel({ 
  model: getGeminiModel('cv-analysis'),  // Use case-specific model
  generationConfig: { ... }
});

// ❌ NEVER hardcode models directly
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',  // DON'T DO THIS
});
```

## Available Model Use Cases

The following use cases are supported by the centralized model configuration:

- **`cv-analysis`** - CV parsing and profile extraction
- **`cv-improvement`** - CV improvement suggestions  
- **`cv-optimization`** - CV optimization against job descriptions
- **`cover-letter`** - Cover letter generation
- **`outreach`** - Outreach message generation
- **`project-description`** - Project description generation
- **`project-ideas`** - Project idea generation
- **`readme-analysis`** - README file analysis
- **`direct-upload`** - Direct PDF upload processing
- **`general`** - General purpose AI tasks

## Environment Configuration

Each use case can be configured via environment variables:

```bash
GEMINI_MODEL=gemini-2.5-flash                     # Global fallback model
GEMINI_CV_ANALYSIS_MODEL=gemini-2.0-flash-exp    # Specific model for CV analysis
GEMINI_COVER_LETTER_MODEL=gemini-2.5-flash       # Specific model for cover letters
# ... etc for each use case
```

## Fallback Strategy

The system uses hierarchical fallbacks:
1. **Specific model** (e.g., `GEMINI_CV_ANALYSIS_MODEL`)
2. **Global fallback** (`GEMINI_MODEL`)
3. **Hardcoded default** (`gemini-2.5-flash`)

## Integration Examples

### CV Analysis
```typescript
import { getGeminiModel } from '@/lib/modelConfig';

const model = genAI.getGenerativeModel({ 
  model: getGeminiModel('cv-analysis'),
  generationConfig: {
    temperature: 0.1,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  }
});
```

### Cover Letter Generation
```typescript
import { getGeminiModel } from '@/lib/modelConfig';

const model = genAI.getGenerativeModel({ 
  model: getGeminiModel('cover-letter'),
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});
```

### Direct Upload Processing
```typescript
import { getGeminiModel } from '@/lib/modelConfig';

const model = genAI.getGenerativeModel({ 
  model: getGeminiModel('direct-upload'),
  generationConfig: {
    temperature: 0,
    topK: 1,
    topP: 1,
  }
});
```

## Development Benefits

### Type Safety
- Full TypeScript support with proper use case types
- Compile-time validation of model use cases
- IDE autocomplete for available use cases

### Performance Optimization
- Optimized model selection per specific task
- Reduced API costs through appropriate model selection
- Better response quality through task-specific models

### Maintainability
- Single source of truth for all model configurations
- Easy environment-based model switching
- Centralized model version management

### Debug Visibility
- Development logging shows model selection per use case
- Easy identification of which model is being used
- Clear audit trail of model usage

## Related Documentation

- **Centralized Model Configuration**: `lib/modelConfig.ts` - Source implementation
- **Environment Variables**: See reference docs for complete AI provider setup
- **Debug Workflows**: See workflow docs for AI debugging procedures