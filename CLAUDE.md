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
1. **Parameter Validation**: Runtime validation for all inputs
2. **Semantic Caching**: Cache keys that capture business logic meaning
3. **Structured Error Handling**: Custom error classes with metadata
4. **Graceful Degradation**: External service failures don't break core functionality
5. **Simplified Debug Modes**: Use single `DEBUG_RAPIDAPI` variable (off|log|stop)
6. **Explicit Configuration**: Use `USE_MOCK_DATA` flag instead of auto-detection

---

## 🧠 AI WORKING METHODOLOGY & VALIDATION

### ⚡ CONFIDENCE & EXECUTION STANDARDS

**🚨 MANDATORY CONFIDENCE THRESHOLD**:
- **95%+ confidence required** before executing any significant changes
- **Below 95% confidence**: Ask for clarification, gather more context, or propose alternatives
- **Never guess or assume** when dealing with critical business logic, security, or data integrity

**📋 PRE-EXECUTION VALIDATION CHECKLIST**:
1. **Do I understand the complete requirements?** (Not just the immediate ask)
2. **Have I read relevant documentation?** (Package docs, existing code patterns)
3. **Do I know the potential impact?** (Breaking changes, dependencies, side effects)
4. **Is my approach consistent with existing patterns?** (Architecture, code style, conventions)
5. **Have I considered edge cases and error scenarios?**

### 📚 MANDATORY DOCUMENTATION RESEARCH

**🔍 ALWAYS READ BEFORE IMPLEMENTING**:
- **Package/Library Documentation**: For ANY package you'll interact with (check version compatibility)
- **Existing Code Patterns**: Search codebase for similar implementations before creating new ones  
- **API Documentation**: For external services, databases, or complex internal APIs
- **Project-Specific Docs**: CLAUDE.md sections relevant to your task

**📖 VERSION-SPECIFIC DOCUMENTATION STRATEGY**:
1. **ALWAYS Check Package Versions FIRST**: Read `package.json` to identify exact versions
2. **Sequential Documentation Source Priority**:
   - **1st: Context7 MCP** → `mcp__context7-mcp__resolve-library-id` then `get-library-docs`
   - **2nd: Official Documentation** → Use exact version URLs (e.g., `docs.library.com/v2.1.3/`)
   - **3rd: GitHub/Repository Docs** → Check version tags for version-specific docs
   - **4th: Community Sources** → Only as fallback, verify against official sources
3. **Version Compatibility Verification**:
   - **Major Version Changes**: Read migration guides and breaking changes
   - **Minor/Patch Differences**: Check changelog for relevant updates
   - **Legacy Versions**: Understand deprecated features and upgrade paths
4. **Documentation Quality Validation**:
   - **Cross-reference** multiple sources for accuracy
   - **Verify with existing code** patterns in the project
   - **Test examples** from docs against actual package behavior

**📋 PRACTICAL EXAMPLE - React Documentation Reading**:
```bash
# 1. Check version first
grep "react" package.json  # Shows "react": "^18.2.0"

# 2. Use Context7 MCP for React 18.2.0 docs
mcp__context7-mcp__resolve-library-id("react")
mcp__context7-mcp__get-library-docs("/facebook/react/v18.2.0")

# 3. If Context7 unavailable, use version-specific URL
# ✅ CORRECT: https://react.dev/reference/react/useEffect (React 18)
# ❌ WRONG: https://react.dev/docs/hooks-effect (React 16 docs)

# 4. Cross-reference with existing usage in project
grep -r "useEffect" components/ --include="*.tsx"
```

### 🔄 SYSTEMATIC PROBLEM-SOLVING APPROACH

**📈 PROGRESSIVE COMPLEXITY HANDLING**:
1. **Start Simple**: Understand the basic requirement before adding complexity
2. **Plan in Stages**: Break complex tasks into smaller, validatable steps  
3. **Validate Early**: Test understanding with simple examples before full implementation
4. **Iterate and Refine**: Build incrementally, validating each step

**🧪 VALIDATION METHODS**:
- **Version-First Documentation Reading**: 
  1. Check `package.json` for exact version
  2. Use Context7 MCP for that specific version
  3. Fallback to official docs with version-specific URLs
  4. Cross-reference with project's existing implementation
