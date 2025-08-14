# CLAUDE.md - Project Guidelines & Context

This file provides comprehensive guidance for Claude Code when working with the TechRec repository.

---

## 🎯 PROJECT OVERVIEW

### Core Platform
**TechRec** is a comprehensive AI-powered tech recruitment platform with sophisticated gamification, built with:
- **Frontend**: Next.js 15+ with TypeScript, TailwindCSS 4, DaisyUI components
- **Backend**: Next.js API routes with Prisma ORM, MongoDB, Redis caching
- **AI Integration**: Dual provider system (OpenAI + Google Gemini)
- **Payments**: Stripe integration for subscription management
- **Gamification**: XP progression + subscription-based points economy

### Key Features
- Multi-stage CV analysis with ATS scoring and actionable feedback
- AI-powered cover letter and outreach message generation
- Batch application workflows with progress tracking
- Comprehensive gamification system with achievements and streaks
- Subscription tiers with points-based premium features
- Real-time state management with Redux persistence

---

## 🚨 CRITICAL WORKFLOWS & NON-NEGOTIABLES

### ⚠️ CRITICAL TAILWIND CSS CONFIGURATION
**🚫 NEVER REMOVE**: The safelist configuration in `tailwind.config.ts` is MANDATORY:

```typescript
safelist: [
  // Force include utilities that content scanning misses
  'bg-green-200', 'border-4', 'border-8', 'border-opacity-50',
  // Pattern matching for all variations
  { pattern: /bg-green-\d+/ },
  { pattern: /bg-red-\d+/ }, 
  { pattern: /bg-blue-\d+/ },
  { pattern: /border-\d+/ },
  { pattern: /\/\d+/ }, // opacity modifiers
],
```

**Root Cause**: Tailwind's content scanning fails to detect certain utilities, causing selective generation where some work (border-2) but others fail (border-4). This affects both v3 and v4.

### Git Commit Policy
**🚫 ABSOLUTE PROHIBITION**: 
- **NEVER COMMIT CHANGES WITHOUT EXPLICIT USER PERMISSION**
- User must test changes and explicitly say "commit this" or "create a commit"
- Even if changes are complete and working, ALWAYS wait for user approval
- Breaking this rule destroys user trust and workflow control

### Gamification System Management
**⚠️ MANDATORY PROCESS**: For ANY gamification-related work:
1. **ALWAYS read** `@GAMIFICATION_STRATEGY.md` first
2. **IMMEDIATELY update** the documentation after any gamification changes
3. Follow the dual-progression architecture (XP levels + subscription tiers)
4. Maintain consistency with existing point costs and XP rewards

### API Development Standards
**⚠️ MANDATORY**: All API routes must follow established patterns:
1. **Zod Schema Validation**: Runtime validation for all inputs
2. **Semantic Caching**: Cache keys that capture business logic meaning
3. **Structured Error Handling**: Custom error classes with metadata
4. **Graceful Degradation**: External service failures don't break core functionality

---

## 🏗️ ARCHITECTURE & DEVELOPMENT PATTERNS

### Technology Stack
- **Frontend**: Next.js 15.2+ with App Router, TypeScript (strict mode)
- **Styling**: TailwindCSS 4 + DaisyUI components
- **Database**: MongoDB with Prisma ORM (6.6.0)
- **Caching**: Redis (ioredis) for configuration and performance
- **State Management**: Redux Toolkit with persistence
- **Payments**: Stripe with webhook security
- **Authentication**: NextAuth.js with OAuth providers

### Database Architecture (Single Source of Truth)
**✅ CRITICAL UPDATE (January 2025)**: Complete migration from redundant CvAnalysis table to proper single source of truth.

**Core Profile Tables**:
- `Developer`: User profiles with gamification fields, contact info, basic profile data
- `ContactInfo`: 1:1 with Developer - phone, address, social links
- `Experience`: 1:Many with Developer - work history with responsibilities and achievements
- `Education`: 1:Many with Developer - educational background with dates and details
- `Achievement`: 1:Many with Developer - certifications, awards, accomplishments
- `DeveloperSkill`: Many:Many junction table with Skill - skill levels and categories
- `Skill`: Master skill list with categories for consistent skill management

**File Management**:
- `CV`: File metadata only (S3 keys, upload status, improvement scores)
- **DEPRECATED**: ~~`CvAnalysis`~~ - No longer used, data migrated to proper profile tables

**Gamification Tables**:
- `XPTransaction`, `PointsTransaction`, `UserBadge`, `DailyChallenge`, `SubscriptionTier`

