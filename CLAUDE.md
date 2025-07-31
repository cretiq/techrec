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

### Testing Requirements
**⚠️ MANDATORY**: Comprehensive testing coverage following established patterns:
```tsx
// ✅ UI Testing - Every interactive element requires data-testid
<Button data-testid="profile-experience-add-button">Add Experience</Button>
<TableRow data-testid={`cv-management-row-cv-item-${cv.id}`}>
<Input data-testid="profile-info-input-name" />

// ✅ Schema Validation Testing - Use Zod for all API validation
export const RequestSchema = z.object({
  field: z.string().min(1, "Field is required"),
}).strict();

// ✅ Utility Function Testing - Comprehensive edge case coverage
describe('utility function', () => {
  it('handles empty input gracefully', () => { /* test */ });
  it('validates input boundaries', () => { /* test */ });
  it('sanitizes malicious input', () => { /* test */ });
});

// ✅ Integration Testing - Mock external services properly
jest.mock('@aws-sdk/client-s3');
jest.mock('@prisma/client');
```

### API Development Standards
**⚠️ MANDATORY**: All API routes must follow established patterns:
1. **Zod Schema Validation**: Runtime validation for all inputs
2. **Semantic Caching**: Cache keys that capture business logic meaning
3. **Structured Error Handling**: Custom error classes with metadata
4. **Graceful Degradation**: External service failures don't break core functionality

---

## 📋 GIT COMMIT STRATEGY (APPLY CONSISTENTLY)

### Core Principles
- **Commit frequently**: Small, focused commits over large ones
- **Self-contained changes**: Each commit = complete, logical unit of work
- **Clear messaging**: Conventional commit format always
- **Atomic commits**: One concern per commit (never mix features with fixes)
- **Clean history**: Maintain readable project evolution

### Commit Frequency Guidelines
- ✅ After completing each function or method
- ✅ After fixing each bug or issue (one fix per commit)
- ✅ After adding each test case (separate from implementation)
- ✅ After each documentation update
- ✅ Before switching contexts
- ⚠️ **Maximum 1-2 hours of work per commit**

### Commit Message Format
```
<type>(<scope>): <description>

[optional body explaining why, not what]

[optional footer with breaking changes/closes issues]
```

#### Commit Types
- `feat:` - New feature or functionality
- `fix:` - Bug fix or error correction
- `refactor:` - Code restructuring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or modifying tests
- `docs:` - Documentation changes
- `style:` - Code formatting, no logic changes
- `chore:` - Maintenance tasks, build changes

#### Scopes (Project-Specific)
- `gamification` - Gamification system (XP, points, achievements, streaks)
- `subscription` - Stripe integration and subscription management
- `cv-analysis` - CV parsing, analysis, and improvement features
- `auth` - Authentication and authorization
- `ui` - User interface components and styling
- `api` - Backend API endpoints and logic
- `db` - Database schema, migrations, or queries

### Commit Examples
```bash
feat(gamification): implement atomic points spending with race condition protection
fix(cv-analysis): resolve race condition in analysis status updates
refactor(auth): extract middleware validation logic to separate module
perf(gamification): optimize leaderboard queries with strategic indexing
test(subscription): add integration tests for Stripe webhook handling
docs(gamification): update strategy document with implemented features
```

### When to Commit
✅ **DO commit when:**
- Function/method is complete and tested
- Bug is fixed and verified
- Component is implemented and working
- Documentation is updated for recent changes
- Refactoring is complete and tests pass
- Performance optimization is measurable

❌ **DON'T commit when:**
- Code doesn't compile or has syntax errors
- Tests are failing (unless committing the failing test first)
- Mixing multiple unrelated changes
- Work is incomplete or partially implemented
- Temporary debugging code is included
- **USER HAS NOT EXPLICITLY APPROVED THE COMMIT** ⚠️ CRITICAL RULE

### Emergency Situations
- Use `WIP:` prefix for urgent context switches
- Always return to complete WIP commits before final delivery
- Use `git stash` for very temporary context switches

---

## 🏗️ ARCHITECTURE & DEVELOPMENT PATTERNS

### Technology Stack
- **Frontend Framework**: Next.js 15.2+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 + DaisyUI components
- **Database**: MongoDB with Prisma ORM (6.6.0)
- **Caching**: Redis (ioredis) for configuration and performance
- **State Management**: Redux Toolkit with persistence
- **Payments**: Stripe with webhook security
- **Animations**: Framer Motion for smooth transitions
- **Authentication**: NextAuth.js with OAuth providers

### AI Integration
**Dual Provider System** (`utils/aiProviderSelector.ts`):
- **OpenAI**: GPT models for analysis and generation
- **Google Gemini**: Alternative provider with automatic fallback
- **Usage**: CV analysis, cover letter generation, content optimization

**Advanced AI Patterns**:
```typescript
// ✅ Dynamic Prompt Engineering - Context-aware prompt construction
const buildPrompt = (context: RequestContext) => {
  const basePrompt = getBasePrompt(context.type);
  const toneModifier = getToneModifier(context.tone);
  const personalization = getPersonalizationContext(context);
  return `${basePrompt}\n${toneModifier}\n${personalization}`;
};

// ✅ Semantic Caching - Business logic-based cache keys
const generateCacheKey = (data: RequestData): string => {
  return [
    data.type,
    data.profile.id,
    data.role.title,
    data.company.name,
    data.tone || 'formal',
    data.requestType || 'coverLetter'
  ].join(':').replace(/[^a-zA-Z0-9:-]/g, '_');
};

// ✅ AI Response Validation - Structured output validation
const validateAIResponse = (response: string, context: RequestContext) => {
  const validation = ResponseValidator.validate(response, {
    wordCount: WORD_BOUNDS[context.type],
    tone: context.tone,
    requiredElements: getRequiredElements(context.type)
  });
  return validation;
};
```