- **Code Pattern Discovery**: Search for existing patterns using Grep/Glob tools
- **Type Compatibility Verification**: Check TypeScript interfaces and type compatibility
- **Breaking Changes Assessment**: Compare current usage vs documented changes
- **Impact Analysis**: Consider effects on existing functionality and dependencies

### 🚨 CRITICAL REVIEW REQUIREMENTS

**⚠️ MANDATORY SELF-REVIEW BEFORE EXECUTION**:
1. **Plan Validation**: "Does this plan address all requirements?"
2. **Risk Assessment**: "What could go wrong? How likely? How severe?"
3. **Alternative Evaluation**: "Is there a simpler, more maintainable approach?"
4. **Consistency Check**: "Does this follow existing project patterns?"
5. **Future-Proofing**: "Will this be maintainable as the project grows?"

**🔍 UNCERTAINTY ESCALATION PROTOCOL**:
- **High Impact + Low Confidence**: Always ask for clarification
- **Version Mismatches**: When project version differs significantly from available docs
- **Unfamiliar Technology**: Research documentation thoroughly first, starting with Context7 MCP
- **Business Logic Questions**: Validate understanding rather than guess
- **Breaking Changes**: Explicitly confirm intention and impact
- **Documentation Gaps**: When multiple sources conflict or lack version-specific info

### 🎯 QUALITY ASSURANCE STANDARDS

**✅ COMPLETION CRITERIA**:
- **Functional Requirements**: All stated requirements met
- **Non-Functional Requirements**: Performance, security, maintainability considered
- **Integration Points**: Changes work with existing systems
- **Documentation**: Updated where changes affect documented behavior
- **Testing**: Appropriate tests written for new functionality

**🔄 CONTINUOUS IMPROVEMENT**:
- **Learn from Patterns**: Identify and reuse successful approaches
- **Document Decisions**: Explain non-obvious choices for future reference
- **Optimize for Maintainability**: Prefer clear, readable solutions over clever ones
- **Validate Assumptions**: Test edge cases and error conditions

### 🚀 EXECUTION EXCELLENCE PRINCIPLES

**🏗️ IMPLEMENTATION STRATEGY**:
1. **Research First**: Understand before building
2. **Plan Explicitly**: Write out the approach before coding
3. **Build Incrementally**: Implement in small, testable pieces
4. **Validate Continuously**: Check each step before proceeding
5. **Document Clearly**: Explain complex decisions and trade-offs

**⚡ EFFICIENCY GUIDELINES**:
- **Reuse Before Create**: Always check for existing solutions
- **Compose Before Customize**: Use existing patterns and components
- **Abstract When Appropriate**: Create reusable solutions for repeated patterns
- **Optimize Later**: Prioritize correctness and clarity over premature optimization

---

## 📖 DOCUMENTATION NAVIGATION & MAINTENANCE

### Documentation Architecture
This project uses a **two-tier documentation system**:
1. **CLAUDE.md** (this file) - Primary entry point with critical rules and patterns
2. **[@docs/claude-references/](@docs/claude-references/)** - Detailed technical workflows and reference material

### When to Read What
**Start with CLAUDE.md for:**
- Critical rules and non-negotiables
- Core architecture patterns
- Component development guidelines
- API development standards
- Quick reference for common tasks

**Consult @docs/claude-references/ for:**
- Debug workflow details → [`workflows/`](@docs/claude-references/workflows/)
- Environment variable reference → [`reference/environment-variables.md`](@docs/claude-references/reference/environment-variables.md)
- File location details → [`reference/file-locations.md`](@docs/claude-references/reference/file-locations.md)
- Historical changes → [`changelog.md`](@docs/claude-references/changelog.md)

### Documentation Update Process
**⚠️ CRITICAL**: When updating documentation:

1. **Updating CLAUDE.md**:
   - Add/update critical rules and patterns directly
   - Keep content concise - extract details to references if >50 lines
   - Always update the changelog reference

2. **Updating Reference Docs**:
   - Update the specific atomic documentation file
   - Ensure CLAUDE.md summary remains accurate
   - Update the reference index if adding new files

3. **Decision Tree**:
   - Is it a critical rule or pattern? → CLAUDE.md
   - Is it a detailed workflow (>50 lines)? → @docs/claude-references/workflows/
   - Is it reference material? → @docs/claude-references/reference/
   - Is it historical information? → @docs/claude-references/changelog.md

---

## 🏗️ ARCHITECTURE & DEVELOPMENT PATTERNS