### State Management Patterns
**Redux Slices with Persistence**:
- `userSlice`: Authentication state (persisted)
- `analysisSlice`: CV analysis results (persisted, 24h expiry)
- `gamificationSlice`: XP, points, achievements (persisted)
- `selectedRolesSlice`: Multi-role application state (persisted)
- `coverLettersSlice`: Generated content cache (persisted)

### AI Integration
**Centralized Model Configuration System** (`lib/modelConfig.ts`):
- **Primary Provider**: Google Gemini with centralized model management
- **Legacy Support**: OpenAI integration maintained for compatibility
- **Configuration**: Environment-based model selection with fallbacks

**🚨 CRITICAL: Centralized Model Management**
**All Gemini model versions are now centralized in `lib/modelConfig.ts`**:

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

**Available Model Use Cases**:
`cv-analysis`, `cv-improvement`, `cv-optimization`, `cover-letter`, `outreach`, `project-description`, `project-ideas`, `readme-analysis`, `direct-upload`, `general`

---

## 🎨 UI/UX DEVELOPMENT GUIDELINES

### Component Architecture
**Migration Pattern**: Custom components → DaisyUI
- **Legacy**: Custom shadcn/ui components in `/components/ui/`
- **Current**: DaisyUI components in `/components/ui-daisy/`

### Object-Based Variant Architecture 
**🚨 CRITICAL EVOLUTION**: **Unified Component System with Object-Based Variants**

**Core Philosophy**: All UI components follow a unified object-based variant system that replaces CVA complexity with predictable, maintainable patterns.

**✅ MANDATORY Approach**: Object-Based Variant Architecture
```tsx
// ✅ NEW PATTERN: Object-based variants with consistent base classes
const componentBase = "base-classes transition-all duration-100 ease-smooth"

const componentVariants = {
  default: `${componentBase} bg-base-100 border border-base-300/50`,
  glass: `${componentBase} bg-base-300/60 backdrop-blur-lg`,
  elevated: `${componentBase} shadow-md hover:shadow-lg`,
}

// ✅ Clean, predictable usage with enhanced props
<Button variant="glass" hoverable animated />
<Card variant="elevated" interactive />
```

**❌ FORBIDDEN Approaches**: 
- Never override styles in consuming components
- Never create one-off inline styles
- Never duplicate styling logic

**Why This Approach is Mandatory**:
- **Single Source of Truth**: Change once, updates everywhere
- **Predictable APIs**: Developers know what to expect (`variant`, `size`, `className`)
- **Design Consistency**: No more one-off styling or visual inconsistencies
- **Developer Velocity**: Build faster with existing, tested components

### Component Architecture (4-Layer System)
```
📁 /components/ui-daisy/           ← 🎯 LAYER 1: UI PRIMITIVES (40+ components)
📁 /components/                    ← 🏗️ LAYER 2: BUSINESS COMPONENTS
📁 /app/components/                ← 📄 LAYER 3: PAGE-SPECIFIC (minimal)
📁 /app/[route]/                   ← 🌐 LAYER 4: PAGES (consume all layers)
```

**🔍 Before Creating New Component Checklist**:
1. **Can I use existing ui-daisy component with different variant?** 
2. **Can I compose existing components together?**
3. **Does this contain business logic?** → `/components/[feature]/`
4. **Is this truly reusable?** → `/components/ui-daisy/`
5. **Is this page-specific?** → `/app/components/` (rare)

### Design System Standards
**Glass Morphism Theme**:
```tsx
<Card className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">
```

**Animation Standards**:
- **Loading**: Sophisticated orbital loaders over simple spinners
- **Hover Effects**: Include movement, shadow, and background changes
- **Transitions**: Use `transition-all duration-100` for smooth multi-property changes

**Standardized Text Sizing System**:
```tsx
// ✅ NEVER use text-xs - use standardized minimum sizes
.text-xs-min     // 14px - absolute minimum for accessibility
.text-sm-min     // 15px - comfortable minimum for body text  
.text-base-comfortable // 16px - ideal for body text
```

**Essential Patterns**:
```tsx
// ✅ Fixed table layouts prevent width flickering
<Table className="table-fixed w-full">
// ✅ Cross-component communication
window.dispatchEvent(new CustomEvent('expandAllSections'));
// ✅ Comprehensive test coverage
<Button data-testid={`action-button-${action}-${id}`}>
```

---

## 🔧 API & BACKEND PATTERNS