### Database Architecture (Single Source of Truth)
**✅ CRITICAL ARCHITECTURAL UPDATE (January 2025)**: Complete migration from redundant CvAnalysis table to proper single source of truth tables.

**Core Profile Tables** (see `prisma/schema.prisma`):
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
- `XPTransaction`: XP earning and awarding history
- `PointsTransaction`: Points spending and earning tracking
- `UserBadge`: Achievement and badge management
- `DailyChallenge`: Challenge system for engagement
- `SubscriptionTier`: FREE, BASIC, STARTER, PRO, EXPERT

### State Management Patterns
**Redux Slices with Persistence**:
- `userSlice`: Authentication state (persisted)
- `analysisSlice`: CV analysis results (persisted, 24h expiry)
- `gamificationSlice`: XP, points, achievements (persisted)
- `selectedRolesSlice`: Multi-role application state (persisted)
- `coverLettersSlice`: Generated content cache (persisted)

**Advanced State Patterns**:
```typescript
// ✅ Granular State Updates - Precise state management
updateCoverLetterTone: (state, action: PayloadAction<{ roleId: string; tone: CoverLetterTone }>) => {
  const { roleId, tone } = action.payload;
  if (state.coverLetters[roleId]) {
    state.coverLetters[roleId].tone = tone;
  }
}

// ✅ Type-Safe Selectors - Structured data access
export const selectCoverLetterByRole = (state: RootState, roleId: string) =>
  state.coverLetters.coverLetters[roleId];

// ✅ Bulk Operations - Multi-role state management
export const selectAllCoverLetters = (state: RootState) =>
  Object.values(state.coverLetters.coverLetters);
```

### Error Handling Architecture
**Structured Error Management**:
```typescript
// ✅ Custom Error Classes - Business context preservation
export class CoverLetterValidationError extends CoverLetterError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'VALIDATION_ERROR', meta);
  }
}

export class CoverLetterGenerationError extends CoverLetterError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'GENERATION_ERROR', meta);
  }
}

// ✅ Error Classification - Structured error responses
const handleAPIError = (error: unknown) => {
  if (error instanceof CoverLetterValidationError) {
    return NextResponse.json(
      { error: error.message, code: error.code, meta: error.meta },
      { status: 400 }
    );
  }
  // ... other error types
};
```

---

## 🎨 UI/UX DEVELOPMENT GUIDELINES

### Component Architecture
**Migration Pattern**: Custom components → DaisyUI
- **Legacy**: Custom shadcn/ui components in `/components/ui/`
- **Current**: DaisyUI components in `/components/ui-daisy/`
- **Integration**: Gradual migration maintaining existing functionality

### Design System
**Glass Morphism Theme**:
```tsx
// ✅ Standard glass morphism pattern
<Card variant="transparent" className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">

// ✅ Glass form inputs
<Input className="bg-base-100/50 backdrop-blur-sm border border-base-300/50 focus:ring-2 focus:ring-primary/20" />
```

**Animation Standards**:
- **Loading**: Sophisticated orbital loaders over simple spinners
- **Hover Effects**: Include movement (`translate-x-1`), shadow, and background changes
- **Transitions**: Use `transition-all duration-200` for smooth multi-property changes
- **Progress**: Animated progress bars with shimmer effects

**Advanced Animation Patterns**:
```tsx
// ✅ Animation Orchestration - Coordinated multi-element effects
{isNewlyGenerated && (
  <>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    />
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`sparkle-${i}`}
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0], y: [20, -30, -50, -80] }}
        transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
      >
        <Sparkles className="w-full h-full text-primary" />
      </motion.div>
    ))}
  </>
)}

// ✅ External Trigger Management - Component coordination
useEffect(() => {
  const handleExternalTrigger = () => {
    if (!isGenerating) generateCoverLetter();
  };
  window.addEventListener('triggerCoverLetterGeneration', handleExternalTrigger);
  return () => window.removeEventListener('triggerCoverLetterGeneration', handleExternalTrigger);
}, [isGenerating, generateCoverLetter]);

// ✅ Multi-Mode Adaptability - Context-aware component behavior
const layoutClass = isMultiRoleMode 
  ? "grid grid-cols-1 lg:grid-cols-2 gap-6" 
  : "max-w-4xl mx-auto";
```

### Component Requirements
**Essential Patterns**:
```tsx
// ✅ Fixed table layouts prevent width flickering
<Table className="table-fixed w-full">
  <TableHead className="w-[40%] min-w-[200px]">Filename</TableHead>
</Table>

// ✅ Cross-component communication
window.dispatchEvent(new CustomEvent('expandAllSections'));

// ✅ Comprehensive test coverage
<Button data-testid={`action-button-${action}-${id}`}>
```

---

## 🔧 API & BACKEND PATTERNS

### API Route Structure
**✅ UPDATED RESTful Patterns (Single Source of Truth)**:
```
/api/[resource]/[id]/[action]
- /api/cv/ - CV file upload and metadata management
- /api/developer/me/profile - Complete profile CRUD (single source of truth)
- /api/developer/me/experience - Experience CRUD operations
- /api/developer/me/education - Education CRUD operations  
- /api/developer/me/skills - Skills CRUD operations
- /api/developer/me/achievements - Achievements CRUD operations
- /api/cv-analysis/latest - Legacy compatibility (fetches from profile tables)
- /api/gamification/ - XP, points, achievements, challenges
- /api/subscription/ - Stripe integration and webhooks
- /api/generate-* - AI content generation endpoints
```

**⚠️ DEPRECATED APIs**:
- `/api/cv-analysis/[id]/save-version` - Replaced by `/api/developer/me/profile`
- Direct CvAnalysis table operations - Use proper profile APIs instead

