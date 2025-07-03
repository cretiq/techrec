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

### Database Architecture
**Key Models** (see `prisma/schema.prisma`):
- `Developer`: User profiles with gamification fields
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
**RESTful Patterns**:
```
/api/[resource]/[id]/[action]
- /api/cv/ - CV upload and management
- /api/cv-analysis/ - AI-powered analysis with retry/versioning
- /api/gamification/ - XP, points, achievements, challenges
- /api/subscription/ - Stripe integration and webhooks
- /api/generate-* - AI content generation endpoints
```

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
**CV Analysis Flow**:
1. User uploads CV → S3 storage
2. File parsed using LangChain or custom parsers
3. Multi-dimensional analysis (ATS, content quality, formatting, impact)
4. Results cached in Redis (24-hour TTL)
5. Gamification updates (XP awards, achievement checks)

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
- **ID mismatches**: Check CV ID vs Analysis ID in URL/store mapping
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
- After architectural changes or new patterns
- When onboarding information becomes outdated

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

### Continuous Improvement Framework
**Daily Memory Optimization Process** (Enhanced July 3, 2025):
1. **Pattern Crystallization**: Document successful architectural decisions and proven approaches
2. **Development Velocity Enhancement**: Identify and encode efficiency improvements  
3. **Quality Standard Evolution**: Capture testing, validation, and error handling improvements
4. **AI Collaboration Refinement**: Optimize context sharing and development workflow integration
5. **Visual Design Mastery**: Establish and evolve UI/UX patterns for consistency and excellence
6. **Brand Integration Standards**: Document external service integration approaches
7. **Animation Sophistication**: Refine motion design patterns for enhanced user experience

### Strategic Development Outcomes
**Compound Effectiveness Achievements**:
- **Enterprise-Grade Reliability**: Sophisticated error handling and graceful degradation patterns
- **Production-Ready Performance**: Advanced caching strategies and connection resilience
- **Developer Experience Excellence**: Comprehensive testing, type safety, and documentation
- **AI-Assisted Development Mastery**: Optimal context intelligence and workflow integration
- **Visual Design Excellence**: Glass morphism mastery with consistent brand integration
- **Feature Implementation Velocity**: From planning to production with complete traceability
- **User Experience Sophistication**: Motion design and interaction patterns that delight users

---

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency. Updated through strategic memory optimization to capture enterprise-grade development patterns and AI collaboration excellence.*

**Last Strategic Optimization**: July 3, 2025 - Enhanced with glass morphism mastery, LinkedIn brand integration standards, advanced animation patterns, feature traceability excellence, and sophisticated user feedback integration workflows. Comprehensive daily memory sync capturing Feature Request #5 implementation patterns and visual design evolution.