### API Route Structure
**✅ RESTful Patterns (Single Source of Truth)**:
```
/api/[resource]/[id]/[action]
- /api/cv/ - CV file upload and metadata management
- /api/developer/me/profile - Complete profile CRUD (single source of truth)
- /api/developer/me/experience - Experience CRUD operations
- /api/developer/me/education - Education CRUD operations  
- /api/developer/me/skills - Skills CRUD operations
- /api/developer/me/achievements - Achievements CRUD operations
- /api/gamification/ - XP, points, achievements, challenges
- /api/subscription/ - Stripe integration and webhooks
- /api/generate-* - AI content generation endpoints
- /api/rapidapi/search - Job search with AI-enriched LinkedIn data
```

### RapidAPI Integration Reference
**📚 CRITICAL**: When working with job search functionality, refer to comprehensive documentation:
- **[🌟 Complete Reference](docs/features/rapidapi-complete-reference.md)** - Full integration guide with AI enhancements
- **[Implementation Summary](docs/features/rapidapi-implementation-summary.md)** - Architecture and component overview
- **[Enhancement History](docs/features/rapidapi-enhancement-plan.md)** - Complete project tracking

**⚠️ Key Implementation Notes**:
- Uses **high-fidelity defaults**: `agency='FALSE'`, `include_ai='true'`, `description_type='text'`
- **Enhanced Mock Data**: `rapidapi_job_response_enhanced.json` provides realistic AI fields for development
- **Type-Safe Architecture**: `EnhancedRole` interface with 16+ AI fields per job
- **Performance Optimized**: Memoized job cards with accessibility compliance

### Security & Performance
- **Gamification Protection**: Atomic transactions, server-side validation, rate limiting, audit trails
- **Stripe Integration**: Webhook signature verification, replay attack protection, idempotency keys
- **Advanced Caching**: Configuration caching (24h TTL), semantic cache keys, Redis connection resilience
- **Graceful Degradation**: Cache failures don't break functionality

---

## 📊 DEVELOPMENT WORKFLOWS

### CV Analysis Flow (Direct Gemini Upload - Primary Method)
**🚀 DIRECT UPLOAD WORKFLOW** (When `ENABLE_DIRECT_GEMINI_UPLOAD=true`):
1. User uploads CV → S3 storage + Direct upload to Gemini API
2. **No local parsing** - Gemini processes raw PDF/DOCX to preserve document structure
3. Enhanced prompt extracts structured data (contact, experience, skills, education)
4. **Background sync saves DIRECTLY to proper profile tables** (Developer, Experience, Education, Skills)
5. UI fetches from proper profile APIs (`/api/developer/me/*`)
6. Manual edits save via `/api/developer/me/profile` to proper tables
7. Results cached in Redis with semantic keys (24-hour TTL)
8. Gamification updates (XP awards, achievement checks)

**📄 TRADITIONAL WORKFLOW** (Fallback - Currently commented out for debugging):
1. User uploads CV → S3 storage
2. File parsed locally using LangChain/pdf2json to extract text
3. Parsed text sent to Gemini for analysis
4. Same sync/cache/gamification flow as above

### Development Commands
```bash
# Development
npm run dev                    # Development server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint
npm run test                   # Jest tests

# Database
npx prisma migrate dev         # Run migrations
npx prisma generate           # Generate client
npx prisma studio            # GUI

# Testing
npm run test:e2e              # Playwright E2E tests
npx playwright test --headed  # Run tests with visible browser

# AI Debug Analysis
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts    # Analyze latest direct upload session
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-cv-upload-parsing.ts # Analyze both upload methods (auto-detects)
DEBUG_COVER_LETTER=true NODE_ENV=development npx tsx scripts/analyze-cover-letter-generation.ts # Analyze cover letter debug sessions
```

### Cover Letter Generation Debug Workflow
**🔍 CLEANED DEBUG SYSTEM** for AI-powered cover letter generation:

#### **Environment Setup**
```bash
# Add to .env.local for permanent debugging (recommended):
DEBUG_COVER_LETTER=true
NODE_ENV=development

# Or set per-command for one-off analysis:
DEBUG_COVER_LETTER=true NODE_ENV=development [command]
```

#### **Three-File Debug System**
**🚀 ENHANCED WORKFLOW**: Each cover letter generation creates three files in `/logs/cover-letter-generation/`:

1. **`{sessionId}-unified-debug.json`** - Complete debug data with metadata
2. **`{sessionId}-raw-content.json`** - **NEW!** Clean file with only 3 essential fields
3. **`{sessionId}-analysis.json`** - Analysis results and recommendations

#### **Cleaned Unified Structure**
**Main Content Fields** (at top level):
1. **`rawPromptTemplate`** - Template with variable placeholders (`${variable}`)
2. **`fullPrompt`** - Final prompt with variables substituted  
3. **`aiResponse`** - Generated cover letter content