### Security Patterns
**Gamification Protection**:
- Atomic transactions with serializable isolation
- Server-side validation of all point costs
- Rate limiting on expensive operations
- Audit trails for all transactions

**Stripe Integration Security**:
- Webhook signature verification
- Replay attack protection (10-minute tolerance)
- Idempotency keys for all operations
- Customer ID validation and constraints

### Performance Optimization
**Advanced Caching Strategy**:
```typescript
// ✅ Configuration caching (24-hour TTL)
const config = await redis.get('config:subscription-tiers');

// ✅ Leaderboard caching (1-hour TTL)
const leaderboard = await redis.get(`leaderboard:${tier}:${period}`);

// ✅ Semantic Cache Keys - Business logic meaning
const cacheKey = [
  'cover-letter',
  profile.id,
  role.title,
  company.name,
  tone || 'formal',
  requestType || 'coverLetter'
].join(':').replace(/[^a-zA-Z0-9:-]/g, '_');
```

**Redis Connection Resilience**:
```typescript
// ✅ Advanced Connection Management - Enterprise-grade Redis handling
const connectToRedis = (): Promise<Redis> => {
  if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')) {
    return Promise.resolve(redisClient);
  }
  
  if (clientReadyPromise) {
    return clientReadyPromise;
  }

  clientReadyPromise = new Promise((resolve, reject) => {
    const client = new Redis(redisUrl, {
      retryDelayOnFailover: 1000,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: shouldUseTLS ? {} : undefined,
    });

    client.on('ready', () => resolve(client));
    client.on('error', (err) => {
      if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
        console.log('Redis connection lost, will retry...');
      } else {
        reject(err);
      }
    });
    
    client.connect().catch(reject);
  });

  return clientReadyPromise;
};

// ✅ Graceful Degradation - Cache failures don't break functionality
const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const client = await connectToRedis();
    return await client.get(key);
  } catch (error) {
    console.warn('Cache GET failed, continuing without cache:', error);
    return null;
  }
};
```

**Database Indexing**:
```javascript
// Strategic indexes for gamification
db.developers.createIndex({ "totalXP": -1 })
db.developers.createIndex({ "subscriptionTier": 1, "totalXP": -1 })
```

---

## 📊 DEVELOPMENT WORKFLOWS

### User Experience Patterns
**✅ UPDATED CV Analysis Flow (Single Source of Truth)**:
1. User uploads CV → S3 storage
2. File parsed using LangChain or custom parsers
3. Multi-dimensional AI analysis (ATS, content quality, formatting, impact) 
4. **Background sync saves DIRECTLY to proper profile tables** (Developer, Experience, Education, Skills)
5. UI fetches from proper profile APIs (`/api/developer/me/*`)
6. Manual edits save via `/api/developer/me/profile` to proper tables
7. Results cached in Redis with semantic keys (24-hour TTL)
8. Gamification updates (XP awards, achievement checks)

**Subscription Tier Flow**:
1. User selects tier upgrade
2. Stripe customer/subscription creation
3. Webhook handling for subscription updates
4. Points allocation and efficiency bonus calculation
5. Database updates with atomic transactions

### Business Logic Patterns
**Advanced Utility Functions**:
```typescript
// ✅ Intelligent Skill Ranking - ATS optimization
export const rankSkills = (skills: string[], profileSkills: ProfileSkill[] = []): string[] => {
  const skillProficiencyMap = new Map<string, number>();
  profileSkills.forEach(ps => {
    skillProficiencyMap.set(ps.name.toLowerCase(), ps.proficiencyLevel || 3);
  });

  return skills
    .map(skill => ({
      name: skill,
      proficiency: skillProficiencyMap.get(skill.toLowerCase()) || 2
    }))
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 8)
    .map(s => s.name);
};

// ✅ Smart Achievement Extraction - Quantified metrics detection
export const deriveAchievements = (profile: InternalProfile, supplied: string[] | undefined, max = 3): string[] => {
  if (supplied && supplied.length) return supplied.slice(0, max);
  
  const results: string[] = [];
  profile.achievements?.forEach((ach) => {
    if (results.length >= max) return;
    if (/\d/.test(ach.description)) { // Look for quantified achievements
      results.push(ach.description);
    }
  });
  
  return results.slice(0, max);
};

// ✅ Content Validation Pipeline - Multi-dimensional quality assurance
export const validateCoverLetterOutput = (content: string, context: ValidationContext): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    wordCount: content.split(/\s+/).length,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Word count validation
  const bounds = WORD_BOUNDS[context.requestType];
  if (result.wordCount < bounds.min || result.wordCount > bounds.max) {
    result.errors.push(`Word count ${result.wordCount} outside range ${bounds.min}-${bounds.max}`);
    result.isValid = false;
  }

  // Professional tone validation
  const unprofessionalPhrases = ['awesome', 'super excited', 'totally', 'amazing'];
  const foundUnprofessional = unprofessionalPhrases.filter(phrase => 
    content.toLowerCase().includes(phrase)
  );
  
  if (foundUnprofessional.length > 0) {
    result.warnings.push(`Consider more professional alternatives to: ${foundUnprofessional.join(', ')}`);
  }

  return result;
};
```

### Error Handling Patterns
**Common Issues & Solutions**:
- **Infinite API calls**: Check useEffect dependencies for unstable references
- **Form control errors**: Ensure controlled components have both `value` and `onChange`
- **Redux persistence**: Add necessary fields to persist whitelist
- **✅ FIXED - Missing work experience**: Now uses proper Experience table as single source of truth
- **✅ FIXED - Save functionality**: Redux updates now persist via `/api/developer/me/profile`
- **✅ FIXED - Data duplication**: Eliminated redundant CvAnalysis table
- **Cache failures**: Always implement graceful degradation for external services
- **AI API errors**: Use structured error classes with business context
- **Validation errors**: Provide specific field-level error messages

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
npx prisma db push           # Push schema changes
npx prisma studio            # GUI