### Technology Stack
- **Frontend**: Next.js 15.2+ with App Router, TypeScript (strict mode)
- **Styling**: TailwindCSS 4 + DaisyUI components
- **Database**: MongoDB with Prisma ORM (6.6.0)
- **Caching**: Redis (ioredis) for configuration and performance, with server-side isolation pattern
- **State Management**: Redux Toolkit with persistence
- **Payments**: Stripe with webhook security
- **Authentication**: NextAuth.js with OAuth providers
- **Build Configuration**: Webpack exclusions for Node.js modules (DNS, ioredis) from client bundle

### Database Architecture (Single Source of Truth)
**✅ CRITICAL UPDATE (January 2025)**: Complete migration from redundant CvAnalysis table to proper single source of truth.

📖 **See detailed database schema:**
- **[Complete Database Schema](@docs/claude-references/architecture/database-schema.md)**

**Core entities**: Developer, ContactInfo, Experience, Education, Achievement, DeveloperSkill, Skill
**Gamification**: XPTransaction, PointsTransaction, UserBadge, DailyChallenge, SubscriptionTier

### State Management Patterns
**Redux Slices with Persistence**:
- `userSlice`: Authentication state (persisted)
- `analysisSlice`: CV analysis results (persisted, 24h expiry)
- `gamificationSlice`: XP, points, achievements (persisted)
- `selectedRolesSlice`: Multi-role application state (persisted)
- `coverLettersSlice`: Generated content cache (persisted)
- `rolesSlice`: Search parameters AND results (persisted) - No auto-search on reload

### AI Integration
**Centralized Model Configuration System** (`lib/modelConfig.ts`):
- **Primary Provider**: Google Gemini with centralized model management
- **Legacy Support**: OpenAI integration maintained for compatibility
- **Configuration**: Environment-based model selection with fallbacks

**🚨 CRITICAL: Centralized Model Management**
**All Gemini model versions are now centralized in `lib/modelConfig.ts`**:

📖 **See detailed AI integration patterns:**
- **[AI Integration Patterns](@docs/claude-references/development/ai-integration-patterns.md)**

**Mandatory pattern**: `import { getGeminiModel } from '@/lib/modelConfig'`
**Available use cases**: `cv-analysis`, `cover-letter`, `direct-upload`, `general`, etc.

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

**✅ RECOMMENDED Styling Utilities**: 
- **Use `cn()` for conditional styling**: Leverage clsx/classnames for dynamic class logic
- **Combine variants with utilities**: Mix object-based variants with utility functions
- **Smart class merging**: Use tailwind-merge for conflict resolution when needed

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

### Styling Utilities & Best Practices
**🚀 MANDATORY: Use Styling Utilities Where Applicable**

📖 **See complete styling utility guide:**
- **[Styling Utilities Guide](@docs/claude-references/development/styling-utilities-guide.md)**

**Core utilities**: `cn()` (clsx/classnames), `twMerge()` (intelligent class merging)
**Usage**: Conditional styling, object-based conditionals, smart conflict resolution

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
// ✅ Use cn() for conditional styling
const buttonClass = cn(
  'btn btn-primary',
  isLoading && 'loading',
  disabled && 'btn-disabled'
)

// ✅ Combine variants with utility functions
<Button 
  variant="primary" 
  className={cn(baseStyles, isActive && 'ring-2 ring-primary')} 
/>

// ✅ Smart class merging with tailwind-merge
import { twMerge } from 'tailwind-merge'
const mergedClasses = twMerge('p-4 p-2 bg-red-500 bg-blue-500')

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
**📚 CRITICAL**: When working with job search functionality:

📖 **See detailed integration documentation:**
- **[RapidAPI Integration](@docs/claude-references/integrations/rapidapi-integration.md)**

**Key features**: AI-enhanced job search, type-safe architecture, memoized components, **comprehensive usage tracking**

**🔧 Debug Configuration (Simplified Aug 2025)**:
- `DEBUG_RAPIDAPI=off` - Normal operation (default)
- `DEBUG_RAPIDAPI=log` - Make real calls with comprehensive logging
- `DEBUG_RAPIDAPI=stop` - Log request details without making API call
- `USE_MOCK_DATA=true` - Use mock data instead of real API calls
- **Removed**: Separate `DEBUG_RAPIDAPI_CALL` and `STOP_RAPIDAPI_CALL` variables