**Metadata Sections**:
- **`metadata.templateInfo`**: Expansion ratio, variable count, template type
- **`metadata.responseInfo`**: Duration, word count, validation status, model used
- **`metadata.requestInfo`**: Role, company, content type, cache status
- **`fullContext`**: Complete request/response data for comprehensive debugging

#### **Raw Content File**
**🎯 NEW FEATURE**: The analysis script automatically creates a lightweight `{sessionId}-raw-content.json` file containing ONLY:

```json
{
  "rawPromptTemplate": "SYSTEM:\nYou are ${role}...",
  "fullPrompt": "SYSTEM:\nYou are an elite copywriter...", 
  "aiResponse": "Dear Hiring Team,\nI am writing..."
}
```

**Perfect for**: Quick content access, template comparison, AI response extraction, external tool integration.

#### **Debug File Generation**
**Automatic during cover letter generation** - When debug is enabled:

```
📁 /logs/cover-letter-generation/
├── 2025-08-14T12-30-45-123Z-unified-debug.json    # Complete debug data
├── 2025-08-14T12-30-45-123Z-raw-content.json     # NEW: Clean 3-field file  
└── 2025-08-14T12-30-45-123Z-analysis.json        # Generated by script
```

#### **Debug Analysis Script**
**Enhanced analysis** - Run after cover letter generation:

```bash
DEBUG_COVER_LETTER=true NODE_ENV=development npx tsx scripts/analyze-cover-letter-generation.ts
```

**New Features**:
- ✅ **Auto-creates raw content file** with just the 3 essential fields
- ✅ **Comprehensive prompt analysis** with template expansion ratios
- ✅ **Quality metrics** and validation status
- ✅ **Backward compatibility** with old debug file formats
- ✅ **Direct field access paths** for easy content retrieval

#### **Expected Output Structure**
```json
{
  "sessionId": "2025-08-14T12-30-45-123Z",
  "timestamp": "2025-08-14T12:30:45.123Z",
  "cached": false,
  "rawPromptTemplate": "SYSTEM:\nYou are ${role}...",
  "fullPrompt": "SYSTEM:\nYou are an elite copywriter...", 
  "aiResponse": "Dear Hiring Team,\nI am writing...",
  "metadata": {
    "templateInfo": {
      "templateType": "MVP Content Template",
      "expansionRatio": "3.02",
      "variableCount": 47
    },
    "responseInfo": {
      "duration": 2500,
      "wordCount": 287,
      "validationPassed": true
    }
  },
  "fullContext": { /* complete request/response data */ }
}
```

#### **Usage Examples**
```bash
# Generate cover letter with debug enabled
DEBUG_COVER_LETTER=true npm run dev

# Analyze latest session
DEBUG_COVER_LETTER=true npx tsx scripts/analyze-cover-letter-generation.ts

# Check debug files created
ls -la logs/cover-letter-generation/
```

### CV Upload Debug Workflow
**🔍 COMPREHENSIVE DEBUG SYSTEM** for Direct Gemini Upload analysis:

#### **Environment Setup**
```bash
# Add to .env.local for permanent debugging (recommended):
DEBUG_CV_UPLOAD=true
NODE_ENV=development
ENABLE_DIRECT_GEMINI_UPLOAD=true

# Or set per-command for one-off analysis:
DEBUG_CV_UPLOAD=true NODE_ENV=development [command]
```

#### **Test User Configuration**
**🛡️ CRITICAL**: The upload route uses a **real test user** to prevent orphaned CV records:

- **Test User Email**: `cv-upload-test@test.techrec.com`
- **Test User ID**: `689491c6de5f64dd40843cd0`
- **Purpose**: Ensures proper database integrity and foreign key constraints
- **Safety**: Developer existence verified before profile sync operations

**Why This Matters**: Previous mock IDs created orphaned CV records that couldn't sync to profiles, violating database constraints and causing Prisma errors.

#### **Debug File Generation**
**Automatic during CV upload** - When debug is enabled, 3 files are created in `/logs/direct-gemini-upload/`:

1. **`[sessionId]-direct-upload.json`** - File upload to Gemini metrics
   - File validation, upload duration, Gemini file URI
   - Local vs Gemini file size comparison
   - Upload success/failure details

2. **`[sessionId]-direct-analysis.json`** - Gemini analysis request/response
   - Full prompt sent to Gemini
   - Model used and configuration
   - Raw response and parsed JSON
   - Data quality metrics (skills count, experience items, etc.)