# Seeding
npm run seed                  # Database seeding
npm run seed:roles           # Seed roles data
```

---

## 🧪 TESTING STRATEGY

### Testing Requirements

**🚨 CRITICAL AUTHENTICATION RULE**:
- **ALL CV and developer-related tests MUST authenticate FIRST**
- **Tests ALWAYS start unauthenticated** - this is the default state
- **Use `AuthHelper.ensureLoggedIn()` in test.beforeEach()** before any CV operations
- **Client-side authentication protection** redirects unauthenticated users to `/auth/signin`
- **Test users**: `junior@test.techrec.com`, `senior@test.techrec.com`, `newbie@test.techrec.com`

**Authentication Pattern Example**:
```typescript
import { AuthHelper } from '../utils/auth-helper';

test.beforeEach(async ({ page }) => {
  // CRITICAL: Always authenticate first before testing CV functionality
  const auth = new AuthHelper(page);
  await auth.ensureLoggedIn('junior_developer');
  
  // Now can access protected routes
  await page.goto('/developer/cv-management');
});
```

**Mandatory Coverage**:
- ✅ ALL buttons, links, and interactive elements
- ✅ ALL form inputs, selects, and textareas
- ✅ ALL table headers, rows, and cells
- ✅ ALL loading states and skeleton components
- ✅ ALL conditional UI elements (badges, status indicators)

**Test ID Naming Convention**:
```
Format: {page/section}-{component}-{element}-{identifier?}

Examples:
- profile-experience-card
- cv-management-table-header-filename
- gamification-level-progress-bar
- subscription-tier-badge-expert
```

### Quality Assurance
**Code Quality Standards**:
- Clean, reusable, and scalable code
- Follow existing patterns and conventions
- Maintain backward compatibility
- Extend existing functionality rather than replace

### **Core Implementation Mandate**

When implementing new features or modifying existing ones, you must adhere to the following core principles to ensure consistency, maintainability, and architectural integrity.

**1. Analyze and Adhere:**
*   **Analyze First:** Before writing any code, thoroughly analyze the existing codebase. Identify established architectural patterns, state management conventions, and UI component usage.
*   **Strictly Adhere to the Design System:** Exclusively use components from the established UI library (`daisyUI`). Do not introduce custom styling or one-off components. The new feature must be visually indistinguishable from the existing interface.
*   **Integrate with Centralized State:** Connect to the existing state management solution (Redux) by reusing established selectors and dispatching existing actions. Do not duplicate state or introduce new state management logic for existing data domains.

**2. Structure and Implement:**
*   **Encapsulate Logic:** Build new features within self-contained, single-responsibility components.
*   **Preserve Layout Integrity:** Integrate new components into the existing layout structure without modifying core layout rules. Ensure changes are additive and do not cause regressions in responsiveness or visual organization.
*   **Prioritize Clarity:** Write clean, readable, and maintainable code that aligns with project-wide best practices.

---

## 📚 DOCUMENTATION STANDARDS

### File Organization
**Key Documentation Files**:
- `CLAUDE.md` - This file (project guidelines)
- `GAMIFICATION_STRATEGY.md` - Comprehensive gamification documentation
- `README.md` - Project setup and overview
- `/scripts/README-task-master.md` - Task management documentation

### Documentation Requirements
**When to Update Documentation**:
- After any gamification-related changes (update `GAMIFICATION_STRATEGY.md`)
- After adding new API endpoints or significant features
- After architectural changes or new patterns (update `docs/architecture/system-architecture.md`)
- When onboarding information becomes outdated
- **✅ COMPLETED**: Updated comprehensive architecture documentation in `docs/architecture/`

---

## 🤖 AI COLLABORATION EXCELLENCE

### Context Intelligence Framework
**Optimal AI Assistance Patterns**:
```typescript
// ✅ Pattern Recognition - Leverage established patterns
"Follow the Redis connection management pattern from lib/redis.ts"
"Use the structured error handling approach from the cover letter API"
"Apply the semantic caching strategy from generateCacheKey function"

// ✅ Context Preservation - Maintain development continuity
"Analyze existing components before creating new ones"
"Check Redux slices for state management patterns"
"Review test files for testing approach consistency"

// ✅ Architecture Alignment - Ensure system coherence
"Integrate with existing Redux state management"
"Use established DaisyUI component patterns"
"Follow the granular commit strategy from CLAUDE.md"
```

### Development Workflow Integration
**Effective Collaboration Strategies**:
1. **Pattern-First Development**: Always analyze existing patterns before implementing new features
2. **Test-Driven Enhancement**: Use comprehensive testing patterns for all new functionality
3. **Type-Safe Implementation**: Leverage Zod schemas and TypeScript for bulletproof APIs
4. **Performance-Conscious Design**: Apply caching and optimization patterns consistently
5. **Error-Resilient Architecture**: Implement graceful degradation for all external dependencies

### Quality Assurance Integration
**AI-Assisted Quality Framework**:
```bash
# ✅ Validation Commands - Run before every commit
npm run lint                  # Code style validation
npm run typecheck            # TypeScript compilation check
npm test                     # Comprehensive test suite
npm run build               # Production build validation