**📊 Usage Tracking System (Enhanced Aug 2025)**:
- **Universal Headers Processing**: Usage data captured from ALL response types (real API, mock, cached, debug)
- **Admin Dashboard Integration**: `/admin` page displays current usage regardless of debug mode
- **Cache Persistence**: Usage headers preserved across cached responses
- **Realistic Mock Data**: Mock and debug modes provide authentic usage simulation
- **Environment Standardization**: Consistent `DEBUG_RAPIDAPI` variable across all endpoints

### MVP Beta Points System (Active)
**🚀 BETA TESTING MODE**: Dynamic points-per-result system for controlled API usage
- **Points Deduction**: 1 point per job result returned (0 points if no results)
- **Configuration**: `NEXT_PUBLIC_ENABLE_MVP_MODE=true`, `MVP_INITIAL_POINTS=300`
- **UI Integration**: Real-time balance display, cost preview, usage notifications
- **Admin Tools**: Quick adjustment buttons, beta tester setup (300 points)
- **Rate Limiting**: 5,000 requests/month RapidAPI Pro plan protected by points

### Security & Performance
- **Gamification Protection**: Atomic transactions, server-side validation, rate limiting, audit trails
- **Stripe Integration**: Webhook signature verification, replay attack protection, idempotency keys
- **Advanced Caching**: Configuration caching (24h TTL), semantic cache keys, Redis connection resilience
- **Graceful Degradation**: Cache failures don't break functionality
- **Server-Side Module Isolation**: Client-side bundle excludes Node.js modules (Redis, DNS, etc.) via webpack configuration

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

📖 **See complete command reference:**
- **[Development Commands](@docs/claude-references/reference/development-commands.md)**

**Essential commands**: `npm run dev`, `npm run build`, `npm run test:e2e`, debug analysis scripts

**🧪 Testing Commands** (New Implementation):
```bash
# Run all unit tests (0.4s)
npm test -- __tests__/unit/

# Run specific test suite
npm test -- __tests__/unit/pointsManager.test.ts
npm test -- __tests__/unit/debugMode.test.ts
npm test -- __tests__/unit/searchValidation.test.ts
npm test -- __tests__/unit/usageTracking.test.ts

# Run with verbose output
npm test -- __tests__/unit/ --verbose
```

**Simplified RapidAPI Debug** (Aug 2025):
```bash
# Debug with logging
DEBUG_RAPIDAPI=log npm run dev

# Debug without API calls
DEBUG_RAPIDAPI=stop npm run dev

# Use mock data
USE_MOCK_DATA=true npm run dev
```

### Debug Workflows

**🔍 AI-POWERED DEBUG SYSTEMS**: Comprehensive debugging for cover letter generation and CV upload analysis.

📖 **See detailed workflows:**
- **[Cover Letter Debug Workflow](@docs/claude-references/workflows/cover-letter-debug.md)** - Three-file debug system with enhanced analysis
- **[CV Upload Debug Workflow](@docs/claude-references/workflows/cv-upload-debug.md)** - Direct Gemini upload pipeline analysis

**Quick Commands:**
```bash
# Cover Letter Debug
DEBUG_COVER_LETTER=true NODE_ENV=development npx tsx scripts/analyze-cover-letter-generation.ts

# CV Upload Debug  
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts
```


---

## 🧪 TESTING STRATEGY

### 📋 RapidAPI Subsystem Testing (Complete Implementation)

**🎯 THREE-TIER TESTING ARCHITECTURE**:
- **Unit Tests**: Core logic validation (< 5s) - **113 tests passing** ✅
- **Integration Tests**: API routes with mocked dependencies (< 30s) 
- **E2E Tests**: Critical user flows (< 60s)

**📦 COMPREHENSIVE UNIT TEST COVERAGE**:
```bash
npm test -- __tests__/unit/     # Run all unit tests (0.4s)
```

**🔧 Test Infrastructure**:
- **Jest + TypeScript**: Optimized configuration for Next.js
- **Deep Prisma Mocking**: `jest-mock-extended` for transaction simulation
- **Test Fixtures**: Centralized realistic data in `__tests__/fixtures/`
- **Mock Helpers**: Transaction setup, points deduction, error scenarios

**✅ VALIDATED SYSTEMS**:
- **PointsManager**: MVP Beta pricing (1 point/result), atomic transactions, tier discounts
- **Debug Modes**: All modes (off/log/stop) with consistent points deduction
- **Search Validation**: Parameter limits, cache keys, security validation
- **Usage Tracking**: Universal header processing (real/mock/cached/debug)