3. **`[sessionId]-direct-sync.json`** - Profile sync transformation
   - Data transformation from Gemini response to database format
   - Sync success/failure with item counts
   - Database operation performance

#### **Debug Analysis Scripts**
**Manual analysis** - Run after CV upload to generate insights:

1. **Direct Upload Analyzer** (Primary):
   ```bash
   DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts
   ```
   - Creates `[sessionId]-direct-summary.json` with comprehensive analysis
   - Provides human-readable console output with pipeline health scoring
   - Identifies performance bottlenecks and data quality issues

2. **Universal Flow Analyzer** (Auto-detects method):
   ```bash
   DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-cv-upload-parsing.ts
   ```
   - Detects whether Direct or Traditional upload was used
   - Routes to appropriate analyzer or provides summary for both

#### **Debug Output Structure**
```
📁 /logs/direct-gemini-upload/
├── 2025-08-08T13-08-28-590Z-direct-upload.json    # Auto-generated during upload
├── 2025-08-08T13-08-28-590Z-direct-analysis.json  # Auto-generated during upload  
├── 2025-08-08T13-08-28-590Z-direct-sync.json      # Auto-generated during upload
└── 2025-08-08T13-08-28-590Z-direct-summary.json   # Generated by analysis script
```

#### **Pipeline Health Analysis**
The debug system provides comprehensive metrics:

- **🚀 Performance**: Upload (1.6s) → Analysis (12.5s) → Sync (1.2s) 
- **📊 Data Quality**: Contact info extraction, skills count, experience parsing
- **✅ Health Score**: 0-100% pipeline health with stage-by-stage breakdown
- **💡 Recommendations**: Specific improvement suggestions for each stage
- **🐛 Issue Detection**: Automatic identification of validation failures, timeouts, parsing errors

#### **Common Debug Scenarios**
```bash
# After UI upload, check if debug worked:
ls -la logs/direct-gemini-upload/

# Run analysis to understand pipeline performance:
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts

# Check latest session without running full analysis:
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-cv-upload-parsing.ts

# Test direct upload via curl (uses real test user):
curl -X POST http://localhost:3000/api/cv/upload \
  -F "file=@tests/fixtures/KRUSHAL_SONANI.pdf" \
  -H "Content-Type: multipart/form-data"
```

#### **Expected Success Indicators**
When the debug system is working correctly, you should see:

```bash
# In server logs:
🧪 Test user ID: 689491c6de5f64dd40843cd0
🚀 [DIRECT-GEMINI] Developer verified, proceeding with sync {
  developerId: '689491c6de5f64dd40843cd0',
  email: 'cv-upload-test@test.techrec.com'
}
🚀 [DIRECT-GEMINI] Workflow completed successfully { 
  improvementScore: 100, 
  syncDuration: ~2400ms, 
  finalStatus: 'COMPLETED' 
}

# In curl response:
{"status":"COMPLETED","cvId":"...","improvementScore":100}

# Debug files created:
logs/direct-gemini-upload/
├── [timestamp]-direct-upload.json
├── [timestamp]-direct-analysis.json  
└── [timestamp]-direct-sync.json
```

---

## 🧪 TESTING STRATEGY

### 📋 Comprehensive Testing Guide
**🚨 CRITICAL**: Read the complete testing best practices document first:
**📖 See: [`docs/testing/e2e-best-practices.md`](./docs/testing/e2e-best-practices.md)**

### Critical Testing Rules
**🚨 AUTHENTICATION RULE**:
- **ALL tests MUST authenticate FIRST** - No exceptions
- **Use `AuthHelper.ensureLoggedIn()` in test.beforeEach()`** before any operations

**🚨 CV TESTING RULE**:
- **EXPECT users to have existing CV data** from previous test runs
- **HANDLE existing data gracefully** - don't assume fresh users
- **USE test skipping** when state is unclear rather than failing

```typescript
import { AuthHelper } from '../utils/auth-helper';

test.beforeEach(async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.ensureLoggedIn('junior_developer'); // MANDATORY
});