# ✅ Pattern Verification - Ensure consistency
rg "data-testid" --type tsx  # Verify test ID coverage
rg "export.*Error" --type ts # Check error class consistency
rg "createSlice" lib/features/ # Review Redux patterns
```

### Strategic Development Principles
**Compound Effectiveness Framework**:
1. **Architectural Consistency**: Always extend existing patterns rather than create new ones
2. **Type System Maturity**: Runtime validation + compile-time safety = bulletproof code
3. **Testing Comprehensiveness**: UI, Integration, Unit, and Mock testing for complete coverage
4. **Performance Optimization**: Semantic caching, connection pooling, graceful degradation
5. **Error Handling Excellence**: Structured errors with business context and metadata
6. **Component Composition**: Single-responsibility components with clear interfaces
7. **State Management Precision**: Granular updates with type-safe selectors
8. **Animation Sophistication**: Coordinated effects that enhance user experience

### Advanced Feature Implementation Mastery
**Daily Pattern Recognition (Updated: July 3, 2025)**:

#### **Glass Morphism Excellence Framework**
- **Standard Pattern**: `bg-base-100/60 backdrop-blur-sm border border-base-300/50`
- **Hover States**: Enhanced with shadow transitions (`hover:shadow-lg`)
- **Animation Integration**: Smooth backdrop-blur effects with framer-motion
- **Performance**: GPU-accelerated transforms for 60fps animations
- **Consistency**: Applied universally across application routing, buttons, and cards

#### **LinkedIn Brand Integration Standards**
- **Authentic Color Scheme**: Primary `#0077b5`, hover `#005885`, dark `#004165`
- **Official Logo Integration**: SVG components with proper scaling and accessibility
- **Visual Distinction**: Easy Apply (solid gradient) vs External (outline glass)
- **Motion Enhancement**: Pulse animations on interaction, scale transforms on hover
- **Context Preservation**: New tab navigation maintains user workflow continuity

#### **Component Enhancement Strategies**
- **Progressive Enhancement**: Core functionality first, visual improvements second
- **Conditional Rendering**: Smart data availability checks before component rendering
- **Animation Orchestration**: Coordinated delays (0.1s, 0.2s, 0.3s) for smooth sequences
- **Reusability Maximization**: Enhance existing components rather than create duplicates
- **Accessibility Integration**: ARIA labels, keyboard navigation, screen reader support

#### **Feature Traceability Excellence**
- **Commit Strategy**: `[FR #X]` references creating clear planning → implementation chains
- **Documentation Integration**: Implementation details captured in commit messages
- **Testing Patterns**: Integration tests covering complete user workflows
- **Quality Gates**: Build validation, TypeScript checks, lint compliance
- **Progress Tracking**: Feature completion with comprehensive implementation notes

#### **Advanced Animation Patterns**
```typescript
// ✅ Motion Standard - Hover Interactions
const hoverAnimation = { scale: 1.02, transition: { duration: 0.1 } };
const tapAnimation = { scale: 0.98, transition: { duration: 0.1 } };

// ✅ Sequential Animation Orchestration
const staggerChildren = {
  animate: { opacity: 1, y: 0 },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 }
};

// ✅ Glass Morphism Animation
const glassTransition = {
  background: "bg-base-100/60",
  backdropFilter: "backdrop-blur-sm",
  hover: "hover:bg-base-100/80 hover:shadow-lg"
};
```

#### **User Feedback Integration Mastery**
- **Visual Feedback Loops**: Screenshot analysis → immediate UI improvements
- **Iterative Refinement**: Multiple improvement cycles within single sessions
- **Context Understanding**: User intent recognition from visual and functional feedback
- **Responsive Adaptation**: Real-time adjustments based on interaction patterns
- **Quality Validation**: Continuous verification of implementation against user expectations

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
├── prisma/                   # Database schema
└── types/                    # TypeScript definitions
```

### Environment Variables Required
```bash
# Database & Caching
MONGODB_URI=              # MongoDB connection
REDIS_URL=               # Redis connection (redis:// or rediss:// for TLS)
REDIS_USE_TLS=true       # Force TLS (overrides URL scheme detection)
REDIS_TLS_STRICT=false   # Allow self-signed certificates (dev/staging)
REDIS_DEBUG=false        # Enable Redis debug logging
DISABLE_REDIS_CACHE=true # Disable caching entirely (development)

# Authentication
NEXTAUTH_URL=            # App URL
NEXTAUTH_SECRET=         # JWT secret
GOOGLE_CLIENT_ID=        # OAuth provider
GITHUB_ID=              # OAuth provider

# AI Providers
OPENAI_API_KEY=         # GPT models
GOOGLE_AI_API_KEY=      # Gemini models

# Payments
STRIPE_SECRET_KEY=      # Stripe integration
STRIPE_WEBHOOK_SECRET=  # Webhook security

# Storage
AWS_S3_BUCKET_NAME=     # File storage
```

### Common Debugging Commands
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Generate Prisma client
npx prisma generate

# View Redis cache
redis-cli monitor

# Check build output
npm run build 2>&1 | head -50
```

---

## 📈 STRATEGIC MEMORY OPTIMIZATION

### Evolution Tracking
**Codebase Maturity Indicators**:
- ✅ **Testing Infrastructure**: Comprehensive Jest + Testing Library + Integration testing
- ✅ **Type System**: Zod validation + TypeScript for bulletproof APIs
- ✅ **Error Architecture**: Structured error classes with business context
- ✅ **State Management**: Granular Redux actions with type-safe selectors
- ✅ **Performance**: Semantic caching + Redis resilience + graceful degradation
- ✅ **Component Design**: Animation orchestration + multi-mode adaptability + glass morphism mastery
- ✅ **AI Integration**: Dynamic prompts + validation pipelines + fallback mechanisms
- ✅ **Business Logic**: Smart content extraction + professional quality validation
- ✅ **Brand Integration**: Authentic external service integration with LinkedIn standards
- ✅ **Feature Traceability**: Complete planning → implementation → completion audit trails
- ✅ **🆕 DATABASE ARCHITECTURE**: Single source of truth pattern with proper CRUD APIs
- ✅ **🆕 DATA FLOW INTEGRITY**: Complete CV upload → profile tables → UI display consistency
- ✅ **🆕 PERSISTENCE RELIABILITY**: Real save functionality replacing Redux-only updates

