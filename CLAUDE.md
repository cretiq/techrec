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
**⚠️ MANDATORY**: Every interactive element MUST include comprehensive `data-testid` attributes:
```tsx
// ✅ Required pattern for all components
<Button data-testid="profile-experience-add-button">Add Experience</Button>
<TableRow data-testid={`cv-management-row-cv-item-${cv.id}`}>
<Input data-testid="profile-info-input-name" />
```

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
**Caching Strategy**:
```typescript
// Configuration caching (24-hour TTL)
const config = await redis.get('config:subscription-tiers');

// Leaderboard caching (1-hour TTL)
const leaderboard = await redis.get(`leaderboard:${tier}:${period}`);
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

### Error Handling Patterns
**Common Issues & Solutions**:
- **Infinite API calls**: Check useEffect dependencies for unstable references
- **Form control errors**: Ensure controlled components have both `value` and `onChange`
- **Redux persistence**: Add necessary fields to persist whitelist
- **ID mismatches**: Check CV ID vs Analysis ID in URL/store mapping

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
REDIS_URL=               # Redis connection

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

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency.*