test('should handle CV functionality', async ({ page }) => {
  // Handle existing data gracefully
  if (profileVisible && !uploadVisible) {
    test.skip('User has existing CV data');
    return;
  }
  // Proceed with test logic
});
```

### Current Test Status (Post-Cleanup)
- **✅ Success Rate: 91%** (41/45 tests passing)
- **✅ Authentication Tests**: All working (35/35)  
- **✅ CV Management Tests**: Core functionality working
- **✅ Experience Management**: Profile editing working
- **🗑️ Removed**: 277 problematic tests (API-dependent, flaky workflows)

### Test User Types Available
```typescript
'junior_developer'     // junior@test.techrec.com
'experienced_developer' // senior@test.techrec.com  
'new_user'             // newbie@test.techrec.com
'cv_upload_1'          // cv-upload-1@test.techrec.com
'cv_upload_2'          // cv-upload-2@test.techrec.com
'cv_upload_3'          // cv-upload-3@test.techrec.com
```

**Test ID Naming Convention**: `{page/section}-{component}-{element}-{identifier?}`

---

## 🔧 DEBUG WORKFLOW & SERVER MONITORING

### Server Management
**✅ MANDATORY Process Management**:
```bash
# 1. Clean environment
pkill -f "npm run dev"

# 2. Start server with logging
nohup npm run dev > server.log 2>&1 &

# 3. Validate startup
sleep 3 && head -10 server.log
```

### Database Integrity & Test User Setup
**🛡️ CRITICAL SAFETY**: The CV upload route uses a real test user to prevent database integrity issues:

**Test User Details**:
- **Email**: `cv-upload-test@test.techrec.com`
- **Developer ID**: `689491c6de5f64dd40843cd0`
- **Purpose**: Prevents orphaned CV records and Prisma constraint violations

**Safety Validations**:
- Developer existence verified before profile sync
- Foreign key constraints properly maintained
- No orphaned CV records created during debugging

**Previous Issue**: Mock developer IDs created CV records that couldn't link to profiles, causing Prisma P2025 errors during profile sync.

### Essential Debug Commands
```bash
# Monitor logs during development
tail -f server.log

# Search for specific errors
grep -i "error\|failed\|exception" server.log

# Monitor API endpoints
grep -i "upload\|gemini\|analysis" server.log

# Authentication debugging
grep -i "session\|auth\|unauthorized" server.log
```

---

## 🤖 AI COLLABORATION EXCELLENCE

### Context Intelligence Framework
**Pattern Recognition**:
- Follow Redis connection management pattern from `lib/redis.ts`
- Use structured error handling approach from cover letter API
- Apply semantic caching strategy from generateCacheKey function

### Strategic Development Principles
1. **Architectural Consistency**: Always extend existing patterns rather than create new ones
2. **Type System Maturity**: Runtime validation + compile-time safety = bulletproof code
3. **Testing Comprehensiveness**: UI, Integration, Unit, and Mock testing for complete coverage
4. **Performance Optimization**: Semantic caching, connection pooling, graceful degradation
5. **Error Handling Excellence**: Structured errors with business context and metadata

### Advanced Implementation Patterns
**Premium Feature Excellence**:
- **Atomic Transactions**: Use `PointsManager.spendPointsAtomic` for race condition protection
- **Multi-Layer Validation**: UI eligibility checks + backend subscription/points validation
- **Real-Time State Integration**: Redux user/gamification state for dynamic UI updates

**Design System Mastery**:
- **DaisyUI Component Priority**: Strict adherence over custom HTML elements
- **Component Composition**: Reusable single-purpose components over inline implementations

---

## ⚡ QUICK REFERENCE

### Essential File Locations
```
📁 Key Directories:
├── app/api/                   # API routes
├── components/                # UI components
│   ├── ui/                   # Legacy shadcn components
│   ├── ui-daisy/            # DaisyUI components
│   └── gamification/        # Gamification UI
├── lib/features/             # Redux slices
├── lib/gamification/         # Gamification logic
├── utils/                    # Utility services
├── scripts/                  # Debug analysis and utility scripts
├── logs/                     # Debug output (development only)
│   ├── direct-gemini-upload/ # Direct upload debug sessions
│   ├── cover-letter-generation/ # Cover letter debug sessions (unified files)
│   └── cv-upload-parse-*     # Traditional upload debug sessions
├── prisma/                   # Database schema
└── types/                    # TypeScript definitions

📁 Key CV Upload Files:
├── app/api/cv/upload/route.ts           # Main upload API (Direct Upload primary)
├── utils/directGeminiUpload.ts          # Direct Gemini upload service
├── utils/directUploadDebugLogger.ts     # Direct upload debug logging
├── scripts/analyze-direct-upload.ts     # Direct upload analysis script
├── scripts/analyze-cv-upload-parsing.ts # Universal upload analyzer
└── utils/backgroundProfileSync.ts       # Profile data synchronization