### Continuous Improvement Framework
**Daily Memory Optimization Process** (Enhanced July 10, 2025):
1. **Pattern Crystallization**: Document successful architectural decisions and proven approaches
2. **Development Velocity Enhancement**: Identify and encode efficiency improvements  
3. **Quality Standard Evolution**: Capture testing, validation, and error handling improvements
4. **AI Collaboration Refinement**: Optimize context sharing and development workflow integration
5. **Visual Design Mastery**: Establish and evolve UI/UX patterns for consistency and excellence
6. **Brand Integration Standards**: Document external service integration approaches
7. **Animation Sophistication**: Refine motion design patterns for enhanced user experience
8. **Execution Primer Integration**: Apply 99% confidence thresholds with mandatory debug logging
9. **Self-Improvement Mandate**: Systematic code review and architectural compliance validation

### Strategic Development Outcomes
**Compound Effectiveness Achievements**:
- **Enterprise-Grade Reliability**: Sophisticated error handling and graceful degradation patterns
- **Production-Ready Performance**: Advanced caching strategies and connection resilience
- **Developer Experience Excellence**: Comprehensive testing, type safety, and documentation
- **AI-Assisted Development Mastery**: Optimal context intelligence and workflow integration
- **Visual Design Excellence**: Glass morphism mastery with consistent brand integration
- **Feature Implementation Velocity**: From planning to production with complete traceability
- **User Experience Sophistication**: Motion design and interaction patterns that delight users
- **Premium Feature Architecture**: Comprehensive gamification integration with atomic transactions
- **Self-Improving Code Quality**: Systematic architectural compliance and refactoring protocols
- **Debug-Driven Development**: Environment-aware logging infrastructure for uncertainty management

### Advanced Feature Implementation Mastery
**Daily Pattern Recognition** (Updated: July 14, 2025):

#### **Premium Feature Implementation Excellence**
- **Atomic Transaction Patterns**: Use `PointsManager.spendPointsAtomic` for race condition protection
- **Multi-Layer Validation**: UI eligibility checks + backend subscription/points validation + audit trails
- **Graceful Premium Degradation**: Clear disabled states with specific reason indicators
- **Real-Time State Integration**: Redux user/gamification state for dynamic UI updates
- **Subscription Tier Architecture**: STARTER+ tier validation with efficiency bonus calculations

#### **Self-Improvement Development Cycle**
- **Execution Primer Consultation**: Mandatory 99% confidence threshold validation before implementation
- **Debug Logging Infrastructure**: Comprehensive environment-aware logging for uncertainty areas
- **Architectural Compliance Review**: Systematic evaluation against design system principles
- **Component Extraction Patterns**: Single-responsibility components from monolithic implementations
- **State Management Integration**: Centralized Redux patterns over local component state

#### **Design System Mastery Evolution**
- **DaisyUI Component Priority**: Strict adherence over custom HTML elements with TailwindCSS
- **Radio Group Patterns**: `RadioGroup` and `Radio` components for consistent form controls
- **Badge Usage Standards**: Variant consistency for status indicators and premium features
- **Alert Integration**: Structured `Alert` components for user messaging and notifications
- **Component Composition**: Reusable single-purpose components over inline implementations

#### **Debug-Driven Development Protocols**
- **Request ID Tracing**: End-to-end request tracking for complex feature flows
- **Environment Detection**: Development/production mode logging with forced overrides
- **Validation Logging**: Parameter validation, premium checks, and transaction outcomes
- **Error Context Preservation**: Structured error classes with business logic metadata
- **Performance Monitoring**: API call timing, cache operations, and state updates

#### **Redux State Architecture Refinement**
- **Persistence Strategy**: Selective whitelist patterns for user experience continuity
- **Endpoint-Aware Caching**: Search parameter integration with endpoint-specific cache keys
- **State Hydration**: Seamless Redux persist integration with existing infrastructure
- **Action Granularity**: Specific endpoint parameter updates over bulk state changes
- **Selector Optimization**: Memoized selectors for premium validation and user eligibility

#### **Critical Bug Resolution Mastery**
- **Dual Data Source Prevention**: Always standardize on single data source with consistent ID transformation
- **Data Consistency Validation**: External/internal ID mapping must be consistent across all API endpoints
- **State Management Hybrid**: Local state for immediate UI feedback + Redux for persistence and synchronization
- **Error Handler Scope**: Always retrieve session within error handler scope, don't rely on outer scope variables
- **API Naming Standards**: Consistent singular/plural endpoint naming prevents integration issues
- **Data Validation Patterns**: External data transformation with enum mapping before database operations

#### **Advanced Debugging Excellence**
- **Systematic Bug Documentation**: Use bug-analyzer.md framework for structured problem-solving
- **Multi-Level Root Cause Analysis**: Address architectural issues, not just symptoms
- **Prevention-First Mindset**: Create searchable patterns that prevent similar issues
- **Comprehensive Testing**: Data flow validation essential for multi-component feature integration
- **Time Investment Tracking**: Critical bugs (90-120 min), medium bugs (15-45 min), simple bugs (5-15 min)
- **Bug Pattern Recognition**: 6 distinct bug types identified with resolution patterns