**🚨 CRITICAL MVP BETA VALIDATION**:
- Points **ALWAYS** deducted in ALL debug modes for system integrity testing
- Zero points deducted when no results returned
- Admin dashboard shows usage regardless of debug mode
- Safe testing without external API costs in stop mode

📖 **See complete testing guide:**
- **[Testing Strategy](@docs/claude-references/development/testing-strategy.md)**
- **[E2E Best Practices](docs/testing/e2e-best-practices.md)**

**Legacy E2E Success Rate**: 91% (41/45 tests passing)

---

## 🔧 DEBUG WORKFLOW & SERVER MONITORING

### Server Management

📖 **See complete server management guide:**
- **[Server Management](@docs/claude-references/operations/server-management.md)**

**Process management**: Clean environment, start with logging, validate startup
**Test user**: `cv-upload-test@test.techrec.com` for database integrity
**Debug commands**: Log monitoring, error tracking, health checks

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

### Quick Reference

📖 **For detailed file locations and structure, see:**
- **[Complete File Locations Reference](@docs/claude-references/reference/file-locations.md)**

**Key directories**: `app/api/`, `components/ui-daisy/`, `lib/features/`, `utils/`, `scripts/`, `logs/`

### Environment Variables

📖 **See complete environment variable reference:**
- **[Environment Variables Reference](@docs/claude-references/reference/environment-variables.md)**

**Key categories**: Database & Caching, Authentication, AI Providers, Gemini Models, Payments, Storage, Debug Settings

**MVP Beta Configuration**:
- `NEXT_PUBLIC_ENABLE_MVP_MODE=true` - Enable beta testing points system (unified flag)
- `MVP_INITIAL_POINTS=300` - Initial points for beta testers
- `MVP_POINTS_PER_RESULT=1` - Points cost per search result
- `MVP_WARNING_THRESHOLD=50` - UI warning when below this
- `MVP_CRITICAL_THRESHOLD=10` - Critical warning threshold

**RapidAPI Debug Configuration** (Simplified Aug 2025):
- `DEBUG_RAPIDAPI=off|log|stop` - Single debug control variable
- `USE_MOCK_DATA=true` - Explicit mock data flag
- **Deprecated**: `DEBUG_RAPIDAPI_CALL`, `STOP_RAPIDAPI_CALL` (replaced by single variable)

### Core Implementation Mandate
When implementing new features:
1. **Component-First Thinking**: Check existing components before creating anything new
2. **Variant-Based Extensions**: Add variants to existing components rather than creating new ones
3. **Standardized APIs**: Follow established patterns (`variant`, `size`, `className`, `icon`)
4. **Smart Styling Utilities**: Use `cn()`, `clsx`, and `tailwind-merge` for dynamic styling logic
5. **Reusability Focus**: Every component should be usable across multiple contexts
6. **Accessibility Built-In**: Components must include proper ARIA labels and keyboard navigation
7. **Documentation Updated**: Add new components/variants to design system documentation

### Component Development Checklist

📖 **See complete development checklist:**
- **[Component Checklist](@docs/claude-references/development/component-checklist.md)**

**Essential requirements**: Object-based variants, interactive props, TypeScript interfaces, accessibility features

---

## 📚 DOCUMENTATION STANDARDS

### Key Documentation Files
- `CLAUDE.md` - This file (project guidelines)
- `GAMIFICATION_STRATEGY.md` - Comprehensive gamification documentation
- `README.md` - Project setup and overview
- `requests/index.md` - Feature request management hub with navigation and statistics
- `requests/ideas-parking-lot.md` - Brainstorming workspace for raw feature concepts
- `requests/templates/feature-request-template.md` - Standardized template for new requests

### Update Requirements
- After any gamification-related changes (update `GAMIFICATION_STRATEGY.md`)
- After adding new API endpoints or significant features
- After architectural changes or new patterns
- After feature request workflow changes (update `requests/` documentation)

---

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency.*

## 📜 Update History