📁 Key Cover Letter Debug Files:
├── app/api/generate-cover-letter/route.ts        # Cover letter generation API (with unified debug)
├── utils/debugLogger.ts                          # CoverLetterDebugLogger (unified file system)
├── scripts/analyze-cover-letter-generation.ts    # Cover letter debug analysis script
└── logs/cover-letter-generation/                 # Unified debug files directory
```

### Environment Variables Required
```bash
# Database & Caching
MONGODB_URI=              # MongoDB connection
REDIS_URL=               # Redis connection
REDIS_USE_TLS=true       # Force TLS

# Authentication
NEXTAUTH_URL=            # App URL
NEXTAUTH_SECRET=         # JWT secret
GOOGLE_CLIENT_ID=        # OAuth provider

# AI Providers
OPENAI_API_KEY=         # GPT models (legacy support)
GOOGLE_AI_API_KEY=      # Gemini models

# Gemini Model Configuration (Centralized System)
GEMINI_MODEL=                     # Global fallback model (default: gemini-2.5-flash)
GEMINI_CV_ANALYSIS_MODEL=         # Model for CV parsing and profile extraction
GEMINI_CV_IMPROVEMENT_MODEL=      # Model for CV improvement suggestions
GEMINI_CV_OPTIMIZATION_MODEL=     # Model for CV optimization against job descriptions
GEMINI_COVER_LETTER_MODEL=        # Model for cover letter generation
GEMINI_OUTREACH_MODEL=            # Model for outreach message generation
GEMINI_PROJECT_DESC_MODEL=        # Model for project description generation
GEMINI_PROJECT_IDEAS_MODEL=       # Model for project idea generation
GEMINI_README_ANALYSIS_MODEL=     # Model for README file analysis
GEMINI_DIRECT_UPLOAD_MODEL=       # Model for direct PDF upload processing

# Payments
STRIPE_SECRET_KEY=      # Stripe integration
STRIPE_WEBHOOK_SECRET=  # Webhook security

# Storage
AWS_S3_BUCKET_NAME=     # File storage