#### **Feature Implementation Excellence**
- **Comprehensive Commit Strategy**: Single commits containing complete feature implementation with [FR #X] traceability
- **Impact Documentation**: Detailed completion summaries with key learnings and architectural insights
- **Future-Ready Architecture**: Design for easy expansion with additional features
- **Backward Compatibility**: Maintain existing functionality while adding new capabilities
- **User Experience Focus**: Seamless workflows with instant visual feedback and consistent UI

#### **AI Collaboration Excellence Patterns**
- **Execution Primer Workflow**: Mandatory consultation before complex feature implementation
- **Todo List Orchestration**: Granular progress tracking with status management for complex tasks
- **Confidence Threshold Management**: 99% standard with debug infrastructure for uncertainty areas
- **Self-Improvement Integration**: Systematic post-implementation architectural compliance review
- **Context Intelligence**: Comprehensive file reading before editing to understand existing patterns
- **Systematic Analysis**: Step-by-step verification of dependencies, state flow, and integration points
- **Quality Compound Effect**: Each feature implementation improves overall codebase architecture
- **Bug Resolution Workflow**: Systematic documentation and prevention pattern creation

---

## 🧪 TEST-DRIVEN DEVELOPMENT MASTERY

### Contemporary Testing Philosophy
**TechRec** embraces modern Test-Driven Development (TDD) practices with Playwright as the primary E2E testing framework. Every new feature must follow the testing loop: **Plan → Test → Implement → Validate → Refine**.

### Core Testing Principles
1. **Test-First Mindset**: Write tests before implementing features
2. **Comprehensive Coverage**: Unit, Integration, and End-to-End testing
3. **Real User Scenarios**: Playwright tests simulate actual user workflows  
4. **Continuous Validation**: Tests run in CI/CD pipeline
5. **Documentation Through Tests**: Tests serve as living documentation

### Testing Framework Integration
**Primary Tools**:
- **Playwright**: End-to-end testing with real browser automation
- **Jest**: Unit and integration testing
- **Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for reliable tests

### Test-Driven Development Workflow
**Step-by-Step Process**:
1. **Feature Planning**: Define user stories and acceptance criteria
2. **Test Design**: Create Playwright tests representing user workflows
3. **Red Phase**: Run tests (they should fail initially)
4. **Implementation**: Build minimal code to make tests pass
5. **Green Phase**: Verify all tests pass
6. **Refactor Phase**: Improve code while maintaining test success
7. **Integration**: Ensure new tests work with existing test suite

### Playwright Testing Standards
**Essential Patterns**:
```typescript
// ✅ User-Centric Test Design
test('user can apply AI suggestions to improve CV content', async ({ page }) => {
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

// ✅ Test Data Management
const testUser = {
  email: 'test@example.com',
  cvData: { /* realistic test data */ }
};

// ✅ Reliable Selectors - Always use data-testid
await page.click('[data-testid="profile-experience-add-button"]');
```

### Testing Commands Reference
**Essential Commands** (see `@claude-instructions/testing-commands.md` for complete reference):
```bash
# Run all Playwright tests
npm run test:e2e

# Run specific test file
npx playwright test cv-suggestions.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug cv-suggestions.spec.ts

# Generate test report
npx playwright show-report

# Update test snapshots
npx playwright test --update-snapshots
```

### Feature Development Integration
**Mandatory Testing Workflow**:
1. **Before Coding**: Reference `@claude-instructions/testing-commands.md` for testing approach
2. **Test Creation**: Design Playwright tests covering all user workflows
3. **Implementation**: Build feature to satisfy test requirements
4. **Validation**: Run complete test suite to ensure no regressions
5. **Documentation**: Update test documentation with new patterns

### Quality Assurance Framework
**Testing Requirements for Every Feature**:
- ✅ **User Journey Tests**: Complete workflows from start to finish
- ✅ **Error Handling Tests**: Graceful degradation scenarios
- ✅ **Mobile Responsiveness**: Cross-device functionality
- ✅ **Performance Tests**: Load time and interaction speed
- ✅ **Accessibility Tests**: Screen reader and keyboard navigation
- ✅ **Data Integrity Tests**: State persistence and synchronization

### Test File Organization
```
tests/
├── e2e/                    # Playwright end-to-end tests
│   ├── cv-management/      # CV-related user workflows  
│   ├── gamification/       # XP, points, achievements testing
│   ├── subscription/       # Payment and tier testing
│   └── auth/              # Authentication workflows
├── integration/           # API and component integration
├── unit/                  # Individual function testing
└── fixtures/             # Reusable test data and utilities
```

### AI-Assisted Testing Excellence
**Proactive Testing Approach**:
- **Always consult `@claude-instructions/testing-commands.md` before implementing features**
- **Design tests that represent real user value and workflows**
- **Create comprehensive test scenarios covering happy path and edge cases**
- **Maintain test reliability through proper selectors and wait conditions**
- **Document testing patterns for future reference and team learning**

---

## 🔧 ADVANCED DEBUGGING WORKFLOW WITH SERVER LOG MONITORING

### Background Development Server Management
**Critical Breakthrough**: Autonomous server log monitoring enables real-time debugging without manual log copying, dramatically improving development velocity and issue resolution accuracy.

### Server Management Protocol
**✅ MANDATORY Process Management**:
```bash
# 1. Always terminate existing processes before starting new ones
pkill -f "npm run dev"

# 2. Verify processes are cleaned up  
ps aux | grep "npm run dev" | grep -v grep

# 3. Start server in background with log capture
nohup npm run dev > server.log 2>&1 &

# 4. IMMEDIATELY validate server startup and port
sleep 3 && head -10 server.log

# 5. Confirm port assignment (typically shows "Local: http://localhost:3000")
# If port 3000 is occupied, Next.js will automatically use 3001, 3002, etc.
```

### Real-Time Server Log Monitoring
**✅ ESSENTIAL Debugging Commands**:
```bash
# Monitor server logs during test execution
tail -f server.log

# Read server logs after test completion
cat server.log

# Search for specific errors or patterns
grep -i "error\|failed\|exception" server.log

# Monitor specific API endpoints
grep -i "cv-improvement\|upload\|gemini" server.log

# Check recent log entries (last 20 lines)
tail -20 server.log
```

### Integrated Test & Debug Workflow
**✅ COMPLETE Process**:
1. **Clean Environment Setup**:
   ```bash
   # Kill existing processes
   pkill -f "npm run dev"
   
   # Start fresh server with logging
   nohup npm run dev > server.log 2>&1 &
   
   # Validate server startup and port
   sleep 3 && head -10 server.log
   ```

2. **Concurrent Test Execution & Log Monitoring**:
   ```bash
   # Run test (in one process)
   npx playwright test specific-test.spec.ts --timeout=30000
   
   # Monitor server logs (read from file during/after test)
   tail -f server.log  # or read server.log file
   ```

3. **Post-Test Analysis**:
   ```bash
   # Analyze complete server logs
   cat server.log
   
   # Search for specific issues
   grep -i "gemini\|upload\|parsing\|failed" server.log
   
   # Clean up processes
   pkill -f "npm run dev"
   ```

### Server Log Analysis Patterns
**✅ KEY Log Signatures to Monitor**:

**Successful Patterns**:
```
✅ Ready in 1321ms                           # Server startup success
✅ GET /developer/cv-management 200         # Page load success  
✅ POST /api/cv/upload 201                  # File upload success
✅ [Gemini Analysis] API call completed     # AI processing success
✅ [Analysis ID] Status updated to COMPLETED # Analysis success
```

**Error Patterns**:
```
❌ File details: { size: 0 }                # Empty file upload
❌ PDF Parsing: Error calling pdfParser     # PDF parsing failure
❌ Schema validation failed                 # Data validation issues
❌ Expected string response from Gemini     # AI response format issues
❌ Status updated to FAILED                 # Processing failure
```

### Port Management Best Practices
**✅ CRITICAL Port Validation**:
- **Always verify** which port the server starts on by reading server.log
- **Default behavior**: Port 3000, but auto-increments if occupied (3001, 3002...)
- **Test configuration**: Ensure Playwright tests target the correct port
- **Clean shutdown**: Always terminate processes to avoid port conflicts

### Advanced Debugging Capabilities
**✅ Server Log Benefits**:
1. **Real-time API monitoring** - See exact request/response data
2. **Error root cause analysis** - Identify specific failure points  
3. **Performance monitoring** - Track API call timing and bottlenecks
4. **Schema validation debugging** - See exact validation failures
5. **AI provider monitoring** - Monitor Gemini model usage and responses
6. **File processing debugging** - Track upload, parsing, and analysis steps

### Gemini AI Debugging Mastery
**✅ Specific Gemini Debug Patterns**:
```bash
# Monitor Gemini model usage
grep -i "gemini model\|using model" server.log

# Track AI response processing  
grep -i "response.*gemini\|gemini.*response" server.log

# Debug schema validation issues
grep -i "validation.*failed\|schema.*error" server.log

# Monitor AI processing timing
grep -i "duration\|completed.*ms" server.log
```

### Authentication Debugging Excellence
**✅ NextAuth Session Debug Patterns**:
```bash
# Monitor authentication flow and session handling
grep -i "session\|auth\|unauthorized" server.log

# Track API authentication failures
grep -i "401\|unauthorized\|authentication failed" server.log

# Monitor development mode authentication bypass
grep -i "development.*mock\|mock developer" server.log

# Debug upload → display flow with authentication
grep -i "upload.*complete\|callback.*signal\|fetch.*latest" server.log

# Track immediate display callback mechanism
grep -i "handleUploadComplete\|upload-complete\|delayed fetch" server.log
```

**✅ Authentication Debugging Workflow**:
1. **Pre-test Authentication**: Verify session endpoints work before testing upload flow
2. **Server Log Monitoring**: Real-time authentication validation during test execution  
3. **Development Mode Testing**: Use valid MongoDB ObjectID for authentication bypass
4. **Callback Flow Validation**: Monitor parameter passing and timing in upload callbacks
5. **Session Scope Verification**: Ensure session retrieval works in error handler contexts

### Process Management Automation
**✅ Recommended Helper Functions**:
```bash
# Add to shell profile (.zshrc, .bashrc)
function dev-server-start() {
    pkill -f "npm run dev" 2>/dev/null
    nohup npm run dev > server.log 2>&1 &
    sleep 3
    echo "Server started on:"
    grep -i "local:" server.log | head -1
}

function dev-server-logs() {
    tail -f server.log
}

function dev-server-stop() {
    pkill -f "npm run dev"
    echo "Development server stopped"
}
```

### Testing Strategy Integration
**✅ Enhanced Test Development**:
1. **Pre-test setup**: Clean server environment with log monitoring
2. **During test execution**: Real-time server log analysis
3. **Post-test analysis**: Comprehensive log review for issues
4. **Issue identification**: Precise error location and context
5. **Solution verification**: Server logs confirm fixes work correctly

This server log monitoring system provides **unprecedented debugging visibility**, enabling autonomous issue identification and resolution without manual log copying or guesswork.

---

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency. Updated through strategic memory optimization to capture enterprise-grade development patterns and AI collaboration excellence.*

**Last Strategic Optimization**: January 31, 2025 - **MAJOR ARCHITECTURAL MODERNIZATION COMPLETE**: 
- ✅ **Single Source of Truth Migration**: Eliminated redundant CvAnalysis table, implemented proper database architecture
- ✅ **Data Flow Consistency**: CV upload → background sync → proper profile tables → UI display pipeline
- ✅ **Real Persistence**: Redux updates now save via `/api/developer/me/profile` to proper database tables
- ✅ **API Architecture**: Complete CRUD operations for all profile sections using established patterns
- ✅ **Comprehensive Documentation**: Created `docs/architecture/system-architecture.md` with current state
- ✅ **Legacy Compatibility**: Maintained UI compatibility during architectural transition
- ✅ **Issue Resolution**: Fixed missing work experience display and save functionality root causes

Previous Update - July 29, 2025: MAJOR TESTING INTEGRATION UPDATE with Playwright E2E framework and comprehensive TDD practices.