**Latest Update**: August 16, 2025 - **SERVER-SIDE MODULE ISOLATION FIX**:
- ✅ **Fixed Client-Side Redis Import Error**: Resolved "Module not found: Can't resolve 'dns'" error
- ✅ **Server-Only Redis Utilities**: Created `rapidapi-redis-utils.ts` for isolated server operations
- ✅ **Webpack Configuration**: Added client-side exclusions for Node.js modules (ioredis, dns, net, tls)
- ✅ **Dynamic Import Pattern**: Refactored cache manager to use async server-only imports
- ✅ **Development Stability**: Fixed development server and build process to complete without errors
- ✅ **Architecture Improvement**: Established pattern for proper client-server module separation

**Previous Update**: August 16, 2025 - **AI WORKING METHODOLOGY & VALIDATION FRAMEWORK**:
- ✅ **Confidence Standards**: 95%+ confidence threshold required before significant changes
- ✅ **Documentation Research**: Mandatory reading of relevant package/library docs before implementation
- ✅ **Critical Review Process**: Self-validation checklist for plan quality and risk assessment
- ✅ **Progressive Problem-Solving**: Systematic approach to breaking down complex tasks
- ✅ **Uncertainty Escalation**: Clear protocols for handling low-confidence scenarios
- ✅ **Quality Assurance**: Completion criteria and continuous improvement standards
- ✅ **Execution Excellence**: Research-first, plan-explicitly, build-incrementally methodology

**Previous Update**: August 16, 2025 - **COMPREHENSIVE RAPIDAPI TESTING SYSTEM**:
- ✅ **Complete Unit Test Suite**: 113 tests covering PointsManager, debug modes, search validation, usage tracking
- ✅ **Three-Tier Architecture**: Unit (< 5s), Integration (< 30s), E2E (< 60s) testing strategy
- ✅ **Jest Infrastructure**: TypeScript-optimized configuration with deep Prisma mocking
- ✅ **MVP Beta Validation**: Critical points deduction testing across ALL debug modes
- ✅ **Test Performance**: All unit tests execute in 0.4 seconds for rapid development feedback
- ✅ **Mock Infrastructure**: Transaction simulation, error scenarios, realistic test data fixtures
- ✅ **Debug Mode Testing**: Validates off/log/stop modes maintain points system integrity

**Previous Update**: August 16, 2025 - **RAPIDAPI USAGE TRACKING SYSTEM FIX**:
- ✅ **Universal Headers Processing**: Usage data captured from ALL response types (real API, mock, cached, debug)
- ✅ **Fixed Environment Variables**: Standardized `DEBUG_RAPIDAPI` usage across admin and search endpoints
- ✅ **Enhanced Cache Manager**: Usage headers preserved and restored from cached responses
- ✅ **Admin Dashboard Integration**: Always displays usage data when available, regardless of debug mode
- ✅ **Realistic Mock/Debug Data**: Authentic usage simulation in all non-production modes
- ✅ **Improved Debug Information**: Enhanced admin UI with debug context without hiding data

**Previous Update**: August 16, 2025 - **SEARCH OPTIMIZATION & API SIMPLIFICATION**:
- ✅ **Removed Auto-Search**: No automatic searches on page reload
- ✅ **Redux Persistence**: Search results now persist across refreshes
- ✅ **Simplified API Route**: Reduced from 830+ to 371 lines (55% reduction)
- ✅ **Consolidated Debug Modes**: Single `DEBUG_RAPIDAPI` variable replaces two
- ✅ **Cleaner Architecture**: Extracted points logic, removed auto-detection
- ✅ **Deleted TheirStack Route**: Removed unused `/api/roles/search` endpoint

**Previous Update**: August 15, 2025 - **MVP BETA POINTS SYSTEM**:
- ✅ **Dynamic Points Deduction**: 1 point per job result (not fixed cost)
- ✅ **Beta Testing Configuration**: 300 initial points, controlled via ENV vars
- ✅ **UI Integration**: Real-time balance display, cost preview, notifications
- ✅ **Admin Enhancements**: Quick adjustment buttons, beta tester setup

**Previous Update**: August 14, 2025 - **DOCUMENTATION ARCHITECTURE OPTIMIZATION**:
- ✅ **Two-Tier Documentation System**: CLAUDE.md as primary entry + atomic reference docs
- ✅ **40% Size Reduction**: Extracted detailed workflows to `@docs/claude-references/`
- ✅ **Zero Information Loss**: All content preserved in appropriate locations
- ✅ **Improved Maintainability**: Atomic updates without side effects

📖 **See full changelog**: **[Complete Update History](@docs/claude-references/changelog.md)**