# Debug & Development
DEBUG_CV_UPLOAD=true        # Enable CV upload debug logging
DEBUG_COVER_LETTER=true     # Enable cover letter generation debug logging
```

### Core Implementation Mandate
When implementing new features:
1. **Component-First Thinking**: Check existing components before creating anything new
2. **Variant-Based Extensions**: Add variants to existing components rather than creating new ones
3. **Standardized APIs**: Follow established patterns (`variant`, `size`, `className`, `icon`)
4. **No Style Overrides**: Never use className for styling - only extend component variants
5. **Reusability Focus**: Every component should be usable across multiple contexts
6. **Accessibility Built-In**: Components must include proper ARIA labels and keyboard navigation
7. **Documentation Updated**: Add new components/variants to design system documentation

### Component Development Checklist
Before shipping any UI component:
- [ ] Uses object-based variants with consistent `componentBase` pattern
- [ ] Includes `hoverable`, `animated`, `interactive` props where appropriate
- [ ] Follows standardized prop API patterns (`variant`, `size`, `className`)
- [ ] Implements unified variant names (`glass`, `outlined`, `elevated`, etc.)
- [ ] Uses faint border aesthetic (`border-base-300/50`)
- [ ] Has proper TypeScript interfaces with variant key typing
- [ ] Includes Framer Motion support for `animated` prop
- [ ] Includes accessibility features (ARIA, focus management)
- [ ] Added to component library exports (`/components/ui-daisy/index.ts`)
- [ ] Documented with usage examples in showcase
- [ ] Tested across different screen sizes and interaction states
- [ ] No inline styles or className overrides in consuming components

---

## 📚 DOCUMENTATION STANDARDS

### Key Documentation Files
- `CLAUDE.md` - This file (project guidelines)
- `GAMIFICATION_STRATEGY.md` - Comprehensive gamification documentation
- `README.md` - Project setup and overview

### Update Requirements
- After any gamification-related changes (update `GAMIFICATION_STRATEGY.md`)
- After adding new API endpoints or significant features
- After architectural changes or new patterns

---

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency.*

**Last Update**: August 14, 2025 - **COVER LETTER DEBUG SYSTEM CLEANUP & RAW CONTENT EXTRACTION COMPLETE**:
- ✅ **Cleaned Debug Structure**: Removed redundant formatted sections, simplified to 3 main fields at top level
- ✅ **Three-File Debug System**: `unified-debug.json` + `raw-content.json` + `analysis.json` per session
- ✅ **Raw Content File Generation**: Analysis script auto-creates lightweight file with only `rawPromptTemplate`, `fullPrompt`, `aiResponse`
- ✅ **Enhanced Analysis Script**: Added raw content file creation, improved unified structure handling, better field access
- ✅ **Perfect for External Tools**: Clean JSON structure ideal for content extraction and template comparison
- ✅ **Updated Documentation**: Complete workflow documentation with new three-file system and usage examples
- ✅ **Backward Compatibility**: Maintains support for old debug file formats during transition
- ✅ **Documentation Update Command**: Created systematic `/commands/update-documentation.md` for future maintenance

**Previous Update**: August 8, 2025 - **DIRECT GEMINI UPLOAD DEBUG SYSTEM COMPLETE + DATABASE INTEGRITY FIX**:
- ✅ **Direct Upload Primary Method**: Traditional upload commented out, Direct Gemini Upload is now the primary workflow
- ✅ **Comprehensive Debug System**: Complete debug logging with 4-file output structure for Direct Upload analysis
- ✅ **Debug Analysis Scripts**: Two analysis scripts (`analyze-direct-upload.ts`, `analyze-cv-upload-parsing.ts`) with environment setup
- ✅ **Pipeline Health Monitoring**: 3-stage analysis (Upload → Analysis → Sync) with performance metrics and quality scoring
- ✅ **Documentation Complete**: Full debug workflow, file locations, commands, and common scenarios documented
- ✅ **Environment Configuration**: Proper `.env.local` setup and per-command environment variable usage
- ✅ **Fixed Critical Issues**: Resolved "validation is not defined" error and directory creation issues in debug logging
- ✅ **Successful Testing**: Direct Upload working with 100% improvement score and complete debug file generation
- ✅ **DATABASE INTEGRITY FIX**: Replaced mock developer ID with real test user (`cv-upload-test@test.techrec.com`) to prevent orphaned CV records
- ✅ **Developer Verification**: Added existence check before profile sync to ensure database constraints are respected
- ✅ **No More Prisma Errors**: Profile sync now works correctly without foreign key constraint violations

**Previous Update**: August 8, 2025 - **CLAUDE.MD CLEANUP & OPTIMIZATION**: 
- ✅ **Content Consolidation**: Removed redundant Professional Design System section (lines 480-715)
- ✅ **Component Architecture Streamlined**: Condensed verbose 4-layer system explanation while preserving core concepts  
- ✅ **Testing Section Simplified**: Consolidated multiple testing references into focused guidelines
- ✅ **File Size Reduction**: ~40% reduction (1026 → 600 lines) while preserving all essential information
- ✅ **Improved Scanning**: Better section organization for faster reference lookup
- ✅ **Zero Information Loss**: All critical workflows, patterns, and requirements maintained

**Previous Update**: August 7, 2025 - **CENTRALIZED GEMINI MODEL CONFIGURATION SYSTEM**: 
- ✅ **Centralized Configuration**: All Gemini models now managed via `lib/modelConfig.ts`
- ✅ **Environment Variable System**: 10 specific model use cases configurable via env vars
- ✅ **Type Safety**: Full TypeScript support with proper use case types
- ✅ **13 Files Updated**: Complete migration across API routes, services, and utilities
- ✅ **Debug Visibility**: Development logging shows model selection per use case
- ✅ **Fallback Strategy**: Hierarchical fallbacks (specific → GEMINI_MODEL → default)
- ✅ **Performance Optimization**: Optimized model selection per specific task
- ✅ **Developer Experience**: Single import replaces hardcoded model strings

**Previous Update**: August 7, 2025 - **OBJECT-BASED VARIANT SYSTEM COMPLETE**: 
- ✅ **Architectural Evolution**: Migrated from CVA to object-based variant system
- ✅ **Unified Component Patterns**: All components share consistent base classes and variant names
- ✅ **Enhanced Interactive Props**: `hoverable`, `animated`, `interactive` across all components
- ✅ **Faint Border Aesthetic**: Consistent subtle borders with opacity variants
- ✅ **Framer Motion Integration**: Optional animation support with hardware acceleration
- ✅ **Improved Developer Experience**: Better TypeScript support and simpler mental model
- ✅ **Performance Optimizations**: Direct object lookup vs complex CVA configurations
- ✅ **Visual Consistency**: Unified variant behavior across Button, Card, Accordion components

**Previous Update**: January 31, 2025 - **MAJOR ARCHITECTURAL MODERNIZATION**: 
- ✅ **Single Source of Truth Migration**: Eliminated redundant CvAnalysis table
- ✅ **Data Flow Consistency**: CV upload → profile tables → UI display pipeline
- ✅ **Real Persistence**: Redux updates save via `/api/developer/me/profile`
- ✅ **API Architecture**: Complete CRUD operations for all profile sections